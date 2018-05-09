import Vue from 'vue'
// initial state
const state = {
  items: [],
  byStoryId: {}
}

// helpers
// getters
const getters = {
  ranksGetByStoryIdMap: (state) => {
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
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
