<template>
  <b-container small :class="rowClass(row)">
    <b-row>
      <b-col cols="4"> 
        <b-img thumbnail rounded fluid-grow :src="getImg(row.attributes.image)" class="story-image" >
      </b-col>
      <b-col class="story-title-container">
        <span class="story-title">
          {{ row.attributes.title || row.name}}
        <i class="fa fa-fw fa-question"></i>
        </span>
      </b-col>
    </b-row>
    <b-row>
      <b-col class="story-excerpt-container">
        <span class="story-excerpt">
          {{ row.attributes.excerpt }}
        </span>
      </b-col>
    </b-row>

    <b-row class="story-footer">
      <b-col class="story-data-container">
        <span class="story-data">
          <b-link v-for="(url,idx) in makeArr(row.attributes.url)" :href="url" target="_blank">link{{idx}} &nbsp;&nbsp;</b-link>
        </span>
      </b-col>
      <b-col cols="6">
        <rank-ui :row="row" :items="items" :settings="settings"> </rank-ui>
      </b-col>
      <b-col class="story-submitter-container">
        <span class="story-submitter">
          {{ users[row.submitter_id] != null ? users[row.submitter_id].name : 'xxx' }}
        </span>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>

export default {
  props: ['row', 'items', 'settings'],
  data () {
    return {
      rowClass: (row) => {
        var result = ''
        if (this.selectedRow === row.id) {
          result = 'story-selected'
        }
        return result
      },
      getImg: (url) => { return require('@/'+url) } 
    }
  },
  computed: {
    selectedRow() { return this.$store.getters.storiesSelectedRow },
    users () { return this.$store.getters.usersGetIdMap }
  },
  methods: {
    makeArr: (x) => { 
      return  x instanceof Array ? x : [x] 
    }
  },
  mounted () { 
  }
}
</script>

<style scoped>
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
  .story-footer {
    display: flex;
    align-items: center;
  }
  .story-selected {
  }
</style>
