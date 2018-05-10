import Vue from 'vue'
// initial state
const state = {
  items: [],
  byStoryId: {}
}

// helpers
// getters
const getters = {
  ranksByStoryId: (state) => {
    return state.byStoryId
  }
}

// actions
const actions = {
}

// mutations
const mutations = {
  ranksSetData: (state, params) => {
      console.log('ranksSetData', params)
      state.items = params || []
      state.items.forEach( x => {
        state.byStoryId[x.story_id] = x
      })
  },
  ranksInitData: (state, stories) => {
    //console.log('ranksInitData', stories)
    var ranks = []
    var byStoryId = {}
    if (state.items.length === 0) {
      stories.sort( (a,b) => { return a.id - b.id } )
      .forEach( (s,idx) => {
        ranks.push({id: null, story_id: s.id, rank: idx+1})
      })
      state.items = ranks
    }
    else {
      stories.sort( (a,b) => { return a.id > b.id } )
      .forEach( (s,idx) => {
        if (state.byStoryId[s.id] == null) {
          ranks.push({id: null, story_id: s.id, rank: idx+1})
        }
        else {
          ranks.push(state.items[idx])
        }
      })
    }
    ranks.forEach( x => {
      byStoryId[x.story_id] = x
    })
    console.log('ranksInitData items', JSON.stringify(ranks, null,2))
    console.log('ranksInitData byStoryId', JSON.stringify(byStoryId,null,2))
    state.items = ranks
    state.byStoryId = byStoryId
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
