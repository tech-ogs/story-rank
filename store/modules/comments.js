import Vue from 'vue'
// initial state
const state = {
  items: [],
  byId: {}
}

// helpers
// getters
const getters = {
  commentsGetItems: (state, params) => {
    return state.items
  }
}

// actions
const actions = {
}

// mutations
const mutations = {
  commentsSetData: (state, params) => {
      console.log('commentsSetData', params instanceof Array, params.length,  params)
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
