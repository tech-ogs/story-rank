var path = require('path');
var ranks = require (path.join ( __dirname, '../../server/modules/ranks/ranks.js'))
var sessions = require (path.join ( __dirname, '../../server/modules/sessions/sessions.js'))

var io = null

var handlersTable = {}

const setIO = (x) => {
  io = x
}

const registerHandler = (socket, eventName, handler) => {
  console.log('handler register: ', socket.id, eventName)
  if (handlersTable[socket.id] == null) {
    handlersTable[socket.id] = {}
  }
  handlersTable[socket.id][eventName] = handler
  return handler
}

const releaseHandlers = (socket) => {
  return () => {
    delete handlersTable[socket.id] 
    socket.removeAllListeners()
    console.log('handlers released: ', socket.id)
  }
}

const cookieParser = (headers) => {
  var cookies = headers.cookie.split(/;\s*/).reduce(
    (accum, curr) => {
      accum[curr.split('=')[0]] = curr.split('=')[1]
      return accum
    },
    {}
  )
  return cookies
}

const makeReq = (socket) => {

  var promise = new Promise ( (resolve, reject) => {
    var req = socket.request
    var result = {}
    var cookies = cookieParser(req.headers)
    console.log ('cookies: ', cookies)
    var cookie = cookies.SRSESSION
    console.log('cookie:', cookie)
    sessions.getSession(cookie)
    .then( (retval) => {
      result.session = retval
      resolve(result) 
    })
    .catch( (err) => {
      console.log(err.message)
      reject(err)
    })
  })
  return promise
}

const rankUpdate = (socket) => {
  return (data) => {
    socket.emit ('ack1', {timestamp: data.timestamp})
    console.log('socket event rank_update', this.id,  data);
    makeReq(socket)
    .then((ret) => {
      ranks.rankUpdate(ret, data)
    })
    .then((ret) => {
        socket.emit('ack2', {timestamp: data.timestamp, result: ret})
    })
    .catch ((err) => {
      socket.emit('err', {timestamp: data.timestamp, message: err.message})
      throw(err)
    })
  }
}


function doBroadcast(msg) {
  console.log ('broadcast handler', msg)
  var socket = getBroadcastSocket() /* to do namespace */
  if (socket != null) { 
    socket.emit ('broadcast', msg.payload)
    socket.broadcast.emit ('broadcast', msg.payload)
  }
}


const setHandlers = (socket) => {
  socket.on('handshake', function (data) {
    console.log('socket event handshake:', this.id,  data);
  });
  socket.on('rank_update', registerHandler(socket, 'rank_update', rankUpdate(socket)))
  
  socket.on('disconnect', registerHandler(socket, 'disconnect', releaseHandlers(socket)))

}

const getHandler = (evtName) => {
  var result = null
  Object.keys(handlersTable).forEach( s => {
    Object.keys (handlersTable[s]).forEach( e => {
      if (e === evtName) {
        result = handlersTable[s][e]
      }
    })
  })
  console.log('getHandler returns:', result)
  return result
}

const getBroadcastSocket = (/*TODO namespace*/) => {
  var result = null
  var socketId = Object.keys(handlersTable)[0]
  //console.log('getBroadcastSocket socketId:', socketId, Object.keys(io.sockets.sockets))
  for (var x in io.sockets.sockets) {
    //console.log ('getBroadcastSocket x:', x)
    if (x === socketId) {
      result = io.sockets.sockets[x];
      break;
    }
  }
  //console.log('getBroadcastSocket returns:', result)
  return result
}

module.exports = exports = {
  setIO : setIO,
  setHandlers : setHandlers,
  getHandler : getHandler,
  doBroadcast : doBroadcast
}
