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

// helpers
// getters
const getters = {
  usersGetItems: (state, params) => (electionId) => {
    return state.items.filter( (x) => {
		return x.election_id === electionId
	})
  },
  usersGetIdMap: (state) => {
    return state.byId
  }
}

// actions
const actions = {
}

// mutations
const mutations = {
  usersSetData: (state, params) => {
      //console.log('usersSetData', params instanceof Array, params.length,  params)
      state.items = params
	  var byId = {}
      params.forEach( x => {
        byId[x.id] = x
      })
	  state.byId = byId
  },
  usersEditRow: (state, row) => {
    var idx = state.indexById[row.id]
    delete state.items[idx]
    Vue.set(state.items, idx, row)
	reindex()
  },
  usersCreateRow: (state, row) => {
  /*
    var idx = state.items.length
    Vue.set(state.items, idx, row)
  */
	state.items.splice(0, 0, row)
	reindex()
  }

}

export default {
  state,
  getters,
  actions,
  mutations
}
