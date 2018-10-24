var path = require('path')
var db = require(path.join(__dirname, '../../common/db'))

async function list (req, res) {
  var client, result
  try {
 	client = await db.getClient()
    console.log('users list:', req.body, req.session)
    result = await client.query('select users($1)', [req.session.id])
	result = result.rows[0].users
    console.log('users result:', result)
  }
  catch(err) {
    //console.trace('stories list error', err.message)
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
