var express = require('express');
var path = require('path');
var query = require(__dirname + '/common/query.js')
var bodyParser = require('body-parser')
var server = express();
server.use(bodyParser.json());
server.use('/static', express.static(path.join(__dirname, '../dist/static')))

// static
server.get('/', function(req, res){
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// queries

var handler = function(fn, req, res) {
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

server.post('/list', function(req, res) {
  console.log('post:', req.body)
  handler (query.list, req, res)
})
    
server.get('/list', function(req, res) {
  handler (query.list, req, res)
})

var port = 80;
server.listen(port, function() {
  console.log('server listening on port ' + port);
});


