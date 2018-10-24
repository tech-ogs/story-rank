<template>
  <b-container class="app-container">
    <b-row class="app-header">
	  <banner :helpText="helpText">
	  </banner>
	  <b-nav class="toolbar">
		 <b-nav-item @click=""> 
			Invite Link: <input type="text" ref="linktext" :value="getInviteLink()"> </input> 
			<b-badge class="" @click="copyInviteLink">copy</b-badge> </b-nav-item> 
	  </b-nav>
    </b-row>
    <b-row class="app-content" ref="list">
      <b-col>
        <b-table striped small :items="items(election.id)" :fields="fields" @row-clicked="rowclick">
          <template slot="content" slot-scope="data">
            <user-row :row="data.item" :items="items(election.id)">
            </user-row>
          </template>
        </b-table>
      </b-col>
    </b-row>
    <b-row class="app-footer">
    </b-row>
	<b-row>
		<b-col>
			<modal-dialog> </modal-dialog>
		</b-col>
	</b-row>
  </b-container>
</template>

<script>
const fields = [
  {
    key: 'content',
    label: '',
    sortable: false
  }
]

export default {
  data () {
    return {
	  helpText: '',
      linkText: null,
      listTable: null,
      fields: fields,
      rowclick: (item, index, event) => {
      }
	}
  },
  computed: {
	isEditor () { return this.$store.getters.isEditor },
	isAdmin () { return this.$store.getters.isAdmin },
	election() { return this.$store.getters.election },
	user() { return this.$store.getters.user },
	userElectionDetails() { return this.$store.getters.userElectionDetails },
    items() { return this.$store.getters.usersGetItems },
    users () { return this.$store.getters.usersGetIdMap },
    comments () { return this.$store.getters.commentsGetStoryIdMap },
    myranks() { return this.$store.getters.myranks},
    results() { return this.$store.getters.getResults},
    selectedRow() { return this.$store.getters.dashSelectedRow},
    scrollTop() { return this.$store.getters.dashScrollTop },

  },
  methods: {
	newElection: function() {
		this.$store.commit('dashSetDetailRow', {id: null, attributes: {} } )
		this.$store.commit ('dashSetDetailAction', 'createRow')
		this.$store.commit ('dashSetDetailMode', 'edit')
		this.$store.commit('dashSetView', ['profile', 'election-detail', 'edit'])
    },
	getInviteLink: function() {
		return 'http://www.ranknvote.com/invite/' + (this.election.hash || this.election.id)
	},
	copyInviteLink: function() {
		this.linkText.select()
		document.execCommand('copy')
	},
    scrollToTop: function() { 
      this.$store.commit('dashSetScrollTop', 0)
    },
    scrollListener: function() {
      var _this = this
      return function(evt) { 
        //console.log('scroll evt:', _this.listTable.scrollTop)
        _this.$store.commit('dashSetScrollTop', _this.listTable.scrollTop)
		if (_this.selectedRow != null) { 
			var el0 = document.getElementById('row_' + _this.items(this.election.id)[0].id);
			var el0Parent = el0 ? el0.parentElement : null;
			var offset = el0Parent.offsetTop + el0.offsetHeight;
			var el = document.getElementById ('row_' + _this.selectedRow.id)
			var elParent = el ? el.parentElement : null
			if (el0Parent && elParent) {
				var bot = elParent.offsetTop + elParent.offsetHeight
				console.log ('scroll, bot:', _this.listTable.scrollTop + offset, bot, _this.listTable.scrollTop + offset - bot)
				if (_this.listTable.scrollTop + offset > bot) {
					_this.$store.commit('dashClearSelection')
				}
				
			}
		}
      }
    },
  },
  watch: {
    'scrollTop': function(newValue, oldValue)  {
      //console.log ('emitting schedule-scroll event:', newValue)
      this.listTable.scrollTop = this.scrollTop
    }
  },

  mounted () {
    console.log('ENV', process.env)
    this.linkText = this.$refs.linktext
    var listTable = this.$refs.list
    console.log('listTable:', listTable)
    this.listTable = listTable
    
    this.listTable.addEventListener('scroll', this.scrollListener());

    this.listTable.scrollTop = this.scrollTop

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
html,
body,
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

.toolbar {
	width: 100%;
	disply: flex;
	justify-content: flex-start;
}
</style>
