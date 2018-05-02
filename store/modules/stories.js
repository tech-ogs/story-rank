import Vue from 'vue'
// initial state
const state = {
  items: [],
  byId: {},
  filters: {}
}

// helpers
// getters
const getters = {
  storiesGetItems: (state, params) => {
    return state.items
  },
  storiesGetItemsF: (state, params) => {
    return state.items.filter( (story) => {
      var result = true
      Object.keys(filters).forEach((f) => {
          result = result && story[f] === filters[f]
      })
      return result
    })
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
    params.forEach( x => {
      state.byId[x.id] = x
    })
  },
  storiesSetFilter: (state, params) => {
    Object.assign(state.filters, params)
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
