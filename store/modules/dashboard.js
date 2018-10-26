import socketEvents from '../socketEvents'
const crypto = require('crypto')

// initial state
// shape: [{ id, quantity }]
const state = {
  socket: null,
  	
  module: 'admin', /* ['public', 'admin', 'profile'] */
  back: {
	module: null,
	view: null,
	mode: null
  },

  public: {
	view: 'dashboard',
	dashboard: {
		mode: 'view'
	}
  },
  admin: {
	view: 'election-list', /* election-list, election-detail, voter-list, story-detail */
	'election-list': {
	 	title: 'Elections',
		mode: 'view' /* view */
	},
	'election-detail': {
	 	title: 'Election Properties',
		mode: 'view' /* view, edit */
	},
	'voter-list': {
	 	title: 'Voters',
		mode: 'edit',
		filters: {
			pattern: null
		}
	},
	'story-detail': {
	 	title: 'Candidate',
		mode: 'edit'
	}
  },
  profile: {
	view: 'my-profile',
	'my-profile': {
	 	title: 'Profile',
		mode: 'view'
	},
	'election-detail': {
	 	title: 'Election Properties',
		mode: 'edit'
	}
  },
  list: {
    scrollTop: 0,
    filters: {
        submitter_id: null,
		pattern: null
    },
	filterShortlist: false
  },
  detail: {
	mode: 'view', /* view, edit */
  	row: null,
	action: ''
  },

  showInfoModal: false,
  info: {
  	cssclass: '',
	size: '',
  	message: '',
	handler: () => {},
	cancel: () => {},
	okTitle: 'OK',
	cancelTitle: 'Cancel',
	okOnly: false
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

  /* current election */
  user: {
  	id: null,
  	login: '', 
 	name: '',
  },
  election: {
  	id: null,
  	name : '',
  	label: '',
    days_to_close: 0,
	active: true
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
  myranks: state => state.myranks,
  shortlist: state=>state.userElectionDetails.shortlist,

  dashState: state => state,
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
  networkTxnStatus: state => state.network.txnStatus,
 
 /* views related */
  moduleName: state=>state.module,
  viewName: state=>state.module.view,
  module: state=>state[state.module],
  view: state=>state[state.module][state[state.module].view],
  back: state => state.back,

}

// actions
const actions = {
    initSockets(context, params) {
      console.log('init socket:', params)
      var socket = params.socket
      context.commit('setSocket', {socket: socket})
      socketEvents.registerHandlers(context, socket)     
    },
    dashInitialize (context, params) {
		context.commit('dashStateInit', params)
		context.commit('electionsSetData', params.elections)
		context.commit('userElectionsSetData', params.userElections)
  	},

}

// mutations
const mutations = {
    setSocket: (state, params) => {
      state.socket = params.socket
    },
    setSocketTest: (state) => {
      state.socket = { emit : () => null }
    },

    dashStateInit (state, params) {
  	    Object.assign(state.user, params.user)
	    Object.assign(state.election, params.elections[0])
	    Object.assign(state.userElectionDetails, params.userElections[state.election.id])
	    state.myranks = params.myranks

		/* compute a random integer hash to randomly shuffle sort order on a per user basis. Use md5 to obtain a stable hash */
		/* modulo the hash by length of list to obtain a random shuffle */
		state.userHash = Number('0x' + (crypto.createHash('md5').update(params.user.login).digest('hex').substr(0,8)))
  },

  dashSetModule (state, params) {
    state.module = params
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

  dashSetElection: (state, row) => {
	state.election = row
  },

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

  /* views related */

  dashSetView: (state, [module, view, mode]) => {
    state.module = module
  	state[module].view = view
  	state[module][view].mode = mode
  },
  dashSetBack: (state, [module, view, mode]) => {
	state.back.module = module
	state.back.view = view
	state.back.mode = mode
  },
  dashClearBack: (state) => {
	state.back.module = null
	state.back.view = null
	state.back.mode = null
  },
  /* info related */

  dashSetInfoModalShow: (state, value) => {
  	state.showInfoModal = value
  },
/*
  dashSetInfoMessage: (state, value) => {
  	state.info.message = value
  },
  dashSetInfoCancel: (state, cancel) => {
	state.info.cancel = cancel
  },
  dashSetInfoHandler: (state, handler) => {
	state.info.handler = handler
  },
 */
  dashInfoSetProps: (state, props) => {
	Object.assign(state.info, props)
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
