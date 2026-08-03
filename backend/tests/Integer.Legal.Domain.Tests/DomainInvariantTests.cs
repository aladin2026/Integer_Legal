using Integer.Legal.Domain.Clients;
using Integer.Legal.Domain.Common;
using Integer.Legal.Domain.Deadlines;
using Integer.Legal.Domain.Matters;
using Integer.Legal.Domain.Operations;
using Xunit;

namespace Integer.Legal.Domain.Tests;

public sealed class DomainInvariantTests
{
    [Fact] public void ClientRequiresFirm() => Assert.Throws<DomainException>(() => new Client(Guid.NewGuid(), Guid.Empty, "C-1", "Client", ClientKind.Person));
    [Fact] public void ClientNormalizesReference() => Assert.Equal("C-1", new Client(Guid.NewGuid(), Guid.NewGuid(), " c-1 ", "Client", ClientKind.Person).Reference);
    [Fact] public void MatterRequiresClient() => Assert.Throws<DomainException>(() => new Matter(Guid.NewGuid(), Guid.NewGuid(), Guid.Empty, "D-1", "Dossier", Guid.NewGuid()));
    [Fact] public void MatterStartsOpen() => Assert.Equal(MatterStatus.Open, NewMatter().Status);
    [Fact] public void MatterCanBeClosed() { var matter = NewMatter(); matter.Close(); Assert.Equal(MatterStatus.Closed, matter.Status); }
    [Fact] public void DeadlineMustBeFuture() { var now = DateTimeOffset.UtcNow; Assert.Throws<DomainException>(() => new Deadline(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), "Audience", now, now)); }
    [Fact] public void DeadlineStartsActive() { var now = DateTimeOffset.UtcNow; Assert.Equal(DeadlineStatus.Active, NewDeadline(now).Status); }
    [Fact] public void DeadlineCanBeCompleted() { var deadline = NewDeadline(DateTimeOffset.UtcNow); deadline.Complete(); Assert.Equal(DeadlineStatus.Completed, deadline.Status); }
    [Fact] public void PartyNormalizesName() => Assert.Equal("SOCIÉTÉ ALPHA", new Party(Guid.NewGuid(), Guid.NewGuid(), " Société Alpha ", PartyKind.Organization, null).NormalizedName);
    [Fact] public void ConflictCheckRequiresTerms() => Assert.Throws<DomainException>(() => new ConflictCheck(Guid.NewGuid(), Guid.NewGuid(), null, Guid.NewGuid(), []));
    [Fact] public void HearingMustBeFuture() { var now = DateTimeOffset.UtcNow; Assert.Throws<DomainException>(() => new Hearing(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), now, "Audience", now)); }
    [Fact] public void DocumentVersionRejectsInvalidHash() => Assert.Throws<DomainException>(() => new DocumentVersion(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), 1, "object", "bad", "application/pdf", 12, Guid.NewGuid()));
    [Fact] public void TimeEntryRequiresPositiveMinutes() => Assert.Throws<DomainException>(() => new TimeEntry(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), DateOnly.FromDateTime(DateTime.UtcNow), 0, "Travail", true, null, "MAD"));
    [Fact] public void ExpenseRejectsNegativeAmount() => Assert.Throws<DomainException>(() => new ExpenseEntry(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), DateOnly.FromDateTime(DateTime.UtcNow), "Frais", -1, "MAD", true));
    [Fact] public void BudgetRejectsInvalidWarning() => Assert.Throws<DomainException>(() => new Budget(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), 1000, "MAD", 101));
    [Fact] public void PrebillStartsAsDraft() => Assert.Equal(PrebillStatus.Draft, new Prebill(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), "PF-1", "MAD", Guid.NewGuid()).Status);
    [Fact] public void RoleAssignmentRejectsInvalidInterval() { var now = DateTimeOffset.UtcNow; Assert.Throws<DomainException>(() => new RoleAssignment(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), "LAWYER", null, Guid.NewGuid(), now, now)); }
    [Fact] public void ScheduledCommandRequiresVersion() => Assert.Throws<DomainException>(() => new ScheduledCommand(Guid.NewGuid(), Guid.NewGuid(), "legal.deadline.remind", 0, "{}", DateTimeOffset.UtcNow));

    private static Matter NewMatter() => new(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), "D-1", "Dossier", Guid.NewGuid());
    private static Deadline NewDeadline(DateTimeOffset now) => new(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), "Audience", now.AddDays(1), now);
}
