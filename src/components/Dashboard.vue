<template>
  <b-container class="app-container">
    <b-row class="app-header">
      <b-navbar class="title-bar" toggleable="sm" type="light" variant="faded" style="width: 100%">


        <b-navbar-brand href="#">
          <span class="title-brand">
          <img src="assets/logo.png" class="logo-icon" alt="WTF-2">
          {{ election.label }} &nbsp; &nbsp;
          </span>
        </b-navbar-brand>

        <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>

        <b-collapse is-nav size="small" id="nav_collapse">
          <b-navbar-nav>
          </b-navbar-nav>
          <!-- Right aligned nav items -->
          <b-navbar-nav class="ml-auto">
            <b-nav-item>
              <div>
              <div style="float:left; width: 80%;">
              <b-form-select v-model="submitterId"  @change="filterSubmitter($event)" class="mb-3">
                <option v-for="user in usersList" :value="user.id">{{user.login}}</option>
              </b-form-select>
              </div>
              <div style="float:left;">
              <b-nav-item @click="submitterId=null;resetSubmitterFilter(null)">
              &nbsp;&nbsp;X
              &nbsp;&nbsp;<b-badge class="flex-perfect-center"> {{ items != null ? items.length : 0 }} </b-badge>
              </b-nav-item>
              </div>
              </div>
            </b-nav-item>
            <b-button variant="outline" size="sm" @click="doLogout"> Sign out </b-button>
          </b-navbar-nav>
        </b-collapse>
      </b-navbar>

      <rank-bar @rank-button-click="handleRankBtnClick"> </rank-bar>

    </b-row>

    <b-row class="app-content" ref="list">
      <b-col>
		<span class="leaderboard-text">Leaderboard</span>
        <b-table striped small :items="items" :fields="fields" @row-clicked="rowclick">
          <template slot="content" slot-scope="data">
            <story-row :row="data.item" :items="items">
            </story-row>
          </template>
        </b-table>
      </b-col>
    </b-row>
    <b-row class="app-footer">
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
      listTable: null,

      fields: fields,
      submitterId: null,
      filterSubmitter: (sid) => {
        this.$store.commit('storiesSetFilter', {submitter_id : sid })
      },
      resetSubmitterFilter: () => {
        this.$store.commit('storiesSetFilter', {submitter_id : null })
      },
      rowclick: (item, index, event) => {
        if (this.selectedRow != null && this.selectedRow.id === item.id) {
          this.$store.commit('dashClearSelection') 
		  this.$store.commit('dashRemoveShortlist', item.id)
        }
        else {
          this.$store.commit('dashSetSelected', item)
		  this.$store.commit('dashAddShortlist', item.id)
        }
      }
    }
  },
  computed: {
	election() { return this.$store.getters.election },
	user() { return this.$store.getters.user },
	userElectionDetails() { return this.$store.getters.userElectionDetails },
    usersList() { return this.$store.getters.usersGetItems },
    //items() { return this.$store.getters.stories },
    items() { return this.$store.getters.storiesGetItems },
    users () { return this.$store.getters.usersGetIdMap },
    comments () { return this.$store.getters.commentsGetStoryIdMap },
    myranks() { return this.$store.getters.myranks},
    results() { return this.$store.getters.getResults},
    selectedRow() { return this.$store.getters.dashSelectedRow},
    scrollTop() { return this.$store.getters.dashScrollTop }
  },
  methods: {
    doLogout: () => {
      var headers = new Headers();
      headers.append('Content-Type', 'application/json');
      window.fetch('/logout', {
        method: 'post',
        credentials: 'same-origin',
        headers: headers,
        body: JSON.stringify({})
      })
      .then( res => {
        if (!res.ok ) { 
          throw Error (res.json())
        }
        return res.json()
      })
      .then( response => {
        window.location.href = '/'
      })
      .catch( err => {
        alert (err.message)
      })
    },
    scrollToTop: function() { 
      this.$store.commit('dashSetScrollTop', 0)
    },
    scrollListener: function() {
      var _this = this
      return function(evt) { 
        console.log('scroll evt:', _this.listTable.scrollTop)
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
	handleRankBtnClick: function (val) {
		console.log ('rank button clicked (dashboard)', val, this.$store)
		if (this.selectedRow.id !== 0) {
			this.$store.commit('dashHandleRankBtnClick', val)
		}
		else {
			if (this.myranks[val] != null) { 
				document.getElementById('row_' + this.myranks[val]).scrollIntoView()
			}
		}
	}
  },
  watch: {
    'scrollTop': function(newValue, oldValue)  {
      console.log ('emitting schedule-scroll event:', newValue)
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
    if (process.env.NODE_ENV === 'client-development') {
      this.$store.dispatch('initStoreTest')
    }
    else { 
      var socket = window.io();
      console.log('Dashboard socket:', socket)
      this.$store.dispatch('initStore', {socket: socket})
      .then(() => {
        //console.log('checking state stories', this.items)
        //console.log('checking state results', JSON.stringify(this.results))
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
.title-bar {
	height: 65px;
	border-bottom-color: rgba(0, 0, 0, 0.05);
	border-bottom-thickness: 1px;
	border-bottom-style: solid;
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

.leaderboard-text {
	font-size: x-small;
	color: silver;
	display: flex;
	justify-content: center;
}
</style>
