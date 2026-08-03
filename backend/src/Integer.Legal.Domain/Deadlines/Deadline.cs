using Integer.Legal.Domain.Common;

namespace Integer.Legal.Domain.Deadlines;

public enum DeadlineStatus { Active = 1, Completed = 2, Cancelled = 3 }

public sealed class Deadline : TenantEntity
{
    public Deadline(Guid id, Guid firmId, Guid matterId, string title, DateTimeOffset dueAt, DateTimeOffset now)
        : base(id, firmId)
    {
        if (matterId == Guid.Empty) throw new DomainException("Matter identifier is required.");
        var normalized = title?.Trim() ?? string.Empty;
        if (normalized.Length is 0 or > 240) throw new DomainException("Deadline title is invalid.");
        if (dueAt <= now) throw new DomainException("An active deadline must be in the future.");
        MatterId = matterId;
        Title = normalized;
        DueAt = dueAt;
        Status = DeadlineStatus.Active;
    }

    public Guid MatterId { get; }
    public string Title { get; }
    public DateTimeOffset DueAt { get; }
    public DeadlineStatus Status { get; private set; }
    public void Complete() => Status = DeadlineStatus.Completed;
}
