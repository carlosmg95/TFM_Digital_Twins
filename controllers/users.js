// ====================================================================================================================
// Dependencies
// ====================================================================================================================

// Node modules
const async = require('async')

// ====================================================================================================================
// Module exports
// ====================================================================================================================

module.exports.create = function(req, res, next) {
    let { username, email, password } = req.body
    let article = { username, email, "password": crypt(password) }

    async.series([
        // Check if the email exists
        function emailExist(cb) {
            mongodb.read('users', {email}, function(error, docs) {
                if (error) {
                    req.error = error
                    return res.renderError(500)
                }

                if (docs && docs.length) {  // If the email exists:
                    req.error = error = fns.formatError(errors.EXISTING_EMAIL, email)
                    return res.renderError(500)
                } else {
                    log.debug('Email free')
                }
                cb()
            })
        },
        // Check if the username exists or it is correct
        function usernameExist(cb) {
            mongodb.read('users', {username}, function(error, docs) {
                if (error) {
                    req.error = error
                    return res.renderError(500)
                }

                // If the username exists or it is a reserved word:
                if ((docs && docs.length) || fns.arrayContains(config.reservedWords, username)) {
                    req.error = error = fns.formatError(errors.EXISTING_USERNAME, username)
                    return res.renderError(500)
                } else if (fns.checkWrongName(username)) {
                    req.error = error = fns.formatError(errors.WRONG_FORMAT_USER, username)
                    return res.renderError(500)
                } else {
                    log.debug('Username free')
                }
                cb()
            })
        },
        // Save the user
        function saveUser(cb) {
            mongodb.create('users', article, function(error, result) {
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
    let functions
    let userId = req.session.user.id
    let where = { username, "password": crypt(password) }

    delete req.user
    delete req.session.user

    async.series([
        // Delete the user
        function(cb) {
            mongodb.delete('users', where, function(error, result) {
                if (error) {
                    req.error = error
                    return res.renderError(500)
                }
                return cb()
            })
        },
        // Get the user's models
        function(cb) {
            mongodb.read('models', { "owner_id": userId }, function(error, docs) {
                if (error) {
                    req.error = error
                    return res.renderError(500)
                }
                let userModels = docs
                functions = userModels.map(function(model) {
                    return function(cb) {
                        models.deleteModelAux(model, userId, cb)  // Prepare the delete functions
                    }
                })
                cb()
            })
        },
        // Delete the models
        function(cb) {
            async.parallel(functions, function(error, result) {
                if (error) {
                    req.error = error
                    return res.renderError(500)
                }
                cb()
            })
        }
    ], function(error, result) {
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

    mongodb.read('users', {email}, function(error, docs) {
        if (error) {
            req.error = error
            return res.renderError(500)
        }

        if (docs && docs.length) {  // If the email exists:
            req.error = fns.formatError(errors.EXISTING_EMAIL, email)
            log.error(req.error.message)
            return next()
        }
        return next()
    })
}

module.exports.rightPassword = function(req, res, next) {
    let id = req.session.user.id
    let password = crypt(req.params.password)
    let where = {"_id": mongodb.stringToObjectId(id), password}
    
    mongodb.read('users', where, function(error, docs) {
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
    const id = req.session.user.id
    getUser(id, function(error, docs) {
        if (!docs || docs.length === 0) {
            return res.renderError(404)
        }
        req.user = docs[0]
        next()
    })
}

// Update an user
module.exports.updateUser = function(req, res, next) {
    let {username, email, password, id} = req.body
    password = password && crypt(password)
    let set = password ? {password} : {}
    async.series([
        // Check if the email exists
        function emailExist(cb) {
            if (email) {
                mongodb.read('users', {email}, function(error, docs) {
                    if (error) {
                        req.error = error
                        return res.renderError(500)
                    }

                    if (docs && docs.length) {  // If the email exists:
                        req.error = error = fns.formatError(errors.EXISTING_EMAIL, email)
                        return res.renderError(500)
                    } else {
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
                mongodb.read('users', {username}, function(error, docs) {
                    if (error) {
                        req.error = error
                        return res.renderError(500)
                    }

                    // If the username exists or it is a reserved word:
                    if ((docs && docs.length) || fns.arrayContains(config.reservedWords, username)) {
                        req.error = error = fns.formatError(errors.EXISTING_USERNAME, username)
                        return res.renderError(500)
                    } else if (fns.checkWrongName(username)) {
                        req.error = error = fns.formatError(errors.WRONG_FORMAT_USER, username)
                        return res.renderError(500)
                    } else {
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
            mongodb.update('users', {"_id": mongodb.stringToObjectId(id)}, set, function(error, result) {
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
        next()
    })
}

// Check if an username exist
module.exports.usernameExist = function(req, res, next) {
    let username = req.params.username

    mongodb.read('users', {username}, function(error, docs) {
        if (error) {
            req.error = error
            return res.renderError(500)
        }

        // If the username exists or it is a reserved word:
        if ((docs && docs.length) || fns.arrayContains(config.reservedWords, username)) {
            req.error = fns.formatError(errors.EXISTING_USERNAME, username)
            log.error(req.error.message)
            return next()
        }
        return next()
    })
}

// ====================================================================================================================
// Private functions
// ====================================================================================================================

const getUser = function(id, callback) {
    mongodb.read(
        'users',
        {"_id": mongodb.stringToObjectId(id)},
        callback,
        { "project": { "password": 0 } }
    )
}
