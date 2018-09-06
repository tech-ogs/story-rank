var path = require('path')
var db = require(path.join(__dirname, '../../common/db'))


function editRow (req, res) {
  console.log ('stories editRow', req.body)
  var client = db.getClient()
  var promise = new Promise(function(resolve, reject) {
    var session = req.session
    var result = null
    db.query(client, {
      cmd: 'select edit_row($1, $2)', 
      params: [req.session, req.body]
    })
    .then(function(ret) {
	  //console.log ('ret editrow: ',ret )
      result = ret.rows[0].edit_row
      return db.commitClient(client)
    })
    .then(function(ret) {
      db.endClient(client)
	  console.log ('resolving editrow: ', result)
      resolve(result)
    })
    .catch(function(err) {
      db.endClient(client)
      reject(err)
    })
  })
  return promise
}

function createRow (req, res) {
  console.log ('stories createRow', req.body)
  var client = db.getClient()
  var promise = new Promise(function(resolve, reject) {
    var session = req.session
    var result = null
    db.query(client, {
      cmd: 'select create_row($1, $2)', 
      params: [req.session, req.body]
    })
    .then(function(ret) {
      result = ret.rows[0].create_row
      return db.commitClient(client)
    })
    .then(function(ret) {
      db.endClient(client)
	  console.log ('resolving createrow: ', result)
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
  editRow: editRow,
  createRow: createRow
}
