<template>
  <b-container class="app-container">
    <b-row class="app-header">
      <b-navbar toggleable="sm" type="light" variant="faded" style="width: 100%">


        <b-navbar-brand href="#">
            <b-container style="width: 100%;">
            <b-row class="flex-perfect-center">
            <b-col>
            <img src="assets/logo.png" class="d-inline-block align-top tag-icon avatar" alt="WTF">
            </b-col>
            <b-col>
            <div class="flex-perfect-center">
              <icon name="star" class="star star-faded star-layer-1"/>
              <div class="star-layer-2 star-text"> {{ items.length }} </div>
            </div>
            </b-col>
            <b-col>
            <div class="flex-perfect-center">
              <icon name="star" class="star star-bright star-layer-1"/>
              <div class="star-layer-2 star-text"> 28 </div>
            </div>
            </b-col>
            <b-col>
            <div class="flex-perfect-center">
              <icon name="user" class="star star-layer-1"/>
            </div>
            </b-col>
            <b-col>
            <div class="flex-perfect-center">
              <icon name="globe" class="star star-layer-1"/>
            </div>
            </b-col>
            <b-col>
            </b-row>
            </b-container>
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
              <b-nav-item @click="submitterId=null;resetSubmitterFilter(null)">&nbsp;X</b-nav-item>
              </div>
              </div>
            </b-nav-item>
            <b-button variant="outline" size="sm" @click="doLogout"> Sign out </b-button>
          </b-navbar-nav>
        </b-collapse>
      </b-navbar>
    </b-row>

    <b-row class="app-content">
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
      fields: fields,
      submitterId: null,
      filterSubmitter: (sid) => {
        this.$store.commit('storiesSetFilter', {submitter_id : sid })
      },
      resetSubmitterFilter: () => {
        this.$store.commit('storiesSetFilter', {submitter_id : null })
      },
      rowclick: (item, index, event) => {
        //console.log('rowclick')
        this.$store.commit('storiesSetSelected', item.id)
      }
    }
  },
  computed: {
    usersList() { return this.$store.getters.usersGetItems },
    items() { return this.$store.getters.storiesGetItemsF },
    users () { return this.$store.getters.usersGetIdMap },
    stories () { return this.$store.getters.storiesGetIdMap },
    comments () { return this.$store.getters.commentsGetStoryIdMap },
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
        //console.log('i am here', res)
        return res.json()
      })
      .then( response => {
        window.location.href = '/'
      })
      .catch( err => {
        alert (err.message)
      })
    }
  },
  mounted () { 
    this.$store.dispatch('initData')
    .then(() => {
      //console.log('checking state stories', this.items)
      //console.log('checking state users', this.users)
      //console.log('checking state stories Id Map', this.stories)
    })
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
.flex-perfect-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.filter-bar {

}
.star {
  width: 30px;
  height: 30px;
}
.star-dim {
  color: khaki;
}
.star-bright {
  color: gold;
}
.star-faded {
  color: lightgray;
}

.star-layer-1 {
  position: absolute;
  z-index: 1;
}
.star-layer-2 {
  position: absolute;
  z-index: 2;
}
.star-text {
  font-size: small;
  margin-top: .2em;
}

</style>
