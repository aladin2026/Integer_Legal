using Integer.Legal.Domain.Clients;
using Integer.Legal.Domain.Deadlines;
using Integer.Legal.Domain.Matters;

namespace Integer.Legal.Application.Abstractions;

public interface IFirmContext { Guid FirmId { get; } }
public interface IActorContext { Guid ActorId { get; } }
public interface IClock { DateTimeOffset UtcNow { get; } }
public interface IClientRepository { Task<bool> ReferenceExistsAsync(Guid firmId, string reference, CancellationToken ct); Task AddAsync(Client client, CancellationToken ct); }
public interface IMatterRepository { Task<bool> ReferenceExistsAsync(Guid firmId, string reference, CancellationToken ct); Task<bool> ClientExistsAsync(Guid firmId, Guid clientId, CancellationToken ct); Task AddAsync(Matter matter, CancellationToken ct); }
public interface IDeadlineRepository { Task<bool> MatterExistsAsync(Guid firmId, Guid matterId, CancellationToken ct); Task AddAsync(Deadline deadline, CancellationToken ct); }
public interface IUnitOfWork { Task CommitAsync(CancellationToken ct); }

public sealed class ConflictException(string message) : Exception(message);
public sealed class NotFoundException(string message) : Exception(message);
