var express = require('express');
var path = require('path');
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var query = require(__dirname + '/common/query.js')
var sessions = require(__dirname + '/modules/sessions/sessions.js')
var auth = require(__dirname + '/modules/auth/auth.js')

var server = express();
var cookieName = 'SRSESSION';
var session = null;

server.use(bodyParser.json());

/*
server.use('/static', express.static(path.join(__dirname, '../dist/static')))
server.use('/assets', express.static(path.join(__dirname, '../src/assets')))
*/

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
    console.log('cookie created successfully from session', session);
    next(); // <-- important!
  })
  .catch( function (err) {
    console.log(err.message)
    throw(err)
  })
});

// public
server.get('/assets/logo.png', function(req, res) {
  res.sendFile(path.join(__dirname, '../src/assets/logo.png'))
})

server.post('/login', function(req, res) {
  auth.login(req, res)
  .then (function(ret) {
    res.status(200).json({message: 'login ok'})
  })
  .catch(function(err) {
    res.status(403).json({message: 'login failure'})
  })
})

server.post('/reset', function(req, res) {
  auth.reset(req, res)
  .then (function(ret) {
    res.status(200).json(ret)
  })
  .catch(function(err) {
    res.status(500).json({message: 'reset failure'})
  })
})


//login
server.get('/', function(req, res){
  //console.log ('get /', session)
  if (req.session.logged_in) {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  }
  else {
    res.sendFile(path.join(__dirname, '../dist/login.html'));
  } 
});

server.use('/static', function(req,res,next){
  //console.log ('static /', session)
  if (req.session.logged_in) {
    express.static(path.join(__dirname, '../dist/static'))(req, res, next);
  }
  else {
    res.status(403).json({message:'Not logged in'});
  }
})

server.use('/assets', function(req,res,next){
  if (req.session.logged_in) {
    express.static(path.join(__dirname, '../src/assets'))(req, res, next);
  }
  else {
    res.status(403).json({message:'Not logged in'});
  }
})


// queries

var handler = function(fn, req, res) {
  if (req.session.logged_in) {
    fn(req, res)
    .then(
      function(result) {
        res.json(result)
      }
    )
    .catch(
      function(err) {
        res.status(420).json({message: err.message})
      }
    )
  }
  else {
    res.status(403).json({message:'Not logged in'});
  } 
}

server.post('/list', function(req, res) {
  console.log('post:', req.body, req.session)
  handler (query.list, req, res)
})
 
server.post('/logout', function(req, res) {
  console.log('logout:', req.body, req.session)
  handler (auth.logout, req, res)
})

/*   
server.get('/list', function(req, res) {
  handler (query.list, req, res)
})
*/

var port = 80;
server.listen(port, '192.168.1.2', function() {
  console.log('server listening on port ' + port);
});


