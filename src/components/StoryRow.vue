<template>
  <b-container small :class="rowClass(item)">
    <b-row>
      <b-col cols="4"> 
        <b-img thumbnail rounded fluid-grow :src="item.attributes.image" class="story-image" >
      </b-col>
      <b-col class="story-title-container">
        <span class="story-title">
          {{ item.attributes.title || item.name}}
        <i class="fa fa-fw fa-question"></i>
        </span>
      </b-col>
    </b-row>
    <b-row>
      <b-col class="story-excerpt-container">
        <span class="story-excerpt">
          {{ item.attributes.excerpt }}
        </span>
      </b-col>
    </b-row>

    <b-row>
      <b-col>
        <rank-ui :item="item"> </rank-ui>
      </b-col>
    </b-row>
    <b-row>
      <b-col class="story-data-container">
        <span class="story-data">
          {{item.id}} 
          <b-link v-for="(url,idx) in makeArr(item.attributes.url)" :href="url" target="_blank">link{{idx}} &nbsp;&nbsp;</b-link>
        </span>
      </b-col>
      <b-col class="story-submitter-container">
        <span class="story-submitter">
          {{ users[item.submitter_id] != null ? users[item.submitter_id].name : 'xxx' }}
        </span>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>

export default {
  props: ['item'],
  data () {
    return {
      rowClass: (item) => {
        var result = ''
        if (this.selectedRow === item.id) {
          result = 'story-selected'
        }
        return result
      }
    }
  },
  computed: {
    selectedRow() { return this.$store.getters.storiesSelectedRow },
    users () { return this.$store.getters.usersGetIdMap },
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
  .story-selected {
  }
</style>
