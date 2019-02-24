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
module.exports.create = function(req, res, next) {
    let { username, password } = req.body
    auth(username, crypt(password), function(error, docs) {
        if (error) {
            req.error = error
            return res.renderError(500)
        }
        if (!docs || docs.length === 0) {
            req.error = fns.formatError(errors.WRONG_USER)
            log.error(req.error.message)
            return res.api.error(req.error)
        }
        let user = docs[0]
        req.user = user
        req.session.user = { "id": user._id, "username": user.username }
        next()
    })
}

module.exports.destroy = function(req, res, next) {
    delete req.user
    delete req.session.user
    res.redirect('/login')
}

// ====================================================================================================================
// Private functions
// ====================================================================================================================

const auth = function(username, password, callback) {
    controllers.mongodb.read('users', {"username": username, "password": password}, callback)
}