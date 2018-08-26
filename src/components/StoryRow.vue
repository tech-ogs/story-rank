<template>
  <b-container small>
		<b-row>
			<b-col>
				<b-row :class="rowClass(row)">
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

				<b-row class="story-footer">
					<b-col class="story-submitter-container">
						<span class="story-submitter">
							<!-- [{{row.id}}] -->
							{{ users[row.submitter_id] != null ? users[row.submitter_id].name : 'xxx' }}
						</span>
					</b-col>
				</b-row>
			</b-col>
			<b-col cols="2" class="rank-button-bar">
				<div class="rank-button-container">
					<b-button class="rank-button" variant="link" size="sm">
						<b-badge class="rank-badge" variant="secondary">1</b-badge>
						<span class="rank-score"> 15 </span>
					</b-button>
				</div>
				<div class="rank-button-container">
					<b-button class="rank-button" variant="link" size="sm">
						<b-badge class="rank-badge" variant="secondary">2</b-badge>
						<span class="rank-score"> 22 </span>
					</b-button>
				</div>
				<div class="rank-button-container">
					<b-button class="rank-button" variant="link" size="sm">
						<b-badge class="rank-badge" variant="secondary">3</b-badge>
						<span class="rank-score"> 34 </span>
					</b-button>
				</div>
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
        var result = 'story-row'
        if (this.selectedRow.id === row.id) {
          result += ' story-selected'
        }
        return result
      },
      getImg: (url) => { return require('@/'+url) } 
    }
  },
  computed: {
    selectedRow() { return this.$store.getters.storiesSelectedRow },
    ranks () { return this.$store.getters.ranks},
    results() { return this.$store.getters.getResults },
    users () { return this.$store.getters.usersGetIdMap },
    favorites() { return this.$store.getters.favorites}
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
  .story-row {
    height:100px; 
    overflow: hidden;
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

  .story-footer {
    height: 20px;
    display: flex;
    align-items: center;
  }

  .story-data-container {
    text-align: left;
  }

  .story-data {
    font-size: x-small;
  }

  .footer-star {
    height: 10px;
    width: 10px;
    color: gold;
  }
  .story-submitter-container {
    display: inline-flex;
    white-space: nowrap;
    text-align: left;
    text-overflow: ellipsis;
  }

  .story-submitter {
    font-size: x-small;
    width: 100%;
  }

  .rank-button-bar {
		display: flex;
		flex-direction: column;
		justify-content: space-around;
	}
	
	.rank-button-container {
	}
	.rank-badge {
	}
	.rank-score {
		font-size: x-small;
	}

  .story-selected {
  }
</style>
