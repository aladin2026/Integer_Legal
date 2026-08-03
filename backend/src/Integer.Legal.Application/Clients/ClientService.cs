using Integer.Legal.Application.Abstractions;
using Integer.Legal.Domain.Clients;
using Integer.Legal.Application.Operations;

namespace Integer.Legal.Application.Clients;

public sealed record CreateClientCommand(string Reference, string DisplayName, ClientKind Kind);
public sealed record CreatedClient(Guid Id, string Reference);

public sealed class ClientService(IClientRepository repository, IOperationalJournal journal, IUnitOfWork unitOfWork, IFirmContext firm, IActorContext actor)
{
    public async Task<CreatedClient> CreateAsync(CreateClientCommand command, CancellationToken ct)
    {
        var reference = command.Reference.Trim().ToUpperInvariant();
        if (await repository.ReferenceExistsAsync(firm.FirmId, reference, ct))
            throw new ConflictException("A client with this reference already exists.");
        var client = new Client(Guid.NewGuid(), firm.FirmId, reference, command.DisplayName, command.Kind);
        await repository.AddAsync(client, ct);
        await journal.RecordCreatedAsync(client, actor.ActorId, "legal.client.created.v1", ct);
        await unitOfWork.CommitAsync(ct);
        return new(client.Id, client.Reference);
    }
}
