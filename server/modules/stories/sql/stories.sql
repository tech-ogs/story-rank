CREATE OR REPLACE FUNCTION stories(params jsonb, control jsonb) returns jsonb AS $$
  if (params.electionId == null) { 
	throw ('stories retrieval failed, no electionId ')
  }
  var result = plv8.execute('select stories.* from application.stories where election_id = $1 order by id desc', [params.electionId])
  return result
$$ LANGUAGE plv8;


