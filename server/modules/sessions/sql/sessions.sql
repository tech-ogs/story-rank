CREATE OR REPLACE FUNCTION get_session(cookie bigint) returns jsonb AS $$
  var records
  if (cookie == null) {
    records = plv8.execute('insert into application.sessions default values returning *')
  }
  else {
    records = plv8.execute('update application.sessions set last_touched = now() where id = $1 and last_touched > now() - interval \'24 hours\' returning *', [cookie])
    if (records == null || records.length === 0) { // expired 
      records = plv8.execute('insert into application.sessions default values returning *')
    }
  }
  //plv8.elog(LOG, 'records', JSON.stringify(records))
  return records[0]
$$ LANGUAGE plv8;

DROP TYPE session_info CASCADE;
CREATE  TYPE session_info as (
  id bigint,
  user_id bigint,
  login varchar,
  logged_in boolean,
  last_touched timestamp,
  attributes jsonb
);
  
CREATE OR REPLACE FUNCTION list_sessions(login varchar) returns setof session_info AS $$

  var ret
  if (login == null) {
    ret = plv8.execute ('select S.id, S.user_id, U.login, S.logged_in, S.last_touched, S.attributes from application.sessions as s left join application.users as U on U.id = S.user_id')
  }
  else {
    ret = plv8.execute ('select S.id, S.user_id, U.login, S.logged_in, S.last_touched, S.attributes from application.sessions as S,  application.users as U where  U.id = S.user_id and U.login = $1', [login])
  }
  return ret
  
$$ LANGUAGE plv8;
