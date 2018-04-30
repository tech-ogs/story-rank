import Vue from 'vue'
// initial state
const state = {
  items: [],
  byId: {}
}

// helpers
// getters
const getters = {
  usersGetItems: (state, params) => {
    return state.items
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
      console.log('usersSetData', params instanceof Array, params.length,  params)
      state.items = params
      params.forEach( x => {
        state.byId[x.id] = x
      })
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
