begin;

alter table legal.outbox_messages add column lease_until timestamptz;
alter table legal.outbox_messages add column attempt_count integer not null default 0;
alter table legal.outbox_messages add column last_error varchar(1000);
alter table legal.outbox_messages add constraint ck_outbox_attempts check(attempt_count>=0);

create table legal.parties (
    id uuid primary key,
    firm_id uuid not null references legal.firms(id),
    display_name varchar(240) not null,
    normalized_name varchar(240) not null,
    kind smallint not null,
    identification_number varchar(100),
    created_at timestamptz not null default now(),
    constraint uq_parties_firm_id unique(firm_id,id),
    constraint ck_parties_kind check(kind in (1,2,3))
);
create index ix_parties_firm_normalized_name on legal.parties(firm_id,normalized_name);

create table legal.matter_parties (
    id uuid not null,
    firm_id uuid not null references legal.firms(id),
    matter_id uuid not null,
    party_id uuid not null,
    role_code varchar(60) not null,
    is_adverse boolean not null default false,
    primary key(firm_id,matter_id,party_id,role_code),
    constraint uq_matter_parties_id unique(firm_id,id),
    constraint fk_matter_parties_matter foreign key(firm_id,matter_id) references legal.matters(firm_id,id),
    constraint fk_matter_parties_party foreign key(firm_id,party_id) references legal.parties(firm_id,id)
);

create table legal.conflict_checks (
    id uuid primary key,
    firm_id uuid not null references legal.firms(id),
    matter_id uuid,
    requested_by uuid not null,
    search_terms jsonb not null,
    status smallint not null default 1,
    decision smallint,
    decided_by uuid,
    decided_at timestamptz,
    created_at timestamptz not null default now(),
    constraint uq_conflict_checks_firm_id unique(firm_id,id),
    constraint fk_conflict_checks_matter foreign key(firm_id,matter_id) references legal.matters(firm_id,id),
    constraint ck_conflict_status check(status in (1,2)),
    constraint ck_conflict_decision check(decision is null or decision in (1,2,3))
);
create table legal.conflict_hits (
    id uuid primary key,
    firm_id uuid not null,
    conflict_check_id uuid not null,
    matched_entity_type varchar(60) not null,
    matched_entity_id uuid not null,
    reason varchar(500) not null,
    score numeric(5,4) not null,
    constraint fk_conflict_hits_check foreign key(firm_id,conflict_check_id) references legal.conflict_checks(firm_id,id),
    constraint ck_conflict_score check(score between 0 and 1)
);

create table legal.procedures (
    id uuid primary key,
    firm_id uuid not null references legal.firms(id),
    matter_id uuid not null,
    procedure_type varchar(80) not null,
    jurisdiction varchar(240) not null,
    external_reference varchar(100),
    status smallint not null default 1,
    created_at timestamptz not null default now(),
    constraint uq_procedures_firm_id unique(firm_id,id),
    constraint fk_procedures_matter foreign key(firm_id,matter_id) references legal.matters(firm_id,id),
    constraint ck_procedure_status check(status in (1,2,3))
);
create table legal.hearings (
    id uuid primary key,
    firm_id uuid not null,
    procedure_id uuid not null,
    scheduled_at timestamptz not null,
    courtroom varchar(160),
    purpose varchar(300) not null,
    status smallint not null default 1,
    outcome text,
    created_at timestamptz not null default now(),
    constraint fk_hearings_procedure foreign key(firm_id,procedure_id) references legal.procedures(firm_id,id),
    constraint ck_hearing_status check(status in (1,2,3,4))
);
create index ix_hearings_firm_schedule on legal.hearings(firm_id,scheduled_at) where status=1;

create table legal.documents (
    id uuid primary key,
    firm_id uuid not null references legal.firms(id),
    matter_id uuid not null,
    title varchar(300) not null,
    classification varchar(80) not null,
    confidentiality smallint not null default 2,
    created_by uuid not null,
    created_at timestamptz not null default now(),
    constraint uq_documents_firm_id unique(firm_id,id),
    constraint fk_documents_matter foreign key(firm_id,matter_id) references legal.matters(firm_id,id),
    constraint ck_document_confidentiality check(confidentiality in (1,2,3,4))
);
create table legal.document_versions (
    id uuid primary key,
    firm_id uuid not null,
    document_id uuid not null,
    version_number integer not null,
    storage_object_key varchar(500) not null,
    content_sha256 char(64) not null,
    media_type varchar(120) not null,
    size_bytes bigint not null,
    created_by uuid not null,
    created_at timestamptz not null default now(),
    constraint fk_document_versions_document foreign key(firm_id,document_id) references legal.documents(firm_id,id),
    constraint uq_document_version unique(firm_id,document_id,version_number),
    constraint ck_document_version_positive check(version_number>0 and size_bytes>=0),
    constraint ck_document_sha check(content_sha256 ~ '^[0-9a-f]{64}$')
);

create table legal.time_entries (
    id uuid primary key,
    firm_id uuid not null references legal.firms(id),
    matter_id uuid not null,
    user_id uuid not null,
    activity_date date not null,
    minutes integer not null,
    description varchar(500) not null,
    billable boolean not null default true,
    hourly_rate numeric(14,2),
    currency char(3) not null default 'MAD',
    prebill_id uuid,
    created_at timestamptz not null default now(),
    constraint uq_time_entries_firm_id unique(firm_id,id),
    constraint fk_time_entries_matter foreign key(firm_id,matter_id) references legal.matters(firm_id,id),
    constraint ck_time_positive check(minutes>0 and (hourly_rate is null or hourly_rate>=0))
);
create table legal.expense_entries (
    id uuid primary key,
    firm_id uuid not null references legal.firms(id),
    matter_id uuid not null,
    incurred_on date not null,
    description varchar(500) not null,
    amount numeric(14,2) not null,
    currency char(3) not null default 'MAD',
    billable boolean not null default true,
    prebill_id uuid,
    created_at timestamptz not null default now(),
    constraint uq_expense_entries_firm_id unique(firm_id,id),
    constraint fk_expense_entries_matter foreign key(firm_id,matter_id) references legal.matters(firm_id,id),
    constraint ck_expense_nonnegative check(amount>=0)
);
create table legal.budgets (
    id uuid primary key,
    firm_id uuid not null references legal.firms(id),
    matter_id uuid not null,
    amount numeric(14,2) not null,
    currency char(3) not null default 'MAD',
    warning_percent numeric(5,2) not null default 80,
    created_at timestamptz not null default now(),
    constraint uq_budgets_firm_matter unique(firm_id,matter_id),
    constraint uq_budgets_firm_id unique(firm_id,id),
    constraint fk_budgets_matter foreign key(firm_id,matter_id) references legal.matters(firm_id,id),
    constraint ck_budget_positive check(amount>=0 and warning_percent between 0 and 100)
);
create table legal.prebills (
    id uuid primary key,
    firm_id uuid not null references legal.firms(id),
    matter_id uuid not null,
    reference varchar(60) not null,
    status smallint not null default 1,
    currency char(3) not null default 'MAD',
    subtotal numeric(14,2) not null default 0,
    adjustment numeric(14,2) not null default 0,
    total numeric(14,2) generated always as (subtotal+adjustment) stored,
    created_by uuid not null,
    approved_by uuid,
    approved_at timestamptz,
    created_at timestamptz not null default now(),
    constraint uq_prebills_firm_reference unique(firm_id,reference),
    constraint uq_prebills_firm_id unique(firm_id,id),
    constraint uq_prebills_firm_id_matter unique(firm_id,id,matter_id),
    constraint fk_prebills_matter foreign key(firm_id,matter_id) references legal.matters(firm_id,id),
    constraint ck_prebill_status check(status in (1,2,3,4)),
    constraint ck_prebill_total check(subtotal>=0 and subtotal+adjustment>=0)
);
create table legal.prebill_lines (
    id uuid primary key,
    firm_id uuid not null,
    prebill_id uuid not null,
    line_type smallint not null,
    source_id uuid,
    description varchar(500) not null,
    quantity numeric(12,2) not null,
    unit_price numeric(14,2) not null,
    amount numeric(14,2) generated always as (quantity*unit_price) stored,
    constraint fk_prebill_lines_prebill foreign key(firm_id,prebill_id) references legal.prebills(firm_id,id),
    constraint ck_prebill_line check(line_type in (1,2,3) and quantity>=0 and unit_price>=0)
);
create unique index uq_prebill_line_source on legal.prebill_lines(firm_id,prebill_id,line_type,source_id) where source_id is not null;

alter table legal.time_entries add constraint fk_time_prebill_same_matter
foreign key(firm_id,prebill_id,matter_id) references legal.prebills(firm_id,id,matter_id);
alter table legal.expense_entries add constraint fk_expense_prebill_same_matter
foreign key(firm_id,prebill_id,matter_id) references legal.prebills(firm_id,id,matter_id);

create table legal.role_assignments (
    id uuid primary key,
    firm_id uuid not null references legal.firms(id),
    user_id uuid not null,
    role_code varchar(80) not null,
    matter_id uuid,
    granted_by uuid not null,
    valid_from timestamptz not null default now(),
    valid_until timestamptz,
    constraint fk_role_assignment_matter foreign key(firm_id,matter_id) references legal.matters(firm_id,id),
    constraint ck_role_validity check(valid_until is null or valid_until>valid_from)
);
create unique index uq_role_assignment_scope on legal.role_assignments(firm_id,user_id,role_code,coalesce(matter_id,'00000000-0000-0000-0000-000000000000'::uuid));

create table legal.scheduled_commands (
    id uuid primary key,
    firm_id uuid not null references legal.firms(id),
    command_type varchar(160) not null,
    command_version integer not null,
    payload jsonb not null,
    execute_at timestamptz not null,
    status smallint not null default 1,
    attempt_count integer not null default 0,
    lease_until timestamptz,
    last_error varchar(1000),
    created_at timestamptz not null default now(),
    constraint ck_scheduled_version check(command_version>0),
    constraint ck_scheduled_status check(status in (1,2,3,4)),
    constraint ck_scheduled_attempts check(attempt_count>=0)
);
create index ix_scheduled_due on legal.scheduled_commands(execute_at) where status=1;

do $$
declare table_name text;
begin
  foreach table_name in array array['parties','matter_parties','conflict_checks','conflict_hits','procedures','hearings','documents','document_versions','time_entries','expense_entries','budgets','prebills','prebill_lines','role_assignments','scheduled_commands'] loop
    execute format('alter table legal.%I enable row level security',table_name);
    execute format('alter table legal.%I force row level security',table_name);
    execute format('create policy firm_isolation on legal.%I using (firm_id=nullif(current_setting(''app.current_firm_id'',true),'''')::uuid) with check (firm_id=nullif(current_setting(''app.current_firm_id'',true),'''')::uuid)',table_name);
  end loop;
end $$;

commit;
