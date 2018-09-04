REATE OR REPLACE FUNCTION shell(cookie bigint) returns jsonb AS $$

	var result = {}

	var userDetails = plv8.execute('select login, name, attributes->\'groups\' as groups  from application.users where id = (select user_id from application.sessions where id = $1)', [cookie])[0] || {}
	var electionDetails = plv8.execute ('select id, name, label, attributes, (close_date::date - open_days::date)::int as days_to_close  from application.user_elections where active = true and user_id = (select user_id from application.sessions where id = $1)', [cookie])[0] || {}
    var ranks = plv8.execute('with x as (select story_id from application.ranks where user_id = (select user_id from applicaiton.sessions where id = $1) order by rank asc) select jsonb_agg(x.story_id) as ranks from x', [cookie])[0].ranks || {}

    result.login = userDetails.login
    result.name = userDetails.name
    result.groups = userDetails.groups
	result.electionId = electionDetails.id
	result.electionName = electionDetails.name
	result.electionLabel = electionDetails.label
    result.locked = electionDetails.attributes.locked
    result.daysToClose = electionDetails.days_to_close
    result.myranks = ranks.ranks
    
    return result

$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION myranks(cookie bigint) returns jsonb AS $$
  var favorites = plv8.execute('select jsonb_object_agg(story_id, true) as favorites from application.ranks where favorite = true and user_id = (select user_id from application.sessions where id = $1)', [cookie])[0].favorites || {}

  return {
    ranks : ranks,
    favorites: favorites
  }
$$ LANGUAGE plv8;



CREATE OR REPLACE FUNCTION login (params json) returns jsonb AS $$
  plv8.elog(LOG, 'plv8 login', JSON.stringify(params))
  
  if (params.login === '' || params.login == null) {
    throw new Error ('Login name is required')
  }
  if (params.password === '' || params.password == null) { 
    throw new Error ('Password is required')
  }
  
  var ret = plv8.execute('select * from application.users where login = $1 and (password = crypt($2, password))', [params.login, params.password])
  plv8.elog(LOG, 'plv8 login ret', JSON.stringify(ret))

  if (['nikesh', 'kavi', 'test'].indexOf(params.login) < 0) {
    throw new Error ('login restricted to construction crew at this time')
  }

  if (ret == null || ret.length === 0) {
    throw new Error ('login failed')
  }
  else {
    if (params.session != null && params.session.id != null) { 
      plv8.execute('update application.sessions set logged_in = true, last_touched = now(), user_id = $1 where id = $2 returning *', [ret[0].id, params.session.id])
    }
  }
  return ret[0]
   
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION logout (params json) returns jsonb AS $$
  plv8.elog(LOG, 'plv8 logout', JSON.stringify(params))
  
  if (params.session != null && params.session.id != null) { 
    ret = plv8.execute('update application.sessions set logged_in = false where id = $1 returning *', [params.session.id])
  }
  return ret[0]
   
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION reset (params json) returns jsonb AS $$

  plv8.elog(LOG, 'plv8 reset', JSON.stringify(params))

  if (params.login === '' || params.login == null) {
    throw new Error ('Login name is required')
  }
  if (params.password === '' || params.password == null) { 
    throw new Error ('Password is required')
  }

  var result = null;
  var code = Math.round(Math.random()*10000)

  if (params.login == null) {
    throw new Error ('null login name')
  }
  if (params.password == null) { 
    throw new Error ('null password')
  }
  var ret = plv8.execute('update application.users set reset_password = crypt($1, gen_salt(\'md5\')), reset_code = $2 where login = $3 returning *', [params.password, code, params.login])
  if (ret == null || ret.length === 0) {
    ret = plv8.execute('insert into application.users (login, reset_code, reset_password) values ($1, $2, crypt($3, gen_salt(\'md5\'))) returning *', [params.login, code, params.password])
    if (ret == null || ret.length === 0) {
      throw new Error ('reset failed')
    }
  }

  if (params.session != null && params.session.id != null) { 
    plv8.execute('update application.sessions set last_touched = now(), logged_in = false  where id = $1', [params.session.id])
  }

  result = {
    code: code,
    login: params.login
  }
  return result
   
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION approve_reset (login varchar) returns jsonb AS $$
  plv8.elog(LOG, 'plv8 approve reset', JSON.stringify(login))
  var result = null;
  if (login == null) {
    throw new Error ('null login name')
  }
  
  var ret = plv8.execute('update application.users set password = reset_password where login = $1 returning *', [login])

  if (ret == null || ret.length === 0) {
    throw new Error ('reset approval failed')
  }
  else {
    plv8.execute('update application.sessions set last_touched = now(), logged_in = false, user_id = null  where user_id = (select id from application.users where login = $1)', [login])
  }

  return null
   
$$ LANGUAGE plv8;

