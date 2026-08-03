using Integer.Legal.Application.Matters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Integer.Legal.Api.Controllers;

[ApiController, Authorize, Route("api/v1/matters")]
public sealed class MattersController(MatterService service) : ControllerBase
{
    public sealed record CreateMatterRequest(Guid ClientId, string Reference, string Title, Guid ResponsibleUserId);
    [HttpPost, ProducesResponseType<CreatedMatter>(StatusCodes.Status201Created)]
    public async Task<IActionResult> Create(CreateMatterRequest request, CancellationToken ct)
    {
        var result = await service.CreateAsync(new(request.ClientId, request.Reference, request.Title, request.ResponsibleUserId), ct);
        return Created($"/api/v1/matters/{result.Id}", result);
    }
}
