<template>
  <b-container>
    <b-row >
		<b-col>
      <b-navbar class="title-bar" toggleable="sm" type="light" variant="faded" style="width: 100%">


        <b-navbar-brand href="#">
          <span class="title-brand">
          <img src="assets/thumbs/logo.jpg" class="logo-icon" alt="WTF-2">
          {{ election.label }}&nbsp; &nbsp;
          </span>
        </b-navbar-brand>

		<b-navbar-nav>
		<b-nav-item>
			 <b-badge @click="showHelp"><h4> &nbsp; ? &nbsp;</h4> </b-badge>
		</b-nav-item>
		</b-navbar-nav>
        <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>

        <b-collapse is-nav size="small" id="nav_collapse">
          <b-navbar-nav>
          </b-navbar-nav>
          <!-- Right aligned nav items -->
          <b-navbar-nav class="ml-auto">

            <b-button v-if="isAdmin" size="sm" @click="electionDetail"> <b>ELECTION</b> </b-button>
			<br>
            <b-button v-if="isAdmin" size="sm" @click="voterList"> <b>VOTER LIST</b> </b-button>
			<br>
			<slot name="admin-view-menu">
			</slot>
          </b-navbar-nav>
        </b-collapse>
      </b-navbar>
		</b-col>
    </b-row>
    <b-row>
      <b-col>
		<slot name="admin-view-content">
		</slot>
	  </b-col>
	</b-row>
  </b-container>
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
    adminView () { return this.$store.getters.adminView || 'my-profile'},
	election() { return this.$store.getters.election }
  },
  methods: {
    showHelp: function() {},
	electionDetail: function() {
		this.$store.commit('dashSetAdminView', 'election-detail')
	},
	voterList: function() {
		this.$store.commit('dashSetAdminView', 'voter-list')
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
