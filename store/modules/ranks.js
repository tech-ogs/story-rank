import Vue from 'vue'
import moveRanks from './moveRanks.js'
// initial state
const state = {
  ranks: {},
  byRank: {},
  favorites: {},
  favoritesByRank: {}
}

// helpers
// getters
const getters = {
  ranks: (state) => {
    return state.ranks
  },
  favorites: (state) => {
    return state.favorites
  }
}

// actions
const actions = {
}

// mutations
const mutations = {
  ranksSetData: (state, params) => {
      //console.log('ranksSetData', params)
      state.ranks = params.ranks
      state.favorites = params.favorites
  },

  ranksInitData: (state, stories) => {
    //console.log('ranksInitData', stories)
    var ranks = {}
    var byRank = {}
    var favoritesByRank = {}

    if (Object.keys(state.ranks).length === 0) {
      stories.sort( (a,b) => { return a.id - b.id } )
      .forEach( (s,idx) => {
        ranks[s.id] = idx+1
      })
    }
    else {
      stories.sort( (a,b) => { return a.id - b.id } )
      .forEach( (s,idx) => {
        if (state.ranks[s.id] == null) {
          ranks[s.id] = idx+1
        }
      })
    }
    Object.keys(ranks).forEach( storyId => {
      byRank[ranks[storyId]] = storyId
    })
    Object.keys(state.favorites).forEach( storyId => {
      favoritesByRank[state.favorites[storyId]] = storyId
    })

    //console.log('ranksInitData ranks', JSON.stringify(ranks, null,2))
    //console.log('ranksInitData byRank', JSON.stringify(byRank, null,2))
    
    state.ranks = ranks
    state.byRank = byRank
    state.favoritesByRank = favoritesByRank
  },
  // ranking moves
  ranksMoveUp: moveRanks.moveUp,
  ranksMoveDown: moveRanks.moveDown,
  ranksMoveTop: moveRanks.moveTop,
  ranksMoveBottom: moveRanks.moveBottom

}

export default {
  state,
  getters,
  actions,
  mutations
}
