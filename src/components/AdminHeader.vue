
<template>
      <b-navbar class="title-bar" toggleable="sm" type="light" variant="faded" style="width: 100%">
        
        <b-navbar-brand href="#">
          <span class="title-brand">
          <img src="assets/thumbs/rnv-logo.jpg" class="logo-icon" alt="rankNVote" @click="close">
           <h2>{{ view.title }}&nbsp; &nbsp; </h2>
          </span>
        </b-navbar-brand>

		<b-navbar-nav>
		<b-nav-item>
			 <b-badge @click="showHelp"><h4> &nbsp; ? &nbsp;</h4> </b-badge>
		</b-nav-item>
		</b-navbar-nav>

      </b-navbar>
</template>

<script>

export default {
  props: ['helpText'],
  data () {
    return {
    }
  },
  computed: {
	election() { return this.$store.getters.election },
    view() { return this.$store.getters.view }
  },
  methods: {
	showHelp: function() { 
		this.$store.commit('dashInfoSetProps', {
			cssclass: 'modal-fullscreen2',
			size: 'lg',
			okOnly: true,
			okTitle: 'OK',
			message: helpText
		})
		this.$store.commit('dashSetInfoModalShow', true) 
	},
    close: function() {
      this.$store.commit('dashSetModule', 'public')
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
.title-bar {
/*
	height: 65px;
*/
	border-bottom-color: rgba(0, 0, 0, 0.05);
	border-bottom-thickness: 1px;
	border-bottom-style: solid;
    padding: 0.0rem 1rem;

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
</style>
