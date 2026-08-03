using Integer.Legal.Api;
using Integer.Legal.Api.Security;
using Integer.Legal.Application.Abstractions;
using Integer.Legal.Application.Clients;
using Integer.Legal.Application.Deadlines;
using Integer.Legal.Application.Matters;
using Integer.Legal.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<ApiExceptionHandler>();
builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IFirmContext, ClaimsFirmContext>();
builder.Services.AddSingleton<IClock, SystemClock>();
builder.Services.AddScoped<ClientService>();
builder.Services.AddScoped<MatterService>();
builder.Services.AddScoped<DeadlineService>();
builder.Services.AddLegalInfrastructure(builder.Configuration);

var authority = builder.Configuration["Authentication:Authority"] ?? throw new InvalidOperationException("Authentication:Authority is required.");
var audience = builder.Configuration["Authentication:Audience"] ?? throw new InvalidOperationException("Authentication:Audience is required.");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
{
    options.Authority = authority;
    options.Audience = audience;
    options.RequireHttpsMetadata = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ClockSkew = TimeSpan.FromMinutes(1)
    };
});
builder.Services.AddAuthorization(options => options.FallbackPolicy = options.DefaultPolicy);

var app = builder.Build();
app.UseExceptionHandler();
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
if (app.Environment.IsDevelopment()) app.MapOpenApi().AllowAnonymous();
app.MapControllers();
app.MapGet("/health/live", () => Results.Ok(new { status = "healthy" })).AllowAnonymous();
app.Run();

public partial class Program;
