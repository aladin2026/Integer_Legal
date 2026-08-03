using Integer.Legal.Application.Abstractions;
using Integer.Legal.Domain.Common;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace Integer.Legal.Api;

public sealed class ApiExceptionHandler(IProblemDetailsService problemDetails) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext context, Exception exception, CancellationToken ct)
    {
        var (status, title, detail) = exception switch
        {
            DomainException ex => (400, "Business rule rejected", ex.Message),
            ConflictException ex => (409, "Conflict", ex.Message),
            NotFoundException ex => (404, "Resource not found", ex.Message),
            UnauthorizedAccessException => (401, "Unauthorized", "Authentication and a trusted firm context are required."),
            _ => (500, "Unexpected error", "An unexpected error occurred.")
        };
        context.Response.StatusCode = status;
        return await problemDetails.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = context,
            ProblemDetails = new ProblemDetails { Status = status, Title = title, Detail = detail }
        });
    }
}
