SET search_path = public, pg_catalog;
-- http://dba.stackexchange.com/questions/1742/how-to-insert-file-data-into-a-postgresql-bytea-column
create or replace function bytea_import(p_path text, p_result out bytea) 
                   language plpgsql as $$
    declare
      l_oid oid;
      r record;
    begin
      p_result := '';
      select lo_import(p_path) into l_oid;
      for r in ( select data 
                 from pg_largeobject 
                 where loid = l_oid 
                 order by pageno ) loop
        p_result = p_result || r.data;
      end loop;
      perform lo_unlink(l_oid);
    end;
$$;

-- http://dba.stackexchange.com/questions/83663/dump-all-binary-columns-from-a-table-as-files

CREATE OR REPLACE FUNCTION bytea_export(bytea,text) RETURNS void AS $$
    declare
     o oid;
     fd integer;
     INV_WRITE int := 131072;
    begin
     o:=lo_create(-1);
     fd:=lo_open(o, INV_WRITE);
     if (fd<0) then
       raise exception 'Failed to open large object %', o;
     end if;

     perform lowrite(fd, $1);
     if (lo_close(fd)<>0) then
       raise exception 'Failed to close large object %', o;
     end if;

     perform lo_export(o, $2);
     perform lo_unlink(o);
    end;
$$ language plpgsql;


CREATE OR REPLACE FUNCTION add_media(args json) RETURNS json AS $$

    var env = args.env;
    var params = args.data;
	var result

    try {
/*
        var actualExtension = params.fileObj.originalname.substr(params.fileObj.originalname.lastIndexOf('.')+1);

        var userInputExt = "";
        if(userInputName.lastIndexOf('.') < 0) {

            userInputName = userInputName + '.' + actualExtension;
        }
*/
		var filepath = params.basePath + '/' + params.fileObj.path

        var ret = plv8.execute('insert into application.media(name, type, created_by, attributes,  data ) select $1, $2, $3, $4,  bytea_import($5) returning id',
            [params.fileObj.originalname, params.fileObj.mimetype, env.user_id, null, filepath ]);
        result = {
            id : ret[0].id,
            name : params.fileObj.originalname
        };
    }
    catch(err) {
        plv8.elog(LOG, err.stack);
    }
    return result;
       
$$ language plv8;
