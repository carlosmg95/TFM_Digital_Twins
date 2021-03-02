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

// Check the size of a model
module.exports.checkSize = function(req, res, next) {
    let fileSize = req.params.size

    if (config.maxSize && (fileSize > (config.maxSize * 1000000))) {
        req.error = fns.formatError(errors.TOO_LARGE, config.maxSize)
        log.error(req.error.message)
    }
    next()
}

// Delete a model from the server
module.exports.deleteModel = function(req, res, next) {
    let model = req.body
    let ownerId = req.session.user.id

    deleteModelAux(model, ownerId, function(error) {
        if (error) {
            log.error(error.message)
            req.error = error
            return res.renderError(500)
        }
        next()
    })
}

// Auxialir function to delete a model
module.exports.deleteModelAux = deleteModelAux = function({name, ext}, ownerId, callback) {
    async.parallel([
        // Delete the model from the database
        function deleteModel(cb) {
            mongodb.delete('models', { name, "owner_id": ownerId }, function(error, results) {
                //If error in query
                if (error) {
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
            filePath = `${filePath}/${ownerId}_${name}.${ext}`
            fs.unlink(filePath, function(error) {
                if (error) {
                    req.error = error.code === 'ENOENT' ? error.message.split(', unlink')[0] : error  // Don't show the file path
                    log.error(req.error)
                    return next()
                }
                cb()
            })
        }
    ], callback)
}

// Get file of a model
module.exports.getModel = function(req, res, next) {
    let {name} = req.params
    let ownerId = req.session.user.id

    mongodb.read('models', { name, "owner_id": ownerId }, function(error, docs) {
        //If error in query
        if (error) {
            req.error = error
            log.error(req.error)
            return next()
        }
        // If no results found
        if (!docs || !docs.length) {
            req.error = errors.RESOURCE_NOT_FOUND
            log.error(req.error.message)
            return next()
        }
        req.file = docs[0].path
        return next()
    })
}

// Get the models of an user
module.exports.getModels = function(req, res, next) {
    let {name} = req.params
    let ownerId = req.session.user.id
    let where = name ? { name, "owner_id": ownerId } : { "owner_id": ownerId }  // If there isn't a name, it get all models

    mongodb.read('models', where, function(error, docs) {
        if (error) {
            req.error = error
            return res.renderError(500)
        }
        if (docs && docs.length !== 0)
            req.model = docs[0]  // Show the model in its page
        else if (name && (!docs || docs.length === 0))
            return res.renderError(404)
        req.data = docs  // Get all the models in the index page
        next()
    }, { "project": { "path": 0 } })
}

// Check if an name exist
module.exports.nameExist = function(req, res, next) {
    let name = req.params.name
    let ownerId = req.session.user.id

    mongodb.read('models', { name, "owner_id": ownerId }, function(error, docs) {
        if (error) {
            req.error = error
            return res.renderError(500)
        }

        // If the name exists or it is a reserved word
        if ((docs && docs.length) || fns.arrayContains(config.reservedWords, name)) {
            req.error = fns.formatError(errors.EXISTING_MODEL_NAME, name)
            log.error(req.error.message)
            return next()
        } else {
            log.debug('Name free')
        }
        return next()
    })
}

module.exports.updatePosition = function(req, res, next) {
    let name = req.body.name,
        ownerId = req.session.user.id,
        rotationX = +req.body['rotation[x]'],
        rotationY = +req.body['rotation[y]'],
        rotationZ = +req.body['rotation[z]'],
        scaleX = +req.body['scale[x]'],
        scaleY = +req.body['scale[y]'],
        scaleZ = +req.body['scale[z]']
    let set = {
        "scale": {
            "x": scaleX,
            "y": scaleY,
            "z": scaleZ
        },
        "rotation": {
            "x": rotationX,
            "y": rotationY,
            "z": rotationZ
        }
    }

    mongodb.update('models', { name, "owner_id": ownerId }, set, function(error, result) {
        if (error) {
            req.error = error
            return res.renderError(500)
        }
        log.info('Success udpate')
        next()
    })
}

module.exports.uploadModel = function(req, res, next) {
    let file = req.files['model-file']
    let fileExt = file.name.split('.').pop()
    let fileName = req.body['model-name']
    let filePath = path.join(__dirname, '../files/models')
    let ownerId = req.session.user.id

    filePath = `${filePath}/${ownerId}_${fileName}.${fileExt}`

    async.series([
        // Check the size
        function checkSize(cb) {
            if (config.maxSize && (file.size > (config.maxSize * 1000000))) {
                req.error = fns.formatError(errors.TOO_LARGE)
                return res.renderError(500)
            }
            cb()
        },
        // Check if the name existes
        function checkName(cb) {
            mongodb.read('models', { "name": fileName, "owner_id": ownerId }, function(error, docs) {
                if (error) {
                    log.error(error.message)
                    return res.renderError(500)
                }

                if ((docs && docs.length) || fns.arrayContains(config.reservedWords, name)) {
                    req.error = fns.formatError(errors.EXISTING_MODEL_NAME, fileName)
                    return res.renderError(500)
                } else if (fns.checkWrongName(name)) {
                    req.error = error = fns.formatError(errors.WRONG_FORMAT_MODEL, name)
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
                    log.debug(`File ${ownerId}_${fileName}.${fileExt} saved`)
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
                "scale": {
                    "x": 1,
                    "y": 1,
                    "z": 1
                },
                "rotation": {
                    "x": 0,
                    "y": 0,
                    "z": 0
                },
                "owner_id": ownerId
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
