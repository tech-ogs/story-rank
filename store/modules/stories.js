import Vue from 'vue'

// initial state
const state = {
  items: [],
  byId: {},
  filters: {
    submitter_id: null
  },
  selected: null,
  animateStar: false,
  animateCircle: false
}

// helpers
// getters
const getters = {
/*
  storiesGetItems: (state) => {
    return state.items
  },
*/
  storiesGetIdMap: (state) => {
    return state.byId
  },
  storiesGetItems: (state, getters) => {
    //console.log('storiesGetItemsF', JSON.stringify(state.filters), JSON.stringify(state.items.map(x=>{return{id: x.id, sid: x.submitter_id, name:x.name}})))
    var ranks = getters.ranks
    var filtered = state.items.filter( (story) => {
      var result = true
      Object.keys(state.filters).forEach((f) => {
          result = result && (state.filters[f] == null || ( story[f] === state.filters[f]) )
      })
      return result
    })
    console.log('filtered', JSON.stringify(state.filters), JSON.stringify(filtered.map(x=>{return{id: x.id, sid: x.submitter_id, name:x.name}})))
    console.log('ranks', ranks)
    var ranks = getters.ranks
    var sorted = state.items.sort ( (a ,b) => {
      return ranks[a.id] - ranks[b.id]
    })

    console.log('sorted', JSON.stringify(state.filters), JSON.stringify(sorted.map(x=>{return{id: x.id, sid: x.submitter_id, name:x.name}})))
    return sorted
  },

/*
  // strictly ranked list to support all moves via swaps, use this when calling mutations in moveRanks
  storiesGetItemsS: (state, getters) => {
    //console.log('storiesGetItemsS', getters)
    var ranks = getters.ranks
    var sorted = state.items.sort ( (a ,b) => {
      return ranks[a.id] - ranks[b.id]
    })

    return sorted
  },
*/

  storiesGetAllResults: (state, getters) => {
    var ranks = getters.getResults.ranks
    console.log('storiesGetAllResults:', JSON.stringify(ranks))
    var filtered = state.items.filter ( (x) => { return ranks.indexOf(x.id) >= 0 } )
    //console.log('res-filtered', JSON.stringify(state.filters), JSON.stringify(filtered.map(x=>{return{id: x.id, sid: x.submitter_id, name:x.name}})))
    var sorted = filtered.sort ( (a ,b) => {
      return  ranks.indexOf(a.id) - ranks.indexOf(b.id)
    })
    //console.log('res-sorted', JSON.stringify(state.filters), JSON.stringify(sorted.map(x=>{return{id: x.id, sid: x.submitter_id, name:x.name}})))
    return sorted
  },

/*
  storiesGetFavs: (state, getters) => {
    //console.log('storiesGetItemsF', getters)
    var ranks = getters.ranks
    var favorites = getters.favorites
    var filtered = state.items.filter( (story) => {
      return favorites[story.id] 
    })
    //console.log('filtered', filtered)
    //console.log('ranks', ranks)
    var sorted = filtered.sort ( (a ,b) => {
      return ranks[a.id] - ranks[b.id]
    })

    return sorted
  },
*/

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
  storiesSelectedRow: (state) => state.selected || {id:0},
  storiesGetAnimateStar: state => state.animateStar,
  storiesGetAnimateCircle: state => state.animateCircle
}

// actions
const actions = {
}

// mutations
const mutations = {
  storiesSetData: (state, params) => {
    //console.log('storiesSetData', params instanceof Array, params.length,  params)
    state.items = params
    var byId = {}
    params.forEach( x => {
      byId[x.id] = x
    })
    state.byId = byId
    //console.log('state.byId', JSON.stringify(state.byId))
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
  storiesAnimateStar: (state) => {
    if (!state.animateStar) {
      console.log('start star animation')
      state.animateStar = true
      setTimeout( () => {
        console.log('end star animation')
        state.animateStar = false
      }, 1500)
    }
  },
  storiesAnimateCircle: (state) => {
    if (!state.animateCircle) {
      console.log('start circle animation')
      state.animateCircle = true
      setTimeout( () => {
        console.log('end circle animation')
        state.animateCircle = false
      }, 1500)
    }
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
