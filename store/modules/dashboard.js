// initial state
// shape: [{ id, quantity }]
const state = {
  mode: 'list', /* ['list', 'detail'] */
  list: {
    scrollTop: 0
  },
	/*
	myranks: {
		1: null,
		2: null,
		3: null
	}
	*/
	myranks: {
		1: 0,
		2: 5,
		3: 9
	}

}

// getters
const getters = {
  dashState: state => state,
  dashMode: state => state.mode,
  dashScrollTop: state => state.list.scrollTop,
  myranks: state => state.myranks
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
	},
    dashHandleRankBtnClick(state, val) {
		console.log ('ok now what', val)
	}
}

export default {
  state,
  getters,
  actions,
  mutations
}
