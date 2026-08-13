do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'integer_legal_runtime') then
    create role integer_legal_runtime nologin nosuperuser nocreatedb nocreaterole noinherit nobypassrls;
  end if;
end $$;

grant connect on database integer_legal to integer_legal_runtime;
grant usage on schema legal to integer_legal_runtime;
grant select, insert, update, delete on all tables in schema legal to integer_legal_runtime;
alter default privileges in schema legal grant select, insert, update, delete on tables to integer_legal_runtime;

select format('alter role integer_legal_runtime login password %L', :'runtime_password') \gexec
