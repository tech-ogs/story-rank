-- the events infrastructure

CREATE OR REPLACE FUNCTION set_flags(in flagstr varchar) returns jsonb as $$
  function binary2bool(binary) {
    return binary === '1' ? true : false
  }

  function str2flags(str) {
    var toks = str.split('')
    return [binary2bool(toks[0]), binary2bool(toks[1]), binary2bool(toks[2])]
  }

  function setflags(flagstr) {
    var flagvalues = str2flags(flagstr)
    plv8.execute('update application.flags set value = $2 where name = $1', ['request_recalc', flagvalues[0]])
    plv8.execute('update application.flags set value = $2 where name = $1', ['inprogress_recalc', flagvalues[1]])
    plv8.execute('update application.flags set value = $2 where name = $1', ['done_recalc', flagvalues[2]])
  }
  setflags (flagstr)
$$ LANGUAGE plv8;


CREATE OR REPLACE FUNCTION process_events() returns jsonb as $$

  var result = null

  var noop = function () {}

  function broadcast(debugInfo, flagstr) {
    plv8.find_function('set_flags')(flagstr)
    var results = plv8.find_function('results')()
    var dobj = {
      debugInfo : debugInfo,
      timestamp : (new Date()).getTime(),
      results : results
    }
    plv8.execute('select pg_notify ($1, $2)', ['broadcast', JSON.stringify(dobj)]);
  }

  function recalc(flagstr) {
    plv8.find_function('set_flags')(flagstr)
    plv8.execute('select calculate_results_rcv()')
    plv8.execute('update application.flags set value = $2 where name = $1', ['inprogress_recalc', false])
    plv8.execute('update application.flags set value = $2 where name = $1', ['done_recalc', true])
    result = 1 /* request another call into process_events */
  }
    
/* 

without assuming the ability to cancel ongoing request 

request_recalc    inprogress_recalc   done_recalc   code

    false               false             false     000 
    false               false             true      001  
    false               true              false     010  
    false               true              true      011  
    true                false             false     100  
    true                false             true      101  
    true                true              false     110  
    true                true              true      111  

*/
  var flags = plv8.execute('select json_object_agg (name, value) as flags from application.flags')[0].flags;
  var flagstr = (flags.request_recalc ? 1 : 0 ) + (flags.inprogress_recalc ? 1 : 0 ) + (flags.done_recalc ? 1 : 0);

  var dispatch = { 
    000 : noop,
    001 : function() { broadcast('001', '000') },
    010 : noop,
    011 : function() { broadcast('011', '000') },
    100 : function() { recalc ('010') },
    101 : function() { recalc ('010') },
    110 : noop,
    111 : function() { recalc ('010') }
  } 

  dispatch[flagstr]()
  
  return result

$$ LANGUAGE plv8;

