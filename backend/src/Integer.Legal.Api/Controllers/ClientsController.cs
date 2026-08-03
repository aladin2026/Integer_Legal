using Integer.Legal.Application.Clients;
using Integer.Legal.Domain.Clients;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Integer.Legal.Api.Controllers;

[ApiController, Authorize(Policy = "LegalWrite"), Route("api/v1/clients")]
public sealed class ClientsController(ClientService service) : ControllerBase
{
    public sealed record CreateClientRequest(string Reference, string DisplayName, ClientKind Kind);
    [HttpPost, ProducesResponseType<CreatedClient>(StatusCodes.Status201Created)]
    public async Task<IActionResult> Create(CreateClientRequest request, CancellationToken ct)
    {
        var result = await service.CreateAsync(new(request.Reference, request.DisplayName, request.Kind), ct);
        return Created($"/api/v1/clients/{result.Id}", result);
    }
}
