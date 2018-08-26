// initial state
// shape: [{ id, quantity }]
const state = {
  mode: 'list', /* ['list', 'detail'] */
  list: {
    scrollTop: 0
  },
	myrank: {
		1: null,
		2: null,
		3: null
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
  },
	dashSetMyRank(state, param) { 
		state.myrank[param.rank] = param.id
	}
}

export default {
  state,
  getters,
  actions,
  mutations
}
