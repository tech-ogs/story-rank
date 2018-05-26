const { Client } = require('pg')


function setup_notify_listeners(client) { 
  client.on('notification', function(msg) {
    console.log(msg);
  });
  client.query("LISTEN broadcast");
  client.query("LISTEN process_events");
});

function getClient() {
  const client = new Client({
    user: 'postgres',
    database: 'stories'
  })
  client.connect()
  return client
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

function processEvents(client) {
  var promise = new Promise(function(resolve, reject) {
    query(client, {cmd: 'select process_events()', params: []})
    .then(function(ret) {
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
      query(client, {cmd: 'commit', params: []})
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
  endClient
}
