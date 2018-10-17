<template>
    <admin-detail>

        <template slot="admin-detail-menu">
        </template>

        <template slot="admin-detail-form">
			election details form here
        </template>

    </admin-detail>
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
	info() { return this.$store.getters.info }

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
