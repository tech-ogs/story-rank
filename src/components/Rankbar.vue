<template>
	<div class="width100">
	<b-navbar>
		<b-nav pills class="width100 flex-left-right rank-toolbar">
		  <b-btn class="rank-text" disabled>Your top 3</b-btn>
		</b-nav>
	</b-navbar>

	<b-navbar class="rank-nav-bar" >
		<b-nav pills fill class="width100 rank-buttons-bar">
		   <rank-button :pos=0  @rank-button-click="handleRankBtnClick" > </rank-button>
		   <rank-button :pos=1  @rank-button-click="handleRankBtnClick"> </rank-button>
		   <rank-button :pos=2  @rank-button-click="handleRankBtnClick"> </rank-button>
		</b-nav>
	</b-navbar>
	<b-navbar>
		<b-nav pills class="width100 flex-left-right rank-toolbar">
		  <b-btn class="rank-text" disabled>Leaderboard</b-btn>
		  <b-btn class="shortlist-button">Your shortlist &nbsp;<b-badge variant="light" class="shortlist-badge"> {{shortlist.length}} </b-badge> </b-btn>
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
    myranks() { return this.$store.getters.myranks},
    selectedRow() { return this.$store.getters.dashSelectedRow},
	shortlist() { return this.$store.getters.shortlist}
  },
  methods: {
		getImg: (url) => { return require('@/'+url) },
		handleRankBtnClick (val)  {
			this.$emit('rank-button-click', val)
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
.shortlist-button {
	
}
.shortlist-badge {
	background-color: gold;
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
