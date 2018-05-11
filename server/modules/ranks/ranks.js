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
 
exports = module.exports = {
  myranks: myranks,
}
