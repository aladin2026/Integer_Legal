using Integer.Legal.Application.Abstractions;
using Integer.Legal.Domain.Matters;
using Integer.Legal.Application.Operations;

namespace Integer.Legal.Application.Matters;

public sealed record CreateMatterCommand(Guid ClientId, string Reference, string Title, Guid ResponsibleUserId);
public sealed record CreatedMatter(Guid Id, string Reference);

public sealed class MatterService(IMatterRepository repository, IOperationalJournal journal, IUnitOfWork unitOfWork, IFirmContext firm, IActorContext actor)
{
    public async Task<CreatedMatter> CreateAsync(CreateMatterCommand command, CancellationToken ct)
    {
        if (!await repository.ClientExistsAsync(firm.FirmId, command.ClientId, ct))
            throw new NotFoundException("Client was not found in the current firm.");
        var reference = command.Reference.Trim().ToUpperInvariant();
        if (await repository.ReferenceExistsAsync(firm.FirmId, reference, ct))
            throw new ConflictException("A matter with this reference already exists.");
        var matter = new Matter(Guid.NewGuid(), firm.FirmId, command.ClientId, reference, command.Title, command.ResponsibleUserId);
        await repository.AddAsync(matter, ct);
        await journal.RecordCreatedAsync(matter, actor.ActorId, "legal.matter.created.v1", ct);
        await unitOfWork.CommitAsync(ct);
        return new(matter.Id, matter.Reference);
    }
}
