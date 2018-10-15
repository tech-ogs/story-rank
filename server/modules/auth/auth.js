var path = require('path')
var db = require(path.join(__dirname, '../../common/db'))

async function shell (req, res) {
	var client, result
	try {
		client = await db.getClient()
		var session = req.session
		console.log('shell:', session.id)
		result = await client.query('select shell($1)', [session.id || null])
        result = result.rows[0].shell
	}
	catch(err) {
		//console.trace ('in shell error', err.message)
		throw(err)
	}
	finally {
		await client.end()
	}
	return result
}
 
async function signup (req, res) {
	var client, result
	try {
		client = await db.getClient()
		var params = req.body
		params.session = req.session
		console.log('signup:', params)
		result = await client.query('select signup($1)', [params || {}])
        result = result.rows[0].signup
		await client.query('commit')
	}
	catch(err) {
	  throw (err)
	}
	finally {
      await client.end()
	}
    return result
}

async function login (req, res) {
    var client, result
    try {
        client = await db.getClient()
        var params = req.body
        params.session = req.session
        console.log('login:', params)
        result = await client.query('select login($1)', [params || {}])
		console.log ('login result:', result)
        result = result.rows[0].login
        await client.query('commit')
    }
  	catch(err) {
	    throw (err)
	}
	finally {
        await client.end()
	}
    return result
}
 
async function logout (req, res) {
    var client, result
    try {
        client = await db.getClient()
        var params = req.body
        params.session = req.session
        console.log('logout:', params)
        result = await client.query('select logout($1)', [params || {}])
        result = result.rows[0].logout
        await client.query('commit')
    }
  	catch(err) {
	    throw (err)
	}
	finally {
        await client.end()
	}
    return result
}

/*
function reset (req, res) {
  var client = db.getClient()
  var params = req.body
  params.session = req.session
  var promise = new Promise(function(resolve, reject) {
    console.log('login:', params)
    client.query('select reset($1)', [params || {}], function (err, ret1) {
      console.log('pg callback', err)
      if (err == null) {
        client.query('commit',[], function(err, ret2) {
          if (err == null) {
            client.end()
            resolve(ret1.rows[0].reset)
          }
          else {
            client.end()
            reject(err)
          }
        })
      }
      else {
        client.end()
        reject(err)
      }
    })
  })
  return promise
}
*/
exports = module.exports = {
  shell: shell,
  signup: signup,
  login: login,
  logout: logout,
  //reset: reset
}
