var path = require('path')
var db = require(path.join(__dirname, '/db'))

async function list (req, res) {
	var result, client
	try {
		client = await db.getClient()
		console.log('list:', req.body)
		var params = req.body || { schema: 'application', table : 'stories' }
		result = await client.query('select list($1, $2)', [params , {}])
		result = result.rows[0].list
	}
	catch(err) {
		//console.trace('list error', err.message)
		throw (err)
	}
	finally {
		await client.end()
	}
	return result
}
 
exports = module.exports = {
  list: list
}
