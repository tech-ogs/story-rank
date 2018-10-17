<template>
    <profile>

        <template slot="profile-view-menu">
        </template>

        <template slot="profile-view-content">
			<div style="float:left; width: 80%;">
				<b-form-input type="text" v-model="name" placeholder="Name" class="mb-3">
				</b-form-input>
			</div>
			<div style="float:left; width: 80%;">
				<b-form-input type="text" v-model="mobile" placeholder="Mobile" class="mb-3">
				</b-form-input>
			</div>

        </template>

    </profile>
</template>

<script>
export default {
  data () {
    return {
		name : '',
		mobile: '',
      listTable: null,
      rowclick: (item, index, event) => {
        if (this.selectedRow != null && this.selectedRow.id === item.id) {
          this.$store.commit('dashClearSelection') 
		  this.$store.commit('dashRemoveShortlist', item.id)
        }
        else {
          this.$store.commit('dashSetSelected', item)
		  this.$store.commit('dashAddShortlist', item.id)
        }
      },
	  blinkenClass: (status) => { return [
		['blinken blinken0', 'blinken blinken1 blinken-fade', 'blinken blinken2 blinken-fade'],
		['blinken blinken0 blinken-fade', 'blinken blinken1', 'blinken blinken2 blinken-fade'],
		['blinken blinken0 blinken-fade', 'blinken blinken1 blinken-fade', 'blinken blinken2']
	  ][status || 0] }
    }
  },
  computed: {
	isEditor () { return this.$store.getters.isEditor },
	isAdmin () { return this.$store.getters.isAdmin },
	election() { return this.$store.getters.election },
	user() { return this.$store.getters.user },
	userElectionDetails() { return this.$store.getters.userElectionDetails },
    usersList() { return this.$store.getters.usersGetItems },
    items() { return this.$store.getters.storiesGetItems },
    users () { return this.$store.getters.usersGetIdMap },
    comments () { return this.$store.getters.commentsGetStoryIdMap },
    myranks() { return this.$store.getters.myranks},
    results() { return this.$store.getters.getResults},
    selectedRow() { return this.$store.getters.dashSelectedRow},
    scrollTop() { return this.$store.getters.dashScrollTop },
	networkTxnStatus() {return this.$store.getters.networkTxnStatus},
	filterSubmitterId: {
		get() {
			return this.$store.getters.dashListFilters.submitter_id
		},
		set(x) {
			this.$store.commit('dashSetFilter', {submitter_id : x })
		}
	},
	filterPattern: {
		get() {
			return this.$store.getters.dashListFilters.pattern
		},
		set(x) {
			this.$store.commit('dashSetFilter', {pattern : x })
		}
	},
	info() { return this.$store.getters.info }

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
	handleRankBtnClick: function (val) {
		console.log ('rank button clicked (dashboard)', val, this.$store)
		if (this.election.active && !(this.userElectionDetails.locked) && this.selectedRow.id !== 0) {
			this.$store.commit('dashHandleRankBtnClick', val)
		}
		else {
			if (this.myranks[val] != null) { 
            	this.$store.commit('dashRemoveFilters')
				setTimeout( () => {
					document.getElementById('row_' + this.myranks[val]).scrollIntoView()
				},0)
			}
		}
	},
	addRow: function() { 
		this.$store.commit('dashSetDetailRow', {id: null, attributes: { shortTitle: '', title : '', excerpt: '', url: '', image: '' } } )
		this.$store.commit('dashSetMode', 'detail')
		this.$store.commit ('dashSetDetailMode', 'edit')
		this.$store.commit ('dashSetDetailAction', 'storiesCreateRow')
	},
	showHelp: function() { 
		this.$store.commit('dashInfoSetProps', {
			cssclass: 'modal-fullscreen2',
			size: 'lg',
			okOnly: true,
			okTitle: 'OK',
			message: faqMessage()
		})
		this.$store.commit('dashSetInfoModalShow', true) 
	}
  },
  watch: {
    'scrollTop': function(newValue, oldValue)  {
      //console.log ('emitting schedule-scroll event:', newValue)
      this.listTable.scrollTop = this.scrollTop
    }
  },

  mounted () {

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
/*
	height: 65px;
*/
	border-bottom-color: rgba(0, 0, 0, 0.05);
	border-bottom-thickness: 1px;
	border-bottom-style: solid;
    padding: 0.0rem 1rem;

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

.info-bar {
	height: 12px;
	display: flex;
	justify-content: center;
	align-items: center;
}

.leaderboard-text {
	width: 55%;
	font-size: x-small;
	color: silver;
	display: flex;
	justify-content: flex-end;
}
.blinkenlights-container {
	width: 45%;
	display: flex;
	justify-content: flex-end;
}

.blinken {

	height: 8px;
	width: 8px;

}
.blinken0 {
	color: lime;

}
.blinken1 {
	color: orange;
}
.blinken2 {
	color: red;
}

.blinken-fade {
	opacity: 0.15
}
</style>
