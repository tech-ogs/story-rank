<template>
  <b-container class="app-container">
    <b-row class="app-header">
      <b-navbar toggleable="sm" type="light" variant="faded" style="width: 100%">


        <b-navbar-brand href="#">
          <span class="title-brand">
          <img src="assets/logo.png" class="d-inline-block align-top tag-icon avatar" alt="WTF">
          WTF stories &nbsp; &nbsp;
          </span>
        </b-navbar-brand>

        
        <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>

        <b-collapse is-nav id="nav_collapse">
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
              &nbsp;&nbsp;<b-badge class="flex-perfect-center"> {{ items.length }} </b-badge>
              </b-nav-item>
              </div>
              </div>
            </b-nav-item>
            <b-button variant="outline" size="sm" @click="doLogout"> Sign out </b-button>
          </b-navbar-nav>
        </b-collapse>
      </b-navbar>

      <b-navbar class="width100">
        <b-navbar-nav class="width100">
          <b-nav-form  class="width100">
            <b-form-row  class="width100 flex-left-right">
              <b-form-radio-group id="btnradios1"
                  buttons
                  button-variant="link"
                  size="md"
                  class="height100"
                  v-model="settings.list"
                  name="radioBtnOutline1" >
                <b-form-radio value="full" class="inline-flex-perfect-center icon-button" :disabled="settings.domain === 'all'">
                  &nbsp;
                  <div class="inline-flex-perfect-center">
                    <icon name="circle" :class="circleClass()"/>
                    <div class="stack-layer-2 icon-text"> {{ stories.length - favlength }} </div>
                  </div>
                  &nbsp;
                </b-form-radio>
                <b-form-radio value="fav" class="inline-flex-perfect-center icon-button" :disabled="settings.domain === 'all'">
                  &nbsp;
                  <div class="inline-flex-perfect-center" @click="scrollToTop">
                    <icon name="star" :class="starClass()"/>
                    <div class="stack-layer-2 icon-text"> {{ favlength }} </div>
                  </div>
                  &nbsp;
                </b-form-radio>
              </b-form-radio-group>
              <b-form-radio-group id="btnradios2"
                  buttons
                  button-variant="outline-primary"
                  size="md"
                  v-model="settings.domain"
                  name="radioBtnOutline2" >
                <b-form-radio value="all" class="flex-perfect-center">
                  All
                </b-form-radio>
                <b-form-radio value="me" class="flex-perfect-center">
                  Me
                </b-form-radio>
              </b-form-radio-group>
            </b-form-row>
          </b-nav-form>
        </b-navbar-nav>
      </b-navbar>

    </b-row>
    <b-row class="app-content" ref="list">
      <b-col>
        <b-table striped small :items="items" :fields="fields" @row-clicked="rowclick">
          <template slot="content" slot-scope="data">
            <story-row :row="data.item" :items="items" :settings="settings">
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
      settings : {
        list: 'full', 
        domain : 'me'
      },
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
          this.$store.commit('storiesSetSelected', null) 
        }
        else {
          this.$store.commit('storiesSetSelected', item)
        }
      },
      starClass: () => {
        //console.log('animateStar: ', this.animateStar)
        var ret = 'star-bright stack-layer-1'
        ret += this.animateStar ? ' star-animation' : ' square30'
        //console.log('starClass: ', ret)
        return ret
      },
      circleClass: () => {
        //console.log('animateCircle: ', this.animateCircle)
        var ret = 'circle-faded stack-layer-1'
        ret += this.animateCircle ? ' circle-animation' : ' square30'
        //console.log('circleClass: ', ret)
        return ret
      }
    }
  },
  computed: {
    usersList() { return this.$store.getters.usersGetItems },
    items() { return {
                me : this.$store.getters.storiesGetItems,
                all: this.$store.getters.storiesGetAllResults
              }[this.settings.domain]
            },
    users () { return this.$store.getters.usersGetIdMap },
    stories () { return this.$store.getters.storiesGetIdMap },
    comments () { return this.$store.getters.commentsGetStoryIdMap },
    stories () { return this.$store.getters.storiesGetItems },
    ranks() { return this.$store.getters.ranks},
    favorites() { return this.$store.getters.favorites},
    results() { return this.$store.getters.getResults},
    favlength() { return this.$store.getters.numFavorites},
    animateStar() { return this.$store.getters.storiesGetAnimateStar},
    animateCircle() { return this.$store.getters.storiesGetAnimateCircle},
    selectedRow() { return this.$store.getters.storiesSelectedRow},
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
        //console.log('scroll evt:', _this.listTable.scrollTop)
        _this.$store.commit('dashSetScrollTop', _this.listTable.scrollTop)
      }
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
      var socket = window.io();
      console.log('Dashboard socket:', socket)
      this.$store.dispatch('initStore', {socket: socket})
      .then(() => {
        //console.log('checking state stories', this.items)
        //console.log('checking state users', this.users)
        //console.log('checking state stories Id Map', this.stories)
        //console.log('checking state ranks', this.ranks)
        //console.log('checking state favorites', this.favorites)
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

.tag-icon {
  height: 50px;
  width: 50px;
}
.title-brand {
  display: flex;
  align-items: center;
  /*justify-content: center;*/
}

.icon-button {
  color:black;
}

.icon-button.active {
  color:black;
}

.icon-button.active .stack-layer-1{
  /* border-bottom: 2px outset red; */
}


.star-dim {
  color: khaki;
}
.star-bright {
  color: gold;
}
.star-animation {
  animation-name: pulse;
  animation-duration: .5s;
}

.circle-faded {
  color: lightgray;
}

.circle-animation {
  animation-name: pulse;
  animation-duration: .5s;
}

@keyframes pulse {
    0%   {height: 35px; width: 35px}
    25%   {height: 37px; width: 37px}
    50%   {height: 40px; width: 40px}
    100%   {height: 40px; width: 40px}
}

.icon-text {
  font-size: small;
  font-weight: bold;
  margin-top: .2em;
}

.flip-list-move {
  transition: transform 1s;
}
</style>
