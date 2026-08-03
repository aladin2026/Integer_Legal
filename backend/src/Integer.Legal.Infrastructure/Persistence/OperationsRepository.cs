using System.Text.Json;
using Integer.Legal.Application.Operations;
using Integer.Legal.Domain.Operations;
using Npgsql;
using NpgsqlTypes;

namespace Integer.Legal.Infrastructure.Persistence;

public sealed class OperationsRepository(LegalDbSession session) : IOperationsRepository
{
    public Task<bool> MatterExistsAsync(Guid firmId, Guid matterId, CancellationToken ct) => ExistsAsync("legal.matters", firmId, matterId, ct);
    public Task<bool> ProcedureExistsAsync(Guid firmId, Guid procedureId, CancellationToken ct) => ExistsAsync("legal.procedures", firmId, procedureId, ct);
    public Task<bool> DocumentExistsAsync(Guid firmId, Guid documentId, CancellationToken ct) => ExistsAsync("legal.documents", firmId, documentId, ct);
    public Task<bool> PartyExistsAsync(Guid firmId, Guid partyId, CancellationToken ct) => ExistsAsync("legal.parties", firmId, partyId, ct);
    public Task<bool> PrebillExistsAsync(Guid firmId, Guid prebillId, CancellationToken ct) => ExistsAsync("legal.prebills", firmId, prebillId, ct);

    public Task AddPartyAsync(Party value, CancellationToken ct) => ExecuteAsync(
        "insert into legal.parties(id,firm_id,display_name,normalized_name,kind,identification_number) values(@id,@firm,@name,@normalized,@kind,@identifier)",
        command => { Base(command, value); Add(command, "name", value.DisplayName); Add(command, "normalized", value.NormalizedName); Add(command, "kind", (short)value.Kind); AddNullable(command, "identifier", value.IdentificationNumber, NpgsqlDbType.Text); }, ct);

    public async Task AddConflictCheckAsync(ConflictCheck value, CancellationToken ct)
    {
        var terms = JsonSerializer.Serialize(value.SearchTerms);
        await ExecuteAsync(
            "insert into legal.conflict_checks(id,firm_id,matter_id,requested_by,search_terms) values(@id,@firm,@matter,@actor,@terms::jsonb)",
            command => { Base(command, value); AddNullable(command, "matter", value.MatterId, NpgsqlDbType.Uuid); Add(command, "actor", value.RequestedBy); Add(command, "terms", terms); }, ct);
        const string hitsSql = """
            with terms as (select upper(value) term from jsonb_array_elements_text(@terms::jsonb)),
            matches as (
              select p.id,'party'::varchar entity_type,p.display_name label from legal.parties p,terms t where p.firm_id=@firm and p.normalized_name like '%'||t.term||'%'
              union
              select c.id,'client'::varchar,c.display_name from legal.clients c,terms t where c.firm_id=@firm and upper(c.display_name) like '%'||t.term||'%'
            )
            insert into legal.conflict_hits(id,firm_id,conflict_check_id,matched_entity_type,matched_entity_id,reason,score)
            select gen_random_uuid(),@firm,@check,entity_type,id,'Name match: '||label,1 from matches
            """;
        await ExecuteAsync(hitsSql, command => { Add(command, "terms", terms); Add(command, "firm", value.FirmId); Add(command, "check", value.Id); }, ct);
    }

    public Task AddMatterPartyAsync(MatterParty value, CancellationToken ct) => ExecuteAsync(
        "insert into legal.matter_parties(id,firm_id,matter_id,party_id,role_code,is_adverse) values(@id,@firm,@matter,@party,@role,@adverse)",
        command => { Base(command, value); Add(command, "matter", value.MatterId); Add(command, "party", value.PartyId); Add(command, "role", value.RoleCode); Add(command, "adverse", value.IsAdverse); }, ct);

    public Task AddProcedureAsync(Procedure value, CancellationToken ct) => ExecuteAsync(
        "insert into legal.procedures(id,firm_id,matter_id,procedure_type,jurisdiction,external_reference) values(@id,@firm,@matter,@type,@jurisdiction,@reference)",
        command => { Base(command, value); Add(command, "matter", value.MatterId); Add(command, "type", value.ProcedureType); Add(command, "jurisdiction", value.Jurisdiction); AddNullable(command, "reference", value.ExternalReference, NpgsqlDbType.Text); }, ct);

    public Task AddHearingAsync(Hearing value, CancellationToken ct) => ExecuteAsync(
        "insert into legal.hearings(id,firm_id,procedure_id,scheduled_at,purpose) values(@id,@firm,@procedure,@scheduled,@purpose)",
        command => { Base(command, value); Add(command, "procedure", value.ProcedureId); Add(command, "scheduled", value.ScheduledAt); Add(command, "purpose", value.Purpose); }, ct);

    public Task AddDocumentAsync(LegalDocument value, CancellationToken ct) => ExecuteAsync(
        "insert into legal.documents(id,firm_id,matter_id,title,classification,created_by) values(@id,@firm,@matter,@title,@classification,@actor)",
        command => { Base(command, value); Add(command, "matter", value.MatterId); Add(command, "title", value.Title); Add(command, "classification", value.Classification); Add(command, "actor", value.CreatedBy); }, ct);

    public Task AddDocumentVersionAsync(DocumentVersion value, CancellationToken ct) => ExecuteAsync(
        "insert into legal.document_versions(id,firm_id,document_id,version_number,storage_object_key,content_sha256,media_type,size_bytes,created_by) values(@id,@firm,@document,@version,@object_key,@sha,@media_type,@size,@actor)",
        command => { Base(command, value); Add(command, "document", value.DocumentId); Add(command, "version", value.VersionNumber); Add(command, "object_key", value.StorageObjectKey); Add(command, "sha", value.ContentSha256); Add(command, "media_type", value.MediaType); Add(command, "size", value.SizeBytes); Add(command, "actor", value.CreatedBy); }, ct);

    public Task AddTimeEntryAsync(TimeEntry value, CancellationToken ct) => ExecuteAsync(
        "insert into legal.time_entries(id,firm_id,matter_id,user_id,activity_date,minutes,description,billable,hourly_rate,currency) values(@id,@firm,@matter,@user,@date,@minutes,@description,@billable,@rate,@currency)",
        command => { Base(command, value); Add(command, "matter", value.MatterId); Add(command, "user", value.UserId); Add(command, "date", value.ActivityDate); Add(command, "minutes", value.Minutes); Add(command, "description", value.Description); Add(command, "billable", value.Billable); AddNullable(command, "rate", value.HourlyRate, NpgsqlDbType.Numeric); Add(command, "currency", value.Currency); }, ct);

    public Task AddExpenseEntryAsync(ExpenseEntry value, CancellationToken ct) => ExecuteAsync(
        "insert into legal.expense_entries(id,firm_id,matter_id,incurred_on,description,amount,currency,billable) values(@id,@firm,@matter,@date,@description,@amount,@currency,@billable)",
        command => { Base(command, value); Add(command, "matter", value.MatterId); Add(command, "date", value.IncurredOn); Add(command, "description", value.Description); Add(command, "amount", value.Amount); Add(command, "currency", value.Currency); Add(command, "billable", value.Billable); }, ct);

    public Task AddBudgetAsync(Budget value, CancellationToken ct) => ExecuteAsync(
        "insert into legal.budgets(id,firm_id,matter_id,amount,currency,warning_percent) values(@id,@firm,@matter,@amount,@currency,@warning)",
        command => { Base(command, value); Add(command, "matter", value.MatterId); Add(command, "amount", value.Amount); Add(command, "currency", value.Currency); Add(command, "warning", value.WarningPercent); }, ct);

    public Task AddPrebillAsync(Prebill value, CancellationToken ct) => ExecuteAsync(
        "insert into legal.prebills(id,firm_id,matter_id,reference,currency,created_by) values(@id,@firm,@matter,@reference,@currency,@actor)",
        command => { Base(command, value); Add(command, "matter", value.MatterId); Add(command, "reference", value.Reference); Add(command, "currency", value.Currency); Add(command, "actor", value.CreatedBy); }, ct);

    public async Task AddPrebillLineAsync(PrebillLine value, CancellationToken ct)
    {
        await ExecuteAsync(
            "insert into legal.prebill_lines(id,firm_id,prebill_id,line_type,source_id,description,quantity,unit_price) values(@id,@firm,@prebill,@type,@source,@description,@quantity,@unit_price)",
            command => { Base(command, value); Add(command, "prebill", value.PrebillId); Add(command, "type", value.LineType); AddNullable(command, "source", value.SourceId, NpgsqlDbType.Uuid); Add(command, "description", value.Description); Add(command, "quantity", value.Quantity); Add(command, "unit_price", value.UnitPrice); }, ct);
        await ExecuteAsync(
            "update legal.prebills set subtotal=(select coalesce(sum(amount),0) from legal.prebill_lines where firm_id=@firm and prebill_id=@prebill) where firm_id=@firm and id=@prebill and status=1",
            command => { Add(command, "firm", value.FirmId); Add(command, "prebill", value.PrebillId); }, ct);
    }

    public Task AddRoleAssignmentAsync(RoleAssignment value, CancellationToken ct) => ExecuteAsync(
        "insert into legal.role_assignments(id,firm_id,user_id,role_code,matter_id,granted_by,valid_from,valid_until) values(@id,@firm,@user,@role,@matter,@actor,@valid_from,@valid_until)",
        command => { Base(command, value); Add(command, "user", value.UserId); Add(command, "role", value.RoleCode); AddNullable(command, "matter", value.MatterId, NpgsqlDbType.Uuid); Add(command, "actor", value.GrantedBy); Add(command, "valid_from", value.ValidFrom); AddNullable(command, "valid_until", value.ValidUntil, NpgsqlDbType.TimestampTz); }, ct);

    public Task AddScheduledCommandAsync(ScheduledCommand value, CancellationToken ct) => ExecuteAsync(
        "insert into legal.scheduled_commands(id,firm_id,command_type,command_version,payload,execute_at) values(@id,@firm,@type,@version,@payload::jsonb,@execute_at)",
        command => { Base(command, value); Add(command, "type", value.CommandType); Add(command, "version", value.Version); Add(command, "payload", value.Payload); Add(command, "execute_at", value.ExecuteAt); }, ct);

    public Task<bool> DecideConflictAsync(Guid firmId, Guid checkId, Guid actorId, ConflictDecision decision, CancellationToken ct) => ExecuteAffectedAsync(
        "update legal.conflict_checks set status=2,decision=@decision,decided_by=@actor,decided_at=now() where firm_id=@firm and id=@id and status=1",
        command => { Add(command, "firm", firmId); Add(command, "id", checkId); Add(command, "actor", actorId); Add(command, "decision", (short)decision); }, ct);

    public Task<bool> RecordHearingOutcomeAsync(Guid firmId, Guid hearingId, string outcome, CancellationToken ct) => ExecuteAffectedAsync(
        "update legal.hearings set status=2,outcome=@outcome where firm_id=@firm and id=@id and status=1",
        command => { Add(command, "firm", firmId); Add(command, "id", hearingId); Add(command, "outcome", outcome); }, ct);

    public Task<bool> ApprovePrebillAsync(Guid firmId, Guid prebillId, Guid actorId, CancellationToken ct) => ExecuteAffectedAsync(
        "update legal.prebills set status=3,approved_by=@actor,approved_at=now() where firm_id=@firm and id=@id and status in (1,2)",
        command => { Add(command, "firm", firmId); Add(command, "id", prebillId); Add(command, "actor", actorId); }, ct);

    public Task<bool> SubmitPrebillAsync(Guid firmId, Guid prebillId, CancellationToken ct) => ExecuteAffectedAsync(
        "update legal.prebills set status=4 where firm_id=@firm and id=@id and status=3",
        command => { Add(command, "firm", firmId); Add(command, "id", prebillId); }, ct);

    private async Task<bool> ExistsAsync(string table, Guid firmId, Guid id, CancellationToken ct)
    {
        var (connection, transaction) = await session.GetTransactionAsync(ct);
        await using var command = new NpgsqlCommand($"select exists(select 1 from {table} where firm_id=@firm and id=@id)", connection, transaction);
        Add(command, "firm", firmId); Add(command, "id", id);
        return (bool)(await command.ExecuteScalarAsync(ct) ?? false);
    }

    private async Task ExecuteAsync(string sql, Action<NpgsqlCommand> parameters, CancellationToken ct)
    {
        var (connection, transaction) = await session.GetTransactionAsync(ct);
        await using var command = new NpgsqlCommand(sql, connection, transaction);
        parameters(command); await command.ExecuteNonQueryAsync(ct);
    }

    private async Task<bool> ExecuteAffectedAsync(string sql, Action<NpgsqlCommand> parameters, CancellationToken ct)
    {
        var (connection, transaction) = await session.GetTransactionAsync(ct);
        await using var command = new NpgsqlCommand(sql, connection, transaction);
        parameters(command); return await command.ExecuteNonQueryAsync(ct) == 1;
    }

    private static void Base(NpgsqlCommand command, Integer.Legal.Domain.Common.TenantEntity value)
    {
        Add(command, "id", value.Id); Add(command, "firm", value.FirmId);
    }
    private static void Add(NpgsqlCommand command, string name, object value) => command.Parameters.AddWithValue(name, value);
    private static void AddNullable(NpgsqlCommand command, string name, object? value, NpgsqlDbType type) => command.Parameters.AddWithValue(name, type, value ?? DBNull.Value);
}
