<template>
    <detail :viewMode="view.mode">

        <template slot="detail-menu">
			<admin-menu v-if="moduleName === 'admin'"> </admin-menu>
			<profile-menu v-else> </profile-menu>
        </template>

        <template slot="detail-form">
		  <div>
			<b-form @submit="" @reset="">
				<b-form-group id="grpName"
							horizontal
							label="Name"
							label-text-align="left"
							label-for="name">
					<b-form-input id="name"></b-form-input>
  				</b-form-group>
				<b-form-group id="grpStart"
							horizontal
							label="Start"
							label-text-align="left"
							label-for="start-date">
					<b-form-input id="start-date"></b-form-input>
  				</b-form-group>
				<b-form-group id="grpEnd"
							horizontal
							label="End"
							label-text-align="left"
							label-for="end-date">
					<b-form-input id="end-date"></b-form-input>
  				</b-form-group>
				<b-form-group id="grpIcon"
							horizontal
							label="Icon"
							label-text-align="left"
							label-for="icon">
						<b-form-file v-model="imageFile" state="true" name="imgfile"
							@change="fileChange($event.target.name, $event.target.files)"
							accept="image/jpeg, image/png, image/gif"
							placeholder="Election Icon Image" >
			   			</b-form-file>
				</b-form-group>

				<b-form-group id="grpRecalc"
							horizontal
							label="Show Results"
							label-text-align="left"
							label-for="recalc-policy">
							<b-form-checkbox id="recalc"
								v-model="editRow.attributes.recalc"
							>
							  Calculate and show results during elections
							</b-form-checkbox>
  				</b-form-group>

				<b-form-group id="grpAlgorithm"
							horizontal
							label="Algorithm"
							label-text-align="left"
							label-for="recalc-policy">
    						<b-form-select  v-model="editRow.attributes.algorithm" :options="algOptions" class="mb-3" />

  				</b-form-group>

			</b-form>
		  </div>
        </template>

    </detail>
</template>

<script>
export default {
  data () {
    return {
		imageFile: null,
		algorithm: 'rcv',
		algOptions: [
			{value: 'rcv', text: 'Ranked Choice'},
			{value: 'fptp', text: 'First Past The Post'}
		]
    }
  },
  computed: {
    row() { 
		return this.$store.getters.dashDetailRow 
	},
	isEditor () { return this.$store.getters.isEditor },
	isAdmin () { return this.$store.getters.isAdmin },
	election() { return this.$store.getters.election },
	user() { return this.$store.getters.user },
	userElectionDetails() { return this.$store.getters.userElectionDetails },
    usersList() { return this.$store.getters.usersGetItems },
	info() { return this.$store.getters.info },
	view() { return this.$store.getters.view },
	moduleName() { return this.$store.getters.moduleName}

  },
  methods: {
	fileChange: () => {}
  },
  watch: {
  },
  created () {
	this.editRow = JSON.parse(JSON.stringify(this.election))
	this.editRow.attributes = this.editRow.attributes || {} // TODO fix and remove this
	this.editRow.attributes.algorithm = this.editRow.attributes.algorithm || this.algOptions[0].value
	this.editRow.attributes.recalc = this.editRow.attributes.recalc || true
  },
  mounted () {

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
