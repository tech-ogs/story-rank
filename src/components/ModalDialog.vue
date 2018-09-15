<template>
    <b-modal v-model="showInfoModal" @ok="info.handler" @cancel="info.cancel" 
        :ok-title="info.okTitle" 
        :cancel-title="info.cancelTitle"
        :ok-only="info.okOnly"
		:class="info.cssclass"
		:size="info.size"
    >
	<div v-html="info.message" class="message-container">
	</div>
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
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.modal-fullscreen1 .modal {
    padding: 0 !important;
}
.modal-fullscreen1 .modal-dialog {
    max-width: 100%;
    height: 100%;
    margin: 0;
}
.modal-fullscreen1 .modal-content {
    border: 0;
    border-radius: 0;
    min-height: 100%;
    height: auto;
}

.modal-fullscreen2  .modal {
    padding: 0 !important;
}
.modal-fullscreen2 .modal-dialog {
    max-width: 100%;
    height: 100%;
    margin: 0;
}
.modal-fullscreen2 .modal-content {
    width: calc(100% - 2rem);
    min-height: 100%;
    height: auto;
    margin: 1rem;
}

.message-container {
	text-align: left;
}
</style>
