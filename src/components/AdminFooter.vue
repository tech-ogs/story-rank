
<template>
  <b-nav fill pills class="width100">
    <b-nav-item :active="moduleName === 'admin'" @click="elections" > Elections </b-nav-item>
    <b-nav-item :active="moduleName === 'public'" @click="vote" > Vote </b-nav-item>
    <b-nav-item :active="moduleName === 'profile'" @click="settings" > Settings </b-nav-item>
  </b-nav>
</template>

<script>

export default {
  props: [],
  data () {
    return {
		
    }
  },
  computed: {
	moduleName () { return this.$store.getters.moduleName }
  },
  methods: {

	elections: function() {
		this.$store.commit('dashSetView', ['admin', 'election-list', 'view'])
	},
	vote: function() {
		this.$store.commit('dashSetView', ['public', 'dashboard', 'view'])
    },
	settings: function() { 
		//this.$store.commit('dashSetDetailRow', {id: null, attributes: { } } )
		this.$store.commit ('dashSetDetailAction', 'editRow')
		this.$store.commit('dashSetView', ['profile', 'my-profile', 'edit'])
	},

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
