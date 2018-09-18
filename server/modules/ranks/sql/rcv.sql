CREATE OR REPLACE FUNCTION rcv_round() returns jsonb AS $$

	var result = {
	}

	var tally = plv8.execute ('with x as ( select count(1) as total from ranktable where rank  = 1 ) , y as (select story_id, count(1) as tally from ranktable where rank = 1 group by story_id) select y.story_id, y.tally, x.total, y.tally::float / x.total::float as percentage from x, y order by tally desc')
/*
	var tally = plv8.execute('with t as (select count(1) as total from ranktable where rank = 1), s as (select distinct story_id from ranktable), x as ( select story_id, count(1) as tally from ranktable where ranktable.rank = 1 group by story_id) select s.story_id, coalesce(x.tally,0) as tally , t.total , case when  t.total > 0 then coalesce(x.tally,0)::float / t.total::float else 0 end as percentage from s left join x on s.story_id = x.story_id , t order by tally desc')
*/

	if (tally != null && tally.length > 0) {
	if (tally[0].percentage > 0.5) {
		result.winner = tally[0]
	}
	else {
		for (var i=tally.length-1; i>=0; i--) {
			if (tally[i].tally > 0) {
				result.loser = tally[i]
				break;
			}
		}

		if (result.loser == null) {
			throw ('rcv round tally error, cannot find loser')
		}

	}

	/* force ballot order if there was only one ballot */

	if (tally[0].percentage === 1.0 && tally[0].tally === 1) { 
		var ballot = plv8.execute('with x as (select * from ranktable order by user_id asc, rank asc) select user_id, json_agg(story_id) as ballot from x group by user_id')[0].ballot
		ballot.forEach( function (storyId, idx)  {
			tally[idx].story_id = storyId
		})
	}
	result.tally = tally;
	}
	return result
	
$$ LANGUAGE plv8;


CREATE OR REPLACE FUNCTION rcv_redistribute_votes(loser jsonb) returns jsonb AS $$
	
	/*plv8.execute ('update ranktable set rank = rank -1 where user_id in (select user_id from ranktable where story_id = $1 and rank = 1)', [loser.story_id])*/
	plv8.execute ('delete from ranktable where story_id = $1', [loser.story_id])
	plv8.execute('with y as ( with x as ( select * from ranktable order by user_id, rank ) select row_number() over (partition by user_id), * from x ) update ranktable set rank = y.row_number from y where ranktable.id = y.id');

$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION calculate_results_rcv(election_id bigint) returns jsonb AS $$

	var results = [];
	var winner = null
	plv8.execute('drop table if exists ranktable');
	plv8.execute('create temp table ranktable as select * from application.ranks where election_id = $1 and user_id in ( select user_id from application.user_elections where election_id = $1 and (attributes->>\'locked\')::boolean = true)', [election_id])
	var ctr = 1
	while (winner == null) {
		plv8.elog(NOTICE, '\n\n round: ', ctr++ , '\n---------------\n')
		plv8.find_function('dump_rankdata')()
		var ret = plv8.find_function('rcv_round')();
		if (ret == null || Object.keys(ret).length === 0) {
			break;
		}
		plv8.find_function('dump_round_results')(ret)
		if (ret.loser != null) {
			results.unshift(ret.loser.story_id)
			plv8.find_function('rcv_redistribute_votes')(ret.loser)
		}
		else {
			/* omit the 0'th record, it is the winner */
			for (var i = ret.tally.length - 1; i > 0; i-- )  {
				var x = ret.tally[i]
				if (x.tally > 0) { 
					results.unshift(x.story_id)
				}
				else {
					results.push(x.story_id)
				}
			}
			results.unshift(ret.winner.story_id)
			winner = ret.winner
		}
	}
	plv8.elog (LOG, 'going to insert results:', election_id, results)
	plv8.execute('insert into application.results (ranks, election_id) values ($1::jsonb, $2) on conflict (election_id) do update set rank_date = now(), ranks = $1::jsonb', [results, election_id])
	return results

$$ LANGUAGE plv8;


CREATE OR REPLACE FUNCTION dump_round_results(result jsonb) returns jsonb AS $$
	var table = 'tally: \n'
	var table = '\nstory   count   total     percent\n'
	result.tally.map( function (x)  {
		table += x.story_id
		table += '      '
		table += x.tally
		table += '      '
		table += x.total
		table += '      '
		table += parseFloat(Math.round(x.percentage * 100) / 100).toFixed(2);
		table += '\n'
	})
	table += '\n\n'
	table += result.loser ? 'loser: ' + result.loser.story_id : 'winner: ' + result.winner.story_id
	plv8.elog(NOTICE, table)
$$ LANGUAGE plv8;


CREATE OR REPLACE FUNCTION dump_rankdata() returns jsonb AS $$
	var ret = plv8.execute('with x as (select * from ranktable order by user_id asc, rank asc) select user_id, json_agg(story_id) as ballot from x group by user_id')
	var table = 'user   ballot\n'
	ret.map( function (x)  {
		table += x.user_id
		table += '      '
		table += JSON.stringify(x.ballot)
		table += '\n'
	})
	plv8.elog(NOTICE, table)
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION test_random_rcv() returns jsonb AS $$

	var stmt = plv8.prepare('insert into application.ranks (election_id, user_id, story_id, rank) values ($1, $2, $3, $4)')

	var election_id = plv8.execute('insert into application.elections (name, active) values ($1, $2) returning id', ['test_random_rcv', true]) [0].id

	/* begin : unused, Math.ceil generates id 1 thru 10, for reference only */
	var users = [1,2,3,4,5,6,7,8,9,10]
	var candidates = [1,2,3,4,5,6,7,8,9,10]
	/* end : unused */

	var numUsers = Math.ceil(Math.random()*10)
	var numChoices = Math.ceil(Math.random()*10)
	var testData = []
	var ballot
	var choice
	plv8.elog(NOTICE , 'numUsers, numChoices', numUsers, numChoices)
	for (var i = 1; i<= numUsers; i++) {
		ballot = []
		for (var j = 1; j <= numChoices; j++) {
			choice = Math.ceil(Math.random()*10)
			if (ballot.indexOf(choice) < 0) {
				ballot.push(choice)
			}
		}
		testData.push(ballot)
		ballot.forEach( function (x, idx)  {
			stmt.execute([election_id, i, x, idx+1])
		})
	} 
	
	var result = plv8.find_function('calculate_results_rcv')(election_id)

	return result
	
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION remove_testdata_rcv() returns jsonb AS $$
	var ids = plv8.execute('select id from application.elections where name = $1', ['test_random_rcv'])
	ids.forEach( function (election)  {
		plv8.execute('delete from application.ranks where election_id = $1', [election.id])
		plv8.execute('delete from application.stories where election_id = $1', [election.id])
		plv8.execute('delete from application.results where election_id = $1', [election.id])
		plv8.execute('delete from application.elections where id = $1', [election.id])
		plv8.execute('drop table if exists ranktable');
	})
$$ LANGUAGE plv8;

