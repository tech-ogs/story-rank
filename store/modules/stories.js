import Vue from 'vue'

// initial state
const state = {
  items: [],
  byId: {},
  indexById: {}
}

async function editRow(context, row) {
	var headers = new Headers();
	headers.append('Content-Type', 'application/json');
	var response;
	try {
		response = await window.fetch('/edit_row', {
		  method: 'post',
		  credentials: 'same-origin',
		  headers: headers,
		  body: JSON.stringify(row || {})
		}) 
		var jsonData = await response.json()
		context.commit('dashSetDetailMode', 'view')
		context.commit('storiesEditRow', jsonData)
		context.commit('dashSetDetailRow', jsonData)
	}
	catch (err) {
		throw (new Error ('error editing row: ' + err.message) )
	}

}

async function createRow(context, row) {
	var headers = new Headers();
	headers.append('Content-Type', 'application/json');
	var response;
	try {
		response = await window.fetch('/create_row', {
		  method: 'post',
		  credentials: 'same-origin',
		  headers: headers,
		  body: JSON.stringify(row || {})
		}) 
		var jsonData = await response.json()
		context.commit('dashSetDetailMode', 'view')
		context.commit('storiesCreateRow', jsonData)
		context.commit('dashSetDetailRow', jsonData)
	}
	catch (err) {
		throw (new Error ('error creating row: ' + err.message) )
	}

}

async function uploadImage(context, id, fileObj) {
	console.log ('uploadImage', id, fileObj)
    var formData = new FormData()
    formData.append('imgfile', fileObj)
	formData.append('storyId', id)
	var headers = new Headers();
	//headers.append('Content-Type', undefined);
	var response;
	try {
		response = await window.fetch('/media/upload', {
		  method: 'post',
		  credentials: 'same-origin',
		  headers: headers,
		  body: formData
		}) 
		var jsonData = await response.json()
		jsonData.storyId = id
		context.commit('storySetImage', jsonData)
	}
	catch (err) {
		throw (new Error ('error uploading image: ' + err.message) )
	}

}
function reindex () { 
    var byId = {}
    var indexById = {}
    state.items.forEach( (x, idx) => {
      byId[x.id] = x
      indexById[x.id] = idx
    })
    state.byId = byId
    state.indexById = indexById
}


// helpers
// getters
const getters = {
/*
  storiesGetItems: (state) => {
    return state.items
  },
*/
  storiesGetIdMap: (state) => {
    return state.byId
  },
  storiesGetItems: (state, getters) => {
    //console.log('storiesGetItemsF', JSON.stringify(state.filters), JSON.stringify(state.items.map(x=>{return{id: x.id, sid: x.submitter_id, name:x.name}})))
    var ranks = getters.ranks
	/*
    var filtered = state.items.filter( (story) => {
      var result = true
      Object.keys(state.filters).forEach((f) => {
          result = result && (state.filters[f] == null || ( story[f] === state.filters[f]) )
      })
      return result
    })
	*/
	var filtered = state.items;

	if (getters.dashFilterShortlist) {
		var shortlist = getters.shortlist
		filtered = filtered.filter ( (story) => {
			return shortlist.indexOf(story.id) >= 0
		} )
	}

    console.log('filtered', JSON.stringify(state.filters), JSON.stringify(filtered.map(x=>{return{id: x.id, sid: x.submitter_id, name:x.name}})))
    console.log('ranks', ranks)
    var ranks = getters.ranks
    var sorted = filtered.sort ( (a ,b) => {
      return ranks[a.id] - ranks[b.id]
    })

    console.log('sorted', JSON.stringify(state.filters), JSON.stringify(sorted.map(x=>{return{id: x.id, sid: x.submitter_id, name:x.name}})))
    return sorted
  },


  stories: (state, getters) => {
    var ranks = getters.getResults.ranks
    var filtered = state.items.filter ( (x) => { return ranks.indexOf(x.id) >= 0 } )
    //console.log('res-filtered', JSON.stringify(state.filters), JSON.stringify(filtered.map(x=>{return{id: x.id, sid: x.submitter_id, name:x.name}})))
    var sorted = filtered.sort ( (a ,b) => {
      return  ranks.indexOf(a.id) - ranks.indexOf(b.id)
    })
    //console.log('res-sorted', JSON.stringify(state.filters), JSON.stringify(sorted.map(x=>{return{id: x.id, sid: x.submitter_id, name:x.name}})))
    return sorted
  },


  storiesFilterIsClear: (state) => {
    var result = true
    for (var f in state.filters) {
      if (state.filters[f] != null) {
        result = false
        break;
      }
    }
    return result
  },
  storiesGetAnimateStar: state => state.animateStar,
  storiesGetAnimateCircle: state => state.animateCircle
}

// actions
const actions = {
	storiesEditRow(context, row) {
		return editRow(context, row)
	},
	storiesCreateRow(context, row) {
		return createRow(context, row)
	},
    storyImageUpload (context, params) {
        return uploadImage(context, params.id, params.fileObj)
    }

}

// mutations
const mutations = {
  storiesSetData: (state, params) => {
    //console.log('storiesSetData', params instanceof Array, params.length,  params)
    state.items = params
	reindex()
    //console.log('state.byId', JSON.stringify(state.byId))
  },
  storiesSetFilter: (state, params) => {
    Object.assign(state.filters, params)
    //console.log('filters:', state.filters)
  },
  storiesEditRow: (state, row) => {
    var idx = state.indexById[row.id]
    delete state.items[idx]
    Vue.set(state.items, idx, row)
	reindex()
  },
  storiesCreateRow: (state, row) => {
  /*
    var idx = state.items.length
    Vue.set(state.items, idx, row)
  */
	state.items.splice(0, 0, row)
	reindex()
  },
  storySetImage: (state, params) => {
	state.byId[params.storyId].attributes.image = params.thumbUrl
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
