require('./check-versions')()
var config = require('../config')
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = JSON.parse(config.dev.env.NODE_ENV)
}
process.title = 'story-server'

var path = require('path');
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')


var routes = require(path.join(__dirname , '../server/routes.js'))(io)
var sessions = require(path.join(__dirname , '../server/modules/sessions/sessions.js'))
var socketEvents = require(path.join(__dirname , '../server/common/socketEvents.js'))
var db = require(path.join(__dirname , '../server/common/db.js'))

var cookieName = 'SRSESSION';

// body
app.use(bodyParser.json());


// cookies
app.use(cookieParser());

app.use(function (req, res, next) {
  // check if client sent cookie
  var cookie = req.cookies[cookieName]
  console.log('cookie:', cookie)
  sessions.getSession(cookie)
  .then( function (retval) {
    req.session = retval
    res.cookie(cookieName, req.session.id, { expires: new Date((new Date().getTime() + 31536000000)), httpOnly: true }); // cookie expires after 1 year
    console.log('cookie created successfully from session', req.session);
    next(); // <-- important!
  })
  .catch( function (err) {
    console.log(err.message)
    throw(err)
  })
});

// routes

app.use('/', routes)

function getIP() { 
  const interfaces = require('os').networkInterfaces();
    
  const addresses = Object.keys(interfaces)
    .reduce((results, name) => results.concat(interfaces[name]), [])
    .filter((iface) => iface.family === 'IPv4' && !iface.internal)
    .map((iface) => iface.address);
    
  return addresses[0]
}

var port = process.env.NODE_ENV === 'production' ? 80 : 8080
var IP = getIP()

if (process.env.NODE_ENV === 'production') {
  server.listen(port, function() {
    console.log('server listening on  ' + IP);
  });
}
else {
  server.listen(port, IP, function() {
    console.log('server listening on  ' + IP + ':' + port);
  });
}

// websockets init

function onError(err) {
  console.log('socket error', err)
}


function onListening(evt) {
  console.log('socket listening', evt)
}
socketEvents.setIO(io);

io.on('error', onError);
io.on('listening', onListening);
io.on('connection', function (socket) {
  console.log('socket event connection')
  socket.emit('handshake', { hello: 'world' });
  socketEvents.setHandlers (socket)
});

/* just do this once. The db notification listeners are not socket specific */

db.setup_notify_listeners(socketEvents)
.then( (ret) => {
	// do nothing
})
.catch( (err) => {
	throw (err)
})

