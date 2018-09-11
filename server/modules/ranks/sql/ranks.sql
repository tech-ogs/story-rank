CREATE OR REPLACE FUNCTION myranks(cookie bigint) returns jsonb AS $$
  var ranks = plv8.execute('select jsonb_object_agg(story_id, rank) as ranks from application.ranks where user_id = (select user_id from application.sessions where id = $1)', [cookie])[0].ranks || {}
  var favorites = plv8.execute('select jsonb_object_agg(story_id, true) as favorites from application.ranks where favorite = true and user_id = (select user_id from application.sessions where id = $1)', [cookie])[0].favorites || {}

  return {
    ranks : ranks,
    favorites: favorites
  }
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION rank_update(session jsonb,  params jsonb) returns jsonb AS $$
  if (session.user_id == null) {
    throw Error ('missing user_id in session ' + session.id)
  }
  plv8.execute('delete from application.ranks where user_id = $1', [session.user_id])

  plv8.elog(LOG, JSON.stringify(params)) 
  var insertStmt = plv8.prepare('insert into application.ranks (user_id, story_id, rank) values ($1, $2, $3)')
  params.myranks.forEach(function(storyId, pos) {
    plv8.elog(LOG, [ session.user_id, storyId, pos+1]) 
	if (storyId != null) {
    	insertStmt.execute([ session.user_id, storyId, pos+1])
	}
  })
  insertStmt.free()

  plv8.execute ('delete from application.user_elections where user_id = $1', [session.user_id])
  plv8.execute ('insert into application.user_elections (user_id, election_id, attributes) values ($1, $2, $3)', [session.user_id, params.election_id, params.userElectionDetails])

  /*update the flags to request a recalc*/

  plv8.execute('update application.flags set value =  $2, params = $3 where name = $1', ['request_recalc', true, {electionId : params.election_id}])

$$ LANGUAGE plv8;


/* results related */

CREATE OR REPLACE FUNCTION results(params jsonb) returns jsonb AS $$
	if (params.electionId == null) {
		throw ('error getting results, no electionId specified')
	}
  var ret = plv8.execute('select ranks  from application.results where election_id = $1', [params.electionId]);
  if (ret == null || ret.length === 0) {
    ret = [{ ranks : [] }]
  }
  return { ranks : ret[0].ranks }
    
$$ LANGUAGE plv8;



