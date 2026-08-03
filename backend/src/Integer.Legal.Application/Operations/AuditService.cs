using Integer.Legal.Application.Abstractions;

namespace Integer.Legal.Application.Operations;

public sealed record AuditEntryView(Guid Id, Guid ActorId, string Action, string EntityType, Guid EntityId, DateTimeOffset OccurredAt, Guid CorrelationId, string Payload);
public interface IAuditRepository
{
    Task<IReadOnlyCollection<AuditEntryView>> ListAsync(Guid firmId, int limit, DateTimeOffset? before, CancellationToken ct);
}
public sealed class AuditService(IAuditRepository repository, IFirmContext firm)
{
    public Task<IReadOnlyCollection<AuditEntryView>> ListAsync(int limit, DateTimeOffset? before, CancellationToken ct)
    {
        if (limit is < 1 or > 100) throw new Integer.Legal.Domain.Common.DomainException("Audit page size is invalid.");
        return repository.ListAsync(firm.FirmId, limit, before, ct);
    }
}
