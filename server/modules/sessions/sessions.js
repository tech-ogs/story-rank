var path = require('path')
var db = require(path.join(__dirname, '../../common/db'))
function getSession (cookie) {
  var client = db.getClient()
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
