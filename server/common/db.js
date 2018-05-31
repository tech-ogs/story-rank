const { Client } = require('pg')
const path = require('path')
//const socketEvents = require (path.join ( __dirname, '../../server/common/socketEvents.js'))

function getClient() {
  const client = new Client({
    user: 'postgres',
    database: 'stories'
  })
  client.connect()
  return client
}


function setup_notify_listeners(socketEvents) {
  const notificationsClient = getClient() 
  notificationsClient.query("LISTEN broadcast");
  notificationsClient.on('notification', socketEvents.doBroadcast);
}

function query(client, params) {
  var promise = new Promise(function(resolve, reject) {
    client.query(params.cmd,params.params, function(err, ret) {
      if (err == null) {
        resolve(ret)
      }
      else {
        reject(err)
      }
    })
  })
  return promise
}

function processEvents() {
  console.log ('processEvents 0')
  var promise = new Promise(function(resolve, reject) {
    var client = getClient()   
    console.log ('processEvents 1')
    query(client, {cmd: 'select process_events()', params: []})
    .then(function(ret) {
      console.log ('processEvents 2', ret.rows)
      if (ret.rows != null && ret.rows[0] != null && ret.rows[0].process_events != null) {
        setTimeout(function() {
          processEvents()
        },0)
      }
      console.log ('processEvents 3')
      return query(client, {cmd: 'commit', params: []})
    })
    .then(function(ret) {
      console.log ('processEvents 4', ret)
      return endClient(client)
    })
    .then(function(ret) {
      console.log ('processEvents 5', ret)
      resolve(ret)
    })
    .catch(function(err) {
      reject(err)
    })
  })
  return promise
}

/*  commit wrapper
    forces an event processing call after each commit
    and then also commits the results of the event processing call
*/

function commitClient(client) {
  var promise = new Promise(function(resolve, reject) {
    query(client, {cmd: 'commit', params: []})
    .then(function(ret) {
      return processEvents()
    })
    .then(function(ret) {
      resolve(ret)
    })
    .catch(function(err) {
      reject (err)
    })
  })
  return promise
}

function endClient(client) {
  client.end()
}

exports = module.exports = {
  getClient,
  query,
  commitClient,
  endClient,
  setup_notify_listeners
}
