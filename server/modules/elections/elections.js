var path = require('path')
var db = require(path.join(__dirname, '../../common/db'))

async function createElection (req, res) {
	console.log ('createElection', req.body)
	var result, client
	try {
  		client = await db.getClient()
    	var session = req.session
		result = await client.query('select create_election($1, $2)', [req.session, req.body])
      	result = result.rows[0].create_election
		await client.query('commit')
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
  createElection: createElection
}
