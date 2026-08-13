using System.Security.Claims;
using Integer.Legal.Api.Security;
using Microsoft.AspNetCore.Http;
using Xunit;

namespace Integer.Legal.Api.Tests;

public sealed class ClaimsContextTests
{
    private static HttpContextAccessor Accessor(params Claim[] claims)
    {
        var identity = new ClaimsIdentity(claims, "oidc");
        return new HttpContextAccessor { HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(identity) } };
    }

    [Fact]
    public void FirmContextUsesIntegerPlatformTenantClaim()
    {
        var firmId = Guid.NewGuid();
        var context = new ClaimsFirmContext(Accessor(new Claim("integer_tenant", firmId.ToString())));
        Assert.Equal(firmId, context.FirmId);
    }

    [Fact]
    public void FirmContextRejectsLegacyFirmIdClaim()
    {
        var context = new ClaimsFirmContext(Accessor(new Claim("firm_id", Guid.NewGuid().ToString())));
        Assert.Throws<UnauthorizedAccessException>(() => context.FirmId);
    }

    [Fact]
    public void ActorContextUsesUnmappedSubjectClaim()
    {
        var actorId = Guid.NewGuid();
        var context = new ClaimsActorContext(Accessor(new Claim("sub", actorId.ToString())));
        Assert.Equal(actorId, context.ActorId);
    }
}
