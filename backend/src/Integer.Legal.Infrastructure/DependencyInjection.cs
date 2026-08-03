using Integer.Legal.Application.Abstractions;
using Integer.Legal.Infrastructure.Persistence;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;

namespace Integer.Legal.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddLegalInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("LegalDatabase")
            ?? throw new InvalidOperationException("ConnectionStrings:LegalDatabase is required.");
        services.AddSingleton(NpgsqlDataSource.Create(connectionString));
        services.AddScoped<LegalDbSession>();
        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<LegalDbSession>());
        services.AddScoped<IClientRepository, ClientRepository>();
        services.AddScoped<IMatterRepository, MatterRepository>();
        services.AddScoped<IDeadlineRepository, DeadlineRepository>();
        return services;
    }
}
