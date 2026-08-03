namespace Integer.Legal.Domain.Common;

public abstract class TenantEntity
{
    protected TenantEntity(Guid id, Guid firmId)
    {
        if (id == Guid.Empty) throw new DomainException("Entity identifier is required.");
        if (firmId == Guid.Empty) throw new DomainException("Firm identifier is required.");
        Id = id;
        FirmId = firmId;
    }

    public Guid Id { get; }
    public Guid FirmId { get; }
}
