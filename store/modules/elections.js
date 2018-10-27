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
  electionsGetItems: (state, params) => {
    return state.items
  },
  electionsGetIdMap: (state) => {
    return state.byId
  },
  electionsGetUserData: (state, electionId) => {
    return state.userData[electionId]
  },
  isAdmin: (state) =>  (electionId) => {
  	return state.userData[electionId].groups != null ? state.userData[electionId].groups.indexOf('admin') >= 0 : false
  },
  isEditor: (state) =>  (electionId) => {
  	return state.userData[electionId].groups != null ? state.userData[electionId].groups.indexOf('editor') >= 0 : false
  }

}

// actions
const actions = {
    createElection: async function (context, params) {
        params.url = '/create_election'
        return context.dispatch('createRow', params)
    }
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
  userElectionsSetData: (state, params) => {
    state.userData = params
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
