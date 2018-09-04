import socketEvents from '../socketEvents'
// initial state
// shape: [{ id, quantity }]
const state = {
  socket: null,
  	
  mode: 'list', /* ['list', 'detail'] */
  detailRow: null,
  detail: {
	mode: 'view' /* ['view', 'edit'] */
  },

  list: {
    scrollTop: 0,
    filters: {
        submitter_id: null
    },
	filterShortlist: false
  },
  selected: null,

  /* from server */
  user: {
  	login: '', 
 	name: '',
  	groups: []
  },
  election: {
  	id: null,
  	name : '',
  	label: '',
    locked: false,
    days_to_close: 0,
  },
  userElectionDetails : {
  	shortlist: [],
	locked: false
  },
  myranks: [null, null, null],


}

const postData = (state) => {
  return {
  	list: state.list,
	myranks: state.myranks,
	election: state.election,
	userElectionDetails: state.userElectionDetails,

  }
}

// getters
const getters = {

  user: state => state.user,
  election: state => state.election,
  userElectionDetails: state => state.userElectionDetails,
  isAdmin: state => state.user.groups.indexOf('admin') >= 0,
  isEditor: state => state.user.groups.indexOf('editor') >= 0,
  myranks: state => state.myranks,
  shortlist: state=>state.userElectionDetails.shortlist,

  dashState: state => state,
  dashMode: state => state.mode,
  dashScrollTop: state => state.list.scrollTop,
  dashSelectedRow: (state) => state.selected || {id:0},

  dashDetailRow: state => state.detailRow,
  dashDetailMode: state => state.detail.mode,

  dashListFilters: state => state.list.filters,
  dashFilterShortlist: state => state.list.filterShortlist
  
}

// actions
const actions = {
    initSockets(context, params) {
      console.log('init socket:', params)
      var socket = params.socket
      context.commit('setSocket', {socket: socket})
      socketEvents.registerHandlers(context, socket)     
    }
}

// mutations
const mutations = {
    setSocket: (state, params) => {
      state.socket = params.socket
    },
    setSocketTest: (state) => {
      state.socket = { emit : () => null }
    },

  dashInitialize (state, params) {
  	Object.assign(state.user, params.user)
	Object.assign(state.election, params.election)
	Object.assign(state.userElectionDetails, params.userElectionDetails.attributes)
	state.myranks = params.myranks
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
  				state.socket.emit('rank_update', postData(state))
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
  	if (state.userElectionDetails.shortlist.indexOf(id) < 0) {
		state.userElectionDetails.shortlist.splice(-1, 0, id)
	}
  	state.socket.emit('rank_update', postData(state))
  },
  dashRemoveShortlist: (state, id) => { 
  	var idx = state.userElectionDetails.shortlist.indexOf(id)
	if (idx >=0) {
		state.userElectionDetails.shortlist.splice(idx,1)
	}
  	state.socket.emit('rank_update', postData(state))
  },
  dashToggleFilterShortlist: (state) => {
  	state.list.filterShortlist = !state.list.filterShortlist
  	state.socket.emit('rank_update', postData(state))
  }
		
}

export default {
  state,
  getters,
  actions,
  mutations
}
