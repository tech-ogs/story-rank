drop schema application cascade;
create schema application;

create table application.users (
  id  bigserial primary key,
  login varchar,
  name  varchar,
  password varchar,
  reset_password varchar,
  reset_code varchar,
  attributes jsonb
);
alter table application.users add constraint users_login_unique unique (login);
create index users_login_idx on application.users(login);

create table application.sessions (
  id bigserial primary key,
  user_id bigint,
  logged_in boolean,
  last_touched timestamp default now(),
  attributes jsonb
);
create index sessions_user_id_idx on application.sessions(user_id);
alter table application.sessions add constraint user_id_fkey foreign key (user_id) references application.users;

create table application.stories (
  id bigserial primary key,
  name varchar,
  submitter_id bigint,
  creation_date timestamp,
  attributes jsonb
);

alter table application.stories add constraint submitter_id_fkey foreign key (submitter_id) references application.users;

create table application.comments (
  id bigserial primary key,
  user_id bigint,
  story_id bigint,
  creation_date timestamp,
  comment varchar,
  attributes jsonb
);

alter table application.comments add constraint user_id_fkey foreign key (user_id) references application.users;
alter table application.comments add constraint story_id_fkey foreign key (story_id) references application.stories;

create table application.ranks (
  id bigserial primary key,
  user_id bigint,
  story_id bigint,
  rank integer,
  rank_date timestamp
);

alter table application.ranks add constraint user_id_fkey foreign key (user_id) references application.users;
alter table application.ranks add constraint story_id_fkey foreign key (story_id) references application.stories;

drop schema timeline cascade;
create schema timeline;

create table timeline.ranks (
  id bigserial primary key,
  record_date timestamp,
  row_id bigint,
  user_id bigint,
  story_id bigint,
  rank integer,
  rank_date timestamp
);

create table timeline.stories (
  id bigserial primary key,
  name varchar,
  submitter_id bigint,
  submission_date timestamp,
  attributes jsonb
);
