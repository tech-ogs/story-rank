var path = require('path')
var db = require(path.join(__dirname, '../../common/db'))

var imagemagick = require('imagemagick');
var Promise = require('promise');
var fs = require('fs');
var path = require('path');
var userid = require('userid');

const basePath = path.join(__dirname, '../../..')
const mediaDir = path.join( basePath, '/cache/')
const thumbDir = path.join ( mediaDir, '/thumbs/')

console.log ('mediaDir: ', mediaDir)

const urlBase = '/cache'

function canGenerateMediaPreview(type) {
    var result = false;
    var mimetypeMap = [
        { 'mimetype' : new RegExp('^image\/','i') , 'thumbnail' : true },
//        { 'mimetype' : new RegExp('^application\/.*document$','i') , 'thumbnail' : true },
//        { 'mimetype' : new RegExp('^application\/.*sheet$','i') , 'thumbnail' : true },
        { 'mimetype' : new RegExp('^application\/pdf','i') , 'thumbnail' : true },
//        { 'mimetype' : new RegExp('^text\/plain','i') , 'thumbnail' : true },
//        { 'mimetype' : new RegExp('^application\/vnd\.ms-excel','i') , 'thumbnail' : true },
//        { 'mimetype' : new RegExp('^application\/msword','i') , 'thumbnail' : true },
    ]
    if (type != null)  {
        mimetypeMap.forEach(function(x) {
            if ( x.mimetype.test(type) ) {
                result = true;
            }
        })
    }

    return result;
}

function getMediaThumbnailFileName(params) {
    var result;
    if (canGenerateMediaPreview(params.type)) {
        result = 'thumb_' + params.id + '.png';
    }
    else {
        result = 'thumb_document.png';   
    }
    return result;
}

function getMediaThumbnailFilePath(params) {
    var result = getMediaThumbnailFileName(params);
    if (canGenerateMediaPreview(params.type)) {
        result = thumbDir + '/' + result;
    }
    else {
        result = mediaDir + '/' + result;
    }
    return result;
}

function getMediaFileName(params) {
    var result;
    if (params.id != null) {
        var name = params.name;
        var extension = name.lastIndexOf('.') > 0 ?  name.substr(name.lastIndexOf('.')+1) : null;
        result = params.id;
        if (extension != null) {
            result  += '.' + extension;
        }
    }
    return result;
}

function getMediaFilePath(params) {
    var result = mediaDir +  '/' + getMediaFileName(params);
    return result;
}

async function addMedia (fileObj, attributes, sessionParams, client ) {
	var result
	if (fileObj.path != null) {
		try {
			var ret = await client.query('select * from add_media($1)', [{
				env: sessionParams,
				data: {
					fileObj : fileObj,
					basePath: basePath,
					attributes : attributes
				}
			}])
			console.log('addMedia success', ret.rows[0].add_media.id);
			result =  ret.rows[0].add_media.id
		} catch (err) {
			console.log('addMedia failed', err);
			throw(err);
		}                
	}
	else {
		console.log('addMedia missing fileObj.path');
		throw ( new Error('document does not exist'));
	}
	return result
}


function renameMediaFile (fileObj, docId) {
    return new Promise(function(resolve, reject) { 
        var path = fileObj.path;
        var newPath = getMediaFilePath({id : docId, name : fileObj.originalname});
        fs.rename(path, newPath,
        function(err) {
            if (err == null) {
                console.log('renameMediaFile success');
                resolve(newPath);
            }
            else{
                console.log('renameMediaFile failure', err)
                reject(err);
            }
        });
    });
}


function saveMediaThumbnail (fileObj, docId, imgBuff) {
    console.log('saveMediaThumbnail ', docId, fileObj.path);
    return new Promise(function(resolve, reject) { 
        var newThumbPath = getMediaThumbnailFilePath({id : docId, name : fileObj.path, type : fileObj.mimetype});
        var fd =  fs.openSync(newThumbPath, 'w');
        fs.write(fd, imgBuff, 0, imgBuff.length, 0, 
        function(err,written){
            if (err == null) {
                console.log('saveMediaThumbnail success');
                resolve(newThumbPath);
            }
            else {
                console.log('saveMediaThumbnail failure', err)
                reject(err);
            }
        })

    });
}

function generateMediaThumbnail(fileObj) {
    return new Promise(function(resolve, reject) { 
        var path = fileObj.path;
        var outputPath;
        if(fileObj.id != null) {
            outputPath = '/documents/thumb_' + fileObj.id + '.png';
        }
        var extension = path.substr(path.lastIndexOf('.')+1).toLowerCase();
 
        if( (/pdf/).test(extension) ) { 
            imagemagick.convert([path+'[0]', '-units', 'pixelsperinch', '-density', '700', '-quality', '100', outputPath||'png:-' ], function(err, stdout){
                console.log('generateMediaThumbnail convert returned , err was ' + err );
                if (err == null) {
                    console.log('generateMediaThumbnail success');
                    resolve(stdout);
                }
                else {
                    console.log('generateMediaThumbnail failure', err);
                    reject(err);
                }
            });
        }
        else if( (/xls|xlsx|txt|docx|doc/).test(extension) ) {
            imagemagick.convert([path+'[0]', 'temp.pdf'], function(result, err) {
                imagemagick.convert(['temp.pdf', '-units', 'pixelsperinch', '-density', '700', '-quality', '100', 'png:-' ], function(err, stdout){
                console.log('generateMediaThumbnail convert returned , err was ' + err );
                if (err == null) {
                    console.log('generateMediaThumbnail success');
                    resolve(stdout);
                }
                else {
                    console.log('generateMediaThumbnail failure', err);
                    reject(err);
                }
                });
            });
        }
        else {
            imagemagick.convert([path,  '-auto-orient', '-thumbnail', '150x150', '-unsharp', '0x.5' , outputPath||'png:-' ], function(err, stdout){
            console.log('generateMediaThumbnail convert returned , err was ' + err );
            if (err == null) {
                console.log('generateMediaThumbnail success');
                resolve(stdout);
            }
            else {
                console.log('generateMediaThumbnail failure', err);
                reject(err);
            }
            });
        }
    })
}

async function uploadMedia (fileObj, attributes, sessionParams) {
	var path = fileObj.path;
	console.log('uploadMedia', path);
	var docId;
	var mediaPath;
	var thumbPath;
	var imgBuf;
	var client = await db.getClient()
	try {
		var docId = await addMedia(fileObj, attributes, sessionParams, client)
		var imgData = await generateMediaThumbnail(fileObj)
		console.log('uploadMedia upload and convert succeeded, going to call renameMediaFile for doc id ', docId);

		imgBuf = (imgData != null ?  new Buffer(imgData, 'binary') : null);
		mediaPath = await renameMediaFile(fileObj, docId);
		thumbPath = await saveMediaThumbnail(fileObj, docId, imgBuf);
		console.log('uploadMedia, all is well');
		await client.query('COMMIT')
	}
	catch(err) {
		console.log('uploadMedia failure in either upload or convert', err);
		await client.query('ROLLBACK')
		throw (err)
	}
	return { 
		id : docId, 
	 	url: urlBase + '/' + mediaPath.split('/').pop(), 
		thumbUrl: urlBase + '/thumbs/' + thumbPath.split('/').pop() 
	}
}

async function patchReferencingRow(params, data) {

	var client = await db.getClient()
	try {
		if (params.rowId != null && !params.rowId.match(/null/)) {
			await client.query ('select set_image_paths($1)', [{
                schema: params.schema,
                table: params.table,
                rowId: params.rowId,
                fieldPath: params.fieldPath,
                thumbPath: params.thumbPath,
                imageUrl: data.url,
                thumbUrl: data.thumbUrl
            }])
		}
	}
	catch(err) {
		throw (err)
	}
}

function thumbnailGenerationReq(filepath) {

    return new Promise(function(resolve, reject){
        fs.stat(filepath, function(err, stats){
            if(err === null) {
                resolve(false);
            }
            else if(err.code === 'ENOENT') {
                resolve(true);
            }
            else {
                reject(err);
            }
        });
    })
}

function downloadThumbnail(req, res, next) {
    var filename = req.params.filename;
    var promise, mediaRow;
    if ( isNaN(filename) ) {
        if (filename.match(/\/img\//) || filename.match(/\/images\//)) {
            promise = Promise.resolve(filename);
        }
        else {
            promise = Promise.resolve( conf.docDir + '/' + filename);
        }
    }
    else {
        var filePath = null;
        promise = dbq.query('select id,name,type,attributes from applications.media where id = $1', [filename])
        .then(function(result) {
            if ( result && result.rows && result.rows.length > 0 ) {
                mediaRow = result.rows[0];
                filePath= getMediaThumbnailFilePath(mediaRow);
                return thumbnailGenerationReq(filePath)
            }
        })
        .then(function(res) {
            if(res === true) {
                var ext = mediaRow.attributes.path.substr(mediaRow.attributes.path.lastIndexOf('.'));
                var fpath = '/documents/' + mediaRow.id + ext;
                if (canGenerateMediaPreview(mediaRow.type)) {
                    return generateMediaThumbnail({ path : fpath, id : mediaRow.id })
                }
            }
            else {
                return filePath;
            }
        })
        .then(function(res) {
            return filePath;            
        })
        .catch(function(err) {
            throw err;
        }) 
    }
    promise
    .then(function(filePath) {
        res.sendFile(filePath, {
            maxAge : req.params.maxAge || 31536000000,
            headers : {
                'Cache-Control' : 'public, max-age=' + (req.params.maxAge || '31536000')
            }
        });
    })
    .catch(function(err) {
        res.status(420).json({'message': 'File not found'});
    })
}


function downloadLogo(req, res, next) {
    var businessId = req.params.businessId;
    dbq.query('select * from qmx_get_business_env($1)', [{ ownerBusinessId: businessId }])
    .then(function(result) {
        var ret = path.join(process.env.SERVER_ROOT, '/app/images/layers-2x.png');
        //console.log('logo result:', result.rows.length, result.rows[0].logo, result.rows[0].logo[0])
        if ( result && result.rows && result.rows.length > 0 && result.rows[0].qmx_get_business_env.logo != null && result.rows[0].qmx_get_business_env.logo.length > 0) {
            var imgId = result.rows[0].qmx_get_business_env.logo[0]
            ret = imgId
        }
        return ret;
    })
    .then( function (ret) { 
        req.params.filename = ret;
        req.params.maxAge = 5; // quickly expire placeholders to allow checking for updates 
        exports.downloadThumbnail(req, res, next);
    })
    .catch(function(err) {
        console.log('downloadLogo',err);
        res.status(420).json({'message': 'Error downloading logo'});
    })
}


exports._getMediaList = function _getMediaList( clientQueryId, queryParams, sqlapi ) {
    var promise = dbq.query(sqlapi, [queryParams.filters, queryParams.controlParams || {}])
        .then (function(result) {
            var rowCount = 0;
            if(result && result.rows && result.rows[0].qmx_media_list != null){
                result.rows = result.rows[0].qmx_media_list;
            }
            if ( result.rows.length > 0 ) {
                rowCount = result.rows.length;
            }
            if ( rowCount > 0 ) {
                console.log('returning a re-formed result object');
                return {
                    status : 'success',
                    rowCount : rowCount,
                    result : result.rows
                }
            }
            else {
                return { result : [], rowCount : 0 };
            }
        });
    return promise;
};

async function upload (req, res, next) {
    console.log('req  =' , req);
    console.log('req.file =' , JSON.stringify(req.file));
    console.log('req.body =' , JSON.stringify(req.body));
    var fileObj = req.file;
	var filePath = path.join(basePath, fileObj.path)
	
	fs.chownSync(filePath, userid.uid('postgres'), userid.uid('postgres'))
	fs.chmodSync(filePath, 0o700)

	try {
		if (fileObj == null) {
			throw ('no file uploaded')
		}
		var ret = await uploadMedia(fileObj, req.body, req.session)
		console.log ('media.upload ret: ', ret)
		await patchReferencingRow(req.body, ret)
		console.log ('done patching referencing row')
		res.json(ret);
	}
    catch(err) {
        res.status(420).json({'message': 'server error : error uploading image' + err.message});
    }
}

async function download(req, res, next) {
    var filename = req.params.filename;
    var promise;
    if ( isNaN(filename) ) {
        //filename = filename.replace(/[\[\]']+/g,'')
        promise = Promise.resolve( conf.docDir + '/' + filename);
    }
    else {
        promise = dbq.query('select id, attributes->\'name\' as name from applications.media where id = $1', [filename])
        .then(function(result) {
            var filePath = null;
            if ( result && result.rows && result.rows.length > 0 ) {
                var mediaRow = result.rows[0];
                filePath = getMediaFilePath(mediaRow);
            }
            return filePath;
        })
        .catch(function(err) {
            console.log('Error occ ', err.stack());
            throw err;
        })
        
    }

    promise
    .then(function(filePath) {
        //TODO: basic access checks - ensure session exists 
        res.sendFile(filePath, {
            maxAge : 31536000000,
            headers : {
                'Cache-Control' : 'public, max-age=31536000'
            }
        });
    })
    .catch(function(err) {
        console.log('download',err);
        res.status(420).json({'message': 'File not found'});
    })
}

exports = module.exports = {
	upload: upload,
	download: download
}

