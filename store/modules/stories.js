import Vue from 'vue'
// initial state
const state = {
  items: [],
  byId: {},
  filters: {
    submitter_id: null
  }
}

// helpers
// getters
const getters = {
  storiesGetItems: (state, params) => {
    return state.items
  },
  storiesGetItemsF: (state, params) => {
    console.log('i am here')
    return state.items.filter( (story) => {
      var result = true
      Object.keys(state.filters).forEach((f) => {
          result = result && (state.filters[f] == null || ( story[f] === state.filters[f]) )
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
    console.log('filters:', state.filters)
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
