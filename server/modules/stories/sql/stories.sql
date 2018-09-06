CREATE OR REPLACE FUNCTION edit_row(session jsonb,  params jsonb) returns jsonb AS $$
  if (session.user_id == null) {
    throw Error ('missing user_id in session ' + session.id)
  }
  plv8.elog(LOG, JSON.stringify(params)) 
  Object.keys(params).forEach(function(key) {
	if (key !== 'id') {
    	plv8.elog(LOG, key, params[key]) 
		val = JSON.stringify (params[key])
		plv8.execute('update application.stories set attributes = jsonb_set(attributes, $1, $2) where id = $3', [ [key], val,  params.id]) 
	}
  })

  /*update the flags to request a recalc*/

  plv8.execute('update application.flags set value =  $2 where name = $1', ['request_recalc', true])
  
  var ret = plv8.execute('select * from application.stories where id = $1', [params.id])[0]
  return ret

$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION create_row(session jsonb,  params jsonb) returns jsonb AS $$
  if (session.user_id == null) {
    throw Error ('missing user_id in session ' + session.id)
  }
  
  var ret = plv8.execute ('insert into application.stories (submitter_id, election_id, attributes) values ($1, $2, $3) returning *', [session.user_id, params.election_id, params.row])
  /*update the flags to request a recalc*/

  plv8.execute('update application.flags set value =  $2 where name = $1', ['request_recalc', true])

  return ret
$$ LANGUAGE plv8;

