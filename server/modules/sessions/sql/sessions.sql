CREATE OR REPLACE FUNCTION get_session(cookie bigint) returns jsonb AS $$
  var records
    plv8.elog(LOG, 'i am here 0')
  if (cookie == null) {
    plv8.elog(LOG, 'i am here 1')
    records = plv8.execute('insert into application.sessions default values returning *')
  }
  else {
    plv8.elog(LOG, 'i am here 2')
    records = plv8.execute('update application.sessions set last_touched = now() where id = $1 and last_touched > now() - interval \'24 hours\' returning *', [cookie])
    if (records == null || records.length === 0) { // expired 
      plv8.elog(LOG, 'i am here 3')
      records = plv8.execute('insert into application.sessions default values returning *')
    }
  }
  //plv8.elog(LOG, 'records', JSON.stringify(records))
  return records[0]
$$ LANGUAGE plv8;

