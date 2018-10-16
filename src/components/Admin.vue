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

            <b-button v-if="isAdmin" size="sm" @click="voterList"> <b>VOTER LIST</b> </b-button>
			<br>
            <b-button v-if="isAdmin" size="sm" @click="elections"> <b>ELECTIONS</b> </b-button>
			<br>
            <b-button  size="sm" @click="myProfile"> <b>MY PROFILE</b> </b-button>
			<br>
            <b-button  size="sm" @click="myElections"> <b>MY ELECTIONS</b> </b-button>
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
    adminView () { return this.$store.getters.adminView || 'voterList'},
	election() { return this.$store.getters.election }
  },
  methods: {
    showHelp: function() {},
    myProfile: function() {},
    myElections: function() {},
  },
  watch: {
  },

  mounted () {

  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
