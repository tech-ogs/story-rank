<template>
    <detail :editRow="editRow" :viewMode="viewMode" :saveHandler="saveHandler">

        <template slot="detail-menu">
		  <b-nav class="toolbar">
			<b-nav-item variant="link" @click="voterList">  Voters </b-nav-item>
			<b-nav-item variant="link" @click="candidates"> Candidates </b-nav-item>
		  </b-nav>
        </template>

        <template slot="detail-form">
		  <div>
			<b-form @submit="" @reset="">
				<b-form-group id="grpName"
							horizontal
							label="Name"
							label-text-align="left"
							label-for="name">
					<b-form-input id="name"  v-model="editRow.name"></b-form-input>
  				</b-form-group>
				<b-form-group id="grpStart"
							horizontal
							label="Start"
							label-text-align="left"
							label-for="start-date">
					<b-form-input id="start-date"  v-model="editRow.open_date"></b-form-input>
  				</b-form-group>
				<b-form-group id="grpEnd"
							horizontal
							label="End"
							label-text-align="left"
							label-for="end-date">
					<b-form-input v-model="editRow.close_date" id="end-date"></b-form-input>
  				</b-form-group>
				<b-form-group id="grpIcon"
							horizontal
							label="Icon"
							label-text-align="left"
							label-for="icon">
						<b-form-file v-model="imageFile" state="true" name="imgfile"
							@change="fileChange('full_image', 'image', $event.target.files)"
							accept="image/jpeg, image/png, image/gif"
							placeholder="Election Icon Image" >
			   			</b-form-file>
						<br>
		  				<b-img  rounded fluid-grow :src="getImg(editRow.attributes.image)" > </b-img>
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
function  dateString(d) {
    var x = new Date(d)
    var y = (x.getYear() + 1900).toString()
    var m = (x.getMonth() + 1).toString()
    var d = (x.getDate()).toString()
    if (m.length === 1) { m = '0' + m }
    if (d.length === 1) { d = '0' + d }
    var ret =  y + '-' + m + '-' + d
    console.log ('dateString returning ', ret)
    return ret
}

export default {
  data () {
    return {
	imageFile: '',
	editRow: {
		id: null,
		name: '',
		open_date: '',
		close_date: '',
		attributes: {
			algorithm: 'rcv',
			recalc: true,
			image: '',
			full_image: ''
		}
	},
	algorithm: 'rcv',
	algOptions: [
		{value: 'rcv', text: 'Ranked Choice'},
		{value: 'fptp', text: 'First Past The Post'}
	],
	getImg: (url) => { 
		console.log ('electiondetails getImg: ', url) 
		//return url != null ? require('@/'+url) : require ('@/assets/thumbs/placeholder.jpg')
		return url != null && url !== '' ? url : '/assets/thumbs/placeholder.jpg'
	} 

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
	moduleName() { return this.$store.getters.moduleName},
	viewMode() { return (this.$store.getters.view).mode },
	action() { return this.$store.getters.dashDetailAction },
	mode() { return this.$store.getters.dashDetailMode }

  },
  methods: {
	voterList: function() {
		this.$store.commit('dashSetBack', ['admin', 'election-detail', 'edit'])
		this.$store.commit('dashSetView', ['admin', 'voter-list', 'edit'])
    },
	candidates: function() {
		this.$store.commit('dashSetView', ['public', 'dashboard', 'view'])
    },

	fileChange: async function (fieldPath, thumbPath, fileList) {

		if (!fileList.length) return;

		var fileObj = fileList[0]
		console.log ('ElectionDetail fileChange', fileObj, this.row.id)
		var ret = await this.$store.dispatch('imageUpload', { 
			schema : 'application',
			table : 'elections',
			fileObj : fileObj, 
			rowId : this.row.id, 
			fieldPath: fieldPath, 
			thumbPath: thumbPath, 
			postAction: 'electionsSetImage' 
		})
		console.log ('ElectionDetail fileChange ret', ret)
		this.editRow.attributes.image = ret.thumbUrl
		this.editRow.attributes.full_image = ret.url

		console.log ('ElectionDetail fileChange DONE')
	},

	saveHandler: function( action, editRow ) {
		this.$store.dispatch(action, {
			schema : 'application',
			table : 'elections',
			row: editRow,
			postAction: action === 'createElection' ? 'electionsCreateRow' : 'electionsEditRow'
		})
		.then( (result) => {
			this.$store.commit('dashSetView', ['admin', 'election-list', 'view'])
		})
		.catch( (err) => {
			throw err
		})
	}

  },
  watch: {
  },
  created () {
	Object.keys(this.editRow).forEach( (x) => {
		if ( x !== 'attributes') {
			this.editRow[x] = this.row[x] != null ? this.row[x] : this.editRow[x]
		}
	})

	Object.keys(this.editRow.attributes).forEach( (x) => {
		this.editRow.attributes[x] = this.row.attributes[x] != null ? this.row.attributes[x] : this.editRow.attributes[x]
	})

	this.editRow.open_date = this.editRow.open_date ? dateString(this.editRow.open_date) : dateString((new Date()).toString())
	this.editRow.close_date = this.editRow.close_date ? dateString(this.editRow.close_date) : dateString(new Date((Date.now() + 15*24*60*60*1000)).toString())
  },
  mounted () {

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.toolbar {
	width: 100%;
	disply: flex;
	justify-content: flex-end;
}
</style>
