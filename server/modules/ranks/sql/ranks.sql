CREATE OR REPLACE FUNCTION rank_update(session jsonb,  params jsonb) returns jsonb AS $$
  if (session.user_id == null) {
    throw Error ('missing user_id in session ' + session.id)
  }
  var eClosed = false;
  var ueLocked = false;
  var userElectionDetails = plv8.execute('select attributes from application.user_elections where user_id = $1 and election_id = $2', [session.user_id, params.election.id])
  if (userElectionDetails != null && userElectionDetails.length > 0) {
	ueLocked = userElectionDetails[0].attributes.locked
  }
  var election = plv8.find_function('get_election')()
  if (election.days_to_close < 0) {
	eClosed = true
  }
  plv8.elog (LOG, 'ueLocked: ', ueLocked)
  if (!eClosed && !ueLocked) {
	  plv8.execute('delete from application.ranks where user_id = $1', [session.user_id])

	  plv8.elog(LOG, ['rank_update params:', JSON.stringify(params)]) 
	  var insertStmt = plv8.prepare('insert into application.ranks (user_id, story_id, rank, election_id) values ($1, $2, $3, $4)')
	  params.myranks.forEach(function(storyId, pos) {
		plv8.elog(LOG, [ session.user_id, storyId, pos+1]) 
		if (storyId != null) {
			insertStmt.execute([ session.user_id, storyId, pos+1, params.election.id])
		}
	  })
	  insertStmt.free()
  }

  if (ueLocked) {
	params.userElectionDetails.locked = true
  }

  plv8.execute ('update application.user_elections set attributes = attributes || $3  where user_id = $1 and election_id = $2', 
	[session.user_id, params.election.id, params.userElectionDetails])
/*
  plv8.execute ('delete from application.user_elections where user_id = $1', [session.user_id])
  plv8.execute ('insert into application.user_elections (user_id, election_id, attributes) values ($1, $2, $3)', [session.user_id, params.election.id, params.userElectionDetails])
*/
  /*update the flags to request a recalc*/

  plv8.execute('update application.flags set value =  $2, params = $3 where name = $1', ['request_recalc', true, {electionId : params.election.id}])

$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION unlock (login varchar) returns jsonb AS $$

	var ret = plv8.execute('update application.user_elections set attributes = jsonb_set(attributes, $1, $2) where user_id = (select id from application.users where login = $3)', [ ['locked'], false, login])
	return ret

$$ LANGUAGE plv8;
/* results related */

CREATE OR REPLACE FUNCTION results(params jsonb) returns jsonb AS $$
	if (params.electionId == null) {
		throw ('error getting results, no electionId specified: ' + JSON.stringify(params))
	}
  var ret = plv8.execute('select ranks  from application.results where election_id = $1', [params.electionId]);
  if (ret == null || ret.length === 0) {
    ret = [{ ranks : [] }]
  }
  return { ranks : ret[0].ranks }
    
$$ LANGUAGE plv8;



