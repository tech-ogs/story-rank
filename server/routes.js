var express = require('express')
var router = express.Router()
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })


var path = require('path');
var express = require('express');
var path = require('path');
var query = require(path.join(__dirname , 'common/query.js'))
var auth = require(path.join(__dirname , 'modules/auth/auth.js'))
var ranks = require(path.join(__dirname , 'modules/ranks/ranks.js'))
var stories = require(path.join(__dirname , 'modules/stories/stories.js'))
var media = require(path.join(__dirname, 'modules/media/media.js'))

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
    fn(req, res, next)
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

var getHandler = function(fn) {
  return function (req, res, next) {
    req.body = req.query
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
  res.sendFile(path.join(__dirname, '../dist/static/logo.png'))
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
  express.static(path.join(__dirname, '../dist/static'))(req, res, next);
})

router.post('/shell', checkAuth, handler(auth.shell)) 
router.post('/list', checkAuth, handler(query.list)) 
router.post('/logout', checkAuth, handler(auth.logout))
router.post('/myranks', checkAuth, handler(ranks.myranks))
router.post('/results', checkAuth, handler(ranks.results))
router.post('/myfavorites', checkAuth, handler(ranks.myfavorites))
router.post('/stories', checkAuth, handler(stories.list))
router.post('/edit_row', checkAuth, handler(stories.editRow))
router.post('/media/upload', checkAuth, upload.single('imgfile'), handler(media.upload))
router.post('/create_row', checkAuth, handler(stories.createRow))

/* to get debug data for client work only, comment in production */
router.get('/list',  getHandler(query.list)) 
router.get('/logout',  getHandler(auth.logout))
router.get('/myranks',  getHandler(ranks.myranks))
router.get('/results',  getHandler(ranks.results))
router.get('/myfavorites',  getHandler(ranks.myfavorites))

module.exports = function (io) {
    //Socket.IO
    io.on('connection', function (socket) {
        console.log('User has connected to Index');
        //ON Events
        socket.on('admin', function () {
            console.log('Successful Socket Test');
        });

        //End ON Events
    });
    return router;
};

//module.exports = router

