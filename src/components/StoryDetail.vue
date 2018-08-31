<template>
  <div>
    <b-container small>

      <b-row>
        <b-col cols="1"> 
          <br>
          <b-link href="#" @click="close" class="close-button"> <icon name="arrow-left" class="close-icon" /> </b-link> 
          <br><br>
        </b-col>
        <b-col class="story-title-container">
        </b-col>
      </b-row>

      <b-row>
        <b-col cols="4"> 
          <b-img thumbnail rounded fluid-grow :src="getImg(row.attributes.image)" class="story-image" > </b-img>
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
            <b-link v-for="(url,idx) in makeArr(row.attributes.url)" :key="idx" :href="url" target="_blank">link{{idx}} &nbsp;&nbsp;</b-link>
          </span>
          <br>
          <span class="story-data">
                  id: {{row.id}} me: {{ranks[row.id]}} all: <b>{{ results.ranks.indexOf(row.id) >= 0 ? results.ranks.indexOf(row.id) +1 : 'x' }}</b> lead: {{ typeof results.leads[results.ranks.indexOf(row.id)] !== 'undefined' ? results.leads[results.ranks.indexOf(row.id)] : 'x' }}
          </span>
        </b-col>
        <b-col class="story-submitter-container">
          <span class="story-submitter">
            {{ users[row.submitter_id] != null ? users[row.submitter_id].name : 'xxx' }}
          </span>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>

export default {
  props: [],
  data () {
    return {
      getImg: (url) => { 
        return url != null ? require('@/'+url) : null } 
    }
  },
  computed: {
    row() { return this.$store.getters.dashSelectedRow},
    ranks () { return this.$store.getters.ranks},
    results() { return this.$store.getters.getResults },
    users () { return this.$store.getters.usersGetIdMap }
  },
  methods: {
    makeArr: (x) => { 
      return  x instanceof Array ? x : [x] 
    },
    close: function() {
      this.$store.commit('dashSetMode', 'list')
    }
  },
  mounted () { 
  }
}
</script>

<style scoped>
  .close-button {
    color: black;
  }
  .close-icon {
    height: 25px;
    width: 25px;
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
</style>
