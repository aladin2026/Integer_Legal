using System.Security.Claims;
using Integer.Legal.Application.Abstractions;

namespace Integer.Legal.Api.Security;

public sealed class ClaimsFirmContext(IHttpContextAccessor accessor) : IFirmContext
{
    public Guid FirmId
    {
        get
        {
            var principal = accessor.HttpContext?.User;
            var value = principal?.FindFirstValue("firm_id");
            if (principal?.Identity?.IsAuthenticated != true || !Guid.TryParse(value, out var firmId) || firmId == Guid.Empty)
                throw new UnauthorizedAccessException("A trusted firm context is required.");
            return firmId;
        }
    }
}

public sealed class SystemClock : IClock { public DateTimeOffset UtcNow => DateTimeOffset.UtcNow; }
