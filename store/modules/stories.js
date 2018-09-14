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
    var result;
	try {
		response = await window.fetch('/edit_row', {
		  method: 'post',
		  credentials: 'same-origin',
		  headers: headers,
		  body: JSON.stringify(row || {})
		}) 
		result = await response.json()
		context.commit('dashSetDetailMode', 'view')
		context.commit('storiesEditRow', result)
		context.commit('dashSetDetailRow', result)
	}
	catch (err) {
		throw (new Error ('error editing row: ' + err.message) )
	}
    return result
}

async function createRow(context, row) {
	var headers = new Headers();
	headers.append('Content-Type', 'application/json');
	var response;
    var result
	try {
		response = await window.fetch('/create_row', {
		  method: 'post',
		  credentials: 'same-origin',
		  headers: headers,
		  body: JSON.stringify(row || {})
		}) 
		result = await response.json()
		context.commit('dashSetDetailMode', 'view')
		context.commit('storiesCreateRow', result)
		context.commit('dashSetDetailRow', result)
	}
	catch (err) {
		throw (new Error ('error creating row: ' + err.message) )
	}
    return result
}

async function uploadImage(context, id, fileObj) {
	console.log ('uploadImage', id, fileObj)
    var formData = new FormData()
    formData.append('imgfile', fileObj)
	formData.append('storyId', id)
	formData.append('name', fileObj.name)
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
		result.storyId = id
        if (id != null) { 
		    context.commit('storySetImage', result)
        }
	}
	catch (err) {
		throw (new Error ('error uploading image: ' + err.message) )
	}
    return result
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
    //var ranks = getters.ranks
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
	return filtered
	/*
    console.log('ranks', ranks)
    var ranks = getters.ranks
    var sorted = filtered.sort ( (a ,b) => {
      return ranks[a.id] - ranks[b.id]
    })

    console.log('sorted', JSON.stringify(state.filters), JSON.stringify(sorted.map(x=>{return{id: x.id, sid: x.submitter_id, name:x.name}})))
    return sorted
	*/
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
  storiesSort: (state, params) => {
  	var locked = params.locked
	var userHash = params.userHash % state.items.length
	var ranks = params.ranks
  	var apos, bpos, result

    const fnLocked = (a ,b) => {
		apos = ranks.indexOf(a.id)
		bpos = ranks.indexOf(b.id)
		if (apos >= 0 && bpos >= 0) {
			result = apos-bpos
		}
		else if (apos >= 0) {
			result = -1
		}
		else if (bpos >= 0) {
			result = 1
		}
		else {
			result = b.id - a.id
		}
		return result
    }
	const fnUnlocked = (a,b) => {
		return b.id - a.id 
	}

	var sortFn = locked ? fnLocked: fnUnlocked

	state.items.sort(sortFn)
	/* and then shuffle if unlocked */
	if (!locked) { 
		for (let i=1; i <= userHash; i++) {
			state.items.push.apply(state.items, state.items.splice(0,1))
		}
	}

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
    if (params.storyId != null) {
	    state.byId[params.storyId].attributes.image = params.thumbUrl
	    state.byId[params.storyId].attributes.full_image = params.url
    }
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
