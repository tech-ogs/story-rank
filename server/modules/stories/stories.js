var path = require('path')
var db = require(path.join(__dirname, '../../common/db'))


function editRow (req, data) {
  var client = db.getClient()
  var promise = new Promise(function(resolve, reject) {
    var session = req.session
    var result = null
    db.query(client, {
      cmd: 'select edit_row($1, $2)', 
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

function createRow (req, data) {
  var client = db.getClient()
  var promise = new Promise(function(resolve, reject) {
    var session = req.session
    var result = null
    db.query(client, {
      cmd: 'select edit_row($1, $2)', 
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
  editRow: editRow,
  createRow: createRow
}
