const { Client } = require('pg')
//const Promise = require('promise')

function getClient() {
  const client = new Client({
    user: 'postgres',
    database: 'stories'
  })
  client.connect()
  return client
}

function list (req, res) {
  var client = getClient()
  var promise = new Promise(function(resolve, reject) {
    console.log('list:', req.body)
    var params = req.body || { schema: 'application', table : 'stories' }
    client.query('select list($1, $2)', [params , {}], function (err, ret) {
      client.end()
      console.log('pg callback', err, ret)
      if (err == null) {
        resolve(ret.rows[0].list)
      }
      else {
        reject(err)
      }
    })
  })
  return promise
}
 
exports = module.exports = {
  list: list
}
