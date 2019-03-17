// ====================================================================================================================
// Dependencies
// ====================================================================================================================

// Node modules
const async = require('async')
const path = require('path')

// Own modules
const controllers = require('../controllers')
const fns = require('../tools/functions')

// ====================================================================================================================
// Module exports
// ====================================================================================================================

// Check if an name exist
module.exports.nameExist = function(req, res, next) {
    let name = req.params.name
    let userId = req.session.user.id

    controllers.mongodb.read('models', {name, userId}, function(error, docs) {
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
    let filePath = path.join(__dirname, '../public/models')
    let userId = req.session.user.id

    filePath = `${filePath}/${userId}_${fileName}.${fileExt}`

    async.series([
        // Check if the name existes
        function checkName(cb) {
            controllers.mongodb.read('models', {"name": fileName, userId}, function(error, docs) {
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
                    log.debug(`File ${userId}_${fileName}.${fileExt} saved`)
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
                userId
            }
            controllers.mongodb.create('models', article, function(error, result) {
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
