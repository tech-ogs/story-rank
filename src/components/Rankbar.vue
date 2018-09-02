<template>

    <b-navbar class="rank-nav-bar" >
        Your top 3<br>
        <b-nav pills fill class="width100 rank-buttons-bar">
           <rank-button :pos=0  @rank-button-click="handleRankBtnClick" > </rank-button>
           <rank-button :pos=1  @rank-button-click="handleRankBtnClick"> </rank-button>
           <rank-button :pos=2  @rank-button-click="handleRankBtnClick"> </rank-button>
        </b-nav>
    </b-navbar>

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
		return this.$store.getters.storiesGetAllResults
    },
    myranks() { return this.$store.getters.myranks},
    selectedRow() { return this.$store.getters.dashSelectedRow},
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

.rank-nav-bar {
	width: 100%;
}
.rank-buttons-bar {
}

</style>
