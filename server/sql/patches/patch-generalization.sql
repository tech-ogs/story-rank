alter table application.users add column mobile varchar;

alter table application.elections add column attributes jsonb;

alter table application.sessions alter column attributes set default '{}'::jsonb;
