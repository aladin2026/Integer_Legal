\set ON_ERROR_STOP on

insert into legal.firms(id,legal_name) values
('10000000-0000-0000-0000-000000000001','Firm One'),
('20000000-0000-0000-0000-000000000002','Firm Two');
insert into legal.clients(id,firm_id,reference,display_name,kind) values
('11000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','C-1','Client One',1),
('22000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000002','C-2','Client Two',1);

do $$ begin
  if not exists(select 1 from pg_roles where rolname='integer_legal_runtime') then
    create role integer_legal_runtime nologin nosuperuser nocreatedb nocreaterole;
  end if;
end $$;
grant usage on schema legal to integer_legal_runtime;
grant select,insert,update on all tables in schema legal to integer_legal_runtime;
grant select on legal.firms to integer_legal_runtime;

set role integer_legal_runtime;
select set_config('app.current_firm_id','10000000-0000-0000-0000-000000000001',false);
do $$
declare visible_count integer;
begin
  select count(*) into visible_count from legal.clients;
  if visible_count <> 1 then raise exception 'RLS isolation failed: expected 1, got %', visible_count; end if;
end $$;
reset role;
