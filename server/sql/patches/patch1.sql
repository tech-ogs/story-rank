--- this schema patch creates the results table and re-creates timelines (not implemented yet so safe to drop)

drop table application.sgraph cascade;
create table application.sgraph (
  src bigint,
  dst bigint,
  kids bigint[]
);

CREATE INDEX src_idx on application.sgraph (src);
CREATE INDEX dst_idx on application.sgraph (dst);
CREATE INDEX kids_idx on application.sgraph USING GIN (kids);

drop table application.results cascade;
create table application.results (
  id bigserial,
  rank_date timestamp default now(),
  ranks bigint[]
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
