<template>
  <div class="rank-dialog-wrapper flex-perfect-center width100" v-if="selectedRow.id === row.id">
  <b-container :class="rankingBarClass" v-if="settings.domain === 'me'">
    <b-row class="width100">
      <b-col>
        <b-link v-if="favorites[row.id]" href="#" @click.stop="moveDown" class="rankbutton"> <icon name="caret-down" class="rankicon" /> </b-link> 
      </b-col>
      <b-col>
        <b-link href="#" @click.stop="toggleFavorite"> <icon name="star" :class="starClass"/> </b-link> 
      </b-col>
      <b-col>
        <b-link v-if="favorites[row.id]" href="#" @click.stop="moveUp" class="rankbutton"> <icon name="caret-up" class="rankicon"/> </b-link> 
      </b-col>
    </b-row>
    <b-row class="width100">
      <b-col>
      </b-col>
      <b-col>
        <!--
          <b-link href="#" @click="showMore" class="morebutton"> <icon name="ellipsis-h" class="moreicon"/> </b-link> 
        -->
        <br>
        <b-badge variant="primary">
          <b-link href="#" @click.stop="showMore" class="morebutton">more...</b-link>
        </b-badge>
      </b-col>
      <b-col>
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
    dashState() { return this.$store.getters.dashState},
    selectedRow() { return this.$store.getters.storiesSelectedRow},
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
      },
      showMore: function() {
        this.$store.commit('dashSetMode', 'detail')
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
    width: 40px;
    height: 40px;
  }
  .star-dim {
    color: gray;
  }
  .star-bright {
    color: gold;
  }
  .rankbutton {
  }
  .rankicon {
    width: 40px;
    height: 40px;
  }

  .morebutton {
    color: black;
  }
  .moreicon {
    width: 40px;
    height: 40px;
  }

  .story-data {
    font-size: x-small;
  }

</style>
