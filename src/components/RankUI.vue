<template>
  <div class="rank-dialog-wrapper">
    <b-modal id="rank-dialog" 
      ref="rank-dialog"  
      :title="title" 
      v-model="showRankUI" 
      @hidden="hidden"
      centered
      no-fade="true"
      modal-class="rank-modal"
    >
      <story-row :item="row()" showDetails="false">
      </story-row>

      <div slot="modal-footer" class="ranking-bar">
        <b-container>
          <b-row>
            <b-col>
              <icon name="angle-double-down"></icon>
            </b-col>
            <b-col>
              <icon name="angle-down"></icon>
            </b-col>
            <b-col>
              <div> -1 </div>
            </b-col>
            <b-col>
              <div> +1 </div>
            </b-col>
            <b-col>
              <icon name="angle-up"></icon>
            </b-col>
            <b-col>
              <icon name="angle-double-up"></icon>
            </b-col>
          </b-row>
        <b-container>
      </div>
    </b-modal>
  </div>
</template>

<script>

export default {
  data () {
    return {
      title: "Rank This Story",
      hidden: () => {
        this.$store.commit('storiesHideRankUI')
        this.$store.commit('storiesClearSelection')
      },
      row : () => {
        return this.stories != null && this.selIndex != null ? this.stories[this.selIndex] : { attributes: {}} 
      } 
    }
  },
  computed: {
    showRankUI() { return this.$store.getters.storiesShowRankUI },
    stories() { return this.$store.getters.storiesGetIdMap },
    selIndex() { return this.$store.getters.storiesSelectedRow },
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
    background-color: yellow;
  }
  .ranking-bar {
    width: 100%;
  }
</style>
