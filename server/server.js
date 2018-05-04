var express = require('express');
var path = require('path');
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var query = require(__dirname + '/common/query.js')
var sessions = require(__dirname + '/modules/sessions/sessions.js')
var server = express();
var cookieName = 'SRSESSION';
var session = null;

server.use(bodyParser.json());

/*
server.use('/static', express.static(path.join(__dirname, '../dist/static')))
server.use('/assets', express.static(path.join(__dirname, '../src/assets')))
*/

// need cookieParser middleware before we can do anything with cookies
server.use(cookieParser());

// set a cookie
server.use(function (req, res, next) {
  // check if client sent cookie
  var cookie = req.cookies[cookieName]
  console.log('cookie:', cookie)
  sessions.getSession(cookie)
  .then( function (retval) {
    session = retval
    res.cookie(cookieName, session.id, { maxAge: 900000, httpOnly: true });
    console.log('cookie created successfully from session', session);
    next(); // <-- important!
  })
  .catch( function (err) {
    console.log(err.message)
    throw(err)
  })
});

server.use('/static', function(req,res,next){
  //console.log ('static /', session)
  if (session.logged_in) {
    console.log ('express.static')
    express.static(path.join(__dirname, '../dist/static'))(req, res, next);
  }
  else {
    res.status(403).json({message:'Not logged in'});
  }
})

server.use('/assets', function(req,res,next){
  if (session.logged_in) {
    express.static(path.join(__dirname, '../dist/assets'))(req, res, next);
  }
  else {
    res.status(403).json({message:'Not logged in'});
  }
})

// static
server.get('/', function(req, res){
  //console.log ('get /', session)
  if (session.logged_in) {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  }
  else {
    res.sendFile(path.join(__dirname, '../dist/login.html'));
  } 
});

// queries

var handler = function(fn, req, res) {
  if (session.logged_in) {
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
  console.log('post:', req.body, session)
  handler (query.list, req, res)
})
    
server.get('/list', function(req, res) {
  handler (query.list, req, res)
})

var port = 80;
server.listen(port, function() {
  console.log('server listening on port ' + port);
});


