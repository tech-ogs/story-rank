<template>
  <b-container small ref="trow">
		<b-row :class="rowClass(row)" v-touch:swipe.left="swipeHandler"  v-touch:swipe.right="swipeHandler">
					<b-col cols="4"> 
						<b-img thumbnail rounded fluid-grow :src="getImg(row.attributes.image)" class="story-image" @click.stop="handleThumbClick(row.attributes.url)"> </b-img>
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
							  [{{row.id}}] 
            {{ users[row.submitter_id] != null ? (users[row.submitter_id].name != null ? users[row.submitter_id].name : users[row.submitter_id].login) : 'xxx' }}
						</span>
					</b-col>
					<b-col class="story-shortlist-container">
						<span class="story-shortlist-marker" v-if="shortlist.indexOf(row.id) >= 0">
          					<icon name="star" class="shortlist-icon" />
						</span>
					</b-col>
				</b-row>
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
      getImg: (url) => { 
        //return url != null ? require('@/'+url) : require ('@/assets/thumbs/placeholder.jpg')
        return url != null ? url : '/assets/thumbs/placeholder.jpg'
      } 
    }
  },
  computed: {
    selectedRow() { return this.$store.getters.dashSelectedRow },
    ranks () { return this.$store.getters.ranks},
    results() { return this.$store.getters.getResults },
    users () { return this.$store.getters.usersGetIdMap },
    shortlist() { return this.$store.getters.shortlist }
  },
  methods: {
    makeArr: (x) => { 
      return  x instanceof Array ? x : [x] 
    },
	swipeHandler (id)  {
		console.log ('swipe handler in row', this.row)
		this.$store.commit('dashSetDetailRow', this.row)
		this.$store.commit('dashSetMode', 'detail')
	},
	handleThumbClick:  (url) => {
		console.log ('handleThumbClick: ', 	url)
  		var win = window.open(url, '_blank');
  		win.focus();
	}
  },
  mounted () { 
	this.$refs.trow.setAttribute('id',  "row_" + this.row.id)
  },
  watch: {
	/* the watch is required to accommodate the reshuffle done for individuals. This watch is expected to be triggered just once for each row after load */
    'row': function(newValue, oldValue)  {
		//console.log ('row changed:', oldValue.id, newValue.id, this.row.id)
		this.$refs.trow.setAttribute('id',  "row_" + this.row.id)
    }
  },

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

  .story-selected {
    background-color: gold;
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
  .shortlist-icon {
	/*color: #007bff;*/
	color:gold;
  }

</style>
