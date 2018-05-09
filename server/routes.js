var express = require('express')
var router = express.Router()


var path = require('path');
var express = require('express');
var path = require('path');
var query = require(path.join(__dirname , 'common/query.js'))
var auth = require(path.join(__dirname , 'modules/auth/auth.js'))
var ranks = require(path.join(__dirname , 'modules/ranks/ranks.js'))
// middleware

var checkAuth = function (req, res, next) {
  if (req.session.logged_in) {
    next()
  }
  else {
    res.status(403).json({message:'Not logged in'});
  }
}

var handler = function(fn) {
  return function(req, res, next) {
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
}

// public

router.get('/', function(req, res){
  //console.log ('get /', session)
  if (req.session.logged_in) {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  }
  else {
    res.sendFile(path.join(__dirname, '../dist/login.html'));
  } 
});

router.get('/assets/logo.png', function(req, res) {
  res.sendFile(path.join(__dirname, '../src/assets/logo.png'))
})

router.post('/login', function(req, res) {
  auth.login(req, res)
  .then (function(ret) {
    res.status(200).json({message: 'login ok'})
  })
  .catch(function(err) {
    res.status(403).json({message: err.message})
  })
})

router.post('/reset', function(req, res) {
  auth.reset(req, res)
  .then (function(ret) {
    res.status(200).json(ret)
  })
  .catch(function(err) {
    res.status(500).json({message: err.message})
  })
})


// authenticated 
router.use('/static', checkAuth, function(req,res,next){
  express.static(path.join(__dirname, '../dist/static'))(req, res, next);
})

router.use('/assets', checkAuth, function(req,res,next){
  express.static(path.join(__dirname, '../src/assets'))(req, res, next);
})

router.post('/list', checkAuth, handler(query.list)) 
router.post('/logout', checkAuth, handler(auth.logout))
router.post('/myranks', checkAuth, handler(ranks.myranks))

module.exports = router

