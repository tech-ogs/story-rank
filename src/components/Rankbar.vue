<template>
	<div class="width100">
	<b-navbar class="top-text-container">
		<span class="top-text"> Your top 3 </span>
	</b-navbar>

	<b-navbar class="rank-nav-bar" >
		<b-nav pills fill class="width100 rank-buttons-bar">
		   <rank-button :pos=0  @rank-button-click="handleRankBtnClick" > </rank-button>
		   <rank-button :pos=1  @rank-button-click="handleRankBtnClick"> </rank-button>
		   <rank-button :pos=2  @rank-button-click="handleRankBtnClick"> </rank-button>
		</b-nav>
	</b-navbar>
	<b-navbar v-if="mode === 'list'">
		<b-nav pills class="width100 flex-left-right rank-actions-bar">
		  <b-btn  size="sm" class="tool-button" @click="toggleFilterShortlist">
			<span class="tool-text">SHORTLIST &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><b-badge variant="light" class="shortlist-badge"> {{shortlist.length}} </b-badge> 
		  </b-btn>
		  <b-btn size="sm" class="tool-button" :disabled="userElectionDetails.locked" @click="handleLock()">
			<span class="tool-text" >SUBMIT &nbsp; &nbsp; </span><b-badge variant="light" class="shortlist-badge"> {{ submitButtonText() }} </b-badge> 
		  </b-btn>
		</b-nav>
	</b-navbar>

	</div>
</template>

<script>
const fields = [
  {
    key: 'content',
    label: '',
    sortable: false
  }
]

export default {
  data () {
    return {
		submitButtonText: () => { 
			var result
			if (this.userElectionDetails.locked) {
				result = 'Locked'
			}
			else {
			 	result = this.election.days_to_close + ' days left'
			}
			return result
		}
    }

  },
  computed: {
    items() { 
		return this.$store.getters.stories
    },
	election() { return this.$store.getters.election},
	userElectionDetails() { return this.$store.getters.userElectionDetails },
    myranks() { return this.$store.getters.myranks},
    selectedRow() { return this.$store.getters.dashSelectedRow},
	shortlist() { return this.$store.getters.shortlist},
	filterShortlist() { return this.$store.getters.dashFilterShortlist },
	mode() { return this.$store.getters.dashMode },
	userHash() { return this.$store.getters.userHash },
	results() { return this.$store.getters.results }
  },
  methods: {
		handleRankBtnClick (val)  {
			this.$emit('rank-button-click', val)
		},
        toggleFilterShortlist ()  {
			this.$store.commit('dashToggleFilterShortlist')
		},
		handleLock() {
			var fn = () => {
				this.$store.commit('dashLockElection')
				this.$store.commit('storiesSort', {locked : true, userHash: this.userHash, ranks: this.results})
			}
			//this.$store.commit('dashSetInfoMessage', 'Are you sure? This cannot be undone')
			//this.$store.commit('dashSetInfoHandler', fn)
			this.$store.commit('dashInfoSetProps', { 
				message : 'Are you sure ? This cannot be undone',
				handler : fn,
				okTitle: 'YES',
				cancelTitle: 'NO',
				okOnly : false
			})
			this.$store.commit('dashSetInfoModalShow', true)
				
		}
				
  },
  watch: {
  },

  mounted () {
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.rank-text {
	background-color: rgba(0, 0, 0, 0.05);
	color: black;
}
.top-text-container {
	height:10px;
	display: flex;
	justify-content: center;
}

.top-text {
	color: silver;
	font-size: x-small;
}

.tool-button {
	
}
.shortlist-badge {
	background-color: gold;
}

.tool-text {
	font-weight: bold;
	/*color: gold;*/
}
.rank-nav-bar {
	width: 100%;
	border-bottom-color: rgba(0, 0, 0, 0.05);
	border-bottom-thickness: 1px;
	border-bottom-style: solid;
}

.rank-buttons-bar {
	width: 100%;
    padding: 0.0 1.0rem;
}

.navbar {
	padding-top: 0px;
	padding-bottom: 0px;
	padding-left: 0.5rem;
	padding-right: 0.5rem;
}

</style>
