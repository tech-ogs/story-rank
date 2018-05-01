var fs = fs || require('fs')
var users = require('./users.js')

var getFilenames = function(dir, filelist) {
  var files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
      filelist.push(file);
  });
  return filelist;
};

function getRecords() {
  var dirPath = '/home/kavi/story-rank/store/data/WTF-2018'
  var flist = getFilenames(dirPath).filter( x => x !== 'media')
  //console.log(flist)

  var result = []

  var submitter, name, date, content, cobj 

  flist.forEach(function(fname) {
    //console.log('processing file: ', fname)
    var toks = fname.split('.')
    submitter = toks[0]
    name = toks[1]
    date = new Date(toks[2])
    content = fs.readFileSync(dirPath + '/' + fname, 'UTF8')
    cobj = JSON.parse(content)
    //console.log(submitter, '    ',  name, '    ', date, '    \n', content, '\n\n')
    result.push({
      submitter,
      name,
      date,
      cobj
    })
  })
  return result
}

function getSqlBatchUsers(usersObj) { 
  var result = []
    
  var stmt, rec
  Object.keys(usersObj).forEach(function(key) {
    rec = usersObj[key]
    stmt = 'insert into application.users (login, name) values ( \'' + rec.login + '\', \'' + rec.name + '\' )'
    result.push(stmt)
  })
  return result
}


function getSqlBatchStories(records) { 
  var result = []
  var stmt;
  var submitter, attributes;
  records.forEach(function(rec) {

    //console.log('processing rec: ', rec.name, rec.submitter)
    attributes = {
      url: rec.cobj.url,
      title: rec.cobj.title,
      image: rec.cobj.image,
      excerpt: rec.cobj.excerpt
    }
    if (attributes.url == null) { 
      throw ('could not find url for story: ', rec.name) 
    }
    submitter = users[rec.submitter.toLowerCase()].login 
    if (submitter == null) { 
      throw ('could not find submitter: ' + submitter )
    }
    attributes.submitter = submitter;
    stmt = 'insert into application.stories (name, attributes) values ( \'' + rec.name + '\', \'' + JSON.stringify(attributes) + '\'::jsonb )'
    result.push(stmt)
  })
  return result
}

function getSqlBatchComments(records) { 
  var result = []
  var stmt;
  var user, story, attributes, comment
  
  records.forEach(function(rec) {
    //console.log('processing rec for comment: ', rec.name, rec.submitter)
    if (rec.cobj.comment != null) {
      user = users[rec.submitter.toLowerCase()].login
      if (user == null) { 
        throw ('could not find user: ' + user )
      }
      story = rec.name
      attributes = {user: user, story: story}
      comment = rec.cobj.comment.replace(new RegExp(/'/, 'g'), '\'\'')
      stmt = 'insert into application.comments (comment, attributes) values ( \'' + (comment || '') + '\', \'' + JSON.stringify(attributes) + '\'::jsonb )'
      result.push(stmt)
    }
  })
  return result
}

var batch = []
var storyRecords = getRecords()
batch.push.apply(batch, getSqlBatchUsers(users))
batch.push.apply(batch, getSqlBatchStories(storyRecords))
batch.push.apply(batch, getSqlBatchComments(storyRecords))
batch.push.apply(batch, ['update application.stories set submitter_id = (select id from application.users where login = stories.attributes->>\'submitter\')'])
batch.push.apply(batch, ['update application.comments set user_id = (select id from application.users where login = comments.attributes->>\'user\')'])
batch.push.apply(batch, ['update application.comments set story_id = (select id from application.stories where name = comments.attributes->>\'story\')'])
batch.push.apply(batch, ['update application.stories set attributes =  attributes #- \'{submitter}\' '])
batch.push.apply(batch, ['update application.comments set attributes =  \'{}\'::jsonb'])

var result = batch.join(';\n')
result += ';'
console.log(result)

