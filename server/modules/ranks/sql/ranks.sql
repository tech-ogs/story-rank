CREATE OR REPLACE FUNCTION myranks(cookie bigint) returns jsonb AS $$
  var records = plv8.execute('select * from application.ranks where user_id = (select user_id from application.sessions where id = $1)', [cookie])
  return records || []
$$ LANGUAGE plv8;

