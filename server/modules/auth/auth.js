const { Client } = require('pg')

function getClient() {
  const client = new Client({
    user: 'postgres',
    database: 'stories'
  })
  client.connect()
  return client
}

function login (req, res) {
  var client = getClient()
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
  var client = getClient()
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
  var client = getClient()
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
  login: login,
  logout: logout,
  reset: reset
}
