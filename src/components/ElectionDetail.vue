<template>
    <detail :viewMode="view.mode">

        <template slot="detail-menu">
			<admin-menu v-if="moduleName === 'admin'"> </admin-menu>
			<profile-menu v-else> </profile-menu>
        </template>

        <template slot="detail-form">
			election details form here
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
	view() { return this.$store.getters.view },
	moduleName() { return this.$store.getters.moduleName}

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
</style>
