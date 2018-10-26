<template>
    <detail :editRow="editRow" :viewMode="viewMode" :saveHandler="saveHandler">

		<template slot="detail-header">
			<admin-header>
			</admin-header>
		</template>
        <template slot="detail-form">
		  <div class="width100">
			<b-form @submit="" @reset="">
				<b-form-group id="grpLogin"
							horizontal
							label="Login"
							label-text-align="left"
							label-for="name">
					<b-form-input disabled id="login"  v-model="editRow.login"></b-form-input>
  				</b-form-group>

				<b-form-group id="grpMobile"
							horizontal
							label="Mobile"
							label-text-align="left"
							label-for="name">
					<b-form-input disabled id="mobile"  v-model="editRow.mobile"></b-form-input>
  				</b-form-group>

				<b-form-group id="grpName"
							horizontal
							label="Name"
							label-text-align="left"
							label-for="name">
					<b-form-input id="name"  v-model="editRow.name"></b-form-input>
  				</b-form-group>

			</b-form>
		  </div>
        </template>
		<template slot="view-footer">
			<admin-footer>
			</admin-footer>
		</template>
    </detail>

</template>

<script>
export default {
  data () {
    return {
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
	viewMode() { return (this.$store.getters.view).mode }
  },
  methods: {
	saveHandler: function( action, editRow ) {
		this.$store.dispatch(action, {
			schema : 'application',
			table : 'users',
			row: editRow,
			postAction: action === 'createRow' ? 'usersCreateRow' : 'usersEditRow'
		})
		.then( (result) => {
            this.$store.commit('dashSetDetailMode', 'view')
            this.$store.commit('dashSetDetailRow', result)
			Object.assign(this.editRow, result)
		})
		.catch( (err) => {
			throw err
		})
	}
  },
  watch: {
  },
  created () {
	this.editRow = JSON.parse(JSON.stringify(this.row))
  },
   
  mounted () {

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.app-footer {
  flex: 0 0 auto;
}

</style>
