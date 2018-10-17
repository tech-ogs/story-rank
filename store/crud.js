async function uploadImage(context, id, fileObj) {
	console.log ('uploadImage', id, fileObj)
    var formData = new FormData()
    formData.append('imgfile', fileObj)
	formData.append('storyId', id)
	formData.append('name', fileObj.name)
	var headers = new Headers();
	var result;
	try {
		var response = await window.fetch('/media/upload', {
		  method: 'post',
		  credentials: 'same-origin',
		  headers: headers,
		  body: formData
		}) 
		var result = await response.json()
		result.storyId = id
        if (id != null) { 
		    context.commit('storySetImage', result)
        }
	}
	catch (err) {
		throw (new Error ('error uploading image: ' + err.message) )
	}
    return result
}

export default {
  uploadImage
}
