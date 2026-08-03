using Integer.Legal.Application.Abstractions;
using Integer.Legal.Domain.Operations;

namespace Integer.Legal.Application.Operations;

public interface IOperationsRepository
{
    Task<bool> MatterExistsAsync(Guid firmId, Guid matterId, CancellationToken ct);
    Task<bool> ProcedureExistsAsync(Guid firmId, Guid procedureId, CancellationToken ct);
    Task<bool> DocumentExistsAsync(Guid firmId, Guid documentId, CancellationToken ct);
    Task<bool> PartyExistsAsync(Guid firmId, Guid partyId, CancellationToken ct);
    Task<bool> PrebillExistsAsync(Guid firmId, Guid prebillId, CancellationToken ct);
    Task AddPartyAsync(Party value, CancellationToken ct);
    Task AddConflictCheckAsync(ConflictCheck value, CancellationToken ct);
    Task AddMatterPartyAsync(MatterParty value, CancellationToken ct);
    Task AddProcedureAsync(Procedure value, CancellationToken ct);
    Task AddHearingAsync(Hearing value, CancellationToken ct);
    Task AddDocumentAsync(LegalDocument value, CancellationToken ct);
    Task AddDocumentVersionAsync(DocumentVersion value, CancellationToken ct);
    Task AddTimeEntryAsync(TimeEntry value, CancellationToken ct);
    Task AddExpenseEntryAsync(ExpenseEntry value, CancellationToken ct);
    Task AddBudgetAsync(Budget value, CancellationToken ct);
    Task AddPrebillAsync(Prebill value, CancellationToken ct);
    Task AddPrebillLineAsync(PrebillLine value, CancellationToken ct);
    Task AddRoleAssignmentAsync(RoleAssignment value, CancellationToken ct);
    Task AddScheduledCommandAsync(ScheduledCommand value, CancellationToken ct);
    Task<bool> DecideConflictAsync(Guid firmId, Guid checkId, Guid actorId, ConflictDecision decision, CancellationToken ct);
    Task<bool> RecordHearingOutcomeAsync(Guid firmId, Guid hearingId, string outcome, CancellationToken ct);
    Task<bool> ApprovePrebillAsync(Guid firmId, Guid prebillId, Guid actorId, CancellationToken ct);
    Task<bool> SubmitPrebillAsync(Guid firmId, Guid prebillId, CancellationToken ct);
}

public interface IOperationalJournal
{
    Task RecordCreatedAsync(Integer.Legal.Domain.Common.TenantEntity entity, Guid actorId, string eventType, CancellationToken ct);
    Task RecordAsync(Guid firmId, Guid actorId, string action, string entityType, Guid entityId, string eventType, string payload, CancellationToken ct);
}

public sealed record CreatePartyCommand(string DisplayName, PartyKind Kind, string? IdentificationNumber);
public sealed record CreateConflictCheckCommand(Guid? MatterId, IReadOnlyCollection<string> SearchTerms);
public sealed record LinkMatterPartyCommand(Guid MatterId, Guid PartyId, string RoleCode, bool IsAdverse);
public sealed record DecideConflictCommand(Guid ConflictCheckId, ConflictDecision Decision);
public sealed record CreateProcedureCommand(Guid MatterId, string ProcedureType, string Jurisdiction, string? ExternalReference);
public sealed record CreateHearingCommand(Guid ProcedureId, DateTimeOffset ScheduledAt, string Purpose);
public sealed record RecordHearingOutcomeCommand(Guid HearingId, string Outcome);
public sealed record CreateDocumentCommand(Guid MatterId, string Title, string Classification);
public sealed record CreateDocumentVersionCommand(Guid DocumentId, int VersionNumber, string StorageObjectKey, string ContentSha256, string MediaType, long SizeBytes);
public sealed record CreateTimeEntryCommand(Guid MatterId, DateOnly ActivityDate, int Minutes, string Description, bool Billable, decimal? HourlyRate, string Currency);
public sealed record CreateExpenseEntryCommand(Guid MatterId, DateOnly IncurredOn, string Description, decimal Amount, string Currency, bool Billable);
public sealed record CreateBudgetCommand(Guid MatterId, decimal Amount, string Currency, decimal WarningPercent);
public sealed record CreatePrebillCommand(Guid MatterId, string Reference, string Currency);
public sealed record CreatePrebillLineCommand(Guid PrebillId, short LineType, Guid? SourceId, string Description, decimal Quantity, decimal UnitPrice);
public sealed record GrantRoleCommand(Guid UserId, string RoleCode, Guid? MatterId, DateTimeOffset ValidFrom, DateTimeOffset? ValidUntil);
public sealed record ScheduleCommand(string CommandType, int Version, string Payload, DateTimeOffset ExecuteAt);
public sealed record CreatedResource(Guid Id);

public sealed class OperationsService(
    IOperationsRepository repository,
    IOperationalJournal journal,
    IUnitOfWork unitOfWork,
    IFirmContext firm,
    IActorContext actor,
    IClock clock)
{
    public Task<CreatedResource> CreatePartyAsync(CreatePartyCommand command, CancellationToken ct) => PersistAsync(
        new Party(Guid.NewGuid(), firm.FirmId, command.DisplayName, command.Kind, command.IdentificationNumber), repository.AddPartyAsync, ct);

    public async Task<CreatedResource> StartConflictCheckAsync(CreateConflictCheckCommand command, CancellationToken ct)
    {
        if (command.MatterId.HasValue) await EnsureMatterAsync(command.MatterId.Value, ct);
        return await PersistAsync(new ConflictCheck(Guid.NewGuid(), firm.FirmId, command.MatterId, actor.ActorId, command.SearchTerms), repository.AddConflictCheckAsync, ct);
    }

    public async Task<CreatedResource> LinkMatterPartyAsync(LinkMatterPartyCommand command, CancellationToken ct)
    {
        await EnsureMatterAsync(command.MatterId, ct);
        if (!await repository.PartyExistsAsync(firm.FirmId, command.PartyId, ct)) throw new NotFoundException("Party was not found in the current firm.");
        return await PersistAsync(new MatterParty(Guid.NewGuid(), firm.FirmId, command.MatterId, command.PartyId, command.RoleCode, command.IsAdverse), repository.AddMatterPartyAsync, ct);
    }

    public async Task DecideConflictAsync(DecideConflictCommand command, CancellationToken ct)
    {
        if (!await repository.DecideConflictAsync(firm.FirmId, command.ConflictCheckId, actor.ActorId, command.Decision, ct)) throw new ConflictException("Conflict check is missing or already decided.");
        await journal.RecordAsync(firm.FirmId, actor.ActorId, "decided", "ConflictCheck", command.ConflictCheckId, "legal.conflict-check.decided.v1", $"{{\"decision\":{(short)command.Decision}}}", ct);
        await unitOfWork.CommitAsync(ct);
    }

    public async Task<CreatedResource> CreateProcedureAsync(CreateProcedureCommand command, CancellationToken ct)
    {
        await EnsureMatterAsync(command.MatterId, ct);
        return await PersistAsync(new Procedure(Guid.NewGuid(), firm.FirmId, command.MatterId, command.ProcedureType, command.Jurisdiction, command.ExternalReference), repository.AddProcedureAsync, ct);
    }

    public async Task<CreatedResource> CreateHearingAsync(CreateHearingCommand command, CancellationToken ct)
    {
        if (!await repository.ProcedureExistsAsync(firm.FirmId, command.ProcedureId, ct)) throw new NotFoundException("Procedure was not found in the current firm.");
        return await PersistAsync(new Hearing(Guid.NewGuid(), firm.FirmId, command.ProcedureId, command.ScheduledAt, command.Purpose, clock.UtcNow), repository.AddHearingAsync, ct);
    }

    public async Task RecordHearingOutcomeAsync(RecordHearingOutcomeCommand command, CancellationToken ct)
    {
        var outcome = command.Outcome?.Trim() ?? string.Empty;
        if (outcome.Length is 0 or > 10_000) throw new Integer.Legal.Domain.Common.DomainException("Hearing outcome is invalid.");
        if (!await repository.RecordHearingOutcomeAsync(firm.FirmId, command.HearingId, outcome, ct)) throw new ConflictException("Hearing is missing or cannot receive an outcome.");
        await journal.RecordAsync(firm.FirmId, actor.ActorId, "outcome-recorded", "Hearing", command.HearingId, "legal.hearing.outcome-recorded.v1", "{}", ct);
        await unitOfWork.CommitAsync(ct);
    }

    public async Task<CreatedResource> CreateDocumentAsync(CreateDocumentCommand command, CancellationToken ct)
    {
        await EnsureMatterAsync(command.MatterId, ct);
        return await PersistAsync(new LegalDocument(Guid.NewGuid(), firm.FirmId, command.MatterId, command.Title, command.Classification, actor.ActorId), repository.AddDocumentAsync, ct);
    }

    public async Task<CreatedResource> AddDocumentVersionAsync(CreateDocumentVersionCommand command, CancellationToken ct)
    {
        if (!await repository.DocumentExistsAsync(firm.FirmId, command.DocumentId, ct)) throw new NotFoundException("Document was not found in the current firm.");
        var version = new DocumentVersion(Guid.NewGuid(), firm.FirmId, command.DocumentId, command.VersionNumber, command.StorageObjectKey, command.ContentSha256, command.MediaType, command.SizeBytes, actor.ActorId);
        return await PersistAsync(version, repository.AddDocumentVersionAsync, ct);
    }

    public async Task<CreatedResource> AddTimeAsync(CreateTimeEntryCommand command, CancellationToken ct)
    {
        await EnsureMatterAsync(command.MatterId, ct);
        var entry = new TimeEntry(Guid.NewGuid(), firm.FirmId, command.MatterId, actor.ActorId, command.ActivityDate, command.Minutes, command.Description, command.Billable, command.HourlyRate, command.Currency);
        return await PersistAsync(entry, repository.AddTimeEntryAsync, ct);
    }

    public async Task<CreatedResource> AddExpenseAsync(CreateExpenseEntryCommand command, CancellationToken ct)
    {
        await EnsureMatterAsync(command.MatterId, ct);
        var entry = new ExpenseEntry(Guid.NewGuid(), firm.FirmId, command.MatterId, command.IncurredOn, command.Description, command.Amount, command.Currency, command.Billable);
        return await PersistAsync(entry, repository.AddExpenseEntryAsync, ct);
    }

    public async Task<CreatedResource> SetBudgetAsync(CreateBudgetCommand command, CancellationToken ct)
    {
        await EnsureMatterAsync(command.MatterId, ct);
        return await PersistAsync(new Budget(Guid.NewGuid(), firm.FirmId, command.MatterId, command.Amount, command.Currency, command.WarningPercent), repository.AddBudgetAsync, ct);
    }

    public async Task<CreatedResource> CreatePrebillAsync(CreatePrebillCommand command, CancellationToken ct)
    {
        await EnsureMatterAsync(command.MatterId, ct);
        return await PersistAsync(new Prebill(Guid.NewGuid(), firm.FirmId, command.MatterId, command.Reference, command.Currency, actor.ActorId), repository.AddPrebillAsync, ct);
    }

    public async Task<CreatedResource> AddPrebillLineAsync(CreatePrebillLineCommand command, CancellationToken ct)
    {
        if (!await repository.PrebillExistsAsync(firm.FirmId, command.PrebillId, ct)) throw new NotFoundException("Prebill was not found in the current firm.");
        var line = new PrebillLine(Guid.NewGuid(), firm.FirmId, command.PrebillId, command.LineType, command.SourceId, command.Description, command.Quantity, command.UnitPrice);
        return await PersistAsync(line, repository.AddPrebillLineAsync, ct);
    }

    public async Task ApprovePrebillAsync(Guid prebillId, CancellationToken ct)
    {
        if (!await repository.ApprovePrebillAsync(firm.FirmId, prebillId, actor.ActorId, ct)) throw new ConflictException("Only a reviewable prebill can be approved.");
        await journal.RecordAsync(firm.FirmId, actor.ActorId, "approved", "Prebill", prebillId, "legal.prebill.approved.v1", "{}", ct);
        await unitOfWork.CommitAsync(ct);
    }

    public async Task SubmitPrebillAsync(Guid prebillId, CancellationToken ct)
    {
        if (!await repository.SubmitPrebillAsync(firm.FirmId, prebillId, ct)) throw new ConflictException("Only an approved prebill can be submitted.");
        await journal.RecordAsync(firm.FirmId, actor.ActorId, "submitted", "Prebill", prebillId, "legal.prebill.submitted.v1", "{}", ct);
        await unitOfWork.CommitAsync(ct);
    }

    public async Task<CreatedResource> GrantRoleAsync(GrantRoleCommand command, CancellationToken ct)
    {
        if (command.MatterId.HasValue) await EnsureMatterAsync(command.MatterId.Value, ct);
        var assignment = new RoleAssignment(Guid.NewGuid(), firm.FirmId, command.UserId, command.RoleCode, command.MatterId, actor.ActorId, command.ValidFrom, command.ValidUntil);
        return await PersistAsync(assignment, repository.AddRoleAssignmentAsync, ct);
    }

    public Task<CreatedResource> ScheduleAsync(ScheduleCommand command, CancellationToken ct) => PersistAsync(
        new ScheduledCommand(Guid.NewGuid(), firm.FirmId, command.CommandType, command.Version, command.Payload, command.ExecuteAt), repository.AddScheduledCommandAsync, ct);

    private async Task EnsureMatterAsync(Guid matterId, CancellationToken ct)
    {
        if (!await repository.MatterExistsAsync(firm.FirmId, matterId, ct)) throw new NotFoundException("Matter was not found in the current firm.");
    }

    private async Task<CreatedResource> PersistAsync<T>(T entity, Func<T, CancellationToken, Task> add, CancellationToken ct) where T : Integer.Legal.Domain.Common.TenantEntity
    {
        await add(entity, ct);
        await journal.RecordCreatedAsync(entity, actor.ActorId, EventName(entity), ct);
        await unitOfWork.CommitAsync(ct);
        return new(entity.Id);
    }

    private static string EventName(Integer.Legal.Domain.Common.TenantEntity entity) => entity switch
    {
        Party => "legal.party.created.v1",
        ConflictCheck => "legal.conflict-check.requested.v1",
        MatterParty => "legal.matter-party.linked.v1",
        Procedure => "legal.procedure.created.v1",
        Hearing => "legal.hearing.scheduled.v1",
        LegalDocument => "legal.document.created.v1",
        DocumentVersion => "legal.document-version.created.v1",
        TimeEntry => "legal.time-entry.created.v1",
        ExpenseEntry => "legal.expense-entry.created.v1",
        Budget => "legal.budget.created.v1",
        Prebill => "legal.prebill.created.v1",
        PrebillLine => "legal.prebill-line.created.v1",
        RoleAssignment => "legal.role-assignment.created.v1",
        ScheduledCommand => "legal.scheduled-command.created.v1",
        _ => throw new InvalidOperationException("Unsupported operational event type.")
    };
}
