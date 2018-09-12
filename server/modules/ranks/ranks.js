var path = require('path')
var db = require(path.join(__dirname, '../../common/db'))
 
function results (req, res) {
  var client = db.getClient()
  var promise = new Promise(function(resolve, reject) {
    var session = req.session
    console.log('results:', session.id)
    client.query('select results($1)', [req.body], function (err, ret) {
      client.end()
      console.log('pg callback', err)
      if (err == null) {
        resolve(ret.rows[0].results)
      }
      else {
        reject(err)
      }
    })
  })
  return promise
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
