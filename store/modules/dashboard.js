// initial state
// shape: [{ id, quantity }]
const state = {
  mode: 'list', /* ['list', 'detail'] */
  list: {
    scrollTop: 0
  }
}

// getters
const getters = {
  dashState: state => state,
  dashMode: state => state.mode,
  dashScrollTop: state => state.list.scrollTop
}

// actions
const actions = {
}

// mutations
const mutations = {
  dashSetMode (state, params) {
    state.mode = params
  },
  dashSetScrollTop (state, params) {
    state.list.scrollTop = params
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
