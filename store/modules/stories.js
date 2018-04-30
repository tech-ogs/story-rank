import Vue from 'vue'
// initial state
const state = {
  items: [],
  byId: {}
}

// helpers
// getters
const getters = {
  storiesGetItems: (state, params) => {
    return state.items
  }
}

// actions
const actions = {
}

// mutations
const mutations = {
  storiesSetData: (state, params) => {
      console.log('storiesSetData', params instanceof Array, params.length,  params)
      state.items = params
      params.forEach( x => {
        state.byId[x.id] = x
      })
  },

}

export default {
  state,
  getters,
  actions,
  mutations
}
