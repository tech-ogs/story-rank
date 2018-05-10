import Vue from 'vue'

// initial state
const state = {
  items: [],
  byId: {},
  filters: {
    submitter_id: null
  },
  selected: null
}

// helpers
// getters
const getters = {
  storiesGetItems: (state) => {
    return state.items
  },
  storiesGetIdMap: (state) => {
    return state.byId
  },
  storiesGetItemsF: (state, getters) => {
    //console.log('storiesGetItemsF', getters)
    var ranks = getters.ranks
    var filtered = state.items.filter( (story) => {
      var result = true
      Object.keys(state.filters).forEach((f) => {
          result = result && (state.filters[f] == null || ( story[f] === state.filters[f]) )
      })
      return result
    })
    //console.log('filtered', filtered)
    //console.log('ranks', ranks)
    var sorted = filtered.sort ( (a ,b) => {
      return ranks[a.id] - ranks[b.id]
    })

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
  storiesSelectedRow: (state) => state.selected

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
    //console.log('filters:', state.filters)
  },
  storiesSetSelected: (state, index) => {
    state.selected = index
  },
  storiesClearSelection: (state, index) => {
    state.selected = null
  },
}

export default {
  state,
  getters,
  actions,
  mutations
}
