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
		<b-nav pills class="width100 flex-left-right">
		  <span class="leaderboard-text">Leaderboard</span>
		  <b-btn :size="sm" class="shortlist-button" @click="toggleFilterShortlist">
			Shortlist &nbsp;<b-badge variant="light" class="shortlist-badge"> {{shortlist.length}} </b-badge> 
		  </b-btn>
		  <b-btn :size="sm" class="shortlist-button" @click="">
			<span class="submit-text" :disabled="electionLocked">SUBMIT</span><b-badge variant="light" class="shortlist-badge"> {{electionDaysToCLose}} days left</b-badge> 
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
    }
  },
  computed: {
    items() { 
		return this.$store.getters.stories
    },
	electionLocked() { return this.$store.getters.electionLocked },
	electionDaysToClose() { return this.$store.getters.electionDaysToClose },
    myranks() { return this.$store.getters.myranks},
    selectedRow() { return this.$store.getters.dashSelectedRow},
	shortlist() { return this.$store.getters.shortlist},
	filterShortlist() { return this.$store.getters.dashFilterShortlist },
	mode() { return this.$store.getters.dashMode }
  },
  methods: {
		getImg: (url) => { return require('@/'+url) },
		handleRankBtnClick (val)  {
			this.$emit('rank-button-click', val)
		},
        toggleFilterShortlist ()  {
			this.$store.commit('dashToggleFilterShortlist')
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

.rank-tool-bar {
	height: 50px;
    border-bottom-color: rgba(0, 0, 0, 0.05);
    border-bottom-thickness: 1px;
    border-bottom-style: solid;
}
.rank-text {
	background-color: rgba(0, 0, 0, 0.05);
	color: black;
}
.top-text-container {
	height:10px;
}

.top-text {
	font-size: x-small;
}
.leaderboard-text {
	font-size: x-small;
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
}
.shortlist-button {
	
}
.shortlist-badge {
	background-color: gold;
}

.submit-text {
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
}

</style>
