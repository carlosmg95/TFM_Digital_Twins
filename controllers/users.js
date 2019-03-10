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

module.exports.create = function(req, res, next) {
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

// Delete an user
module.exports.deleteUser = function(req, res, next) {
    let {username, password} = req.body
    let where = { username, "password": crypt(password) }

    delete req.user
    delete req.session.user

    controllers.mongodb.delete('users', where, function(error, result) {
        if (error) {
            req.error = error
            return res.renderError(500)
        }
        log.debug(`User ${username} deleted`)
        return next()
    })
}

// Check if an email exist
module.exports.emailExist = function(req, res, next) {
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

module.exports.rightPassword = function(req, res, next) {
    let password = crypt(req.params.password)
    let username = req.session.user.username
    controllers.mongodb.read('users', {"username": username, "password": password}, function(error, docs) {
        if (error) {
            req.error = error
            return res.renderError(500)
        }

        if (docs && docs.length) {  // If the email exists:
            log.debug('Right password')
        } else {
            req.error = fns.formatError(errors.WRONG_PASSWORD)
            log.error(req.error.message)
            return next()
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

// Update an user
module.exports.updateUser = function(req, res, next) {
    let oldUsername = req.session.user.username
    let {username, email, password} = req.body
    password = password && crypt(password)
    let set = password ? {password} : {}
    async.series([
        // Check if the email exists
        function emailExist(cb) {
            if (email) {
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
                        set = fns.concatObjects(set, {email})
                    }
                    cb()
                })
            } else {
                cb()
            }
        },
        // Check if the username exists
        function usernameExist(cb) {
            if (username) {
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
                        set = fns.concatObjects(set, {username})
                    }
                    cb()
                })
            } else {
                cb()
            }
        },
        // Update the user
        function updateUser(cb) {
            controllers.mongodb.update('users', {"username": oldUsername}, set, function(error, result) {
                if (error) {
                    req.error = error
                    return res.renderError(500)
                }
                log.info('Success udpate')
                cb()
            })
        }
    ], function(error) {
        if (error) {
            log.error(error.message)
            req.error = error
            return res.renderError(500)
        }
        username = username || oldUsername
        delete req.user
        delete req.session.user
        getUser(username, function(error, docs) {
            let user = docs[0]
            req.user = user
            req.session.user = { "id": user._id, "username": user.username }
            next()
        })
    })
}

// Check if an username exist
module.exports.usernameExist = function(req, res, next) {
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
    controllers.mongodb.read('users', {"username": username}, callback, { "project": { "password": 0 } })
}