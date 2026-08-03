using Integer.Legal.Domain.Common;
using System.Text.Json;
using static Integer.Legal.Domain.Operations.Guard;

namespace Integer.Legal.Domain.Operations;

public enum PartyKind { Person = 1, Organization = 2, Authority = 3 }
public enum ConflictDecision { Cleared = 1, WaiverRequired = 2, Rejected = 3 }
public enum PrebillStatus { Draft = 1, UnderReview = 2, Approved = 3, SubmittedToEInvoice = 4 }

public sealed class Party : TenantEntity
{
    public Party(Guid id, Guid firmId, string displayName, PartyKind kind, string? identificationNumber) : base(id, firmId)
    {
        DisplayName = Required(displayName, 240, nameof(displayName));
        NormalizedName = DisplayName.ToUpperInvariant();
        Kind = kind;
        IdentificationNumber = Optional(identificationNumber, 100, nameof(identificationNumber));
    }
    public string DisplayName { get; }
    public string NormalizedName { get; }
    public PartyKind Kind { get; }
    public string? IdentificationNumber { get; }
}

public sealed class ConflictCheck : TenantEntity
{
    public ConflictCheck(Guid id, Guid firmId, Guid? matterId, Guid requestedBy, IReadOnlyCollection<string> terms) : base(id, firmId)
    {
        if (requestedBy == Guid.Empty) throw new DomainException("Conflict requester is required.");
        var normalized = terms.Select(term => Required(term, 240, nameof(terms)).ToUpperInvariant()).Distinct().ToArray();
        if (normalized.Length == 0) throw new DomainException("At least one conflict search term is required.");
        MatterId = matterId; RequestedBy = requestedBy; SearchTerms = normalized;
    }
    public Guid? MatterId { get; }
    public Guid RequestedBy { get; }
    public IReadOnlyCollection<string> SearchTerms { get; }
}

public sealed class MatterParty : TenantEntity
{
    public MatterParty(Guid id, Guid firmId, Guid matterId, Guid partyId, string roleCode, bool isAdverse) : base(id, firmId)
    {
        RequireId(matterId, "Matter");
        RequireId(partyId, "Party");
        MatterId = matterId;
        PartyId = partyId;
        RoleCode = Required(roleCode, 60, nameof(roleCode)).ToUpperInvariant();
        IsAdverse = isAdverse;
    }
    public Guid MatterId { get; }
    public Guid PartyId { get; }
    public string RoleCode { get; }
    public bool IsAdverse { get; }
}

public sealed class Procedure : TenantEntity
{
    public Procedure(Guid id, Guid firmId, Guid matterId, string procedureType, string jurisdiction, string? externalReference) : base(id, firmId)
    {
        RequireId(matterId, "Matter");
        MatterId = matterId;
        ProcedureType = Required(procedureType, 80, nameof(procedureType));
        Jurisdiction = Required(jurisdiction, 240, nameof(jurisdiction));
        ExternalReference = Optional(externalReference, 100, nameof(externalReference));
    }
    public Guid MatterId { get; }
    public string ProcedureType { get; }
    public string Jurisdiction { get; }
    public string? ExternalReference { get; }
}

public sealed class Hearing : TenantEntity
{
    public Hearing(Guid id, Guid firmId, Guid procedureId, DateTimeOffset scheduledAt, string purpose, DateTimeOffset now) : base(id, firmId)
    {
        RequireId(procedureId, "Procedure");
        if (scheduledAt <= now) throw new DomainException("A scheduled hearing must be in the future.");
        ProcedureId = procedureId;
        ScheduledAt = scheduledAt;
        Purpose = Required(purpose, 300, nameof(purpose));
    }
    public Guid ProcedureId { get; }
    public DateTimeOffset ScheduledAt { get; }
    public string Purpose { get; }
}

public sealed class LegalDocument : TenantEntity
{
    public LegalDocument(Guid id, Guid firmId, Guid matterId, string title, string classification, Guid createdBy) : base(id, firmId)
    {
        RequireId(matterId, "Matter");
        RequireId(createdBy, "Creator");
        MatterId = matterId;
        Title = Required(title, 300, nameof(title));
        Classification = Required(classification, 80, nameof(classification));
        CreatedBy = createdBy;
    }
    public Guid MatterId { get; }
    public string Title { get; }
    public string Classification { get; }
    public Guid CreatedBy { get; }
}

public sealed class DocumentVersion : TenantEntity
{
    public DocumentVersion(Guid id, Guid firmId, Guid documentId, int versionNumber, string objectKey, string sha256, string mediaType, long sizeBytes, Guid createdBy) : base(id, firmId)
    {
        RequireId(documentId, "Document");
        RequireId(createdBy, "Creator");
        if (versionNumber <= 0 || sizeBytes < 0) throw new DomainException("Document version metadata is invalid.");
        var normalizedHash = Required(sha256, 64, nameof(sha256)).ToLowerInvariant();
        if (normalizedHash.Length != 64 || normalizedHash.Any(value => !Uri.IsHexDigit(value))) throw new DomainException("SHA-256 digest is invalid.");
        DocumentId = documentId;
        VersionNumber = versionNumber;
        StorageObjectKey = Required(objectKey, 500, nameof(objectKey));
        ContentSha256 = normalizedHash;
        MediaType = Required(mediaType, 120, nameof(mediaType));
        SizeBytes = sizeBytes;
        CreatedBy = createdBy;
    }
    public Guid DocumentId { get; }
    public int VersionNumber { get; }
    public string StorageObjectKey { get; }
    public string ContentSha256 { get; }
    public string MediaType { get; }
    public long SizeBytes { get; }
    public Guid CreatedBy { get; }
}

public sealed class TimeEntry : TenantEntity
{
    public TimeEntry(Guid id, Guid firmId, Guid matterId, Guid userId, DateOnly activityDate, int minutes, string description, bool billable, decimal? hourlyRate, string currency) : base(id, firmId)
    {
        RequireId(matterId, "Matter");
        RequireId(userId, "User");
        if (minutes <= 0 || hourlyRate < 0) throw new DomainException("Time entry values are invalid.");
        MatterId = matterId;
        UserId = userId;
        ActivityDate = activityDate;
        Minutes = minutes;
        Description = Required(description, 500, nameof(description));
        Billable = billable;
        HourlyRate = hourlyRate;
        Currency = CurrencyCode(currency);
    }
    public Guid MatterId { get; }
    public Guid UserId { get; }
    public DateOnly ActivityDate { get; }
    public int Minutes { get; }
    public string Description { get; }
    public bool Billable { get; }
    public decimal? HourlyRate { get; }
    public string Currency { get; }
}

public sealed class ExpenseEntry : TenantEntity
{
    public ExpenseEntry(Guid id, Guid firmId, Guid matterId, DateOnly incurredOn, string description, decimal amount, string currency, bool billable) : base(id, firmId)
    {
        RequireId(matterId, "Matter");
        if (amount < 0) throw new DomainException("Expense amount cannot be negative.");
        MatterId = matterId;
        IncurredOn = incurredOn;
        Description = Required(description, 500, nameof(description));
        Amount = amount;
        Currency = CurrencyCode(currency);
        Billable = billable;
    }
    public Guid MatterId { get; }
    public DateOnly IncurredOn { get; }
    public string Description { get; }
    public decimal Amount { get; }
    public string Currency { get; }
    public bool Billable { get; }
}

public sealed class Budget : TenantEntity
{
    public Budget(Guid id, Guid firmId, Guid matterId, decimal amount, string currency, decimal warningPercent) : base(id, firmId)
    {
        RequireId(matterId, "Matter");
        if (amount < 0 || warningPercent is < 0 or > 100) throw new DomainException("Budget values are invalid.");
        MatterId = matterId;
        Amount = amount;
        Currency = CurrencyCode(currency);
        WarningPercent = warningPercent;
    }
    public Guid MatterId { get; }
    public decimal Amount { get; }
    public string Currency { get; }
    public decimal WarningPercent { get; }
}

public sealed class Prebill : TenantEntity
{
    public Prebill(Guid id, Guid firmId, Guid matterId, string reference, string currency, Guid createdBy) : base(id, firmId)
    {
        RequireId(matterId, "Matter");
        RequireId(createdBy, "Creator");
        MatterId = matterId;
        Reference = Required(reference, 60, nameof(reference)).ToUpperInvariant();
        Currency = CurrencyCode(currency);
        CreatedBy = createdBy;
        Status = PrebillStatus.Draft;
    }
    public Guid MatterId { get; }
    public string Reference { get; }
    public string Currency { get; }
    public Guid CreatedBy { get; }
    public PrebillStatus Status { get; }
}

public sealed class PrebillLine : TenantEntity
{
    public PrebillLine(Guid id, Guid firmId, Guid prebillId, short lineType, Guid? sourceId, string description, decimal quantity, decimal unitPrice) : base(id, firmId)
    {
        RequireId(prebillId, "Prebill");
        if (lineType is < 1 or > 3 || quantity < 0 || unitPrice < 0) throw new DomainException("Prebill line values are invalid.");
        PrebillId = prebillId;
        LineType = lineType;
        SourceId = sourceId;
        Description = Required(description, 500, nameof(description));
        Quantity = quantity;
        UnitPrice = unitPrice;
    }
    public Guid PrebillId { get; }
    public short LineType { get; }
    public Guid? SourceId { get; }
    public string Description { get; }
    public decimal Quantity { get; }
    public decimal UnitPrice { get; }
}

public sealed class RoleAssignment : TenantEntity
{
    public RoleAssignment(Guid id, Guid firmId, Guid userId, string roleCode, Guid? matterId, Guid grantedBy, DateTimeOffset validFrom, DateTimeOffset? validUntil) : base(id, firmId)
    {
        RequireId(userId, "User");
        RequireId(grantedBy, "Grantor");
        if (validUntil <= validFrom) throw new DomainException("Role validity interval is invalid.");
        UserId = userId;
        RoleCode = Required(roleCode, 80, nameof(roleCode)).ToUpperInvariant();
        MatterId = matterId;
        GrantedBy = grantedBy;
        ValidFrom = validFrom;
        ValidUntil = validUntil;
    }
    public Guid UserId { get; }
    public string RoleCode { get; }
    public Guid? MatterId { get; }
    public Guid GrantedBy { get; }
    public DateTimeOffset ValidFrom { get; }
    public DateTimeOffset? ValidUntil { get; }
}

public sealed class ScheduledCommand : TenantEntity
{
    public ScheduledCommand(Guid id, Guid firmId, string commandType, int version, string payload, DateTimeOffset executeAt) : base(id, firmId)
    {
        if (version <= 0) throw new DomainException("Command version must be positive.");
        CommandType = Required(commandType, 160, nameof(commandType));
        Version = version;
        Payload = Required(payload, 100_000, nameof(payload));
        try
        {
            using var _ = JsonDocument.Parse(Payload);
        }
        catch (JsonException exception)
        {
            throw new DomainException("Scheduled command payload must be valid JSON.", exception);
        }
        ExecuteAt = executeAt;
    }
    public string CommandType { get; }
    public int Version { get; }
    public string Payload { get; }
    public DateTimeOffset ExecuteAt { get; }
}

internal static class Guard
{
    public static string Required(string? value, int max, string name)
    {
        var normalized = value?.Trim() ?? string.Empty;
        if (normalized.Length is 0 || normalized.Length > max)
            throw new DomainException($"{name} is invalid.");
        return normalized;
    }
    public static string? Optional(string? value, int max, string name) => string.IsNullOrWhiteSpace(value) ? null : Required(value, max, name);
    public static void RequireId(Guid value, string name)
    {
        if (value == Guid.Empty) throw new DomainException($"{name} identifier is required.");
    }
    public static string CurrencyCode(string value)
    {
        var normalized = Required(value, 3, nameof(value)).ToUpperInvariant();
        if (normalized.Length != 3) throw new DomainException("Currency must use ISO 4217 format.");
        return normalized;
    }
}
