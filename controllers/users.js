// ====================================================================================================================
// Dependencies
// ====================================================================================================================

// Node modules
const path = require('path')

// Own modules
const controllers = require('../controllers')

// ====================================================================================================================
// Module exports
// ====================================================================================================================

module.exports.create = function (req, res, next) {
    let { username, email, password } = req.body
    let article = { username, email, password }
    controllers.mongodb.create('users', article, function(error, result) {
        if (error) {
            log.error(error)
            return next()
        }
        log.debug(`Inserted user with ID: ${result.insertedId}`)
        next()
    })
}

// Check if an username exist
module.exports.usernameExist = function (req, res, next) {
    let username = req.params.username

    controllers.mongodb.read('users', {"username": username}, function(error, docs) {
        if (docs.length) {
            req.error = fns.formatError(errors.EXISTING_USERNAME, username)
            log.error(req.error.message)
            return next()
        } else {
            log.debug('no hay usuario')
        }
        return next()
    })
}