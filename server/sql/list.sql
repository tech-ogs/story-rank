CREATE OR REPLACE FUNCTION list(params jsonb, control jsonb) returns jsonb AS $$
  if (params.schema == null || params.table == null) { 
    throw ('must supply schema and  table for list api')
  }
  /* projection is a csv of colnames */
  var projection = control.projection || '*' 
  var result = plv8.execute('select ' + projection + ' from ' + params.schema + '.' + params.table + ' order by id asc')
  return result
$$ LANGUAGE plv8;
