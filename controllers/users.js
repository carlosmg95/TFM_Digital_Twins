// ====================================================================================================================
// Dependencies
// ====================================================================================================================

// Node modules
const async = require('async')
const path = require('path')

// Own modules
const controllers = require('../controllers')

// ====================================================================================================================
// Module exports
// ====================================================================================================================

module.exports.create = function (req, res, next) {
    let { username, email, password } = req.body
    let article = { username, email, "password": crypt(password) }

    async.series([
        // Check if the email exists
        function emailExist(cb) {
            controllers.mongodb.read('users', {"email": email}, function(error, docs) {
                if (error) {
                    req.error = error
                    return res.renderError(500)
                }

                if (docs && docs.length) {  // If the email exists:
                    req.error = error = fns.formatError(errors.EXISTING_EMAIL, email)
                    return cb(error)
                } else {
                    log.debug('Email free')
                }
                cb()
            })
        },
        // Check if the username exists
        function usernameExist(cb) {
            controllers.mongodb.read('users', {"username": username}, function(error, docs) {
                if (error) {
                    req.error = error
                    return res.renderError(500)
                }

                // If the username exists or it is a reserved word:
                if ((docs && docs.length) || fns.arrayContains(config.reservedWords, username)) {
                    req.error = error = fns.formatError(errors.EXISTING_USERNAME, username)
                    return cb(error)
                } else {
                    log.debug('Username free')
                }
                cb()
            })
        },
        // Save the user
        function saveUser(cb) {
            controllers.mongodb.create('users', article, function(error, result) {
                if (error) {
                    req.error = error
                    return res.renderError(500)
                }
                log.info(`Inserted user with ID: ${result.insertedId}`)
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

// Check if an email exist
module.exports.emailExist = function (req, res, next) {
    let email = req.params.email

    controllers.mongodb.read('users', {"email": email}, function(error, docs) {
        if (error) {
            req.error = error
            return res.renderError(500)
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

// Show a given user
module.exports.show = function(req, res, next) {
    const username = req.params.username || req.session.user.username
    getUser(username, function(error, docs) {
        if (!docs || docs.length === 0) {
            return res.renderError(404)
        }
        req.user = docs[0]
        next()
    })
}


// Check if an username exist
module.exports.usernameExist = function (req, res, next) {
    let username = req.params.username

    controllers.mongodb.read('users', {"username": username}, function(error, docs) {
        if (error) {
            req.error = error
            return res.renderError(500)
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

// ====================================================================================================================
// Private functions
// ====================================================================================================================

const getUser = function(username, callback) {
    controllers.mongodb.read('users', {"username": username}, callback)
}