drop table application.elections cascade;
drop table application.groups cascade;
drop table application.user_elections cascade;

create table application.elections (
	id bigserial primary key,
	name varchar,
	label varchar,
	creation_date timestamp default now(),
	open_date timestamp,
	close_date timestamp,
	active boolean
);

insert into application.elections (name, label, open_date, close_date, active) values ('wtf-q1', 'WTF stories #1', '2018-04-15'::timestamp, '2018-06-26'::timestamp, false);
insert into application.elections (name, label, open_date, close_date, active) values ('wtf-q2', 'WTF stories #2', '2018-09-01'::timestamp, '2018-09-21'::timestamp, true);

alter table application.stories add column election_id bigint;

alter table application.stories add constraint "election_id_fkey" FOREIGN KEY (election_id) REFERENCES application.elections(id);

create table application.groups (
	id bigserial primary key,
	name varchar
);

update application.stories set election_id = (select id from application.elections where name = 'wtf-q1');

insert into application.groups (name) values ('admin');
insert into application.groups (name) values ('public');
insert into application.groups (name) values ('editor');

update application.users set attributes = '{}'::jsonb;
update application.users set attributes = jsonb_set(attributes, '{groups}', '["public"]'::jsonb);
update application.users set attributes = jsonb_set(attributes, '{groups}', '["public", "admin", "editor"]'::jsonb) where login = 'kavi';
update application.users set attributes = jsonb_set(attributes, '{groups}', '["public", "editor"]'::jsonb) where login = 'nikesh';

create table user_elections (
	id bigserial,
	user_id bigint,
	election_id bigint,
	attributes jsonb
);
alter table user_elections add constraint foreign key user_elections_user_id references application.users (id);
alter table user_elections add constraint foreign key user_elections_election_id references application.elections (id);
