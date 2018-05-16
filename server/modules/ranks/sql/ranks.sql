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

  var insertStmt = plv8.prepare('insert into application.ranks (user_id, story_id, rank, favorite) values ($1, $2, $3, $4)')
  Object.keys(params.ranks).forEach(function(r) {

    plv8.elog(LOG, [ session.user_id, params.ranks[r], r, params.favorites[params.ranks[r]] || false])

    insertStmt.execute([ session.user_id, r, params.ranks[r], params.favorites[r] || false])
  })
  insertStmt.free()
$$ LANGUAGE plv8;



