alter table application.users add column mobile int;

alter table application.elections add column image_id bigint;
alter table application.elections add constraint elections_image_id_fkey foreign key (image_id) references application.media(id);

