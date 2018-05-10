<template>
  <div class="rank-dialog-wrapper">
<!--
    <b-button-group class="ranking-bar">
       <b-button sm class="ranking-button" @click="moveBottom">
          <icon name="angle-double-down"></icon>
        </b-button>
        <b-button sm class="ranking-button" @click="moveDown">
          <div> -1 </div>
        </b-button>
        <b-button sm class="ranking-button" @click="moveUp">
          <div> +1 </div>
        </b-button>
        <b-button sm class="ranking-button" @click="moveTop">
          <icon name="angle-double-up"></icon>
        </b-button>
    </b-button-group>
-->
  <icon name="star" :class="starClass"> </star>
  </div>
</template>

<script>

export default {
  props: ['row', 'items'],
  data () {
    return {
      title: "Rank This Story",
      moveUp: () => this.$store.commit('ranksMoveUp', {items: this.items, storyId: this.row.id}),
      moveDown: () => this.$store.commit('ranksMoveDown', {items: this.items, storyId: this.row.id}),
      moveTop: () => this.$store.commit('ranksMoveTop', {items: this.items, storyId: this.row.id}),
      moveBottom: () => this.$store.commit('ranksMoveBottom', {items: this.items, storyId: this.row.id}),
    }
  },
  computed: {
    filterClear() { return this.$store.getters.storiesFilterIsClear},
    starClass() { return this.row.favorite ? 'star star-bright' : 'star star-dim' }
  },
  methods: {
  },
  mounted () { 
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
/*
  .rank-dialog-wrapper {
    width: 100%;
  }
  .ranking-bar {
    width: 100%;
  }
  .ranking-button {
    width: 100%;
    border-thickness: 1px;
    border-color: white;
    border-style: solid;
  }
*/
  .star {
    width: 25px;
    height: 25px;
  }
  .star-dim {
    color: khaki;
  }
  .star-bright {
    color: gold;
  }
</style>
