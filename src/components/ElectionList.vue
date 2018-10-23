<template>
  <b-container class="app-container">
    <b-row class="app-header">
	  <admin-header :helpText="helpText">
	  </admin-header>
	  <b-nav class="toolbar">
		<b-nav-item variant="link" @click="newElection"> New </b-nav-item>
	  </b-nav>
    </b-row>
    <b-row class="app-content" ref="list">
      <b-col>
        <b-table striped small :items="items" :fields="fields" @row-clicked="rowclick">
          <template slot="content" slot-scope="data">
            <election-row :row="data.item" :items="items">
            </election-row>
          </template>
        </b-table>
      </b-col>
    </b-row>
    <b-row class="app-footer">
		<admin-footer> 
		</admin-footer>
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
      listTable: null,
      fields: fields,
      rowclick: (item, index, event) => {

		this.$store.commit('dashSetView', ['public', 'dashboard', 'view'])
      }
	}
  },
  computed: {
	isEditor () { return this.$store.getters.isEditor },
	isAdmin () { return this.$store.getters.isAdmin },
	election() { return this.$store.getters.election },
	user() { return this.$store.getters.user },
	userElectionDetails() { return this.$store.getters.userElectionDetails },
    usersList() { return this.$store.getters.usersGetItems },
    items() { return this.$store.getters.electionsGetItems },
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
    scrollToTop: function() { 
      this.$store.commit('dashSetScrollTop', 0)
    },
    scrollListener: function() {
      var _this = this
      return function(evt) { 
        //console.log('scroll evt:', _this.listTable.scrollTop)
        _this.$store.commit('dashSetScrollTop', _this.listTable.scrollTop)
		if (_this.selectedRow != null) { 
			var el0 = document.getElementById('row_' + _this.items[0].id);
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
    var listTable = this.$refs.list
    console.log('listTable:', listTable)
    this.listTable = listTable
    
    this.listTable.addEventListener('scroll', this.scrollListener());

    this.listTable.scrollTop = this.scrollTop

    /* TODO : move to a central location */

    this.listTable.scrollTop = this.scrollTop
    if (process.env.NODE_ENV === 'client-development') {
      this.$store.dispatch('initStoreTest')
    }
    else { 
      var socket = window.io({
		reconnection: true
	  });
      console.log('Dashboard socket:', socket)
      this.$store.dispatch('initStore', {socket: socket})
      .then(() => {
        //console.log('checking state stories', this.items)
        console.log('checking state election', JSON.stringify(this.election))
        console.log('checking state results', JSON.stringify(this.results))
      })
    }

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
	justify-content: flex-end;
}
</style>
