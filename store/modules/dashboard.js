// initial state
// shape: [{ id, quantity }]
const state = {
  mode: 'list', /* ['list', 'detail'] */
  list: {
    scrollTop: 0
  },
  selected: null,
  //myranks: [33, 6, 43]
  myranks: [null, null, null]
}

// getters
const getters = {
  dashState: state => state,
  dashMode: state => state.mode,
  dashScrollTop: state => state.list.scrollTop,
  dashSelectedRow: (state) => state.selected || {id:0},
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
    dashHandleRankBtnClick(state, val) {

		function rankOf(storyId) {
			var result = null
			for (var i=0; i < state.myranks.length; i++) {
				if (state.myranks[i] === storyId) {
					result = i
					break;
				}
			}
			return result
		}

		function insertShift() {
			if (val < currentRank) {
				for ( i = currentRank; i > val; i--) {
					myranks[i] = myranks[i-1]
				}
				myranks[val] = selected.id
			}
			else if (val > currentRank) {
				for ( i = currentRank; i < val; i++) {
					myranks[i] = myranks[i+1]
				}
				myranks[val] = selected.id
			}
			else {
				// undo ? or nothing ?
			}
		}

		console.log ('rank button click', val)
		var i
		var temp
		var myranks = JSON.parse(JSON.stringify(state.myranks))
		var selected = state.selected
		if (selected != null) {
			var currentRank = rankOf (selected.id)
			if (myranks[val] != null) {
				if (currentRank != null ) {
					insertShift()
				}
				else {
					myranks[val] = selected.id
				}
			}
			else {
				if (currentRank == null) { 
					myranks[val] = selected.id
				}
				else {
					insertShift()
				}
			}
		}
		else {
			if (myranks[val] != null) {
				// scroll to the ranked story
			}
			else {
				// do nothing
			}
		}
		
		for (i=0; i<myranks.length; i++) {
			if (state.myranks[i] !== myranks[i]) {
				state.myranks = myranks;
				break
			}
		}
	},
  dashSetSelected: (state, row) => {
    state.selected = row
  },
  dashClearSelection: (state) => {
    state.selected = null
  },

}

export default {
  state,
  getters,
  actions,
  mutations
}
