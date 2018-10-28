CREATE OR REPLACE FUNCTION shell(cookie bigint) returns jsonb AS $$

	var result = {}

	var userDetails = plv8.execute('select id, login, name, attributes  from application.users where id = (select user_id from application.sessions where id = $1)', [cookie])[0] || {}

	var elections = plv8.find_function('get_elections')(cookie)

	var ret = plv8.execute ('select * from application.user_elections where user_id = (select user_id from application.sessions where id = $1)', [cookie]) || []
	var userElections = {}
	ret.forEach(function(x) {
		userElections[x.election_id] = x.attributes
	})
    var ranks = plv8.execute('with e as (select id from application.elections), x as (select election_id, story_id from application.ranks, e where election_id = e.id and user_id = (select user_id from application.sessions where id = $1)  order by rank asc) select jsonb_build_object(election_id, jsonb_agg(x.story_id)) as ranks from x group by election_id', [cookie])[0]

	result.user = userDetails
	result.elections = elections;
	result.userElections = userElections
    result.myranks = ranks != null && ranks.ranks != null ? ranks.ranks : []
    
    return result

$$ LANGUAGE plv8;


CREATE OR REPLACE FUNCTION get_elections(cookie bigint) returns jsonb AS $$


	var elections = plv8.execute('with y as ( with x as ( select *, (close_date::date - now()::date)::int as days_to_close  from application.elections order by id desc) select id, name, label, attributes,  open_date, close_date, days_to_close, case when x.days_to_close >=0  then true else false end as active from x) select * from y where y.id in (select election_id from application.user_elections where user_id = (select user_id from application.sessions where id = $1)) order by active desc, id desc', [cookie])

	return elections

/*
	var election = plv8.execute('with y as ( with x as ( select *, (close_date::date - now()::date)::int as days_to_close  from application.elections where name not ilike $1 order by id desc) select id, name, label, attributes,  open_date, close_date, days_to_close, case when x.days_to_close >=0  then true else false end as active from x) select * from y order by active desc, id desc limit 1', ['test%'])
	
	return election[0] || {}
*/

$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION delete_test_logins () returns jsonb AS $$
	var rex = 'test\d*$'
	plv8.execute('delete from application.sessions  where user_id in ( select id from application.users where  login ~ $1)', [rex]);
	plv8.execute('delete from application.user_elections  where user_id in ( select id from application.users where  login ~ $1)', [rex]);
	plv8.execute('delete from application.ranks where user_id in ( select id from application.users where login ~ $1)', [rex]);
	plv8.execute('delete from application.users where login ~ $1', [rex]);

$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION signup (params json) returns jsonb AS $$
	plv8.elog(LOG, 'plv8 signup', JSON.stringify(params))

	var emptyRex = /^\s*$/
	var result = null


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
	plv8.elog(LOG, 'plv8 signup userCheck', JSON.stringify(userCheck))

	if (userCheck != null && userCheck.length > 0) {
		throw new Error ('login exists, please retry with a different login')
	}

	var mobileCheck = plv8.execute('select id from application.users where mobile = $1', [params.mobile])
	plv8.elog(LOG, 'plv8 signup mobileCheck', JSON.stringify(mobileCheck))

	if (mobileCheck != null && mobileCheck.length > 0) {
		throw new Error ('Mobile already registered, please retry with a different mobile')
	}

	/* if we got here, we can send the OTP for validation of mobile */
	/* record the OTP for verification */

	if (params.session == null ||  params.session.id == null) {
		throw new Error ('signup attempt failed, session not found. Please make sure cookies are enabled on this device')
	}
	else if (params.session.user_id != null && params.session.logged_in) {
		throw new Error ('signup failed, already logged in as a registered user from this device')

	}
	else {
		result = { otp : Math.floor(Math.random()*10000) }
		var cryptedPassword = plv8.execute('select crypt($1, gen_salt(\'md5\')) as cpasswd', [params.password])[0].cpasswd

		plv8.execute('update application.sessions set logged_in = false, last_touched = now(), user_id = null, attributes = attributes || $1 where id = $2 returning *', 
			[{pendingOtp: { task : 'signup', otp : result.otp, login: params.login, mobile: params.mobile, password: cryptedPassword}}, params.session.id])
	}

	return result
   
$$ LANGUAGE plv8;


CREATE OR REPLACE FUNCTION process_invites_upon_signup (session jsonb) returns jsonb AS $$

	var invites = session.attributes.invites
	if (invites != null && invites instanceof Array && invites.length > 0) {
		invites.forEach(function(x) { 
			var invt = plv8.find_function('parse_invite_code')(x)
			plv8.execute ('insert into application.user_elections (user_id, election_id, attributes) values ( (select user_id from application.sessions where id = $1), $2, $3) returning *', [session.id, invt.electionId, {groups: ["public"]}])
		})
		plv8.execute('update application.sessions set attributes = attributes - \'invites\' where id = $1', [session.id])
	}

$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION validate_otp (params jsonb) returns jsonb AS $$
	var session = params.session
	var operation = session.attributes.pendingOtp
	if (operation == null) {
		throw new Error ('nothing waiting for OTP validation')
	}
	else if (operation.task === 'signup') {
		plv8.elog(LOG, 'signup operation', JSON.stringify(operation))

		if (operation.login.match(/test\d*$/)) {
			params.otp = ''
			operation.otp = ''
		}

		if (params.otp === operation.otp) {
			var userRecord = plv8.execute('insert into application.users (login, mobile, password) values ($1, $2, $3) returning *', [operation.login, operation.mobile, operation.password])
			if (userRecord == null || userRecord.length === 0) {
				throw new Error ('Server error during signup, could not create user')
			}
			plv8.execute('update application.sessions set logged_in = true, last_touched = now(), attributes = attributes - \'pendingOtp\', user_id = $1 where id = $2 returning *', [userRecord[0].id, params.session.id])
			plv8.find_function('process_invites_upon_signup')(params.session)
		}
		else {
			throw new Error ('OTP does not match, try again')
		}
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

CREATE OR REPLACE FUNCTION parse_invite_code (code text) returns jsonb AS $$
	return { electionId : code }	
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION invite (params jsonb) returns jsonb AS $$
  plv8.elog(LOG, 'plv8 invite', JSON.stringify(params))
  var result = null;
  var invite = plv8.find_function('parse_invite_code')(params.code);
  var electionId = invite.electionId;
  
  if (params.session.logged_in) {
	result = plv8.execute ('insert into application.user_elections (user_id, election_id, attributes) values ( (select user_id from application.sessions where id = $1), $2, $3) returning *', [params.session.id, electionId, {groups: ["public"]}])
  }
  else {
	var attributes = plv8.execute('select attributes from application.sessions where id = $1', [params.session.id])[0].attributes
	if (attributes == null) {
		attributes = {}
	}

	if (attributes.invites == null) { 
		attributes.invites = []
	}

	if (attributes.invites.indexOf(params.code) < 0) {
		attributes.invites.push.apply(attributes.invites, [params.code])
	}

	result = plv8.execute('update application.sessions set last_touched = now(), attributes = $1  where id = $2 returning *',[attributes, params.session.id])
  }

  return null
   
$$ LANGUAGE plv8;

