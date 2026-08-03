using Integer.Legal.Application.Abstractions;
using Integer.Legal.Domain.Deadlines;

namespace Integer.Legal.Application.Deadlines;

public sealed record CreateDeadlineCommand(Guid MatterId, string Title, DateTimeOffset DueAt);
public sealed record CreatedDeadline(Guid Id, DateTimeOffset DueAt);

public sealed class DeadlineService(IDeadlineRepository repository, IUnitOfWork unitOfWork, IFirmContext firm, IClock clock)
{
    public async Task<CreatedDeadline> CreateAsync(CreateDeadlineCommand command, CancellationToken ct)
    {
        if (!await repository.MatterExistsAsync(firm.FirmId, command.MatterId, ct))
            throw new NotFoundException("Matter was not found in the current firm.");
        var deadline = new Deadline(Guid.NewGuid(), firm.FirmId, command.MatterId, command.Title, command.DueAt, clock.UtcNow);
        await repository.AddAsync(deadline, ct);
        await unitOfWork.CommitAsync(ct);
        return new(deadline.Id, deadline.DueAt);
    }
}
