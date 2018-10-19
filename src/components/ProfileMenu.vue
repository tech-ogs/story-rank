<template>
  <b-navbar-nav class="ml-auto">
	<b-button v-if="isAdmin" size="sm" @click="myProfile"> <b>MY PROFILE</b> </b-button>
	<br>
	<b-button v-if="isAdmin" size="sm" @click="newElection"> <b>NEW ELECTION</b> </b-button>
  </b-navbar-nav>
</template>

<script>

export default {
  data () {
    return {
	
	}
  },
  computed: {
	isAdmin () { return this.$store.getters.isAdmin },
	election() { return this.$store.getters.election },
  },
  methods: {
    showHelp: function() {},
	myProfile: function() {
		this.$store.commit('dashSetView', ['profile', 'my-profile', 'edit'])
	},
	newElection: function() {
		this.$store.commit('dashSetDetailRow', {id: null, attributes: {} } )
		this.$store.commit ('dashSetDetailAction', 'createRow')
		this.$store.commit ('dashSetDetailMode', 'edit')
		this.$store.commit('dashSetView', ['profile', 'election-detail', 'edit'])
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
html,
body,
.app-container {
  height: 100%; /* needed for proper layout */
}

.app-container {
  display: flex;
  flex-direction: column;
}

.app-header {
  flex: 0 0 auto;
}
.title-bar {
/*
	height: 65px;
*/
	border-bottom-color: rgba(0, 0, 0, 0.05);
	border-bottom-thickness: 1px;
	border-bottom-style: solid;
    padding: 0.0rem 1rem;

}

.app-content {
  flex: 1 1 auto;
  position: relative;/* need this to position inner content */
  overflow-y: scroll; 
  -webkit-overflow-scrolling: touch;
}

.app-footer {
  flex: 0 0 auto;
}

.logo-icon {
    height: 50px;
    width: 50px;
    margin: 10px;
    border:1px solid gray;
    border-radius: 500px;
    -webkit-border-radius: 500px;
    -moz-border-radius: 500px;
}

.title-brand {
  display: flex;
  align-items: center;
  /*justify-content: center;*/
}

.info-bar {
	height: 12px;
	display: flex;
	justify-content: center;
	align-items: center;
}


</style>
