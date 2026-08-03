using Integer.Legal.Application.Operations;
using Npgsql;

namespace Integer.Legal.Infrastructure.Persistence;

public sealed class PlatformIntegrationRepository(LegalDbSession session) : IPlatformIntegrationRepository
{
    public async Task<IReadOnlyCollection<OutboxEnvelope>> ClaimOutboxAsync(Guid firmId, int maximum, TimeSpan lease, CancellationToken ct)
    {
        const string sql = """
            with candidates as (
              select id from legal.outbox_messages where firm_id=@firm and processed_at is null and (lease_until is null or lease_until<now())
              order by occurred_at limit @maximum for update skip locked
            )
            update legal.outbox_messages o set lease_until=now()+@lease,attempt_count=attempt_count+1
            from candidates c where o.id=c.id
            returning o.id,o.event_type,o.event_version,o.payload::text,o.occurred_at
            """;
        var (connection, transaction) = await session.GetTransactionAsync(ct);
        await using var command = new NpgsqlCommand(sql, connection, transaction);
        command.Parameters.AddWithValue("firm", firmId); command.Parameters.AddWithValue("maximum", maximum); command.Parameters.AddWithValue("lease", lease);
        var result = new List<OutboxEnvelope>();
        await using var reader = await command.ExecuteReaderAsync(ct);
        while (await reader.ReadAsync(ct)) result.Add(new(reader.GetGuid(0), reader.GetString(1), reader.GetInt32(2), reader.GetString(3), reader.GetFieldValue<DateTimeOffset>(4)));
        return result;
    }

    public Task<bool> AcknowledgeOutboxAsync(Guid firmId, Guid messageId, CancellationToken ct) => ExecuteAsync(
        "update legal.outbox_messages set processed_at=now(),lease_until=null,last_error=null where firm_id=@firm and id=@id and processed_at is null and lease_until>=now()", firmId, messageId, null, ct);
    public Task<bool> RejectOutboxAsync(Guid firmId, Guid messageId, string error, CancellationToken ct) => ExecuteAsync(
        "update legal.outbox_messages set lease_until=null,last_error=@error where firm_id=@firm and id=@id and processed_at is null", firmId, messageId, error, ct);

    public async Task<IReadOnlyCollection<ScheduledCommandEnvelope>> ClaimScheduledAsync(Guid firmId, int maximum, TimeSpan lease, CancellationToken ct)
    {
        const string sql = """
            with candidates as (
              select id from legal.scheduled_commands where firm_id=@firm and status=1 and execute_at<=now() and (lease_until is null or lease_until<now())
              order by execute_at limit @maximum for update skip locked
            )
            update legal.scheduled_commands s set status=2,lease_until=now()+@lease,attempt_count=attempt_count+1
            from candidates c where s.id=c.id
            returning s.id,s.command_type,s.command_version,s.payload::text,s.execute_at,s.attempt_count
            """;
        var (connection, transaction) = await session.GetTransactionAsync(ct);
        await using var command = new NpgsqlCommand(sql, connection, transaction);
        command.Parameters.AddWithValue("firm", firmId); command.Parameters.AddWithValue("maximum", maximum); command.Parameters.AddWithValue("lease", lease);
        var result = new List<ScheduledCommandEnvelope>();
        await using var reader = await command.ExecuteReaderAsync(ct);
        while (await reader.ReadAsync(ct)) result.Add(new(reader.GetGuid(0), reader.GetString(1), reader.GetInt32(2), reader.GetString(3), reader.GetFieldValue<DateTimeOffset>(4), reader.GetInt32(5)));
        return result;
    }

    public Task<bool> CompleteScheduledAsync(Guid firmId, Guid commandId, CancellationToken ct) => ExecuteAsync(
        "update legal.scheduled_commands set status=3,lease_until=null,last_error=null where firm_id=@firm and id=@id and status=2 and lease_until>=now()", firmId, commandId, null, ct);
    public Task<bool> FailScheduledAsync(Guid firmId, Guid commandId, string error, CancellationToken ct) => ExecuteAsync(
        "update legal.scheduled_commands set status=case when attempt_count>=5 then 4 else 1 end,lease_until=null,last_error=@error where firm_id=@firm and id=@id and status=2", firmId, commandId, error, ct);

    private async Task<bool> ExecuteAsync(string sql, Guid firmId, Guid id, string? error, CancellationToken ct)
    {
        var (connection, transaction) = await session.GetTransactionAsync(ct);
        await using var command = new NpgsqlCommand(sql, connection, transaction);
        command.Parameters.AddWithValue("firm", firmId); command.Parameters.AddWithValue("id", id);
        if (error is not null) command.Parameters.AddWithValue("error", error);
        return await command.ExecuteNonQueryAsync(ct) == 1;
    }
}
