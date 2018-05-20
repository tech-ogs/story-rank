CREATE OR REPLACE FUNCTION myranks(cookie bigint) returns jsonb AS $$
  var ranks = plv8.execute('select jsonb_object_agg(story_id, rank) as ranks from application.ranks where user_id = (select user_id from application.sessions where id = $1)', [cookie])[0].ranks || {}
  var favorites = plv8.execute('select jsonb_object_agg(story_id, true) as favorites from application.ranks where favorite = true and user_id = (select user_id from application.sessions where id = $1)', [cookie])[0].favorites || {}

  return {
    ranks : ranks,
    favorites: favorites
  }
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION rank_update(session jsonb,  params jsonb) returns jsonb AS $$
  if (session.user_id == null) {
    throw Error ('missing user_id in session ' + session.id)
  }
  plv8.execute('delete from application.ranks where user_id = $1', [session.user_id])

  var insertStmt = plv8.prepare('insert into application.ranks (user_id, story_id, rank, favorite) values ($1, $2, $3, $4)')
  Object.keys(params.ranks).forEach(function(r) {

    plv8.elog(LOG, [ session.user_id, params.ranks[r], r, params.favorites[params.ranks[r]] || false])

    insertStmt.execute([ session.user_id, r, params.ranks[r], params.favorites[r] || false])
  })
  insertStmt.free()
$$ LANGUAGE plv8;


/* results related */

CREATE OR REPLACE FUNCTION all_results() returns jsonb AS $$

  var ret = plv8.execute('select * from application.results order by rank asc');
  if (ret == null) {
    ret = []
  }
  return ret;
    
$$ LANGUAGE plv8;

-- TODO : move to helpers if ltree becomes a fact of life ...

CREATE OR REPLACE FUNCTION subpath(in path1 ltree, in path2 ltree) returns boolean AS $$

  if (path1 === path2) {
    return false
  }

  var stmt = 'select \'' + path1 + '\'::ltree ~ (\'*.\' || \'' + path2 + '\'::text || \'.*\')::lquery or \'' + path1 + '\'::ltree ~ (\'*.\' || \'' + path2 + '\'::text)::lquery or \'' + path1 + '\'::ltree ~ (\'' + path2 + '\'::text || \'.*\')::lquery as subtest'
  //plv8.execute('select xlog($1, $2)', 'stmt:', stmt)
  return plv8.execute(stmt)[0].subtest

$$ LANGUAGE PLV8;

CREATE OR REPLACE FUNCTION inpaths(in src text, in dst text) returns jsonb AS $$

  var inpaths = plv8.execute('with x as (select * from application.sgraph where path ~ $1 and not (path ~ $2 or path ~ $3)), y as (select * from application.sgraph where  path ~ $1 and not (path ~ $2 or path ~ $3)), z as (select y.path from x,y where subpath (x.path, y.path)) select distinct(x.path) from x,y  where x.path not in (select path from z) and y.path not in (select path from z)', ['*.' + src, '*.'+ dst +'.*', '*.' + src + '.*{1,}']);

  return inpaths

$$ LANGUAGE PLV8;


CREATE OR REPLACE FUNCTION outpaths(in src text, in dst text) returns jsonb AS $$

  var outpaths = plv8.execute('with x as (select * from application.sgraph where path ~ $1 and not (path ~ $2 or path ~ $3)), y as (select * from application.sgraph where path ~ $1 and not (path ~ $2 or path ~ $3)), z as (select y.path from x,y where subpath (x.path, y.path)) select distinct(x.path) from x,y  where x.path not in (select path from z) and y.path not in (select path from z)', [dst + '.*', '*.' + src + '.*', '*{1,}.' + dst + '.*']);

  return outpaths

$$ LANGUAGE PLV8;

CREATE OR REPLACE FUNCTION calculate_results() returns jsonb AS $$
  function indexOf(arr, val) {
    var ret = -1
    for (var i=0; i<arr.length; i++) {
      if (arr[i] === val) {
        ret = i
        break
      }
    }
    return ret
  }
  /**
   * Runs electSingle until at least *wanted* winners are elected, returns the first *wanted* winners.
   * @param candidates see electSingle
   * @param getScore see electSingle
   * @param ballots see electSingle
   * @param wanted the number of wanted winners
   * @returns [candidate] Array of candidates of size *wanted* (given that there are enough candidates)
   */
  function elect(candidates, getScore, ballots, wanted) {
      if(typeof wanted !== "number") {
          wanted = 1;
      }
      var winners = [];
      plv8.execute('select xlog($1)', ['election starting'])
      while (winners.length < wanted) {
          var thisElection = electSingle(candidates, getScore, ballots);
          plv8.execute('select xlog($1, $2)', ['election', JSON.stringify(thisElection)])
          if (!thisElection.length) {
              plv8.execute('select xlog($1)', ['Could not elect enough?'])
              break;
          }
          winners.push.apply(winners, thisElection);
          if (winners.length == wanted) {
              break;
          }
          else if (winners.length > wanted) {
              plv8.execute('select xlog($1)', ['Too many winners, removing extras'])
              winners.splice(wanted, winners.length);
              break;
          }

          candidates = candidates.filter(function (candidate) {
              return thisElection.indexOf(candidate) === -1;
          });
          plv8.execute('select xlog($1, $2)', ['next candidate list', JSON.stringify(candidates)])
      }
      return winners;
  }
  
  /**
   * Runs the a Ranked Pairs vote, and returns an array of winners (which is usually single, unless the graph has more than
   * one source)
   * @param candidates An array of strings, each representing a candidate
   * @param getScore function(candidate, ballot) => preference # (i.e. lower is preferred)
   * @param ballots array of <any>, each is a ballot that is passed to getScore
   * @returns [candidate] Array of candidates which are the sources of the locked-in graph.
   */

  var inpathsFn = plv8.find_function('inpaths')
  var outpathsFn = plv8.find_function('outpaths')

  function electSingle(candidates, getScore, ballots) {

      plv8.execute('truncate table application.sgraph');

      if (!candidates.length) {
          return [];
      }

      if (candidates.length === 1) {
        return candidates
      }

      //console.log(ballots.length + " Ballots:")
      //console.log(candidates.join("\t"));
      ballots.forEach(function (ballot) {
          var scores = candidates.map(function (cid) {
              return getScore(cid, ballot);
          });
          //console.log(scores.join("\t"));
      });
      var V = {};
      var majorities = [];

      candidates.forEach(function (xCID) {
          var Vx = V[xCID] = {};
          candidates.forEach(function (yCID) {
              if (yCID == xCID) {
                  return;
              }
              Vx[yCID] = ballots.reduce(function (count, ballot) {
                  return count + (getScore(xCID, ballot) < getScore(yCID, ballot) ? 1 : 0);
              },0);
              majorities.push({x: xCID, y: yCID, Vxy: Vx[yCID]});
          });
      });

      majorities.sort(function (m1, m2) {
          var x = m1.x, y = m1.y, z = m2.x, w = m2.y;

          var diff = m1.Vxy - m2.Vxy //Vxy - Vzw
          if (diff > 0) { //Vxy > Vzw
              return 1;
          }
          if (diff == 0) {
              return V[w][z] - V[y][x]; // Vwz > Vyx Smaller minority opposition (now wz and yz)
          }
          return -1;
      }).reverse();

      plv8.execute('select xlog($1, $2)', ['Majorities', JSON.stringify(majorities)]);

      //Lock in:

      function reachable(from, to) {
        var stime = new Date()
        //plv8.execute('select xlog($1, $2)', [JSON.stringify(from), JSON.stringify(to)])
        var ret = plv8.execute('select count(path) from application.sgraph where path ~ $1', ['*.' + from + '.*.' + to + '.*'])
        //plv8.execute('select xlog($1)', [JSON.stringify(ret)])
        plv8.execute('select xlog($1, $2)', ['timex reachable', (new Date() - stime )])
        
        return (ret[0].count > 0)
      }

      function insert_sgraph(from, to) {
        var sgraph = plv8.execute('select path from application.sgraph');
        plv8.execute('select xlog($1, $2, $3)', ['sgraph-before:', from + '.' + to, JSON.stringify(sgraph)]) 
        var stime = new Date()
        var insertStmt = plv8.prepare('insert into application.sgraph (path, parr) values ($1::ltree, regexp_split_to_array($1::text, \'\\.\'))')

      // find maximal distinct inpaths to the proposed "from"

        var inpaths = inpathsFn(from, to)
        plv8.execute('select xlog($1, $2)', ['timex 1: ', (new Date() - stime )])
      // find maximal distinct outpaths from the proposed "to"

        var outpaths = outpathsFn(from, to)


        plv8.execute('select xlog($1, $2)', ['timex 2: ', (new Date() - stime )])
      // add all combinations of <in><from><to><out> paths to the sgraph

        if (inpaths.length === 0) {
          inpaths.push({path: ''})
        }

        if (outpaths.length === 0) {
          outpaths.push({path: ''})
        }

        var val = '';
        inpaths.forEach( function(inpath) {
          outpaths.forEach( function(outpath) {
            if (inpath.path !== '') { 
              val = inpath.path
            }
            else {
              val = from
            }
            if (outpath.path !== '') {
              val += '.' + outpath.path
            }
            else {
              val += '.' + to
            }

            plv8.execute('select xlog($1)', [val])
            insertStmt.execute([val])
          })
        })
        
        plv8.execute('select xlog($1, $2)', ['timex 3: ', (new Date() - stime )])


        // thin the graph by removing subpaths as well as alternate paths 
        // given any two paths, if one of them has a subset of vertexes of the other, remove it
  
        var delrecs = plv8.execute('delete from application.sgraph where path in ( select distinct(x.path) from application.sgraph as x , application.sgraph as y where x.path != y.path and x.parr <@ y.parr )');
        var insert_time = new Date() - stime

        if (insert_time > 150) {
          plv8.execute('select xlog($1)', ['clustering'])
          plv8.execute('cluster application.sgraph using path_gist_idx')
        }
        plv8.execute('select xlog($1, $2, $3)', ['timex insert_sgraph', JSON.stringify(delrecs), (new Date() - stime )])

        sgraph = plv8.execute('select path from application.sgraph');
        plv8.execute('select xlog($1, $2, $3)', ['sgraph-after:', from + '.' + to, JSON.stringify(sgraph)]) 

      }

      var sgcount = 0
      majorities.forEach(function (m) {
        sgcount = plv8.execute('select count(path) as sgcount from application.sgraph')[0].sgcount;
        plv8.execute('select xlog($1,$2)', 'sgcount:', sgcount)
        //if (sgcount < 5000) {
          if (reachable(m.y, m.x)) { //if x is accessible from y, then x->y would create a circle
              return;
          }
          insert_sgraph(m.x, m.y)
        //}
      });
      plv8.execute('select xlog($1)', ['Locked graph'])
      var sources = candidates.filter(function (candidate) {
/*
          return candidates.every(function (neighbor) { //not reachable from every candidate.
              return G[neighbor].indexOf(candidate) === -1;
          });
*/
          var ret1 = plv8.execute('select count(path) from application.sgraph where path ~ $1', [candidate+'.*'])
          var ret2 = plv8.execute('select count(path) from application.sgraph where  path ~ $1', ['*{1,}.' + candidate + '.*'])
          //plv8.execute('select xlog($1, $2, $3, $4)', ['Source candidate', candidate, ret1[0].count, ret2[0].count])
          return (ret1[0].count > 0 && ret2[0].count === 0)
      });
      plv8.execute('select xlog($1, $2)', ['Sources', JSON.stringify(sources)])

      return sources;
  }

  var candidates = plv8.execute('select id from application.stories')
  .map(function(x) { return x.id })

  var ballots = plv8.execute('with y as (with x as (select user_id, story_id, rank from application.ranks order by user_id asc, rank asc) select user_id, jsonb_agg(x.story_id) as ballot from x group by user_id) select ballot from y')
  .map(function(x) {
    return x.ballot
  })

/*
var candidates =  ["Memphis","Nashville","Chattanooga", "Knoxville"];
var ballots = Array.apply(null, {length: 100}).map(Number.call, Number).map(function(i) {
    i -= 42;
    if(i<0) { //mem
        return ["Memphis","Nashville","Chattanooga", "Knoxville"];
    }
    i -= 26;
    if(i<0) { //nash
        return ["Nashville","Chattanooga", "Knoxville", "Memphis"];
    }
    i -= 15;
    if(i< 0) { //chat
        return ["Chattanooga", "Knoxville", "Nashville", "Memphis"];
    }
    //kno
    return ["Knoxville", "Chattanooga", "Nashville", "Memphis"];
})
*/

/*
  var candidates = [1,2,3,4,5]
  var ballots = [
    [1,2,3,4,5],
    [1,3,2,4,5],
    [1,2,3,4,5]
  ]
*/

/*
  var candidates = [1,2,3,4,5,6,7,8]
  var ballots = [
    [2,3,1,7,4,5,6,8],
    [1,3,2,7,4,5,6,8]
  ]
*/

  plv8.execute('select xlog($1, $2, $3)', [candidates.length, JSON.stringify(candidates), JSON.stringify(ballots)])

  winners = elect(candidates, function(candidate, ballot) {
      return indexOf(ballot, candidate);
  }, ballots, candidates.length);

/*
  var stmt =  plv8.prepare('insert into application.results (story_id, rank) values ($1, $2)')
  plv8.execute('select xlog($1, $2)', ['winners', JSON.stringify(winners)])
*/

/*
  winners.forEach(function(winner, rank) {
    stmt.execute([winner, rank])
  })
*/
  return winners
$$ LANGUAGE plv8;
