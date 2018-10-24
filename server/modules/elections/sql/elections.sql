
CREATE OR REPLACE FUNCTION create_election(session jsonb,  params jsonb) returns jsonb AS $$
  if (session.user_id == null) {
    throw Error ('missing user_id in session ' + session.id)
  }
  var ret = plv8.find_function('create_row')(session, params)
  if (ret != null && ret.id != null) {
    var electionId = ret.id
    var userData = {
		locked: false,
		shortlist: [],
		groups: ["admin", "editor", "public"]
	}
    plv8.execute ('insert into application.user_elections (user_id, election_id, attributes) values ($1, $2, $3)', [session.user_id, electionId, userData])
  }
  return ret
$$ LANGUAGE plv8;

