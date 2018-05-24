drop table application.sgraph cascade;
create table application.sgraph (
  src bigint,
  dst bigint,
  margin bigint
);

CREATE INDEX src_idx on application.sgraph (src);
CREATE INDEX dst_idx on application.sgraph (dst);

drop table application.sgraph_index cascade;
create table application.sgraph_index (
  src bigint unique,
  kids bigint[]
);
CREATE INDEX src_index_idx on application.sgraph (src);
alter table application.sgraph_index add constraint unique_src unique  (src);
