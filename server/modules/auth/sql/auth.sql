CREATE OR REPLACE FUNCTION shell(cookie bigint) returns jsonb AS $$

	var result = {}

	var userDetails = plv8.execute('select id, login, name, attributes->\'groups\' as groups  from application.users where id = (select user_id from application.sessions where id = $1)', [cookie])[0] || {}

	var elections = plv8.find_function('get_elections')(cookie)

	var ret = plv8.execute ('select * from application.user_elections where user_id = (select user_id from application.sessions where id = $1)', [cookie]) || []
	var userElections = {}
	ret.forEach(function(x) {
		userElections[x.election_id] = x.attributes
	})
    var ranks = plv8.execute('with e as (select id from application.elections), x as (select election_id, story_id from application.ranks, e where election_id = e.id and user_id = (select user_id from application.sessions where id = $1)  order by rank asc) select jsonb_build_object(election_id, jsonb_agg(x.story_id)) as ranks from x group by election_id', [cookie])[0]

	result.user = userDetails
	result.user.sessionId = cookie
	result.elections = elections;
	result.userElections = userElections
    result.myranks = ranks.ranks != null ? ranks.ranks : []
    
    return result

$$ LANGUAGE plv8;


CREATE OR REPLACE FUNCTION get_elections(cookie bigint) returns jsonb AS $$


	var elections = plv8.execute('with y as ( with x as ( select *, (close_date::date - now()::date)::int as days_to_close  from application.elections where name not ilike $1 order by id desc) select id, name, label, attributes,  open_date, close_date, days_to_close, case when x.days_to_close >=0  then true else false end as active from x) select * from y where y.id in (select election_id from application.user_elections where user_id = (select user_id from application.sessions where id = $2)) order by active desc, id desc', ['test%', cookie])

	return elections

/*
	var election = plv8.execute('with y as ( with x as ( select *, (close_date::date - now()::date)::int as days_to_close  from application.elections where name not ilike $1 order by id desc) select id, name, label, attributes,  open_date, close_date, days_to_close, case when x.days_to_close >=0  then true else false end as active from x) select * from y order by active desc, id desc limit 1', ['test%'])
	
	return election[0] || {}
*/

$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION signup (params json) returns jsonb AS $$
	plv8.elog(LOG, 'plv8 signup', JSON.stringify(params))

	var emptyRex = /^\s*$/

	if (emptyRex.test(params.login) || params.login == null) {
		throw new Error ('Login name is required')
	}
	if (emptyRex.test(params.mobile) || params.mobile == null) {
		throw new Error ('Mobile is required')
	}
	if (emptyRex.test(params.password) || params.password == null) { 
		throw new Error ('Password is required')
	}

	var userCheck = plv8.execute('select * from application.users where login = $1', [params.login])
	plv8.elog(LOG, 'plv8 signup userCheck', JSON.stringify(ret))

	if (userCheck != null && userCheck.length > 0) {
		throw new Error ('login exists, please retry with a different login')
	}

	var mobileCheck = plv8.execute('select id from application.users where mobile = $1', [params.mobile])
	plv8.elog(LOG, 'plv8 signup mobileCheck', JSON.stringify(ret))

	if (mobileCheck != null && mobileCheck.length > 0) {
		throw new Error ('Mobile already registered, please retry with a different mobile')
	}

	/* if we got here, the signup attempt can go through */
	var userRecord = plv8.execute('insert into application.users (login, mobile, password) values ($1, $2, $3) returning *', [params.login, params.mobile, params.password])
	if (userRecord == null || userRecord.length === 0) {
		throw new Error ('Server error during signup')
	}
		
	if (params.session != null && params.session.id != null) {
		plv8.execute('update application.sessions set logged_in = true, last_touched = now(), user_id = $1 where id = $2 returning *', [userRecord[0].id, params.session.id])
	}

	return userRecord[0]
   
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

/*
  if (['nikesh', 'kavi', 'test', 'sue', 'rajesh', 'Jamwal'].indexOf(params.login) < 0) {
    throw new Error ('login restricted to construction crew at this time')
  }
*/

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

