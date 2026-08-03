using Integer.Legal.Application.Abstractions;
using Npgsql;

namespace Integer.Legal.Infrastructure.Persistence;

public sealed class LegalDbSession(NpgsqlDataSource dataSource, IFirmContext firmContext) : IUnitOfWork, IAsyncDisposable
{
    private NpgsqlConnection? connection;
    private NpgsqlTransaction? transaction;

    public async Task<(NpgsqlConnection Connection, NpgsqlTransaction Transaction)> GetTransactionAsync(CancellationToken ct)
    {
        if (connection is not null && transaction is not null) return (connection, transaction);
        connection = await dataSource.OpenConnectionAsync(ct);
        transaction = await connection.BeginTransactionAsync(ct);
        await using var command = new NpgsqlCommand("select set_config('app.current_firm_id', @firm_id, true)", connection, transaction);
        command.Parameters.AddWithValue("firm_id", firmContext.FirmId.ToString());
        await command.ExecuteNonQueryAsync(ct);
        return (connection, transaction);
    }

    public async Task CommitAsync(CancellationToken ct)
    {
        if (transaction is null) throw new InvalidOperationException("No database transaction is active.");
        await transaction.CommitAsync(ct);
        await DisposeAsync();
    }

    public async ValueTask DisposeAsync()
    {
        if (transaction is not null) await transaction.DisposeAsync();
        if (connection is not null) await connection.DisposeAsync();
        transaction = null;
        connection = null;
    }
}
