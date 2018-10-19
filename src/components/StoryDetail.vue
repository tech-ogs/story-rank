<template>
<detail :editRow="editRow" :viewMode="mode" :saveHandler="saveHandler">
	<template slot="detail-header">
	  <b-row>
		<b-col>
      		<rank-bar @rank-button-click="handleRankBtnClick"> </rank-bar>
		</b-col>
	  </b-row>
	</template>

	<template slot="detail-menu">
		<admin-menu> </admin-menu>
	</template>

	<template slot="detail-form">
	  <b-row v-if="mode === 'edit'" >
		<b-col>
	 		<b-form-file v-model="imageFile" state="true" name="imgfile"
				style="width: 300px;"
				@change="fileChange('attributes.full_image', 'attributes.image', $event.target.files)"
				accept="image/jpeg, image/png, image/gif"
				placeholder="Image file..." >
		  </b-form-file>
			<span v-if="editRow.attributes.full_image != null"> 
				{{ editRow.attributes.full_image}} <b-button size="sm" @click="useImage(editRow.attributes.full_image)">use</b-button>
			</span>
		</b-col>
      </b-row>

      <b-row>
        <b-col cols="4"> 

		  <b-img thumbnail rounded fluid-grow :src="getImg(editRow.attributes.image)" class="story-image" > </b-img>


          <span v-if="mode === 'view'" class="story-title">
            {{ row.attributes.shortTitle }}
          <i class="fa fa-fw fa-question"></i>
          </span>
		  <div>
			<b-form-textarea v-if="mode === 'edit'" type="text" placeholder="Short Title"
				v-model="editRow.attributes.shortTitle" 
				:rows="1"
				:max-rows="1"
				id="inputShortTitle"
				:state="shortTitleState"
			>
			</b-form-textarea>
			<b-form-invalid-feedback id="inputShortTitle">
			 	Maximum 10 characters!
			</b-form-invalid-feedback>
		  
		  </div>

        </b-col>

        <b-col class="story-title-container">
          <span v-if="mode === 'view'" class="story-title">
            {{ row.attributes.title }}
          <i class="fa fa-fw fa-question"></i>
          </span>
		  <div>
			<b-form-textarea v-if="mode === 'edit'" type="text" placeholder="Title"
				v-model="editRow.attributes.title" 
				:rows="3"
				:max-rows="5"
				id="inputTitle"
				:state="titleState"
			>
			</b-form-textarea>
			<b-form-invalid-feedback id="inputTitle">
			 	Maximum 100 characters!
			</b-form-invalid-feedback>
		  </div>
        </b-col>
      </b-row>
      <b-row>
        <b-col class="story-excerpt-container">
            <span v-if="mode === 'view'" class="story-excerpt">
              {{ row.attributes.excerpt }}
            </span>
			<b-form-textarea v-if="mode === 'edit'" type="text" placeholder="Excerpt"
				v-model="editRow.attributes.excerpt"
				:rows="10"
				:max-rows="12"
			>
			</b-form-textarea>
        </b-col>

      </b-row>
	  <br>
	  <b-row>
		<b-col class="story-link-container">
          <span v-if="mode === 'view'" class="story-link">
            <b-link  :href="row.attributes.url" target="_blank">link &nbsp;&nbsp;</b-link>
          </span>
          <span v-if="mode === 'edit'" class="story-link-editor">
				<span> link: </span><b-input type="url" v-model="editRow.attributes.url"> </b-input>
          </span>
          <br>
		</b-col>
	  </b-row>

	  <br>
	  <br>


      <b-row class="story-footer">
        <b-col class="story-data-container">
          <span class="story-data">
                  id: {{row.id}} rank: {{'xx'}}
          </span>
        </b-col>
        <b-col class="story-submitter-container">
          <span v-if="mode === 'view'" class="story-submitter">
            {{ users[row.submitter_id] != null ? (users[row.submitter_id].name != null ? users[row.submitter_id].name : users[row.submitter_id].login) : 'xxx' }}
          </span>
		  <div>
			<b-form-select v-if="mode === 'edit'"  placeholder="Submitter"
				v-model="submitterId" 
				:state="submitterState"
			>
                <option v-for="user in usersList" :value="user.id">{{user.login}}</option>
			</b-form-select>
			<b-form-invalid-feedback id="inputTitle">
			 	Maximum 100 characters!
			</b-form-invalid-feedback>
		  </div>

        </b-col>
      </b-row>

      <b-row class="story-footer">
        <b-col class="story-date-container">
          <span v-if="mode === 'view'" class="story-date">
            {{ row.creation_date }}
          </span>
		  <div>
			<b-form-input type="date" v-if="mode === 'edit'"  placeholder="Submission Date"
				v-model="editRow.creation_date" 
			>
			</b-form-input>
		  </div>
        </b-col>
      </b-row>

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
  props: [],
  data () {
    return {
      getImg: (url) => { 
        //return url != null ? require('@/'+url) : require('@/assets/thumbs/placeholder.jpg')
        return url != null && url !== '' ? url : '/assets/thumbs/placeholder.jpg'
	  },
	  imageFile: '',
/*
      editRow: {
		attributes: {}
	  }
*/
	
	  get submitterId () { return this.editRow.submitter_id || (this.user != null ? this.user.id : null)},
	  set submitterId (x) { this.editRow.submitter_id = x},
	  editRow: null
    }
  },
  computed: {
    row() { 
		return this.$store.getters.dashDetailRow 
	},
    ranks () { return this.$store.getters.ranks},
    results() { return this.$store.getters.getResults },
    users () { return this.$store.getters.usersGetIdMap },
    user () { return this.$store.getters.user },
	login() { return this.$store.getters.login },
	election() { return this.$store.getters.election },
    usersList() { return this.$store.getters.usersGetItems },
	groups() { return this.$store.getters.groups },
	isEditor () { return this.$store.getters.isEditor },
	isAdmin () { return this.$store.getters.isAdmin },
	mode() { return this.$store.getters.dashDetailMode },
	action() { return this.$store.getters.dashDetailAction },
	// editing helpers
	titleState() { return this.editRow.attributes.title.length <= 100 },
	shortTitleState() { return this.editRow.attributes.shortTitle.length <= 10 },
	submitterState() { return this.editRow.submitter_id != null }
  },

  methods: {
	handleRankBtnClick: function(pos) {
		console.log ('rank button click in details', pos)
		this.$store.commit('dashSetSelected', this.row)
		this.$store.commit('dashHandleRankBtnClick', pos)
	},

	useImage (x) {
		this.editRow.attributes.url = x 
	},

	fileChange(fieldPath, thumbPath, fileList) {

		if (!fileList.length) return;

		var fileObj = fileList[0]
		console.log ('StoryDetail fileChange', fileObj, this.row.id)
		this.$store.dispatch('imageUpload', { 
			schema : 'application',
			table : 'stories',
			fileObj : fileObj, 
			rowId : this.row.id, 
			fieldPath: fieldPath, 
			thumbPath: thumbPath, 
			postAction: 'storySetImage' 
		})
		.then((ret) => {
			this.editRow.attributes.image = ret.thumbUrl
			this.editRow.attributes.full_image = ret.url
		})
		.catch((err) => {
			throw (err)
		})
	},
	saveHandler: function( action, editRow ) {
		this.$store.dispatch(action, {
			schema : 'application',
			table : 'stories',
			row: editRow,
			postAction: action === 'createRow' ? 'storiesCreateRow' : 'storiesEditRow'
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

  created() {
	this.editRow = JSON.parse(JSON.stringify(this.row))
	this.editRow.submitter_id = this.editRow.submitter_id || this.user.id
	this.editRow.creation_date = this.editRow.creation_date ? dateString(this.editRow.creation_date) : dateString(this.election.open_date)
	this.editRow.election_id = this.editRow.election_id || this.election.id
  },
  mounted () { 
  }
}
</script>

<style scoped>
  .story-title-container {
    text-align: left;
  }

  .story-title {
    font-weight: bold;
  }

  .story-excerpt-container {
    text-align: left;
  }


  .image-uploader {
	z-index: 10;
  }
  .story-excerpt {
  }

  .story-link-container {
	display: flex;
	justify-content: flex-start;
  }

  .story-link {
	
  }
  .story-link-editor {
	display: inline-flex;
	align-items: center;
  }

  .story-data-container {
    text-align: left;
  }

  .story-date-container {
	float: right;
    text-align: right;
  }
  .story-data {
    font-size: x-small;
  }

  .story-date {
    font-size: x-small;
  }

  .story-submitter-container {
    text-align: right;
  }

  .story-submitter {
    font-size: x-small;
  }
  .story-footer {
    display: flex;
    align-items: center;
  }
</style>
