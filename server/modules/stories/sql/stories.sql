CREATE OR REPLACE FUNCTION stories(params jsonb, control jsonb) returns jsonb AS $$
  if (params.electionId == null) { 
	throw ('stories retrieval failed, no electionId ')
  }
  var result = plv8.execute('select stories.* from application.stories where election_id = $1 order by id desc', [params.electionId])
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
  var attributes = plv8.execute('select attributes from application.stories where id = $1', [params.row.id])[0].attributes

  /*Object.assign(attributes, params.attributes)*/

  Object.keys(params.row.attributes).forEach(function(x) {
	attributes[x] = params.row.attributes[x]
  })

  plv8.execute('update application.stories set attributes = $1, submitter_id = $2, creation_date = $3 where id = $4', [attributes, params.row.submitter_id, params.row.creation_date, params.row.id])

  /*update the flags to request a recalc*/

  plv8.execute('update application.flags set value =  $2, params = $3  where name = $1', ['request_recalc', true, { electionId : params.row.election_id } ])
  
  var ret = plv8.execute('select * from application.stories where id = $1', [params.row.id])[0]
  return ret

$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION set_story_thumbnail ( id bigint,  thumb_url varchar, url varchar) returns jsonb AS $$

	plv8.execute('update application.stories set attributes = jsonb_set(attributes, $1, $2) where id = $3', [['image'], '"' + thumb_url + '"', id])
	plv8.execute('update application.stories set attributes = jsonb_set(attributes, $1, $2) where id = $3', [['full_image'], '"' + url + '"', id])

$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION create_row(session jsonb,  params jsonb) returns jsonb AS $$
  if (session.user_id == null) {
    throw Error ('missing user_id in session ' + session.id)
  }

  var ret = plv8.execute ('insert into application.stories (submitter_id, election_id, creation_date, attributes) values ($1, $2, $3, $4) returning *', [params.row.submitter_id, params.row.election_id, params.row.creation_date, params.row.attributes])[0]
  /*update the flags to request a recalc*/

  plv8.execute('update application.flags set value =  $2, params = $3 where name = $1', ['request_recalc', true, {electionId : params.row.election_id}])

  return ret
$$ LANGUAGE plv8;

