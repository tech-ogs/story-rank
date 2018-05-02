<template>
  <b-container class="app-container">
    <b-row class="app-header">

      <b-col>
        <img src="assets/logo.png" class="tag-icon avatar">
      </b-col>
      <b-col class="title" cols="8"> 
        <span> WTF stories </span>
      </b-col>
    </b-row>
    <b-row class="app-content">
      <b-col>
        <b-table striped small :items="items" :fields="fields">
          <template slot="content" slot-scope="data">
            <b-container small>
              <b-row>
                <b-col cols="4"> 
                  <b-img-lazy thumbnail rounded fluid-grow :src="data.item.attributes.image" class="story-image" >
                </b-col>
                <b-col class="story-title-container">
                  <span class="story-title">
                    {{ data.item.attributes.title || data.item.name}}
                  </span>
                </b-col>
              </b-row>
              <b-row>
                <b-col class="story-excerpt-container">
                  <span class="story-excerpt">
                    {{ data.item.attributes.excerpt }}
                  </span>
                </b-col>
              </b-row>
              <b-row>
                <b-col class="story-data-container">
                  <span class="story-data">
                    {{data.item.id}} 
                    <b-link v-for="(url,idx) in makeArr(data.item.attributes.url)" :href="url" target="_blank">link{{idx}} &nbsp;&nbsp;</b-link>
                  </span>
                </b-col>
                <b-col class="story-submitter-container">
                  <span class="story-submitter">
                    {{ users[data.item.submitter_id] != null ? users[data.item.submitter_id].name : 'xxx' }}
                  </span>
                </b-col>
              </b-row>

            </div>
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
  name: 'HelloWorld',
  data () {
    return {
      submitters: this.users,
      fields: fields
    }
  },
  computed: {
    users() { return this.$store.getters.usersGetItems },
    items() { return this.$store.getters.storiesGetItems },
    users () { return this.$store.getters.usersGetIdMap },
    comments () { return this.$store.getters.commentsGetStoryIdMap },
    name () { return (row) => { return row != null ? row.name : 'x' }}
  },
  methods: {
    makeArr: (x) => { 
      return  x instanceof Array ? x : [x] 
    }
  },
  mounted () { 
    this.$store.dispatch('initData')
    .then(() => {
      console.log('checking state stories', this.items)
      console.log('checking state users', this.users)
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
  overflow-y: auto;
}

.app-footer {
  flex: 0 0 auto;
}

.tag-icon {
  height: 50px;
  width: 50px;
}
.title {
  font-size: xx-large;
  display: flex;
  align-items: center;
  justify-content: center;
}
.story-image {
/*
  height: 100px;
  width: 100px;
*/
  float: left;
}
.story-title-container {
  text-align: left;
}

.story-title {
  font-weight: bold;
}

.story-excerpt-container {
  text-align: left;
}

.story-excerpt {
}

.story-data-container {
  text-align: left;
}

.story-data {
  font-size: x-small;
}

.story-submitter-container {
  text-align: right;
}

.story-submitter {
  font-size: x-small;
}


</style>
