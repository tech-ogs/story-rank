CREATE OR REPLACE FUNCTION edit_row(session jsonb,  params jsonb) returns jsonb AS $$
  plv8.elog(LOG, 'edit_row:', JSON.stringify(params)) 
  if (session.user_id == null) {
    throw Error ('missing user_id in session ' + session.id)
  }
  var mandatoryParams = ['schema', 'table', 'row']
  mandatoryParams.forEach(function(x) {
	if (params[x] == null) {
		throw new Error ('edit_row missing mandatory param: ' + x)
	}
  })
  
  var cmd = 'update ' + params.schema + '.' + params.table + ' set ' 
  var counter = 1
  var paramValues = []
  Object.keys(params.row).forEach(function(col) {

		if (col === 'id') {
			return /* eqvt of next in forEach */
		}

		if (col === 'attributes') { 
  	  		var attributes
			attributes = plv8.execute('select attributes from ' + params.schema + '.' + params.table + ' where id = $1', [params.row.id])[0].attributes
			Object.keys(params.row.attributes).forEach(function(x) {
				attributes[x] = params.row.attributes[x]
			})
			cmd += (counter > 1 ? ', ' : ' ') +  'attributes = $' + (counter++)
			paramValues.push (attributes)
	  	}
		else {
			cmd += (counter > 1 ? ', ' : ' ') +  col + ' = $' + (counter++)
			paramValues.push (params.row[col])
		}
  })
  cmd += ' where id = $' + (counter++)
  paramValues.push(params.row.id)
  plv8.elog(LOG, 'edit_row cmd', cmd, paramValues)
  plv8.execute(cmd, paramValues)

  /*update the flags to request a recalc*/

  plv8.execute('update application.flags set value =  $2, params = $3  where name = $1', ['request_recalc', true, { electionId : params.row.election_id } ])
  
  var ret = plv8.execute('select * from ' + params.schema + '.' + params.table + ' where id = $1', [params.row.id])[0]
  return ret

$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION set_image_paths ( params jsonb) returns jsonb AS $$

	var mandatoryParams = ['schema', 'table', 'rowId', 'fieldPath', 'thumbPath', 'imageUrl', 'thumbUrl']
	mandatoryParams.forEach(function(x) {
		if (params[x] == null) {
			throw new Error ('edit_row missing mandatory param: ' + x)
		}
	})

	var cmd = 'update ' + params.schema + '.' + params.table + ' set attributes = jsonb_set(attributes, $1, to_jsonb($2::text)) where id = $3'

	plv8.execute(cmd, [[params.thumbPath], params.thumbUrl, params.rowId])
	plv8.execute(cmd, [[params.fieldPath], params.imageUrl, params.rowId])

$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION create_row(session jsonb,  params jsonb) returns jsonb AS $$
  if (session.user_id == null) {
    throw Error ('missing user_id in session ' + session.id)
  }

  var mandatoryParams = ['schema', 'table', 'row']
  mandatoryParams.forEach(function(x) {
	if (params[x] == null) {
		throw new Error ('edit_row missing mandatory param: ' + x)
	}
  })

  var cmd = 'insert into ' + params.schema + '.' + params.table 
  var cList = '( '
  var phList = '( '
  var paramValues = []
  var counter = 1
  Object.keys(params.row).forEach(function(col) {
	if (col === 'id') {
		return /* eqvt of next in forEach */
	}
	cList += (counter > 1 ? ', ' : ' ') + col
    phList += (counter > 1 ? ', ' : ' ') + '$' + (counter++)
    paramValues.push(params.row[col])
  })
  cList += ' )'
  phList += ' )'
  cmd += cList + ' values ' + phList + ' returning *'
  plv8.elog(LOG, 'create_row cmd', cmd, paramValues)
  var ret = plv8.execute(cmd, paramValues)[0]

  /*update the flags to request a recalc*/

  plv8.execute('update application.flags set value =  $2, params = $3 where name = $1', ['request_recalc', true, {electionId : params.row.election_id}])

  return ret
$$ LANGUAGE plv8;

