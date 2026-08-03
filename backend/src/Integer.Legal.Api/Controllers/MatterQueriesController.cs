using Integer.Legal.Application.Operations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Integer.Legal.Api.Controllers;

[ApiController, Authorize(Policy = "LegalRead"), Route("api/v1/matter-queries")]
public sealed class MatterQueriesController(LegalReadService service) : ControllerBase
{
    [HttpGet]
    public Task<IReadOnlyCollection<MatterListItem>> List([FromQuery] int limit = 50, [FromQuery] DateTimeOffset? before = null, CancellationToken ct = default) => service.ListMattersAsync(limit, before, ct);
    [HttpGet("{matterId:guid}/360")]
    public Task<Matter360View> Get360(Guid matterId, CancellationToken ct) => service.GetMatter360Async(matterId, ct);
}
