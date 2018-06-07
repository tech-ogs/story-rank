alter table application.results drop column ranks;
alter table application.results add column ranks jsonb;
