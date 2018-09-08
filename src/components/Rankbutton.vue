<template>
    <b-nav-item class=""  @click="handleClick">
		<div v-if="itemsById[myranks[pos]] != null">
		<b-img  
			thumbnail rounded fluid rounded="circle" 
			class="rank-button-image" 
			:src="getImg(itemsById[myranks[pos]].attributes.image)"
		> 
		</b-img>
    	<br>
    	{{ itemsById[myranks[pos]].attributes.shortTitle }}
		</div>
		<div v-else class="">
			<div class="rank-button-placeholder flex-perfect-center"> {{ pos + 1 }} 
			</div>
		</div>
    </b-nav-item>

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
    }
  },
  props: ['pos'],
  computed: {
    itemsById() { 
		return this.$store.getters.storiesGetIdMap
    },
    myranks () {
        return this.$store.getters.myranks
    }
  },
  methods: {
      getImg: (url) => { 
        // return url != null ? require('@/'+url) : require('@/assets/thumbs/placeholder.jpg')
        return url != null ? url : '/assets/thumbs/placeholder.jpg'
      },

      handleClick: function () { 
		this.$emit('rank-button-click', this.pos)
      }
  },

  mounted () {
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .rank-button-image{
        display: inline-flex;
        align: top;
        height: 80px;
        width: 80px;            
    }
	.rank-button-placeholder{
		font-size: x-large;
        display: inline-flex;
        align: top;
        height: 80px;
        width: 80px;
		-moz-border-radius: 40px; 
		-webkit-border-radius: 40px; 
		border-radius: 40px;
		background-color: gold;
	}
</style>
