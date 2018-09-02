// initial state
// shape: [{ id, quantity }]
const state = {
	/* set by dashInitialize after login */
  login: '', 
  name: '',
  groups: [], 
  	
  mode: 'list', /* ['list', 'detail'] */
  detailRow: null,
  detail: {
	mode: 'view' /* ['view', 'edit'] */
  },

  list: {
    scrollTop: 0
  },
  selected: null,
  myranks: [null, null, null],
  shortlist: []
}

// getters
const getters = {
  login: state => state.login,
  groups: state => state.groups,
  isAdmin: state => state.groups.indexOf('admin') >= 0,
  isEditor: state => state.groups.indexOf('editor') >= 0,
  myranks: state => state.myranks,
  shortlist: state=>state.shortlist,

  dashState: state => state,
  dashMode: state => state.mode,
  dashScrollTop: state => state.list.scrollTop,
  dashSelectedRow: (state) => state.selected || {id:0},

  dashDetailRow: state => state.detailRow,
  dashDetailMode: state => state.detail.mode
  
}

// actions
const actions = {
}

// mutations
const mutations = {
  dashInitialize (state, params) {
	state.login = params.login,
	state.name = params.name,
	state.groups = params.groups
  },
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
		
		for (i=0; i<myranks.length; i++) {
			if (state.myranks[i] !== myranks[i]) {
				state.myranks = myranks;
				state.selected = null;
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
  dashSetDetailRow: (state,row) => { 
  	state.detailRow = row 
  },
  dashSetDetailMode: (state, mode) => {
    state.detail.mode = mode
  },

  /* we use splice operations to add and remove shortlist entries to force vue to "react" */
  dashAddShortlist: (state, id) => {
  	if (state.shortlist.indexOf(id) < 0) {
		state.shortlist.splice(-1, 0, id)
	}
  },
  dashRemoveShortlist: (state, id) => { 
  	var idx = state.shortlist.indexOf(id)
	if (idx >=0) {
		state.shortlist.splice(idx,1)
	}
  }
		
}

export default {
  state,
  getters,
  actions,
  mutations
}
