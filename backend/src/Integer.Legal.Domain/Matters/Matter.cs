using Integer.Legal.Domain.Common;

namespace Integer.Legal.Domain.Matters;

public enum MatterStatus { Open = 1, Suspended = 2, Closed = 3, Archived = 4 }

public sealed class Matter : TenantEntity
{
    public Matter(Guid id, Guid firmId, Guid clientId, string reference, string title, Guid responsibleUserId)
        : base(id, firmId)
    {
        if (clientId == Guid.Empty) throw new DomainException("Client identifier is required.");
        if (responsibleUserId == Guid.Empty) throw new DomainException("Responsible user is required.");
        ClientId = clientId;
        ResponsibleUserId = responsibleUserId;
        Reference = Required(reference, 50, nameof(reference)).ToUpperInvariant();
        Title = Required(title, 300, nameof(title));
        Status = MatterStatus.Open;
    }

    public Guid ClientId { get; }
    public Guid ResponsibleUserId { get; }
    public string Reference { get; }
    public string Title { get; }
    public MatterStatus Status { get; private set; }

    public void Close() => Status = MatterStatus.Closed;

    private static string Required(string value, int max, string name)
    {
        var normalized = value?.Trim() ?? string.Empty;
        if (normalized.Length is 0 || normalized.Length > max)
            throw new DomainException($"{name} must contain between 1 and {max} characters.");
        return normalized;
    }
}
