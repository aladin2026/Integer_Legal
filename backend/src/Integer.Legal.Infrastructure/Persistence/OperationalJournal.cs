using System.Text.Json;
using Integer.Legal.Application.Operations;
using Integer.Legal.Domain.Common;
using Npgsql;

namespace Integer.Legal.Infrastructure.Persistence;

public sealed class OperationalJournal(LegalDbSession session) : IOperationalJournal
{
    public async Task RecordCreatedAsync(TenantEntity entity, Guid actorId, string eventType, CancellationToken ct)
    {
        var payload = JsonSerializer.Serialize(new { entityId = entity.Id, firmId = entity.FirmId });
        await RecordAsync(entity.FirmId, actorId, "created", entity.GetType().Name, entity.Id, eventType, payload, ct);
    }

    public async Task RecordAsync(Guid firmId, Guid actorId, string action, string entityType, Guid entityId, string eventType, string payload, CancellationToken ct)
    {
        const string auditSql = "insert into legal.audit_entries(id,firm_id,actor_id,action,entity_type,entity_id,occurred_at,correlation_id,payload) values(@audit_id,@firm,@actor,@action,@entity_type,@entity_id,@occurred,@correlation,@payload::jsonb)";
        const string outboxSql = "insert into legal.outbox_messages(id,firm_id,event_type,event_version,payload,occurred_at) values(@outbox_id,@firm,@event_type,1,@payload::jsonb,@occurred)";
        var occurred = DateTimeOffset.UtcNow;
        var correlation = Guid.NewGuid();
        var envelopePayload = JsonSerializer.Serialize(new { entityId, firmId, correlationId = correlation, data = JsonSerializer.Deserialize<JsonElement>(payload) });
        var (connection, transaction) = await session.GetTransactionAsync(ct);
        await using (var command = new NpgsqlCommand(auditSql, connection, transaction))
        {
            command.Parameters.AddWithValue("audit_id", Guid.NewGuid()); command.Parameters.AddWithValue("firm", firmId);
            command.Parameters.AddWithValue("actor", actorId); command.Parameters.AddWithValue("action", action); command.Parameters.AddWithValue("entity_type", entityType);
            command.Parameters.AddWithValue("entity_id", entityId); command.Parameters.AddWithValue("occurred", occurred);
            command.Parameters.AddWithValue("correlation", correlation); command.Parameters.AddWithValue("payload", envelopePayload);
            await command.ExecuteNonQueryAsync(ct);
        }
        await using (var command = new NpgsqlCommand(outboxSql, connection, transaction))
        {
            command.Parameters.AddWithValue("outbox_id", Guid.NewGuid()); command.Parameters.AddWithValue("firm", firmId);
            command.Parameters.AddWithValue("event_type", eventType); command.Parameters.AddWithValue("payload", envelopePayload);
            command.Parameters.AddWithValue("occurred", occurred); await command.ExecuteNonQueryAsync(ct);
        }
    }
}
