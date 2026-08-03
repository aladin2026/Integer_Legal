begin;

create schema if not exists legal;

create table legal.firms (
    id uuid primary key,
    legal_name varchar(240) not null,
    country_code char(2) not null default 'MA',
    default_language varchar(5) not null default 'fr',
    created_at timestamptz not null default now(),
    constraint ck_firms_language check (default_language in ('fr','en','ar'))
);

create table legal.clients (
    id uuid primary key,
    firm_id uuid not null references legal.firms(id),
    reference varchar(40) not null,
    display_name varchar(240) not null,
    kind smallint not null,
    created_at timestamptz not null default now(),
    constraint uq_clients_firm_reference unique(firm_id, reference),
    constraint uq_clients_firm_id unique(firm_id, id),
    constraint ck_clients_kind check(kind in (1,2))
);

create table legal.matters (
    id uuid primary key,
    firm_id uuid not null references legal.firms(id),
    client_id uuid not null,
    reference varchar(50) not null,
    title varchar(300) not null,
    responsible_user_id uuid not null,
    status smallint not null,
    created_at timestamptz not null default now(),
    constraint fk_matters_client_tenant foreign key(firm_id, client_id) references legal.clients(firm_id, id),
    constraint uq_matters_firm_reference unique(firm_id, reference),
    constraint uq_matters_firm_id unique(firm_id, id),
    constraint ck_matters_status check(status in (1,2,3,4))
);

create table legal.deadlines (
    id uuid primary key,
    firm_id uuid not null references legal.firms(id),
    matter_id uuid not null,
    title varchar(240) not null,
    due_at timestamptz not null,
    status smallint not null,
    created_at timestamptz not null default now(),
    constraint fk_deadlines_matter_tenant foreign key(firm_id, matter_id) references legal.matters(firm_id, id),
    constraint ck_deadlines_status check(status in (1,2,3))
);

create index ix_matters_firm_client on legal.matters(firm_id, client_id);
create index ix_deadlines_firm_due_active on legal.deadlines(firm_id, due_at) where status=1;

create table legal.outbox_messages (
    id uuid primary key,
    firm_id uuid not null references legal.firms(id),
    event_type varchar(200) not null,
    event_version integer not null,
    payload jsonb not null,
    occurred_at timestamptz not null,
    processed_at timestamptz null,
    constraint ck_outbox_version check(event_version > 0)
);
create index ix_outbox_unprocessed on legal.outbox_messages(occurred_at) where processed_at is null;

create table legal.inbox_messages (
    message_id uuid not null,
    consumer varchar(200) not null,
    event_version integer not null,
    received_at timestamptz not null default now(),
    processed_at timestamptz null,
    primary key(message_id, consumer),
    constraint ck_inbox_version check(event_version > 0)
);

create table legal.audit_entries (
    id uuid primary key,
    firm_id uuid not null references legal.firms(id),
    actor_id uuid not null,
    action varchar(120) not null,
    entity_type varchar(120) not null,
    entity_id uuid not null,
    occurred_at timestamptz not null,
    correlation_id uuid not null,
    payload jsonb not null
);
create index ix_audit_firm_entity on legal.audit_entries(firm_id, entity_type, entity_id, occurred_at desc);

do $$
declare table_name text;
begin
  foreach table_name in array array['clients','matters','deadlines','outbox_messages','audit_entries'] loop
    execute format('alter table legal.%I enable row level security', table_name);
    execute format('alter table legal.%I force row level security', table_name);
    execute format('create policy firm_isolation on legal.%I using (firm_id = nullif(current_setting(''app.current_firm_id'', true), '''')::uuid) with check (firm_id = nullif(current_setting(''app.current_firm_id'', true), '''')::uuid)', table_name);
  end loop;
end $$;

create or replace function legal.reject_audit_mutation() returns trigger language plpgsql as $$
begin raise exception 'audit entries are append-only'; end $$;
create trigger trg_audit_immutable before update or delete on legal.audit_entries
for each row execute function legal.reject_audit_mutation();

commit;
