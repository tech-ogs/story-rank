import Vue from 'vue'
// initial state
const state = {
  items: [],
  byId: {}
}

// helpers
// getters
const getters = {
  electionsGetItems: (state, params) => {
    return state.items
  },
  electionsGetIdMap: (state) => {
    return state.byId
  }
}

// actions
const actions = {
}

// mutations
const mutations = {
  electionsSetData: (state, params) => {
      //console.log('usersSetData', params instanceof Array, params.length,  params)
      state.items = params
	  var byId = {}
      params.forEach( x => {
        byId[x.id] = x
      })
	  state.byId = byId
  },
  electionsEditRow: (state, row) => {
    var idx = state.indexById[row.id]
    delete state.items[idx]
    Vue.set(state.items, idx, row)
	reindex()
  },
  electionsCreateRow: (state, row) => {
  /*
    var idx = state.items.length
    Vue.set(state.items, idx, row)
  */
	state.items.splice(0, 0, row)
	reindex()
  },
  electionsSetImage: (state, params) => {
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
