--- this schema patch creates the results table and re-creates timelines (not implemented yet so safe to drop)

drop table application.sgraph cascade;
create table application.sgraph (
  path ltree
);

CREATE INDEX path_gist_idx ON application.sgraph USING GIST (path);
CREATE INDEX path_idx ON application.sgraph USING BTREE (path);

drop table application.results cascade;
create table application.results (
  story_id bigint,
  rank integer
);

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
  record_date timestamp,
  row_id bigint,
  name varchar,
  submitter_id bigint,
  submission_date timestamp,
  attributes jsonb
);

create table timeline.results (
  id bigserial primary key,
  record_date timestamp,
  story_id bigint,
  rank integer
);
