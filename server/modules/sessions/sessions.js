var path = require('path')
var db = require(path.join(__dirname, '../../common/db'))

async function getSession (cookie) {
	var client, result
	try {
		client = await db.getClient()
		console.log('getSession:', cookie)
		result = await client.query('select get_session($1)', [cookie || null])
		result = result.rows[0].get_session
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
  getSession: getSession
}
