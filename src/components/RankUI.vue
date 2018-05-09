<template>
  <div class="rank-dialog-wrapper">
    <b-button-group class="ranking-bar">
       <b-button sm class="ranking-button" @click="goBottom">
          <icon name="angle-double-down"></icon>
        </b-button>
        <b-button sm class="ranking-button" @click="goFilterBottom" :disabled="filterClear">
          <icon name="angle-down"></icon>
        </b-button>
        <b-button sm class="ranking-button" @click="goDown">
          <div> -1 </div>
        </b-button>
        <b-button sm class="ranking-button" @click="goUp">
          <div> +1 </div>
        </b-button>
        <b-button sm class="ranking-button" @click="goFilterTop" :disabled="filterClear">
          <icon name="angle-up"></icon>
        </b-button>
        <b-button sm class="ranking-button" @click="goTop">
          <icon name="angle-double-up"></icon>
        </b-button>
    </b-button-group>
  </div>
</template>

<script>

export default {
  props: ['item'],
  data () {
    return {
      title: "Rank This Story",
      goUp: () => this.$store.commit('storiesMoveUp', item),
      goDown: () => this.$store.commit('storiesMoveDown', item),
      goFilterTop: () => this.$store.commit('storiesMoveFilterTop', item),
      goFilterBottom: () => this.$store.commit('storiesMoveFilterBottom', item),
      goTop: () => this.$store.commit('storiesMoveTop', item),
      goBottom: () => this.$store.commit('storiesMoveBottom', item),
    }
  },
  computed: {
    filterClear() { return this.$store.getters.storiesFilterIsClear},
  },
  methods: {
  },
  mounted () { 
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
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

</style>
