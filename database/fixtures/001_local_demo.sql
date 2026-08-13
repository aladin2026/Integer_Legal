begin;

insert into legal.firms(id, legal_name, country_code, default_language) values
('11111111-1111-4111-8111-111111111111', 'Cabinet Atlas Démonstration', 'MA', 'fr'),
('22222222-2222-4222-8222-222222222222', 'Cabinet Rif Démonstration', 'MA', 'fr')
on conflict (id) do nothing;

select set_config('app.current_firm_id', '11111111-1111-4111-8111-111111111111', true);
insert into legal.clients(id, firm_id, reference, display_name, kind) values
('11000000-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'CLI-A-001', 'Atlas Industries', 2)
on conflict (id) do nothing;
insert into legal.matters(id, firm_id, client_id, reference, title, responsible_user_id, status) values
('11000000-0000-4000-8000-000000000101', '11111111-1111-4111-8111-111111111111', '11000000-0000-4000-8000-000000000001', 'IL-A-2026-001', 'Restructuration Atlas Industries', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 1)
on conflict (id) do nothing;
insert into legal.deadlines(id, firm_id, matter_id, title, due_at, status) values
('11000000-0000-4000-8000-000000000201', '11111111-1111-4111-8111-111111111111', '11000000-0000-4000-8000-000000000101', 'Validation du protocole', now() + interval '14 days', 1)
on conflict (id) do nothing;

select set_config('app.current_firm_id', '22222222-2222-4222-8222-222222222222', true);
insert into legal.clients(id, firm_id, reference, display_name, kind) values
('22000000-0000-4000-8000-000000000001', '22222222-2222-4222-8222-222222222222', 'CLI-B-001', 'Rif Logistique', 2)
on conflict (id) do nothing;
insert into legal.matters(id, firm_id, client_id, reference, title, responsible_user_id, status) values
('22000000-0000-4000-8000-000000000101', '22222222-2222-4222-8222-222222222222', '22000000-0000-4000-8000-000000000001', 'IL-B-2026-001', 'Contentieux Rif Logistique', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 1)
on conflict (id) do nothing;

commit;
