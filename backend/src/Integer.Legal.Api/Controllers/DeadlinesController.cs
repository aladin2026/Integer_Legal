using Integer.Legal.Application.Deadlines;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Integer.Legal.Api.Controllers;

[ApiController, Authorize(Policy = "LegalWrite"), Route("api/v1/deadlines")]
public sealed class DeadlinesController(DeadlineService service) : ControllerBase
{
    public sealed record CreateDeadlineRequest(Guid MatterId, string Title, DateTimeOffset DueAt);
    [HttpPost, ProducesResponseType<CreatedDeadline>(StatusCodes.Status201Created)]
    public async Task<IActionResult> Create(CreateDeadlineRequest request, CancellationToken ct)
    {
        var result = await service.CreateAsync(new(request.MatterId, request.Title, request.DueAt), ct);
        return Created($"/api/v1/deadlines/{result.Id}", result);
    }
}
