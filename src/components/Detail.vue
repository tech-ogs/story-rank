<template>
  <div v-touch:swipe.left="close"  v-touch:swipe.right="close" >
    <b-container small>
	  <b-row>
        <banner>
            <template slot="banner-menu">
              <slot name="detail-menu">
              </slot>
            </template>
        </banner>
	  </b-row>

    <slot name="detail-header">
    </slot>
	  <br>
	  <br>
    <slot name="detail-form">
    </slot>

      <b-row>
        <b-col class="flex-perfect-center">
		  <b-button-toolbar class="width100" v-if="mode === 'view'" key-nav>
<!--
			<b-button-group class="mx-1">
			  <b-btn>&laquo;</b-btn>
			  <b-btn>&lsaquo;</b-btn>
			</b-button-group>
-->
			<b-button-group class="button-group mx-1">
			  <b-btn @click="close">Back</b-btn>
			  <b-btn v-if="isEditor || isAdmin" @click="doEdit">Edit</b-btn>
			</b-button-group>
<!--
			<b-button-group class="mx-1">
			  <b-btn>&rsaquo;</b-btn>
			  <b-btn>&raquo;</b-btn>
			</b-button-group>
-->
		  </b-button-toolbar>

		  <b-button-toolbar v-if="mode === 'edit'" key-nav>
			<b-button-group class="mx-1">
			  <b-btn @click="saveHandler(action, editRow)">Save</b-btn>
			</b-button-group>
		  </b-button-toolbar>

        </b-col>
      </b-row>

    </b-container>
  </div>
</template>

<script>

export default {
  props: ['editRow', 'viewMode', 'saveHandler'],
  data () {
    return {
    }
  },
  computed: {
    row() { 
		return this.$store.getters.dashDetailRow 
	},
    ranks () { return this.$store.getters.ranks},
    results() { return this.$store.getters.getResults },
    users () { return this.$store.getters.usersGetIdMap },
    user () { return this.$store.getters.user },
	login() { return this.$store.getters.login },
	election() { return this.$store.getters.election },
    usersList() { return this.$store.getters.usersGetItems },
	groups() { return this.$store.getters.groups },
	isEditor () { return this.$store.getters.isEditor },
	isAdmin () { return this.$store.getters.isAdmin },
	mode() { return this.$store.getters.dashDetailMode },
	action() { return this.$store.getters.dashDetailAction },
  },

  methods: {
    close: function() {
      this.$store.commit('dashSetModule', 'public')
    },
	handleRankBtnClick: function(pos) {
		console.log ('rank button click in details', pos)
		this.$store.commit('dashSetSelected', this.row)
		this.$store.commit('dashHandleRankBtnClick', pos)
	},
	doEdit: function() {
		this.$store.commit('dashSetDetailAction', 'editRow')
		this.$store.commit('dashSetDetailMode', 'edit')
	},

  },

  created() {
	if (this.viewMode != null) { 
		this.$store.commit('dashSetDetailMode', this.viewMode)
	}
  },
  mounted () { 
  }
}
</script>

<style scoped>
  .close-button-container{
  }
  .close-button {
    color: black;
  }
  .close-icon {
    height: 25px;
    width: 25px;
  }
  .button-group {
	width: 100%;
	display: flex;
	justify-content: space-around;
  }
</style>
