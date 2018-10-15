var path = require('path')
var db = require(path.join(__dirname, '../../common/db'))
 
async function results (req, res) {
	var result, client
	try {
		client = await db.getClient()
		var session = req.session
		console.log('results:', session.id)
		result = await client.query('select results($1)', [req.body])
		result = result.rows[0].results
	}
	catch (err) {
		throw (err)
	}
	finally {
		client.end()
	}
  return result
}
 

function rankUpdate (req, data) {
  var client = db.getClient()
  var promise = new Promise(function(resolve, reject) {
    var session = req.session
    var result = null
    db.query(client, {
      cmd: 'select rank_update($1, $2)', 
      params: [session, data]
    })
    .then(function(ret) {
      result = ret
      return db.commitClient(client)
    })
    .then(function(ret) {
      db.endClient(client)
      resolve(result)
    })
    .catch(function(err) {
      db.endClient(client)
      reject(err)
    })
  })
  return promise
}

exports = module.exports = {
  results: results,
  rankUpdate: rankUpdate
}
