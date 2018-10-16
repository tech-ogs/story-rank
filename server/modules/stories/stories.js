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

async function editRow (req, res) {
	console.log ('stories editRow', req.body)
	var result, client
	try {
  		client = await db.getClient()
    	var session = req.session
		result = await client.query('select edit_row($1, $2)', [req.session, req.body])
      	result = result.rows[0].edit_row
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

async function createRow (req, res) {
	console.log ('stories createRow', req.body)
	var result, client
	try {
  		client = await db.getClient()
    	var session = req.session
		result = await client.query('select create_row($1, $2)', [req.session, req.body])
      	result = result.rows[0].create_row
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
  list: list,
  editRow: editRow,
  createRow: createRow
}
