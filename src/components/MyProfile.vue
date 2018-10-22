<template>
    <detail :viewMode="view.mode">

        <template slot="detail-header">
			<admin-header>
			</admin-header>
        </template>

        <template slot="detail-menu">
			<profile-menu> </profile-menu>
        </template>

        <template slot="detail-form">
			<div>
				My profile form here
			</div>
        </template>
		<template slot="detail-footer">
			<admin-footer>
			</admin-footer>
		</template>
    </detail>

</template>

<script>
export default {
  data () {
    return {
    }
  },
  computed: {
	isEditor () { return this.$store.getters.isEditor },
	isAdmin () { return this.$store.getters.isAdmin },
	election() { return this.$store.getters.election },
	user() { return this.$store.getters.user },
	userElectionDetails() { return this.$store.getters.userElectionDetails },
    usersList() { return this.$store.getters.usersGetItems },
	info() { return this.$store.getters.info },
	view() { return this.$store.getters.view }
  },
  methods: {
  },
  watch: {
  },

  mounted () {

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.app-footer {
  flex: 0 0 auto;
}

</style>
