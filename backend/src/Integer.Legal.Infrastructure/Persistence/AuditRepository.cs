using Integer.Legal.Application.Operations;
using Npgsql;
using NpgsqlTypes;

namespace Integer.Legal.Infrastructure.Persistence;

public sealed class AuditRepository(LegalDbSession session) : IAuditRepository
{
    public async Task<IReadOnlyCollection<AuditEntryView>> ListAsync(Guid firmId, int limit, DateTimeOffset? before, CancellationToken ct)
    {
        const string sql = "select id,actor_id,action,entity_type,entity_id,occurred_at,correlation_id,payload::text from legal.audit_entries where firm_id=@firm and (@before is null or occurred_at<@before) order by occurred_at desc,id limit @limit";
        var (connection, transaction) = await session.GetTransactionAsync(ct);
        await using var command = new NpgsqlCommand(sql, connection, transaction);
        command.Parameters.AddWithValue("firm", firmId); command.Parameters.AddWithValue("before", NpgsqlDbType.TimestampTz, before is null ? DBNull.Value : before.Value); command.Parameters.AddWithValue("limit", limit);
        var result = new List<AuditEntryView>();
        await using var reader = await command.ExecuteReaderAsync(ct);
        while (await reader.ReadAsync(ct)) result.Add(new(reader.GetGuid(0), reader.GetGuid(1), reader.GetString(2), reader.GetString(3), reader.GetGuid(4), reader.GetFieldValue<DateTimeOffset>(5), reader.GetGuid(6), reader.GetString(7)));
        return result;
    }
}
