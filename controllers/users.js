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
    let article = { username, email, "password": crypt(password) }
    controllers.mongodb.create('users', article, function(error, result) {
        if (error) {
            log.error(error)
            return next()
        }
        log.debug(`Inserted user with ID: ${result.insertedId}`)
        next()
    })
}

// Check if an email exist
module.exports.emailExist = function (req, res, next) {
    let email = req.params.email

    controllers.mongodb.read('users', {"email": email}, function(error, docs) {
        if (error) {
            log.error(error)
            return next()
        }

        if (docs && docs.length) {  // If the email exists:
            req.error = fns.formatError(errors.EXISTING_EMAIL, email)
            log.error(req.error.message)
            return next()
        } else {
            log.debug('Email free')
        }
        return next()
    })
}


// Check if an username exist
module.exports.usernameExist = function (req, res, next) {
    let username = req.params.username

    controllers.mongodb.read('users', {"username": username}, function(error, docs) {
        if (error) {
            log.error(error)
            return next()
        }

        // If the username exists or it is a reserved word:
        if ((docs && docs.length) || fns.arrayContains(config.reservedWords, username)) {
            req.error = fns.formatError(errors.EXISTING_USERNAME, username)
            log.error(req.error.message)
            return next()
        } else {
            log.debug('Username free')
        }
        return next()
    })
}