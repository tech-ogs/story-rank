var path = require('path')
var db = require(path.join(__dirname, '../../common/db'))
function shell (req, res) {
  var client = db.getClient()
  var promise = new Promise(function(resolve, reject) {
    var session = req.session
    console.log('shell:', session.id)
    client.query('select shell($1)', [session.id || null], function (err, ret) {
      client.end()
      console.log('pg callback', err)
      if (err == null) {
        resolve(ret.rows[0].shell)
      }
      else {
        reject(err)
      }
    })
  })
  return promise
}
 
function login (req, res) {
  var client = db.getClient()
  var params = req.body
  params.session = req.session
  var promise = new Promise(function(resolve, reject) {
    console.log('login:', params)
    client.query('select login($1)', [params || {}], function (err, ret1) {
      console.log('pg callback', err)
      if (err == null) {
        client.query('commit',[], function(err, ret2) {
          if (err == null) {
            client.end()
            resolve(ret1.rows[0].login)
          }
          else {
            client.end()
            reject(err)
          }
        })
      }
      else {
        client.end()
        reject(err)
      }
    })
  })
  return promise
}
 
function logout (req, res) {
  var client = db.getClient()
  var params = req.body
  params.session = req.session
  var promise = new Promise(function(resolve, reject) {
    console.log('logout:', params)
    client.query('select logout($1)', [params || {}], function (err, ret1) {
      console.log('pg callback', err)
      if (err == null) {
        client.query('commit',[], function(err, ret2) {
          if (err == null) {
            client.end()
            resolve(ret1.rows[0].logout)
          }
          else {
            client.end()
            reject(err)
          }
        })
      }
      else {
        client.end()
        reject(err)
      }
    })
  })
  return promise
}

function reset (req, res) {
  var client = db.getClient()
  var params = req.body
  params.session = req.session
  var promise = new Promise(function(resolve, reject) {
    console.log('login:', params)
    client.query('select reset($1)', [params || {}], function (err, ret1) {
      console.log('pg callback', err)
      if (err == null) {
        client.query('commit',[], function(err, ret2) {
          if (err == null) {
            client.end()
            resolve(ret1.rows[0].reset)
          }
          else {
            client.end()
            reject(err)
          }
        })
      }
      else {
        client.end()
        reject(err)
      }
    })
  })
  return promise
}

exports = module.exports = {
  shell: shell,
  login: login,
  logout: logout,
  reset: reset
}
