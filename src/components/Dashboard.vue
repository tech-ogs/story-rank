<template>
  <b-container class="app-container">
    <b-row class="app-header">
      <b-navbar toggleable="sm" type="light" variant="faded" style="width: 100%">


        <b-navbar-brand href="#">
          <span class="title-brand">
          <img src="assets/logo.png" class="d-inline-block align-top tag-icon avatar" alt="WTF">
          WTF stories &nbsp; &nbsp;
<!--
          <b-badge class="flex-perfect-center"> {{ items.length }} </b-badge>
-->
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
              <b-nav-item @click="submitterId=null;resetSubmitterFilter(null)">&nbsp;X</b-nav-item>
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
              <b-form-col>
              <b-form-radio-group id="btnradios2"
                  buttons
                  button-variant="outline"
                  size="md"
                  class="height100"
                  name="radioBtnOutline" >
                <b-form-radio value="1" class="inline-flex-perfect-center" style="border: 0px;">
                  &nbsp;
                  <div class="inline-flex-perfect-center">
                    <icon name="circle" class="square30 star-faded stack-layer-1"/>
                    <div class="stack-layer-2 icon-text"> {{ items.length }} </div>
                  </div>
                  &nbsp;
                </b-form-radio>
                <b-form-radio value="2" class="inline-flex-perfect-center" style="border: 0px;">
                  &nbsp;
                  <div class="inline-flex-perfect-center">
                    <icon name="star" class="square30 star-bright stack-layer-1"/>
                    <div class="stack-layer-2 icon-text"> 28 </div>
                  </div>
                  &nbsp;
                </b-form-radio>
              </b-form-radio-group>
              </b-form-col>
              <b-form-col>
              <b-form-radio-group id="btnradios2"
                  buttons
                  button-variant="outline-primary"
                  size="md"
                  name="radioBtnOutline" >
                <b-form-radio value="3" class="flex-perfect-center">
                  Me
                </b-form-radio>
                <b-form-radio value="4" class="flex-perfect-center">
                  All
                </b-form-radio>
              </b-form-radio-group>
              </b-form-col>
            </b-form-row>
          </b-nav-form>
        </b-navbar-nav>
      </b-navbar>

<!--
        <b-container>
          <b-row>
            <b-col class="flex-perfect-center">
            <div class="flex-perfect-center">
              <icon name="circle" class="square50 star-faded stack-layer-1"/>
              <div class="stack-layer-2 icon-text"> {{ items.length }} </div>
            </div>
            </b-col>
            <b-col class="flex-perfect-center">
            <div class="flex-perfect-center">
              <icon name="star" class="square50 star-bright stack-layer-1"/>
              <div class="stack-layer-2 icon-text"> 28 </div>
            </div>
            </b-col>
            <b-col>
            <div class="flex-perfect-center">
              <icon name="user" class="square30"/>
            </div>
            </b-col>
            <b-col>
            <div class="flex-perfect-center">
              <icon name="globe" class="square30"/>
            </div>
            </b-col>
          </b-row>
        </b-container>
-->
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

.filter-bar {

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

.icon-text {
  font-size: small;
  font-weight: bold;
  margin-top: .2em;
}

</style>
