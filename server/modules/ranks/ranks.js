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
 

async function rankUpdate (req, data) {
	var client, result
	try {
		client = await db.getClient()
    	var session = req.session
		result = await client.query('select rank_update($1, $2)', [session, data])
		result = result.rows[0].rank_update
		await client.query('commit');
	}
	catch(err) {
		throw (err)
	}
	finally {
		client.end()
	}
	return result
}

exports = module.exports = {
  results: results,
  rankUpdate: rankUpdate
}
