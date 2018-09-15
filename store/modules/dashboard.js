import socketEvents from '../socketEvents'
const crypto = require('crypto')

// initial state
// shape: [{ id, quantity }]
const state = {
  socket: null,
  	
  mode: 'list', /* ['list', 'detail'] */
  detail: {
	mode: 'view', /* ['view', 'edit'] */
  	row: null,
	action: ''
  },
  showInfoModal: false,
  info: {
  	message: '',
	handler: null,
	cancel: null
  },

  list: {
    scrollTop: 0,
    filters: {
        submitter_id: null,
		pattern: null
    },
	filterShortlist: false
  },
  selected: null,

  /* from socket handlers */

  network : {
    /* rank_update txn */
  	txnStatus: 2, /* 0 = green, 1 = yellow, 2 = red */
	ack1Timestamp: 0,
	ack2Timestamp: 0,

	/* websocket connection status */
	pingTimestamp: 0
  },

  /* from server */
  user: {
  	id: null,
  	login: '', 
 	name: '',
  	groups: []
  },
  election: {
  	id: null,
  	name : '',
  	label: '',
    days_to_close: 0,
  },
  userElectionDetails : {
  	shortlist: [],
	locked: false
  },
  myranks: [null, null, null],
  userHash: 0

}

const postData = (state) => {
  return {
  	list: state.list,
	myranks: state.myranks,
	election: state.election,
	userElectionDetails: state.userElectionDetails,
	timestamp: (new Date()).getTime()

  }
}

// getters
const getters = {

  user: state => state.user,
  userHash: state => state.userHash,
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

  dashDetailRow: state => state.detail.row,
  dashDetailMode: state => state.detail.mode,
  dashDetailAction: state => state.detail.action,

  dashListFilters: state => state.list.filters,
  dashFilterShortlist: state => state.list.filterShortlist,

  dashShowInfoModal: state => state.showInfoModal,
  info: state=>state.info,
  /* network related */
  networkTxnStatus: state => state.network.txnStatus
  
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

	/* compute a random integer hash to randomly shuffle sort order on a per user basis. Use md5 to obtain a stable hash */
	/* modulo the hash by length of list to obtain a random shuffle */
	state.userHash = Number('0x' + (crypto.createHash('md5').update(params.user.login).digest('hex').substr(0,8)))
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
				state.network.txnStatus = 2;
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
  
  /* we use splice operations to add and remove shortlist entries to force vue to "react" */
  dashAddShortlist: (state, id) => {
  	if (state.userElectionDetails.shortlist.indexOf(id) < 0) {
		state.userElectionDetails.shortlist.splice(-1, 0, id)
	}
	state.network.txnStatus = 2;
  	state.socket.emit('rank_update', postData(state))
  },
  dashRemoveShortlist: (state, id) => { 
  	var idx = state.userElectionDetails.shortlist.indexOf(id)
	if (idx >=0) {
		state.userElectionDetails.shortlist.splice(idx,1)
	}
	state.network.txnStatus = 2;
  	state.socket.emit('rank_update', postData(state))
  },

  /* filters related */
  dashToggleFilterShortlist: (state) => {
  	state.list.filterShortlist = !state.list.filterShortlist
	state.list.filters.submitter_id = null
	state.list.filters.pattern = null
	state.network.txnStatus = 2;
  	state.socket.emit('rank_update', postData(state))
  },
  dashSetFilter: (state, params) => {
	state.list.filters.submitter_id = params.submitter_id != null ? parseInt(params.submitter_id) : null
	state.list.filters.pattern = params.pattern
  },

  dashRemoveFilters: (state) => {
  	state.list.filterShortlist = false
  	state.list.filters.submitter_id = null
	state.list.filters.pattern = null
	state.network.txnStatus = 2;
  	state.socket.emit('rank_update', postData(state))
  },

  /* election related */

  dashLockElection: (state) => {
		state.userElectionDetails.locked = true
		state.network.txnStatus = 2;
  		state.socket.emit('rank_update', postData(state))
  },

  /* detail related */

  dashSetDetailRow: (state,row) => { 
  	state.detail.row = row 
  },
  dashSetDetailMode: (state, mode) => {
    state.detail.mode = mode
  },
  dashSetDetailAction: (state, action) => {
  	state.detail.action = action
  },

  /* info related */

  dashSetInfoModalShow: (state, value) => {
  	state.showInfoModal = value
  },
  dashSetInfoMessage: (state, value) => {
  	state.info.message = value
  },
  dashSetInfoCancel: (state, cancel) => {
	state.info.cancel = cancel
  },
  dashSetInfoHandler: (state, handler) => {
	state.info.handler = handler
  },
  /* network related */

  netProcessHandshake: (state) => {
	state.network.txnStatus = 0
  },

  netProcessReconnect: (state) => {
  	if (state.network.txnStatus > 0) {
		state.network.txnStatus = 2;
		state.socket.emit('rank_update', postData(state))
	}
	else {
		state.network.txnStatus = 0
	}
  },

  netProcessAck1: (state, data) => {
  	if (data.timestamp > state.network.ack1Timestamp && state.network.txnStatus > 1) {
		state.network.ack1Timestamp = data.timestamp
		state.network.txnStatus = 1
	}
  },
		
  netProcessAck2: (state, data) => {
  	if (data.timestamp > state.network.ack2Timestamp && state.network.txnStatus > 0) {
		state.network.ack2Timestamp = data.timestamp
		state.network.txnStatus = 0
	}
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
