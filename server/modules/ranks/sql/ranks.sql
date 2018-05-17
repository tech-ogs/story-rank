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
      while (winners.length < wanted) {
          var thisElection = electSingle(candidates, getScore, ballots);
          if (!thisElection.length) {
              //console.log("Could not elect enough?");
              break;
          }
          winners.push.apply(winners, thisElection);
          if (winners.length == wanted) {
              break;
          }
          else if (winners.length > wanted) {
              //console.log("Too many winners, removing extras");
              winners.splice(wanted, winners.length);
              break;
          }

          candidates = candidates.filter(function (candidate) {
              return thisElection.indexOf(candidate) === -1;
          });
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
  function electSingle(candidates, getScore, ballots) {


      if (!candidates.length) {
          return [];
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

      //console.log("Majorities:\n", majorities);
      //Lock in:

      function reachable(from, to) {
        plv8.execute('select xlog($1, $2)', [JSON.stringify(from), JSON.stringify(to)])
        var ret = plv8.execute('select count(path) from application.sgraph where path ~ $1', [from + '.*.' + to])
        return (ret != null && ret.length > 0)
      }

      function insert_sgraph(from, to) {
        var insertStmt = plv8.prepare('insert into application.sgraph (path) values ($1)')
        insertStmt.execute(from + '.' + to)
        var candidates = plv8.execute('select path from application.sgraph where path ~ $1', ['*.' + from])
        if (candidates != null && candidates.length > 0) { 
          candidates.forEach(function(x) { 
            insertStmt.execute([x + '.' + to])
          })
        }
      }

      majorities.forEach(function (m) {
          if (reachable(m.y, m.x)) { //if x is accessible from y, then x->y would create a circle
              return;
          }
          insert_sgraph(m.x, m.y)
      });
      //console.log("Locked Graph:\n", G);
      var sources = candidates.filter(function (candidate) {
/*
          return candidates.every(function (neighbor) { //not reachable from every candidate.
              return G[neighbor].indexOf(candidate) === -1;
          });
*/
          var ret = plv8.execute('select count(path) from application.sgraph where path ~ $1', ['*.'+candidate])
          return (ret == null || ret.length === 0)
      });
      //console.log("Graph Sources:", sources);

      return sources;
  }

/*  
    //dead reference code
    var G = {};
    candidates.forEach(function (candidate) {
        G[candidate] = [];
    });
    function reachable(from, to) {
        var nFrom = G[from];

        //Can be reached from one of my connections:
        return nFrom.some(function (neighbor) {
            return neighbor == to || reachable(neighbor, to);
        });
    }

    majorities.forEach(function (m) {
        if (reachable(m.y, m.x)) { //if x is accessible from y, then x->y would create a circle
            return;
        }
        (G[m.x] = G[m.x] || []).push(m.y);
    });
    //console.log("Locked Graph:\n", G);
    var sources = candidates.filter(function (candidate) {
        return candidates.every(function (neighbor) { //not reachable from every candidate.
            return G[neighbor].indexOf(candidate) === -1;
        });
    });
    //console.log("Graph Sources:", sources);
*/

  plv8.execute('delete from application.sgraph');

  var candidates = plv8.execute('select id from application.stories')
  .map(function(x) { return x.id })

  var ballots = plv8.execute('with y as (with x as (select user_id, story_id, rank from application.ranks order by user_id asc, rank asc) select user_id, jsonb_agg(x.story_id) as ballot from x group by user_id) select ballot from y')
  .map(function(x) {
    return x.ballot
  })

  winners = elect(candidates, function(candidate, ballot) {
      return indexOf(ballot, candidate);
  }, ballots, candidates.length);

  var stmt =  plv8.prepare('insert into application.results (story_id, rank) values ($1, $2)')
  winners.forEach(function(winner, rank) {
    stmt.execute([winner, rank])
  })
  return winners
$$ LANGUAGE plv8;
