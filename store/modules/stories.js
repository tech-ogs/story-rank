import Vue from 'vue'
import ranking from './stories_ranking.js'

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
  storiesGetItems: (state, params) => {
    return state.items
  },
  storiesGetIdMap: (state) => {
    return state.byId
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
  storiesSelectedRow: (state) => state.selected,

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
  },
  storiesSetSelected: (state, index) => {
    state.selected = index
  },
  storiesClearSelection: (state, index) => {
    state.selected = null
  },
  // ranking moves
  storiesMoveUp: ranking.moveUp,
  storiesMoveDown: ranking.moveDown,
  storiesFilterTop: ranking.moveFilterTop,
  storiesFilterBottom: ranking.moveFilterBottom,
  storiesMoveTop: ranking.moveTop,
  storiesMoveDown: ranking.moveDown
}

export default {
  state,
  getters,
  actions,
  mutations
}
