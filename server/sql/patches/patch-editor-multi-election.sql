drop table application.elections cascade;
drop table application.groups cascade;

create table application.elections (
	id bigserial primary key,
	name varchar,
	creation_date timestamp default now(),
	close_date timestamp
);

insert into application.elections (name, creation_date, close_date) values ('wtf-q1', '2018-04-15'::timestamp, '2018-06-26'::timestamp);
insert into application.elections (name, creation_date) values ('wtf-q2', '2018-09-01');

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

