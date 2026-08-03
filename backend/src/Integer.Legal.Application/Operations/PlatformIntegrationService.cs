using Integer.Legal.Application.Abstractions;

namespace Integer.Legal.Application.Operations;

public sealed record OutboxEnvelope(Guid Id, string EventType, int EventVersion, string Payload, DateTimeOffset OccurredAt);
public sealed record ScheduledCommandEnvelope(Guid Id, string CommandType, int CommandVersion, string Payload, DateTimeOffset ExecuteAt, int AttemptCount);

public interface IPlatformIntegrationRepository
{
    Task<IReadOnlyCollection<OutboxEnvelope>> ClaimOutboxAsync(Guid firmId, int maximum, TimeSpan lease, CancellationToken ct);
    Task<bool> AcknowledgeOutboxAsync(Guid firmId, Guid messageId, CancellationToken ct);
    Task<bool> RejectOutboxAsync(Guid firmId, Guid messageId, string error, CancellationToken ct);
    Task<IReadOnlyCollection<ScheduledCommandEnvelope>> ClaimScheduledAsync(Guid firmId, int maximum, TimeSpan lease, CancellationToken ct);
    Task<bool> CompleteScheduledAsync(Guid firmId, Guid commandId, CancellationToken ct);
    Task<bool> FailScheduledAsync(Guid firmId, Guid commandId, string error, CancellationToken ct);
}

public sealed class PlatformIntegrationService(IPlatformIntegrationRepository repository, IUnitOfWork unitOfWork, IFirmContext firm)
{
    public async Task<IReadOnlyCollection<OutboxEnvelope>> ClaimOutboxAsync(int maximum, int leaseSeconds, CancellationToken ct)
    {
        ValidateLease(maximum, leaseSeconds);
        var result = await repository.ClaimOutboxAsync(firm.FirmId, maximum, TimeSpan.FromSeconds(leaseSeconds), ct);
        await unitOfWork.CommitAsync(ct); return result;
    }
    public async Task AcknowledgeOutboxAsync(Guid id, CancellationToken ct) => await TransitionAsync(repository.AcknowledgeOutboxAsync(firm.FirmId, id, ct), "Outbox message was not claimable.", ct);
    public async Task RejectOutboxAsync(Guid id, string error, CancellationToken ct) => await TransitionAsync(repository.RejectOutboxAsync(firm.FirmId, id, Error(error), ct), "Outbox message was not claimable.", ct);
    public async Task<IReadOnlyCollection<ScheduledCommandEnvelope>> ClaimScheduledAsync(int maximum, int leaseSeconds, CancellationToken ct)
    {
        ValidateLease(maximum, leaseSeconds);
        var result = await repository.ClaimScheduledAsync(firm.FirmId, maximum, TimeSpan.FromSeconds(leaseSeconds), ct);
        await unitOfWork.CommitAsync(ct); return result;
    }
    public async Task CompleteScheduledAsync(Guid id, CancellationToken ct) => await TransitionAsync(repository.CompleteScheduledAsync(firm.FirmId, id, ct), "Scheduled command was not leased.", ct);
    public async Task FailScheduledAsync(Guid id, string error, CancellationToken ct) => await TransitionAsync(repository.FailScheduledAsync(firm.FirmId, id, Error(error), ct), "Scheduled command was not leased.", ct);

    private async Task TransitionAsync(Task<bool> transition, string message, CancellationToken ct)
    {
        if (!await transition) throw new ConflictException(message);
        await unitOfWork.CommitAsync(ct);
    }
    private static void ValidateLease(int maximum, int leaseSeconds)
    {
        if (maximum is < 1 or > 100 || leaseSeconds is < 10 or > 600) throw new Integer.Legal.Domain.Common.DomainException("Worker lease parameters are invalid.");
    }
    private static string Error(string value)
    {
        var normalized = value?.Trim() ?? string.Empty;
        if (normalized.Length is 0 or > 1000) throw new Integer.Legal.Domain.Common.DomainException("Worker error is invalid.");
        return normalized;
    }
}
