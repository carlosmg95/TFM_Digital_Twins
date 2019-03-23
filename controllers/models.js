// ====================================================================================================================
// Dependencies
// ====================================================================================================================

// Node modules
const async = require('async')
const fs = require('fs')
const path = require('path')

// ====================================================================================================================
// Module exports
// ====================================================================================================================

// Delete a model
module.exports.deleteModel = function(req, res, next) {
    let {name} = req.body
    let owenerId = req.session.user.id

    async.parallel([
        // Delete the model from the database
        function deleteModel(cb) {
            mongodb.delete('models', {name, owenerId}, function(error, results) {
                //If error in query
                if(error) {
                    req.error = error
                    log.error(req.error)
                    return next()
                }
                cb()
            })
        },
        // Remove the model file
        function removeFile(cb) {
            let filePath = path.join(__dirname, '../files/models')
            filePath = `${filePath}/${owenerId}_${name}.glb`
            fs.unlinkSync(filePath)
            cb()
        }
    ], function(error) {
        if (error) {
            log.error(error.message)
            req.error = error
            return res.renderError(500)
        }
        next()
    })
}

// Get an object of an user
module.exports.getModel = function(req, res, next) {
    let {name} = req.params
    let owenerId = req.session.user.id

    mongodb.read('models', {name, owenerId}, function(error, docs) {
        //If error in query
        if(error) {
            req.error = error
            log.error(req.error)
            return next()
        }
        // If no results found
        if(!docs || !docs.length) {
            req.error = errors.RESOURCE_NOT_FOUND
            log.error(req.error.message)
            return next()
        }
        req.file = docs[0].path
        return next()
    })
}

// Get the objects of an user
module.exports.getModels = function(req, res, next) {
    let owenerId = req.session.user.id

    mongodb.read('models', {owenerId}, function(error, docs) {
        if (error) {
            req.error = error
            return res.renderError(500)
        }
        req.data = docs
        next()
    })
}

// Check if an name exist
module.exports.nameExist = function(req, res, next) {
    let name = req.params.name
    let owenerId = req.session.user.id

    mongodb.read('models', {name, owenerId}, function(error, docs) {
        if (error) {
            req.error = error
            return res.renderError(500)
        }

        if (docs && docs.length) {  // If the name exists:
            req.error = fns.formatError(errors.EXISTING_MODEL_NAME, name)
            log.error(req.error.message)
            return next()
        } else {
            log.debug('Name free')
        }
        return next()
    })
}

module.exports.uploadModel = function(req, res, next) {
    let file = req.files['model-file']
    let fileExt = file.name.split('.').pop()
    let fileName = req.body['model-name']
    let filePath = path.join(__dirname, '../files/models')
    let owenerId = req.session.user.id

    filePath = `${filePath}/${owenerId}_${fileName}.${fileExt}`

    async.series([
        // Check if the name existes
        function checkName(cb) {
            mongodb.read('models', {"name": fileName, owenerId}, function(error, docs) {
                if (error) {
                    log.error(error.message)
                    return res.renderError(500)
                }

                if (docs && docs.length) {  // If the name exists:
                    req.error = fns.formatError(errors.EXISTING_MODEL_NAME, fileName)
                    return res.renderError(500)
                }
                cb()
            })
        },
        // Save the file in the server
        function saveFile(cb) {
            file.mv(filePath, function(error) {
                if (error) {
                    req.error = error
                    return res.renderError(500)
                } else {
                    log.debug(`File ${owenerId}_${fileName}.${fileExt} saved`)
                    cb()
                }
            })
        },
        // Save the file in the database
        function createFile(cb) {
            let article = {
                "ext": fileExt,
                "name": fileName,
                "path": filePath,
                owenerId
            }
            mongodb.create('models', article, function(error, result) {
                if (error) {
                    req.error = error
                    return res.renderError(500)
                }
                log.info(`Inserted model with ID: ${result.insertedId}`)
                cb()
            })
        }
    ], function(error) {
        if (error) {
            log.error(error.message)
            req.error = error
            return res.renderError(500)
        }
        next()
    })
}
