<template>
  <b-container class="app-container">
    <b-row class="app-header">
	  <banner :helpText="helpText">
		<template slot="banner-menu">
          <b-navbar-nav class="ml-auto">
            <b-button v-if="isAdmin" size="sm" @click="admin"> <b>MANAGE</b> </b-button>
			<br>
            <b-button  size="sm" @click="profile"> <b>PROFILE</b> </b-button>
			<br>
            <b-nav-item>
              <div>

              <div style="float:left; width: 80%;">
              <b-form-select v-model="filterSubmitterId"  class="mb-3">
                <option v-for="user in usersList" :key="user.id" :value="user.id">{{user.login}}</option>
              </b-form-select>
              </div>
              <div style="float:left;">
              <b-nav-item @click="filterSubmitterId = null">
              &nbsp;&nbsp;X
              &nbsp;&nbsp;<!-- <b-badge class="flex-perfect-center"> {{ items != null ? items.length : 0 }} </b-badge> -->
              </b-nav-item>
              </div>

              <div style="float:left; width: 80%;">
              <b-form-input type="text" v-model="filterPattern" placeholder="Search text" class="mb-3">
              </b-form-input>
              </div>
              <div style="float:left;">
              <b-nav-item @click="filterPattern = null">
              &nbsp;&nbsp;X
              &nbsp;&nbsp;<!-- <b-badge class="flex-perfect-center"> {{ items != null ? items.length : 0 }} </b-badge> -->
              </b-nav-item>
              </div>
              </div>
            </b-nav-item>
			<br>
            <b-button size="sm" @click="doLogout"> <b>SIGN OUT</b> </b-button>
          </b-navbar-nav>
		</template>
	  </banner>
      <rank-bar @rank-button-click="handleRankBtnClick"> </rank-bar>

    </b-row>
	<b-row class="app-header">
		<b-col>
		<div class="info-bar">
		<div class="leaderboard-text">Leaderboard</div>
		<div class="blinkenlights-container">
			<span class="blinkenlights">  
				<icon name="square" :class="blinkenClass(networkTxnStatus)[0]" /> 
				<icon name="square" :class="blinkenClass(networkTxnStatus)[1]" /> 
				<icon name="square" :class="blinkenClass(networkTxnStatus)[2]" /> 
			</span> 
		</div>
		</div>
		</b-col>
	</b-row>
    <b-row class="app-content" ref="list">
      <b-col>
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

function faqMessage() {
var result = `
Frequently Asked Questions
<br><br>
1.	What is the full form of WTF? 

<br><br>
Fellow WIMWIans, you belong to the pioneering batch of 1989. If you cannot crack this simple acronym, we cannot help you. In fact, if you let us know your name, we shall actively send death threats to you. No, nada, nyet, nein, non, nahin, you will never get to know this from us.
<br><br>
2.	Do you really have so much time on your hands that you do all this? 

<br><br>
Yes. We do.
<br><br>
3.	Now that I am here what am I supposed to do?

<br><br>
Good. 
<br>
Have you registered on the site? If YES skip point a) below and go to point b) 
<br>
				  If NO go to point a)
<br>
a) First register on the app. Go to www.story-rank.com. Please enter a username that you like and most important that you can remember, post that press the Register/Reset button and send the string generated "userid:XXXX" to Kavi privately on Whatsapp. Kavi will activate your account.
<br>
b) Login to www.story-rank.com using your own id and password. You can then type a password in and mess with the stories and become part of the glorious sisterhood of guinea pigs.
<br>
c) Stories will appear in a random order for each voter. This order shall remain stable. You are faced with a lot of choices given the high amount of CP our batch is capable of. Therefore, just keep selecting stories that catch your fancy by clicking on them. These will go into a shortlist and that has a counter. 
<br>
d) If you want to read the story at length from its original source, click on the picture that accompanies the story. It will take you to the original video, photo or newsfeed from where the story was sourced.  
<br>
e) Once you have shortlisted the lot, you can at your leisure but before the cutoff date decide to rank them. If you think a story submitted deserves a rank hit the appropriate rank button. Do NOT I repeat DO NOT hit the submit button. That is like a nuclear option for future use.
<br>
f) Once you have selected the three ranks, take a deep breath because you can still retreat from this position. If you think you want to change just go to the story you wish to upgrade and select the appropriate rank. 
<br>
g) Now you are ready to use your nuclear option the submit button. Once you hit this button, this wonderful app will record your vote and will not allow you to do anything further. 
<br>
<br>
4.	What is the process you guys follow on ranking? 

<br><br>
We follow the same system that is used to select the Indian President. 

<br><br>
5.	When you say I have to rank, do I press the buttons that have 1,2, 3 written on it or the little red blue green buttons that my fat fingers have major problems reaching?
<br><br>
Please press buttons with 1, 2, 3 written on them. Please ignore the coloured buttons. We have put those buttons for aliens with tiny digits.
<br><br>
6.	Do you guys really have nothing better to do?
<br><br>
No.
<br><br>
7.	I have ranked the stories but I have not submitted the ranking. I have suddenly seen a story that is a true wtf. What do I do?
<br><br>
First, thank you for not pressing the submit button because then we cannot help you. Second, select the story by clicking on it and press the rank you wish to elevate it to. The existing story will be replaced by the new story. 
<br><br>
8.	I want to add this wonderful life saving app to my home screen. How do I do that?
<br><br>
First determine if your cellphone has an iOS or Android as your operating system. If it is Kaizen we still have not released on that yet so you may not be able to see it on your cellphone. 
<br><br>
For Android
<br>
 Click on the 3 vertical dots on the right hand top corner of your screen. There is a drop down menu there. It has an option to add to the home screen. Please do so. Voila!
<br><br>
For iOS
<br>
At the bottom of the screen you'll see the sharing icon depicting an arrow that looks like it's trying to get away from a square. Tap this button.
<br>
Scroll to the right to find the + sign option that says: "Add to Home Screen". Tap that
<br>
Hit done. Voila!
`
return result

}
export default {
  data () {
    return {
	  helpText: faqMessage(),
      listTable: null,
      fields: fields,
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
	admin: function() {
		this.$store.commit('dashSetMode', 'admin')
	},
	profile: function() { 
		this.$store.commit('dashSetMode', 'profile')
	}
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
