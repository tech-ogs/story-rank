<template>
    <b-container class="app-container" v-touch:swipe.left="close"  v-touch:swipe.right="close">
	  <b-row class="app-header">
        <slot name="detail-header">
        <banner>
            <template slot="banner-menu">
            </template>
        </banner>
        </slot>

	  <slot name="detail-menu">
	  </slot>
	  </b-row>


      <b-row class="app-content">
		<slot name="detail-form">
		</slot>

		<br>
        <div class="flex-perfect-center width100">
          <b-button-toolbar class="width100" v-if="mode === 'view'" key-nav>
            <b-button-group class="button-group mx-1">

              <b-btn @click="close">Back</b-btn>

              <b-btn v-if="isEditor(election.id) || isAdmin(election.id)" @click="doEdit">Edit</b-btn>

            </b-button-group>
          </b-button-toolbar>

          <b-button-toolbar v-if="mode === 'edit'" key-nav>
            <b-button-group class="mx-1">

              <b-btn @click="saveHandler(action, editRow)">Save</b-btn>

            </b-button-group>
          </b-button-toolbar>

        </div>
      </b-row>

      <b-row class="app-footer">
        <slot name="view-footer">
        </slot>
      </b-row>
    </b-container>
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
	back() { return this.$store.getters.back }
  },

  methods: {
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

    .app-content {
      flex: 1 1 auto;
      position: relative;/* need this to position inner content */
      overflow-y: scroll; 
      -webkit-overflow-scrolling: touch;
    }

    .app-footer {
      flex: 0 0 auto;
    }


  .button-group {
	width: 100%;
	display: flex;
	justify-content: space-around;
  }
</style>
