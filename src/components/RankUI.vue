<template>
  <div class="rank-dialog-wrapper">
  <b-container class="width100">

  <span :class="rankingBarClass">
        <b-link v-if="settings.list === 'fav' && favorites[row.id]" href="#" @click="moveDown"> <icon name="arrow-down" /> </b-link> 
        <b-link href="#" @click="toggleFavorite"> <icon name="star" :class="starClass"/> </b-link> 
        <b-link v-if="settings.list === 'fav' && favorites[row.id]" href="#" @click="moveUp"> <icon name="arrow-up" /> </b-link> 
  </span>
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
      moveTop: () => this.$store.dispatch('ranksMoveTopAction', {items: this.items, storyId: this.row.id}),
      moveBottom: () => this.$store.dispatch('ranksMoveBottomAction', {items: this.items, storyId: this.row.id}),
    }
  },
  computed: {
    filterClear() { return this.$store.getters.storiesFilterIsClear},
    starClass() { return this.favorites[this.row.id] ? 'star star-bright' : 'star star-dim' },
    rankingBarClass() { return this.settings.list === 'fav' && this.favorites[this.row.id] ? 'ranking-bar' : 'star-bar' },
    favorites() { return this.$store.getters.favorites}
  },
  methods: {
      toggleFavorite: function() {
        if (this.favorites[this.row.id]) { 
          this.$store.commit('storiesAnimateCircle')
          this.moveBottom() 
        }
        else {
          this.$store.commit('storiesAnimateStar')
          this.moveTop() 
        }
      }
  },
  mounted () { 
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .ranking-bar {
    display: flex;
    width: 100%;
    justify-content: space-between;
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
</style>
