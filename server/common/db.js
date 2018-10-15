const { Client } = require('pg')
const path = require('path')
const credentials = {
	user: 'postgres',
	database: 'stories'
}

//const socketEvents = require (path.join ( __dirname, '../../server/common/socketEvents.js'))
async function getClient() {
	const client = new Client(credentials)
	await client.connect()
	return client
}


async function setup_notify_listeners(socketEvents) {
  const notificationsClient = new Client(credentials)
  await notificationsClient.connect()
  notificationsClient.query("LISTEN broadcast");
  notificationsClient.on('notification', socketEvents.doBroadcast);
}

/*
function query(client, params) {
  var promise = new Promise(function(resolve, reject) {
    client.query(params.cmd,params.params, function(err, ret) {
      if (err == null) {
	  	console.log ('commit ok')
        resolve(ret)
      }
      else {
	  	console.log ('commit failed')
        reject(err)
      }
    })
  })
  return promise
}
*/

function processEventsOld() {
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

async function processEvents() {
	console.log ('processEvents')
	try {
		do {
			var client = getClient()
			var ret = await query(client, {cmd: 'select process_events()', params: []})
			await query(client, {cmd: 'commit', params: []})
			await endClient(client)
			console.log ('process Events ret: ', ret)
		} while (ret.rows != null && ret.rows[0] != null && ret.rows[0].process_events != null) 
	}
	catch(err) {
		throw(err)
	}
	return null
}


/*  commit wrapper
    forces an event processing call after each commit
    and then also commits the results of the event processing call
*/

/*
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
*/
/*
function endClient(client) {
  client.end()
}
*/

exports = module.exports = {
  getClient,
  //query,
  //commitClient,
  //endClient,
  setup_notify_listeners
}
