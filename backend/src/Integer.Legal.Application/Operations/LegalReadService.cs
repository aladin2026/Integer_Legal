using Integer.Legal.Application.Abstractions;

namespace Integer.Legal.Application.Operations;

public sealed record MatterListItem(Guid Id, string Reference, string Title, short Status, Guid ClientId, string ClientName, Guid ResponsibleUserId, DateTimeOffset CreatedAt);
public sealed record DeadlineView(Guid Id, string Title, DateTimeOffset DueAt, short Status);
public sealed record PartyView(Guid Id, string DisplayName, string RoleCode, bool IsAdverse);
public sealed record ConflictView(Guid Id, short Status, short? Decision, DateTimeOffset CreatedAt);
public sealed record ProcedureView(Guid Id, string ProcedureType, string Jurisdiction, short Status);
public sealed record HearingView(Guid Id, Guid ProcedureId, DateTimeOffset ScheduledAt, string Purpose, short Status, string? Outcome);
public sealed record DocumentView(Guid Id, string Title, string Classification, int VersionCount, DateTimeOffset CreatedAt);
public sealed record FinancialView(int TotalMinutes, decimal TotalExpenses, decimal? BudgetAmount, decimal ApprovedPrebillsTotal, string Currency);
public sealed record Matter360View(
    MatterListItem Matter,
    IReadOnlyCollection<DeadlineView> Deadlines,
    IReadOnlyCollection<PartyView> Parties,
    IReadOnlyCollection<ConflictView> ConflictChecks,
    IReadOnlyCollection<ProcedureView> Procedures,
    IReadOnlyCollection<HearingView> Hearings,
    IReadOnlyCollection<DocumentView> Documents,
    FinancialView Financial);

public interface ILegalReadRepository
{
    Task<IReadOnlyCollection<MatterListItem>> ListMattersAsync(Guid firmId, int limit, DateTimeOffset? before, CancellationToken ct);
    Task<Matter360View?> GetMatter360Async(Guid firmId, Guid matterId, CancellationToken ct);
}

public sealed class LegalReadService(ILegalReadRepository repository, IFirmContext firm)
{
    public Task<IReadOnlyCollection<MatterListItem>> ListMattersAsync(int limit, DateTimeOffset? before, CancellationToken ct)
    {
        if (limit is < 1 or > 100) throw new Integer.Legal.Domain.Common.DomainException("Matter page size is invalid.");
        return repository.ListMattersAsync(firm.FirmId, limit, before, ct);
    }

    public async Task<Matter360View> GetMatter360Async(Guid matterId, CancellationToken ct) =>
        await repository.GetMatter360Async(firm.FirmId, matterId, ct)
        ?? throw new NotFoundException("Matter was not found in the current firm.");
}
