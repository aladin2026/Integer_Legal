using Integer.Legal.Application.Operations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Integer.Legal.Api.Controllers;

[ApiController, Authorize(Policy = "PlatformWorker"), Route("api/v1/platform-integration")]
public sealed class PlatformIntegrationController(PlatformIntegrationService service, OperationsService operations) : ControllerBase
{
    public sealed record ClaimRequest(int Maximum = 50, int LeaseSeconds = 60);
    public sealed record FailureRequest(string Error);
    public sealed record RegisterDocumentVersionRequest(int VersionNumber, string StorageObjectKey, string ContentSha256, string MediaType, long SizeBytes);

    [HttpPost("documents/{documentId:guid}/versions")]
    public async Task<IActionResult> RegisterDocumentVersion(Guid documentId, RegisterDocumentVersionRequest request, CancellationToken ct)
    {
        var result = await operations.AddDocumentVersionAsync(new(documentId, request.VersionNumber, request.StorageObjectKey, request.ContentSha256, request.MediaType, request.SizeBytes), ct);
        return Created($"/api/v1/documents/{documentId}/versions/{result.Id}", result);
    }

    [HttpPost("outbox/claim")]
    public Task<IReadOnlyCollection<OutboxEnvelope>> ClaimOutbox(ClaimRequest request, CancellationToken ct) => service.ClaimOutboxAsync(request.Maximum, request.LeaseSeconds, ct);
    [HttpPost("outbox/{messageId:guid}/acknowledgement")]
    public async Task<IActionResult> AcknowledgeOutbox(Guid messageId, CancellationToken ct) { await service.AcknowledgeOutboxAsync(messageId, ct); return NoContent(); }
    [HttpPost("outbox/{messageId:guid}/failure")]
    public async Task<IActionResult> RejectOutbox(Guid messageId, FailureRequest request, CancellationToken ct) { await service.RejectOutboxAsync(messageId, request.Error, ct); return NoContent(); }

    [HttpPost("scheduler/claim")]
    public Task<IReadOnlyCollection<ScheduledCommandEnvelope>> ClaimScheduled(ClaimRequest request, CancellationToken ct) => service.ClaimScheduledAsync(request.Maximum, request.LeaseSeconds, ct);
    [HttpPost("scheduler/{commandId:guid}/completion")]
    public async Task<IActionResult> CompleteScheduled(Guid commandId, CancellationToken ct) { await service.CompleteScheduledAsync(commandId, ct); return NoContent(); }
    [HttpPost("scheduler/{commandId:guid}/failure")]
    public async Task<IActionResult> FailScheduled(Guid commandId, FailureRequest request, CancellationToken ct) { await service.FailScheduledAsync(commandId, request.Error, ct); return NoContent(); }
}
