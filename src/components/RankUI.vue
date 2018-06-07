<template>
  <div class="rank-dialog-wrapper flex-perfect-center width100" v-if="selectedRow === row.id">
  <b-container :class="rankingBarClass" v-if="settings.domain === 'me'">
    <b-row class="width100">
      <b-col>
        <b-link v-if="favorites[row.id]" href="#" @click="moveDown"> <icon name="caret-square-down" class="rbutton" /> </b-link> 
      </b-col>
      <b-col>
        <b-link href="#" @click="toggleFavorite"> <icon name="star" :class="starClass"/> </b-link> 
      </b-col>
      <b-col>
        <b-link v-if="favorites[row.id]" href="#" @click="moveUp"> <icon name="caret-square-up" class="rbutton"/> </b-link> 
      </b-col>
    </b-row>
  </b-container>

  </div>
</template>

<script>

export default {
  props: ['row', 'items', 'settings'],
  data () {
    return {
      title: "Rank This Story",
      moveUp: () => this.$store.dispatch('ranksMoveUpAction', {items: this.items, storyId: this.row.id}),
      moveDown: () => this.$store.dispatch('ranksMoveDownAction', {items: this.items, storyId: this.row.id}),
      moveInFav: () => this.$store.dispatch('ranksMoveInFavAction', {items: this.items, storyId: this.row.id}),
      moveOutFav: () => this.$store.dispatch('ranksMoveOutFavAction', {items: this.items, storyId: this.row.id}),
    }
  },
  computed: {
    selectedRow() { return this.$store.getters.storiesSelectedRow },
    filterClear() { return this.$store.getters.storiesFilterIsClear},
    starClass() { return this.favorites[this.row.id] ? 'star star-bright' : 'star star-dim' },
    rankingBarClass() { return this.settings.list === 'fav' && this.favorites[this.row.id] ? 'ranking-bar' : 'star-bar' },
    favorites() { return this.$store.getters.favorites},
    ranks () { return this.$store.getters.ranks},
    results() { return this.$store.getters.getResults }
  },
  methods: {
      toggleFavorite: function() {
        if (this.favorites[this.row.id]) { 
          this.$store.commit('storiesAnimateCircle')
          this.moveOutFav() 
        }
        else {
          this.$store.commit('storiesAnimateStar')
          this.moveInFav() 
        }
      }
  },
  mounted () { 
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .rank-dialog-wrapper {
    position: absolute;
    z-index: 10;
    height: 100px;
  }

  .ranking-bar {
  }

  .star-bar {
  }

  .star {
    width: 25px;
    height: 25px;
  }
  .star-dim {
    color: gray;
  }
  .star-bright {
    color: gold;
  }
  .rbutton {
    width: 25px;
    height: 25px;
  }
  .story-data {
    font-size: x-small;
  }

</style>
