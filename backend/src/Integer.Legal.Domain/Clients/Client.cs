using Integer.Legal.Domain.Common;

namespace Integer.Legal.Domain.Clients;

public enum ClientKind { Person = 1, Organization = 2 }

public sealed class Client : TenantEntity
{
    public Client(Guid id, Guid firmId, string reference, string displayName, ClientKind kind)
        : base(id, firmId)
    {
        Reference = Required(reference, 40, nameof(reference)).ToUpperInvariant();
        DisplayName = Required(displayName, 240, nameof(displayName));
        Kind = kind;
    }

    public string Reference { get; }
    public string DisplayName { get; }
    public ClientKind Kind { get; }

    private static string Required(string value, int max, string name)
    {
        var normalized = value?.Trim() ?? string.Empty;
        if (normalized.Length is 0 || normalized.Length > max)
            throw new DomainException($"{name} must contain between 1 and {max} characters.");
        return normalized;
    }
}
