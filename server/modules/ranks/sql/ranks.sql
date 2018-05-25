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

CREATE OR REPLACE FUNCTION results() returns jsonb AS $$

  var ret = plv8.execute('select ranks  from application.results order by id desc limit 1');
  if (ret == null || ret.length === 0) {
    ret = [{ ranks : [] }]
  }
  return { ranks : ret[0].ranks }
    
$$ LANGUAGE plv8;


CREATE OR REPLACE FUNCTION initindex() returns jsonb as $$
  plv8.execute('truncate table application.sgraph_index');
  plv8.execute('insert into application.sgraph_index (src, kids)  select id, array[]::integer[] from application.stories')
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION reindex() returns jsonb as $$

  var stime = new Date();

  var stmt = ''
  stmt += ' with index as ('
  stmt += ' with exploded_index as ('
  stmt += ' with raw_index as ('
  stmt += '  with  recursive kidscte (src, dst, path) as ( '
  stmt += '    select src, dst, array[dst] from application.sgraph  '
  stmt += '    union all '
  stmt += '  select s.src, s.dst,  s.dst || path from application.sgraph s, kidscte k where s.dst = k.src ) '
  stmt +=  ' select src, dst, path  from kidscte) '
  stmt +=  ' select distinct unnest(path) as p, src from  raw_index)'
  stmt +=  ' select array_agg(p) as path, src from exploded_index group by src)'
  stmt += ' update application.sgraph_index set kids = index.path from index where sgraph_index.src = index.src '

  plv8.execute(stmt)
  var reindex_time = new Date() - stime
  plv8.execute('select xlog($1, $2)', ['timex reindex:', reindex_time])
/*
  var sgraph = plv8.execute('select * from application.sgraph order by src')
  var sgraph_index = plv8.execute('select * from application.sgraph_index where array_length(kids,1) is not null order by src')
  plv8.execute('select xlog($1, $2)', ['REINDEX GRAPH', JSON.stringify(sgraph)])
  plv8.execute('select xlog($1, $2)', ['REINDEX INDEX', JSON.stringify(sgraph_index)])
*/

$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION reachable(in src bigint, in dst bigint) returns boolean AS $$

  var stime = new Date()
  //plv8.execute('select xlog($1, $2)', [JSON.stringify(src), JSON.stringify(dst)])
  var ret = plv8.execute ('select array[$2::bigint] <@ kids as check from application.sgraph_index where src = $1 limit 1', [src, dst])
  //plv8.execute('select xlog($1, $2, $3, $4)', ['ret', src, dst, JSON.stringify(ret)])
  var result = false
  if (ret.length > 0) {
    result = ret[0].check
  }
  plv8.execute('select xlog($1, $2)', ['timex reachable', (new Date() - stime )])
  return result


$$ LANGUAGE plv8;


CREATE OR REPLACE FUNCTION graph_sources() returns jsonb AS $$

  var sources = plv8.execute('select distinct src from application.sgraph where src not in (select dst from application.sgraph)');
  return sources.map(function(x) { return x.src })

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

  function calculate_majorities(candidates, ballots, getScoreFn) {
      var V = {};
      var majorities = [];

      candidates.forEach(function (xCID) {
          var Vx = V[xCID] = {};
          candidates.forEach(function (yCID) {
              if (yCID == xCID) {
                  return;
              }
              Vx[yCID] = ballots.reduce(function (count, ballot) {
                  return count + (getScoreFn(xCID, ballot) < getScoreFn(yCID, ballot) ? 1 : 0);
              },0);
              majorities.push({x: xCID, y: yCID, Vxy: Vx[yCID]});
          });
      });
    return { 
      majorities: majorities,
      V: V
    }
  }

  var reachableFn = plv8.find_function('reachable')

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

      plv8.find_function('initindex')()
      var maj_ret = calculate_majorities(candidates, ballots, getScore)
      var majorities = maj_ret.majorities
      var Vtable = V = maj_ret.V

      while (winners.length < wanted) {
          var thisElection  = electSingle(majorities, V)
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

          maj_ret = calculate_majorities(candidates, ballots, getScore)
          majorities = maj_ret.majorities
          V = maj_ret.V
      }
      var result = winners.map(function(w,idx) {
        var ret = {id: w, lead: 0}
        if (idx < winners.length - 1) {
          ret.lead = Vtable[w][winners[idx+1]] - Vtable[winners[idx+1]][w]
        }
        return ret
      })
      plv8.execute('insert into application.results (ranks) values ($1)', [result])
      return result
  }
  
  /**
   * Runs the a Ranked Pairs vote, and returns an array of winners (which is usually single, unless the graph has more than
   * one source)
   * @param candidates An array of strings, each representing a candidate
   * @param getScore function(candidate, ballot) => preference # (i.e. lower is preferred)
   * @param ballots array of <any>, each is a ballot that is passed to getScore
   * @returns [candidate] Array of candidates which are the sources of the locked-in graph.
   */

  


  //function electSingle(candidates, getScore, ballots) {
  function electSingle(majorities, V) {

      plv8.execute('truncate table application.sgraph');
      plv8.execute('update  application.sgraph_index set kids = array[]::integer[]');
      if (!candidates.length) {
          return [];
      }

      if (candidates.length === 1) {
        return candidates
      }


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


      function insert_sgraph(from, to, margin) {
        var stime = new Date()
        plv8.execute('insert into application.sgraph (src, dst, margin) values ($1, $2, $3)', [from, to, margin])
        plv8.execute('select reindex()')
        plv8.execute('select xlog($1, $2)', ['timex insert_sgraph: ', (new Date() - stime )])
        //sgraph = plv8.execute('select src, dst  from application.sgraph');
        //plv8.execute('select xlog($1, $2, $3)', ['sgraph-after:', from + '.' + to, JSON.stringify(sgraph)]) 
      }

      var flag = true
      majorities.forEach(function (m, counter) {
          if (reachableFn(parseInt(m.y), parseInt(m.x))) { //if x is accessible from y, then x->y would create a circle
              return;
          }
          if (false) {
            flag = false
          }
          if (flag) {
          plv8.execute('select xlog($1, $2, $3, $4)', ['insert_sgraph:', m.x, m.y, counter ])   
          insert_sgraph(m.x, m.y, m.Vxy)
          }
      });
      plv8.execute('select xlog($1)', ['Locked graph'])
      var sources = plv8.find_function('graph_sources')();
      plv8.execute('select xlog($1, $2)', ['Sources', JSON.stringify(sources)])

      return sources;
  }



/*
// 1: Nashville, 2: Chattanooga, 3: Knoxville, 4: Memphis
var candidates =  [1,2,3,4];
var ballots = Array.apply(null, {length: 100}).map(Number.call, Number).map(function(i) {
    i -= 42;
    if(i<0) { //mem
        //return ["Memphis","Nashville","Chattanooga", "Knoxville"];
        return [4,1,2,3]
    }
    i -= 26;
    if(i<0) { //nash
        //return ["Nashville","Chattanooga", "Knoxville", "Memphis"];
        return [1, 2, 3, 4]
    }
    i -= 15;
    if(i< 0) { //chat
        //return ["Chattanooga", "Knoxville", "Nashville", "Memphis"];
        return [2, 3, 1, 4]
    }
    //kno
    //return ["Knoxville", "Chattanooga", "Nashville", "Memphis"];
    return [3, 2, 1, 4]
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

/*

candidates = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48]
ballots =  [
  [20,43,6,41,39,1,2,3,4,5,7,8,9,10,11,12,13,14,15,16,17,18,19,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,40,42,44,45,46,47,48],
  [7,20,6,30,22,15,33,36,41,43,44,45,1,2,3,4,5,8,9,10,11,12,13,14,16,17,18,19,21,23,24,25,26,27,28,29,31,32,34,35,37,38,39,40,42,46,47,48],
  [47,43,46,48,45,44,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42],
  [1,7,9,20,44,30,45,43,2,3,4,5,6,8,10,11,12,13,14,15,16,17,18,19,21,22,23,24,25,26,27,28,29,31,32,33,34,35,36,37,38,39,40,41,42,46,47,48]
]

*/


//  var candidates = plv8.execute('select id from application.stories where id in ( select story_id from application.ranks where favorite = true)')
//  .map(function(x) { return x.id })

  var candidates = plv8.execute('with x as (select story_id, count(story_id) from application.ranks where favorite = true group by story_id order by count desc limit 15) select story_id from x')
  .map(function(x) { return x.story_id })

  var ballots = plv8.execute('with y as (with x as (select user_id, story_id, rank from application.ranks where story_id=any($1) and favorite=true  order by user_id asc, rank asc) select user_id, jsonb_agg(x.story_id) as ballot from x group by user_id) select ballot from y', [candidates])
  .map(function(x) {
    return x.ballot
  })

  plv8.execute('select xlog($1, $2, $3)', [candidates.length, JSON.stringify(candidates), JSON.stringify(ballots)])

  var maxBallotLength = 0;
  ballots.forEach(function(x) {
    if (maxBallotLength < x.length) {
      maxBallotLength = x.length
    }
  })

  winners = elect(candidates, function(candidate, ballot) {
      return indexOf(ballot, candidate) >= 0 ? indexOf(ballot, candidate) : maxBallotLength;
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
