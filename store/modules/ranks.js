import Vue from 'vue'
import moveRanks from './moveRanks.js'
// initial state
const state = {
  ranks: {},
  byRank: {},
  favorites: {},
  favoritesByRank: {},
  results: []
}

// helpers
// getters
const getters = {
  ranks: (state) => {

    //console.log( 'ranks getter', console.log( Object.keys(state.ranks || {}).sort((a,b)=>state.ranks[a]-state.ranks[b]))  )
    return state.ranks
  },
  favorites: (state) => {
    return state.favorites
  },
  numFavorites: (state) => { 
    var result = 0
    if (state.favorites != null) { 
      result = Object.keys(state.favorites)
      .filter( x => { return state.favorites[x] } )
      .length
    }
    return result
  },
  getResults: (state) => {
    var ret = {ranks: [], leads: []}  
    if (state.results.length > 0) { 
      state.results.reduce( (accum, x) => {
        accum.ranks.push(x.id)
        accum.leads.push(x.lead)
        return accum
      }, ret)
    }
    return ret
  }
}

// actions
const actions = {
  ranksMoveUpAction: moveRanks.moveUpAction,
  ranksMoveDownAction: moveRanks.moveDownAction,
  ranksMoveTopAction: moveRanks.moveTopAction,
  ranksMoveBottomAction: moveRanks.moveBottomAction,
  ranksMoveInFavAction: moveRanks.moveInFavAction,
  ranksMoveOutFavAction: moveRanks.moveOutFavAction
}

// mutations
const mutations = {
  ranksSetData: (state, params) => {
      //console.log('ranksSetData', params)
      state.ranks = params.ranks
      state.favorites = params.favorites

      //console.log( 'ranks setdata', console.log( Object.keys(state.ranks || {}).sort((a,b)=>state.ranks[a]-state.ranks[b]))  )
  },
  // result (summary/aggregated ranks)
  resultsSetData: (state, params) => {
    console.log('resultsSetData', JSON.stringify(params))
    state.results = params.ranks
    
    
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
        else {
          ranks[s.id] = state.ranks[s.id]
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
    //console.log( 'ranks initData', console.log( Object.keys(state.ranks || {}).sort((a,b)=>state.ranks[a]-state.ranks[b]))  )
  },
  // ranking moves
  ranksMoveUp: moveRanks.moveUp,
  ranksMoveDown: moveRanks.moveDown,
  ranksMoveTop: moveRanks.moveTop,
  ranksMoveBottom: moveRanks.moveBottom,
  ranksMoveInFav: moveRanks.moveInFav,
  ranksMoveOutFav: moveRanks.moveOutFav
}

export default {
  state,
  getters,
  actions,
  mutations
}
