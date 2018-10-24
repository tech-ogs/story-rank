drop function stories (jsonb, jsonb);
CREATE OR REPLACE FUNCTION stories(cookie bigint) returns jsonb AS $$
/*
  if (params.electionId == null) { 
	throw ('stories retrieval failed, no electionId ')
  }
  var result = plv8.execute('select stories.* from application.stories where election_id = $1 order by id desc', [params.electionId])
*/
  var result = plv8.execute ('select stories.* from application.stories, application.user_elections where stories.election_id = user_elections.election_id and user_elections.user_id = (select user_id from application.sessions where id = $1) order by election_id desc', [cookie])

  return result
$$ LANGUAGE plv8;


