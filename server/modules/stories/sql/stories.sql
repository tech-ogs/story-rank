CREATE OR REPLACE FUNCTION stories(params jsonb, control jsonb) returns jsonb AS $$
  var result = plv8.execute('with election as ( select * from active_election()) select stories.* from application.stories, election where election_id = (election.active_election->>\'id\')::bigint order by id desc')
  return result
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION edit_row(session jsonb,  params jsonb) returns jsonb AS $$
  if (session.user_id == null) {
    throw Error ('missing user_id in session ' + session.id)
  }
  plv8.elog(LOG, JSON.stringify(params)) 
/*
  Object.keys(params.attributes).forEach(function(key) {
	if (key !== 'id') {
    	plv8.elog(LOG, key, params[key]) 
		val = JSON.stringify (params[key])
		plv8.execute('update application.stories set attributes = jsonb_set(attributes, $1, $2) where id = $3', [ [key], val,  params.id]) 
	}
  })
*/
  var attributes = plv8.execute('select attributes from application.stories where id = $1', [params.id])[0].attributes
  Object.assign(attributes, params.attributes)

  plv8.execute('update application.stories set attributes = $1, submitter_id = $2 where id = $3', [attributes, params.submitter_id, params.id])

  /*update the flags to request a recalc*/

  plv8.execute('update application.flags set value =  $2 where name = $1', ['request_recalc', true])
  
  var ret = plv8.execute('select * from application.stories where id = $1', [params.id])[0]
  return ret

$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION set_story_thumbnail ( id bigint,  url varchar) returns jsonb AS $$

	plv8.execute('update application.stories set attributes = jsonb_set(attributes, $1, $2) where id = $3', [['image'], '"' + url + '"', id])

$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION create_row(session jsonb,  params jsonb) returns jsonb AS $$
  if (session.user_id == null) {
    throw Error ('missing user_id in session ' + session.id)
  }

  var ret = plv8.execute ('insert into application.stories (submitter_id, election_id, attributes) values ($1, $2, $3) returning *', [params.submitter_id, params.election_id, params.attributes])[0]
  /*update the flags to request a recalc*/

  plv8.execute('update application.flags set value =  $2 where name = $1', ['request_recalc', true])

  return ret
$$ LANGUAGE plv8;

