
CREATE OR REPLACE FUNCTION users(cookie bigint) returns jsonb AS $$
  var result = plv8.execute('with usr as (select user_id as id from application.sessions where id = $1), elections as (select  election_id as id from application.user_elections, usr where user_id = usr.id), candidates as (select user_id, election_id from application.user_elections, elections where election_id = elections.id) select users.*, candidates.election_id from application.users, candidates where users.id = candidates.user_id', [cookie])
  return result
$$ LANGUAGE plv8;
