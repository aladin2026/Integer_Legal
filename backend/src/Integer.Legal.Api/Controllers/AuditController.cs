using Integer.Legal.Application.Operations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Integer.Legal.Api.Controllers;

[ApiController, Authorize(Policy = "LegalAdmin"), Route("api/v1/audit")]
public sealed class AuditController(AuditService service) : ControllerBase
{
    [HttpGet]
    public Task<IReadOnlyCollection<AuditEntryView>> List([FromQuery] int limit = 50, [FromQuery] DateTimeOffset? before = null, CancellationToken ct = default) => service.ListAsync(limit, before, ct);
}
