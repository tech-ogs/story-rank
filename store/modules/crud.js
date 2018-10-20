const state = {
}


const getters = {
}

const actions = {

    editRow: async function (context, params) {
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        var response;
        var result;
        try {
            response = await window.fetch('/edit_row', {
              method: 'post',
              credentials: 'same-origin',
              headers: headers,
              body: JSON.stringify(params || {})
            }) 
            result = await response.json()
            if (params.postAction != null) {
                context.commit(params.postAction, result)
            }
        }
        catch (err) {
            throw (new Error ('error editing row: ' + err.message) )
        }
        return result
    },

    createRow: async function (context, params) {
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        var response;
        var result
        try {
            response = await window.fetch('/create_row', {
              method: 'post',
              credentials: 'same-origin',
              headers: headers,
              body: JSON.stringify(params || {})
            }) 
            result = await response.json()
            if (params.postAction != null) {
                context.commit(params.postAction, result)
            }

        }
        catch (err) {
            throw (new Error ('error creating row: ' + err.message) )
        }
        return result
    },

	imageUpload: async function (context, params) {
		
		console.log ('imageUpload', params)
		var formData = new FormData()
		formData.append('imgfile', params.fileObj)
		formData.append('schema', params.schema)
		formData.append('table', params.table)
		formData.append('rowId', params.rowId)
		formData.append('fieldPath', params.fileObj.fieldPath)
		formData.append('thumbPath', params.fileObj.thumbPath)

		var headers = new Headers();
		var result;
		try {
			var response = await window.fetch('/media/upload', {
			  method: 'post',
			  credentials: 'same-origin',
			  headers: headers,
			  body: formData
			}) 
			var result = await response.json()
			if (result.id != null) { 
				context.commit(params.postAction, result)
			}
		}
		catch (err) {
			throw (new Error ('error uploading image: ' + err.message) )
		}
		return result
	}
}

const mutations = {
}

export default {
  state,
  getters,
  actions,
  mutations
}
