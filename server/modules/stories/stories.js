var path = require('path')
var db = require(path.join(__dirname, '../../common/db'))

async function list (req, res) {
  var client, result
  try {
 	client = await db.getClient()
    console.log('stories list:', req.body)
    result = await client.query('select stories($1, $2)', [req.body , {}])
	result = result.rows[0].stories
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
