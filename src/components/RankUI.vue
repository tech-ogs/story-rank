<template>
  <div class="rank-dialog-wrapper">
  <span :class="rankingBarClass" v-if="settings.domain === 'me'">
        <b-link v-if="settings.list === 'fav' && favorites[row.id]" href="#" @click="moveDown"> <icon name="arrow-down" /> </b-link> 
        <b-link href="#" @click="toggleFavorite"> <icon name="star" :class="starClass"/> </b-link> 
        <b-link v-if="settings.list === 'fav' && favorites[row.id]" href="#" @click="moveUp"> <icon name="arrow-up" /> </b-link> 
  </span>
  <br>
  <span class="story-data">
          id: {{row.id}} me: {{ranks[row.id]}} all: <b>{{ results.ranks.indexOf(row.id) >= 0 ? results.ranks.indexOf(row.id) +1 : 'x' }}</b> lead: {{ typeof results.leads[results.ranks.indexOf(row.id)] !== 'undefined' ? results.leads[results.ranks.indexOf(row.id)] : 'x' }}

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
    favorites() { return this.$store.getters.favorites},
    ranks () { return this.$store.getters.ranks},
    results() { return this.$store.getters.getResults }
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
  .story-data {
    font-size: x-small;
  }

</style>
