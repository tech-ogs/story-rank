<template>
    <detail :viewMode="view.mode">

        <template slot="detail-menu">
			<admin-menu> </admin-menu>
        </template>

        <template slot="detail-form">
			<b-row>
				Voter list placeholder
			</b-row>
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
</style>
