import Vue from 'vue'

// initial state
const state = {
  items: [],
  byId: {},
  indexById: {}
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

function numFilter (x,y) {
	return x === y
}

function strFilter (x,y) {
	return y.match(x) != null
}

function checkFilter (key, val, row) {
	var result
	if (val == null) {
		result = true
	}
	else if (typeof val === 'number') {
		result = numFilter (val, row[key])
	}
	else {
		result = strFilter(val, row.attributes.title + row.attributes.shortTitle)
	}
	return result
}

// helpers
// getters
const getters = {
  storiesGetIdMap: (state) => {
    return state.byId
  },
  storiesGetItems: (state, getters) => {
    //console.log('storiesGetItemsF', JSON.stringify(state.filters), JSON.stringify(state.items.map(x=>{return{id: x.id, sid: x.submitter_id, name:x.name}})))
    //var ranks = getters.ranks
	var filters = getters.dashListFilters
    var filtered = state.items.filter( (story) => {
      var result = true
      Object.keys(filters).forEach((f) => {
          result = result && checkFilter(f, filters[f], story)
      })
      return result
    })

	if (getters.dashFilterShortlist) {
		var shortlist = getters.shortlist
		filtered = filtered.filter ( (story) => {
			return shortlist.indexOf(story.id) >= 0
		} )
	}

    //console.log('filtered', JSON.stringify(state.filters), JSON.stringify(filtered.map(x=>{return{id: x.id, sid: x.submitter_id, name:x.name}})))
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



  storiesFilterIsClear: (state) => {
    var result = true
    for (var f in state.filters) {
      if (state.filters[f] != null) {
        result = false
        break;
      }
    }
    return result
  }
}

// actions
const actions = {
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
	var copy = state.items.map( (x) => x )
	copy.sort(sortFn)
	/* and then shuffle if unlocked */
	if (!locked) { 
		for (let i=1; i <= userHash; i++) {
			copy.push.apply(copy, copy.splice(0,1))
		}
	}
	state.items = copy
	reindex()
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
	    state.byId[params.id].attributes.image = params.thumbUrl
	    state.byId[params.id].attributes.full_image = params.url
    }
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
