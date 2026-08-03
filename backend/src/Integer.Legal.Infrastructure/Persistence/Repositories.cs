using Integer.Legal.Application.Abstractions;
using Integer.Legal.Domain.Clients;
using Integer.Legal.Domain.Deadlines;
using Integer.Legal.Domain.Matters;
using Npgsql;

namespace Integer.Legal.Infrastructure.Persistence;

public sealed class ClientRepository(LegalDbSession session) : IClientRepository
{
    public async Task<bool> ReferenceExistsAsync(Guid firmId, string reference, CancellationToken ct)
    {
        const string sql = "select exists(select 1 from legal.clients where firm_id=@firm_id and reference=@reference)";
        var (connection, transaction) = await session.GetTransactionAsync(ct);
        await using var command = new NpgsqlCommand(sql, connection, transaction);
        command.Parameters.AddWithValue("firm_id", firmId); command.Parameters.AddWithValue("reference", reference);
        return (bool)(await command.ExecuteScalarAsync(ct) ?? false);
    }

    public async Task AddAsync(Client client, CancellationToken ct)
    {
        const string sql = "insert into legal.clients(id,firm_id,reference,display_name,kind) values(@id,@firm_id,@reference,@name,@kind)";
        var (connection, transaction) = await session.GetTransactionAsync(ct);
        await using var command = new NpgsqlCommand(sql, connection, transaction);
        command.Parameters.AddWithValue("id", client.Id); command.Parameters.AddWithValue("firm_id", client.FirmId);
        command.Parameters.AddWithValue("reference", client.Reference); command.Parameters.AddWithValue("name", client.DisplayName);
        command.Parameters.AddWithValue("kind", (short)client.Kind); await command.ExecuteNonQueryAsync(ct);
    }
}

public sealed class MatterRepository(LegalDbSession session) : IMatterRepository
{
    public Task<bool> ReferenceExistsAsync(Guid firmId, string reference, CancellationToken ct) => ExistsAsync("legal.matters", "reference", firmId, reference, ct);
    public async Task<bool> ClientExistsAsync(Guid firmId, Guid clientId, CancellationToken ct)
    {
        const string sql = "select exists(select 1 from legal.clients where firm_id=@firm_id and id=@id)";
        return await ExecuteExistsAsync(sql, firmId, "id", clientId, ct);
    }
    public async Task AddAsync(Matter matter, CancellationToken ct)
    {
        const string sql = "insert into legal.matters(id,firm_id,client_id,reference,title,responsible_user_id,status) values(@id,@firm_id,@client_id,@reference,@title,@responsible,@status)";
        var (connection, transaction) = await session.GetTransactionAsync(ct);
        await using var command = new NpgsqlCommand(sql, connection, transaction);
        command.Parameters.AddWithValue("id", matter.Id); command.Parameters.AddWithValue("firm_id", matter.FirmId);
        command.Parameters.AddWithValue("client_id", matter.ClientId); command.Parameters.AddWithValue("reference", matter.Reference);
        command.Parameters.AddWithValue("title", matter.Title); command.Parameters.AddWithValue("responsible", matter.ResponsibleUserId);
        command.Parameters.AddWithValue("status", (short)matter.Status); await command.ExecuteNonQueryAsync(ct);
    }
    private async Task<bool> ExistsAsync(string table, string column, Guid firmId, string value, CancellationToken ct)
    {
        var sql = $"select exists(select 1 from {table} where firm_id=@firm_id and {column}=@value)";
        return await ExecuteExistsAsync(sql, firmId, "value", value, ct);
    }
    private async Task<bool> ExecuteExistsAsync(string sql, Guid firmId, string parameter, object value, CancellationToken ct)
    {
        var (connection, transaction) = await session.GetTransactionAsync(ct);
        await using var command = new NpgsqlCommand(sql, connection, transaction);
        command.Parameters.AddWithValue("firm_id", firmId); command.Parameters.AddWithValue(parameter, value);
        return (bool)(await command.ExecuteScalarAsync(ct) ?? false);
    }
}

public sealed class DeadlineRepository(LegalDbSession session) : IDeadlineRepository
{
    public async Task<bool> MatterExistsAsync(Guid firmId, Guid matterId, CancellationToken ct)
    {
        const string sql = "select exists(select 1 from legal.matters where firm_id=@firm_id and id=@id)";
        var (connection, transaction) = await session.GetTransactionAsync(ct);
        await using var command = new NpgsqlCommand(sql, connection, transaction);
        command.Parameters.AddWithValue("firm_id", firmId); command.Parameters.AddWithValue("id", matterId);
        return (bool)(await command.ExecuteScalarAsync(ct) ?? false);
    }
    public async Task AddAsync(Deadline deadline, CancellationToken ct)
    {
        const string sql = "insert into legal.deadlines(id,firm_id,matter_id,title,due_at,status) values(@id,@firm_id,@matter_id,@title,@due_at,@status)";
        var (connection, transaction) = await session.GetTransactionAsync(ct);
        await using var command = new NpgsqlCommand(sql, connection, transaction);
        command.Parameters.AddWithValue("id", deadline.Id); command.Parameters.AddWithValue("firm_id", deadline.FirmId);
        command.Parameters.AddWithValue("matter_id", deadline.MatterId); command.Parameters.AddWithValue("title", deadline.Title);
        command.Parameters.AddWithValue("due_at", deadline.DueAt); command.Parameters.AddWithValue("status", (short)deadline.Status);
        await command.ExecuteNonQueryAsync(ct);
    }
}
