<template>
  <div>
    <b-container small>
	  <br>
	  <b-row>
        <b-col class="close-button-container flex-left"> 
          <b-link href="#" @click="close" class="close-button"> <icon name="arrow-left" class="close-icon" /> </b-link> 
		</b-col>
	  </b-row>
	  <b-row>
		<b-col>
      		<rank-bar @rank-button-click="handleRankBtnClick"> </rank-bar>
		</b-col>
	  </b-row>
	  <br>
	  <br>
      <b-row>
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
                  id: {{row.id}} rank: {{'xx'}}
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
    row() { 
		console.log ('detail row:', this.$store.getters.dashDetailRow)
		return this.$store.getters.dashDetailRow 
	},
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
    },
	handleRankBtnClick: function(pos) {
		console.log ('rank button click in details', pos)
		this.$store.commit('dashSetSelected', this.row)
		this.$store.commit('dashHandleRankBtnClick', pos)
	}
  },
  mounted () { 
  }
}
</script>

<style scoped>
  .close-button-container{
  }
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
