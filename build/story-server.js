require('./check-versions')()

var config = require('../config')
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = JSON.parse(config.dev.env.NODE_ENV)
}
process.title = 'story-server'

var path = require('path');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')

var routes = require(path.join(__dirname , '../server/routes.js'))
var sessions = require(path.join(__dirname , '../server/modules/sessions/sessions.js'))

var server = express();
var cookieName = 'SRSESSION';

// body
server.use(bodyParser.json());


// cookies
server.use(cookieParser());

server.use(function (req, res, next) {
  // check if client sent cookie
  var cookie = req.cookies[cookieName]
  console.log('cookie:', cookie)
  sessions.getSession(cookie)
  .then( function (retval) {
    req.session = retval
    res.cookie(cookieName, req.session.id, { maxAge: 900000, httpOnly: true });
    console.log('cookie created successfully from session', req.session);
    next(); // <-- important!
  })
  .catch( function (err) {
    console.log(err.message)
    throw(err)
  })
});

// routes

server.use('/', routes)

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
if ( process.env.NODE_ENV === 'production') {
  server.listen(port, function() {
    console.log('server listening on port ' + port);
  });
}
else {
  server.listen(port, IP, function() {
    console.log('server listening on IP:port ' + IP + ':'+ port);
  });
}


