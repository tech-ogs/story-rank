var path = require('path')
var db = require(path.join(__dirname, '../../common/db'))
function myranks (req, res) {
  var client = db.getClient()
  var promise = new Promise(function(resolve, reject) {
    var session = req.session
    console.log('myRanks:', session.id)
    client.query('select myranks($1)', [session.id || null], function (err, ret) {
      client.end()
      console.log('pg callback', err)
      if (err == null) {
        resolve(ret.rows[0].myranks)
      }
      else {
        reject(err)
      }
    })
  })
  return promise
}
 
function results (req, res) {
  var client = db.getClient()
  var promise = new Promise(function(resolve, reject) {
    var session = req.session
    console.log('results:', session.id)
    client.query('select results()', [], function (err, ret) {
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
      return db.commit(client)
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
  myranks: myranks,
  results: results,
  rankUpdate: rankUpdate
}
