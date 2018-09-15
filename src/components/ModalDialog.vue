<template>
    <b-modal v-model="showInfoModal" @ok="info.handler" @cancel="info.cancel" 
        :ok-title="info.okTitle" 
        :cancel-title="info.cancelTitle"
        :ok-only="info.okOnly"
    >
            {{info.message}}
    </b-modal>
</template>

<script>

export default {
  data () {
    return {
    }
  },
  props: [],
  computed: {
	info()  { return this.$store.getters.info },
	showInfoModal: { 
		get() { 
			//return this.$store.getters.dashShowInfoModal
			var ret = this.$store.getters.dashShowInfoModal
			console.log ('showInfoModal getter ret:', ret)
			return ret
		},
		set(x) { 
			//console.log ('showInfoModal setter', x)
			this.$store.commit('dashSetInfoModalShow', x) 
		}
	}
  },
  methods: {
  },

  mounted () {
	console.log ('dialog mounted')
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
