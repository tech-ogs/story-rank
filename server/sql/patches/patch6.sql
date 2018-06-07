drop table application.flags;
create table application.flags (
  name varchar primary key,
  value boolean
);
insert into application.flags(name, value) values ('request_recalc', false);
insert into application.flags(name, value) values ('inprogress_recalc', false);
insert into application.flags(name, value) values ('done_recalc', false);


