using Integer.Legal.Application.Operations;
using Npgsql;
using NpgsqlTypes;

namespace Integer.Legal.Infrastructure.Persistence;

public sealed class LegalReadRepository(LegalDbSession session) : ILegalReadRepository
{
    public async Task<IReadOnlyCollection<MatterListItem>> ListMattersAsync(Guid firmId, int limit, DateTimeOffset? before, CancellationToken ct)
    {
        const string sql = """
            select m.id,m.reference,m.title,m.status,m.client_id,c.display_name,m.responsible_user_id,m.created_at
            from legal.matters m join legal.clients c on c.firm_id=m.firm_id and c.id=m.client_id
            where m.firm_id=@firm and (@before is null or m.created_at<@before)
            order by m.created_at desc,m.id limit @limit
            """;
        var (connection, transaction) = await session.GetTransactionAsync(ct);
        await using var command = new NpgsqlCommand(sql, connection, transaction);
        command.Parameters.AddWithValue("firm", firmId);
        command.Parameters.AddWithValue("before", NpgsqlDbType.TimestampTz, before is null ? DBNull.Value : before.Value);
        command.Parameters.AddWithValue("limit", limit);
        return await ReadAsync(command, ReadMatter, ct);
    }

    public async Task<Matter360View?> GetMatter360Async(Guid firmId, Guid matterId, CancellationToken ct)
    {
        var matter = (await QueryAsync(
            "select m.id,m.reference,m.title,m.status,m.client_id,c.display_name,m.responsible_user_id,m.created_at from legal.matters m join legal.clients c on c.firm_id=m.firm_id and c.id=m.client_id where m.firm_id=@firm and m.id=@matter",
            firmId, matterId, ReadMatter, ct)).SingleOrDefault();
        if (matter is null) return null;
        var deadlines = await QueryAsync("select id,title,due_at,status from legal.deadlines where firm_id=@firm and matter_id=@matter order by due_at limit 50", firmId, matterId, reader => new DeadlineView(reader.GetGuid(0), reader.GetString(1), reader.GetFieldValue<DateTimeOffset>(2), reader.GetInt16(3)), ct);
        var parties = await QueryAsync("select p.id,p.display_name,mp.role_code,mp.is_adverse from legal.matter_parties mp join legal.parties p on p.firm_id=mp.firm_id and p.id=mp.party_id where mp.firm_id=@firm and mp.matter_id=@matter order by p.display_name limit 100", firmId, matterId, reader => new PartyView(reader.GetGuid(0), reader.GetString(1), reader.GetString(2), reader.GetBoolean(3)), ct);
        var conflicts = await QueryAsync("select id,status,decision,created_at from legal.conflict_checks where firm_id=@firm and matter_id=@matter order by created_at desc limit 20", firmId, matterId, reader => new ConflictView(reader.GetGuid(0), reader.GetInt16(1), reader.IsDBNull(2) ? null : reader.GetInt16(2), reader.GetFieldValue<DateTimeOffset>(3)), ct);
        var procedures = await QueryAsync("select id,procedure_type,jurisdiction,status from legal.procedures where firm_id=@firm and matter_id=@matter order by created_at desc limit 50", firmId, matterId, reader => new ProcedureView(reader.GetGuid(0), reader.GetString(1), reader.GetString(2), reader.GetInt16(3)), ct);
        var hearings = await QueryAsync("select h.id,h.procedure_id,h.scheduled_at,h.purpose,h.status,h.outcome from legal.hearings h join legal.procedures p on p.firm_id=h.firm_id and p.id=h.procedure_id where h.firm_id=@firm and p.matter_id=@matter order by h.scheduled_at desc limit 100", firmId, matterId, reader => new HearingView(reader.GetGuid(0), reader.GetGuid(1), reader.GetFieldValue<DateTimeOffset>(2), reader.GetString(3), reader.GetInt16(4), reader.IsDBNull(5) ? null : reader.GetString(5)), ct);
        var documents = await QueryAsync("select d.id,d.title,d.classification,count(v.id)::integer,d.created_at from legal.documents d left join legal.document_versions v on v.firm_id=d.firm_id and v.document_id=d.id where d.firm_id=@firm and d.matter_id=@matter group by d.id order by d.created_at desc limit 100", firmId, matterId, reader => new DocumentView(reader.GetGuid(0), reader.GetString(1), reader.GetString(2), reader.GetInt32(3), reader.GetFieldValue<DateTimeOffset>(4)), ct);
        var financial = (await QueryAsync(
            "select coalesce((select sum(minutes) from legal.time_entries where firm_id=@firm and matter_id=@matter),0)::integer,coalesce((select sum(amount) from legal.expense_entries where firm_id=@firm and matter_id=@matter),0), (select amount from legal.budgets where firm_id=@firm and matter_id=@matter),coalesce((select sum(total) from legal.prebills where firm_id=@firm and matter_id=@matter and status in (3,4)),0),coalesce((select currency from legal.budgets where firm_id=@firm and matter_id=@matter),(select currency from legal.prebills where firm_id=@firm and matter_id=@matter limit 1),'MAD')",
            firmId, matterId, reader => new FinancialView(reader.GetInt32(0), reader.GetDecimal(1), reader.IsDBNull(2) ? null : reader.GetDecimal(2), reader.GetDecimal(3), reader.GetString(4)), ct)).Single();
        return new(matter, deadlines, parties, conflicts, procedures, hearings, documents, financial);
    }

    private async Task<IReadOnlyCollection<T>> QueryAsync<T>(string sql, Guid firmId, Guid matterId, Func<NpgsqlDataReader, T> map, CancellationToken ct)
    {
        var (connection, transaction) = await session.GetTransactionAsync(ct);
        await using var command = new NpgsqlCommand(sql, connection, transaction);
        command.Parameters.AddWithValue("firm", firmId); command.Parameters.AddWithValue("matter", matterId);
        return await ReadAsync(command, map, ct);
    }
    private static async Task<IReadOnlyCollection<T>> ReadAsync<T>(NpgsqlCommand command, Func<NpgsqlDataReader, T> map, CancellationToken ct)
    {
        var result = new List<T>();
        await using var reader = await command.ExecuteReaderAsync(ct);
        while (await reader.ReadAsync(ct)) result.Add(map(reader));
        return result;
    }
    private static MatterListItem ReadMatter(NpgsqlDataReader reader) => new(reader.GetGuid(0), reader.GetString(1), reader.GetString(2), reader.GetInt16(3), reader.GetGuid(4), reader.GetString(5), reader.GetGuid(6), reader.GetFieldValue<DateTimeOffset>(7));
}
