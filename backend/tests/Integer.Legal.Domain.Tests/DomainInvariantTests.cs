using Integer.Legal.Domain.Clients;
using Integer.Legal.Domain.Common;
using Integer.Legal.Domain.Deadlines;
using Integer.Legal.Domain.Matters;
using Xunit;

namespace Integer.Legal.Domain.Tests;

public sealed class DomainInvariantTests
{
    [Fact] public void Client_requires_firm() => Assert.Throws<DomainException>(() => new Client(Guid.NewGuid(), Guid.Empty, "C-1", "Client", ClientKind.Person));
    [Fact] public void Client_normalizes_reference() => Assert.Equal("C-1", new Client(Guid.NewGuid(), Guid.NewGuid(), " c-1 ", "Client", ClientKind.Person).Reference);
    [Fact] public void Matter_requires_client() => Assert.Throws<DomainException>(() => new Matter(Guid.NewGuid(), Guid.NewGuid(), Guid.Empty, "D-1", "Dossier", Guid.NewGuid()));
    [Fact] public void Matter_starts_open() => Assert.Equal(MatterStatus.Open, NewMatter().Status);
    [Fact] public void Matter_can_be_closed() { var matter = NewMatter(); matter.Close(); Assert.Equal(MatterStatus.Closed, matter.Status); }
    [Fact] public void Deadline_must_be_future() { var now = DateTimeOffset.UtcNow; Assert.Throws<DomainException>(() => new Deadline(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), "Audience", now, now)); }
    [Fact] public void Deadline_starts_active() { var now = DateTimeOffset.UtcNow; Assert.Equal(DeadlineStatus.Active, NewDeadline(now).Status); }
    [Fact] public void Deadline_can_be_completed() { var deadline = NewDeadline(DateTimeOffset.UtcNow); deadline.Complete(); Assert.Equal(DeadlineStatus.Completed, deadline.Status); }

    private static Matter NewMatter() => new(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), "D-1", "Dossier", Guid.NewGuid());
    private static Deadline NewDeadline(DateTimeOffset now) => new(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), "Audience", now.AddDays(1), now);
}
