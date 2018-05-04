const { Client } = require('pg')

function getClient() {
  const client = new Client({
    user: 'postgres',
    database: 'stories'
  })
  client.connect()
  return client
}

function getSession (cookie) {
  var client = getClient()
  var promise = new Promise(function(resolve, reject) {
    console.log('getSession:', cookie)
    client.query('select get_session($1)', [cookie || null], function (err, ret) {
      client.end()
      console.log('pg callback', err)
      if (err == null) {
        resolve(ret.rows[0].get_session)
      }
      else {
        reject(err)
      }
    })
  })
  return promise
}
 
exports = module.exports = {
  getSession: getSession
}
