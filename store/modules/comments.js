import Vue from 'vue'
// initial state
const state = {
  items: [],
  byId: {},
  byStoryId: {}
}

// helpers
// getters
const getters = {
  commentsGetItems: (state, params) => {
    return state.items
  },
  commentsGetIdMap: (state) => {
    return state.byId
  },
  commentsGetStoryIdMap: (state) => {
    return state.byStoryId
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
        if (state.byStoryId[x.story_id] == null) {
          state.byStoryId[x.story_id] = [x]
        }
        else {
          state.byStoryId[x.story_id].push.apply(state.byStoryId[x.story_id], [x])
        }
      })
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
