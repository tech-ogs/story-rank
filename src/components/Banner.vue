
<template>
      <b-navbar class="title-bar" toggleable="sm" type="light" variant="faded" style="width: 100%">
        

        <b-navbar-brand href="#">
          <span class="title-brand">
		  <span @click="close"><icon name="angle-left" class="back-icon"/> &nbsp;</span>
          <b-img :src="getImg(election.attributes.image)" class="logo-icon" alt="WTF-2"> </b-img>
          {{ (election.label || election.name).substr(0,15) }}&nbsp; &nbsp;
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
          <slot name="banner-menu">
          </slot>

        </b-collapse>

      </b-navbar>

</template>

<script>

export default {
  props: ['helpText'],
  data () {
    return {
      getImg: (url) => { 
        return url != null && url !== '' ? url : '/assets/thumbs/placeholder.jpg'
      } 

    }
  },
  computed: {
	election() { return this.$store.getters.election },
	back() { return this.$store.getters.back }
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
		var back = this.back
		if (back.module != null && back.view != null && back.mode != null) {
			this.$store.commit('dashSetView', [back.module, back.view, back.mode])
			this.$store.commit('dashClearBack')
		}
		else {
      		this.$store.commit('dashSetView', ['admin', 'election-list', 'view'])
		}
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

.back-icon {
	transform: scale(2.0, 3.5);
	color: #007bff;
/*
    border:1px solid gray;
    border-radius: 500px;
    -webkit-border-radius: 500px;
    -moz-border-radius: 500px;
*/
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
