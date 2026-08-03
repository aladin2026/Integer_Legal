using Integer.Legal.Application.Operations;
using Integer.Legal.Domain.Operations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Integer.Legal.Api.Controllers;

[ApiController, Authorize(Policy = "LegalWrite"), Route("api/v1/parties")]
public sealed class PartiesController(OperationsService service) : ControllerBase
{
    public sealed record CreatePartyRequest(string DisplayName, PartyKind Kind, string? IdentificationNumber);
    public sealed record LinkMatterRequest(Guid MatterId, string RoleCode, bool IsAdverse);
    [HttpPost]
    public async Task<IActionResult> Create(CreatePartyRequest request, CancellationToken ct)
    {
        var result = await service.CreatePartyAsync(new(request.DisplayName, request.Kind, request.IdentificationNumber), ct);
        return Created($"/api/v1/parties/{result.Id}", result);
    }
    [HttpPost("{partyId:guid}/matter-links")]
    public async Task<IActionResult> LinkMatter(Guid partyId, LinkMatterRequest request, CancellationToken ct)
    {
        var result = await service.LinkMatterPartyAsync(new(request.MatterId, partyId, request.RoleCode, request.IsAdverse), ct);
        return Created($"/api/v1/parties/{partyId}/matter-links/{result.Id}", result);
    }
}

[ApiController, Authorize(Policy = "LegalWrite"), Route("api/v1/conflict-checks")]
public sealed class ConflictChecksController(OperationsService service) : ControllerBase
{
    public sealed record StartConflictCheckRequest(Guid? MatterId, IReadOnlyCollection<string> SearchTerms);
    public sealed record DecideConflictRequest(ConflictDecision Decision);
    [HttpPost]
    public async Task<IActionResult> Start(StartConflictCheckRequest request, CancellationToken ct)
    {
        var result = await service.StartConflictCheckAsync(new(request.MatterId, request.SearchTerms), ct);
        return Accepted($"/api/v1/conflict-checks/{result.Id}", result);
    }
    [HttpPost("{conflictCheckId:guid}/decision")]
    public async Task<IActionResult> Decide(Guid conflictCheckId, DecideConflictRequest request, CancellationToken ct)
    {
        await service.DecideConflictAsync(new(conflictCheckId, request.Decision), ct);
        return NoContent();
    }
}

[ApiController, Authorize(Policy = "LegalWrite"), Route("api/v1/procedures")]
public sealed class ProceduresController(OperationsService service) : ControllerBase
{
    public sealed record CreateProcedureRequest(Guid MatterId, string ProcedureType, string Jurisdiction, string? ExternalReference);
    [HttpPost]
    public async Task<IActionResult> Create(CreateProcedureRequest request, CancellationToken ct)
    {
        var result = await service.CreateProcedureAsync(new(request.MatterId, request.ProcedureType, request.Jurisdiction, request.ExternalReference), ct);
        return Created($"/api/v1/procedures/{result.Id}", result);
    }
}

[ApiController, Authorize(Policy = "LegalWrite"), Route("api/v1/hearings")]
public sealed class HearingsController(OperationsService service) : ControllerBase
{
    public sealed record CreateHearingRequest(Guid ProcedureId, DateTimeOffset ScheduledAt, string Purpose);
    public sealed record OutcomeRequest(string Outcome);
    [HttpPost]
    public async Task<IActionResult> Create(CreateHearingRequest request, CancellationToken ct)
    {
        var result = await service.CreateHearingAsync(new(request.ProcedureId, request.ScheduledAt, request.Purpose), ct);
        return Created($"/api/v1/hearings/{result.Id}", result);
    }
    [HttpPost("{hearingId:guid}/outcome")]
    public async Task<IActionResult> RecordOutcome(Guid hearingId, OutcomeRequest request, CancellationToken ct)
    {
        await service.RecordHearingOutcomeAsync(new(hearingId, request.Outcome), ct);
        return NoContent();
    }
}

[ApiController, Authorize(Policy = "LegalWrite"), Route("api/v1/documents")]
public sealed class DocumentsController(OperationsService service) : ControllerBase
{
    public sealed record CreateDocumentRequest(Guid MatterId, string Title, string Classification);
    [HttpPost]
    public async Task<IActionResult> Create(CreateDocumentRequest request, CancellationToken ct)
    {
        var result = await service.CreateDocumentAsync(new(request.MatterId, request.Title, request.Classification), ct);
        return Created($"/api/v1/documents/{result.Id}", result);
    }
}

[ApiController, Authorize(Policy = "LegalFinance"), Route("api/v1/financial")]
public sealed class FinancialController(OperationsService service) : ControllerBase
{
    public sealed record TimeRequest(Guid MatterId, DateOnly ActivityDate, int Minutes, string Description, bool Billable, decimal? HourlyRate, string Currency);
    public sealed record ExpenseRequest(Guid MatterId, DateOnly IncurredOn, string Description, decimal Amount, string Currency, bool Billable);
    public sealed record BudgetRequest(Guid MatterId, decimal Amount, string Currency, decimal WarningPercent);
    public sealed record PrebillRequest(Guid MatterId, string Reference, string Currency);
    public sealed record PrebillLineRequest(short LineType, Guid? SourceId, string Description, decimal Quantity, decimal UnitPrice);
    [HttpPost("time-entries")]
    public async Task<IActionResult> AddTime(TimeRequest request, CancellationToken ct) => CreatedResource(await service.AddTimeAsync(new(request.MatterId, request.ActivityDate, request.Minutes, request.Description, request.Billable, request.HourlyRate, request.Currency), ct), "time-entries");
    [HttpPost("expense-entries")]
    public async Task<IActionResult> AddExpense(ExpenseRequest request, CancellationToken ct) => CreatedResource(await service.AddExpenseAsync(new(request.MatterId, request.IncurredOn, request.Description, request.Amount, request.Currency, request.Billable), ct), "expense-entries");
    [HttpPost("budgets")]
    public async Task<IActionResult> SetBudget(BudgetRequest request, CancellationToken ct) => CreatedResource(await service.SetBudgetAsync(new(request.MatterId, request.Amount, request.Currency, request.WarningPercent), ct), "budgets");
    [HttpPost("prebills")]
    public async Task<IActionResult> CreatePrebill(PrebillRequest request, CancellationToken ct) => CreatedResource(await service.CreatePrebillAsync(new(request.MatterId, request.Reference, request.Currency), ct), "prebills");
    [HttpPost("prebills/{prebillId:guid}/lines")]
    public async Task<IActionResult> AddPrebillLine(Guid prebillId, PrebillLineRequest request, CancellationToken ct) => CreatedResource(await service.AddPrebillLineAsync(new(prebillId, request.LineType, request.SourceId, request.Description, request.Quantity, request.UnitPrice), ct), $"prebills/{prebillId}/lines");
    [HttpPost("prebills/{prebillId:guid}/approval")]
    public async Task<IActionResult> ApprovePrebill(Guid prebillId, CancellationToken ct) { await service.ApprovePrebillAsync(prebillId, ct); return NoContent(); }
    [HttpPost("prebills/{prebillId:guid}/e-invoice-submission")]
    public async Task<IActionResult> SubmitPrebill(Guid prebillId, CancellationToken ct) { await service.SubmitPrebillAsync(prebillId, ct); return Accepted(); }
    private ObjectResult CreatedResource(CreatedResource resource, string segment) => Created($"/api/v1/financial/{segment}/{resource.Id}", resource);
}

[ApiController, Authorize(Policy = "LegalAdmin"), Route("api/v1/administration")]
public sealed class AdministrationController(OperationsService service) : ControllerBase
{
    public sealed record GrantRoleRequest(Guid UserId, string RoleCode, Guid? MatterId, DateTimeOffset ValidFrom, DateTimeOffset? ValidUntil);
    public sealed record ScheduleRequest(string CommandType, int Version, string Payload, DateTimeOffset ExecuteAt);
    [HttpPost("role-assignments")]
    public async Task<IActionResult> GrantRole(GrantRoleRequest request, CancellationToken ct)
    {
        var result = await service.GrantRoleAsync(new(request.UserId, request.RoleCode, request.MatterId, request.ValidFrom, request.ValidUntil), ct);
        return Created($"/api/v1/administration/role-assignments/{result.Id}", result);
    }
    [HttpPost("scheduled-commands")]
    public async Task<IActionResult> Schedule(ScheduleRequest request, CancellationToken ct)
    {
        var result = await service.ScheduleAsync(new(request.CommandType, request.Version, request.Payload, request.ExecuteAt), ct);
        return Accepted($"/api/v1/administration/scheduled-commands/{result.Id}", result);
    }
}
