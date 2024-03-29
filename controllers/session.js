// ====================================================================================================================
// Dependencies
// ====================================================================================================================

// Node modules
const async = require('async')

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
        req.session.user = { "id": user._id }
        next()
    })
}

module.exports.destroy = function(req, res, next) {
    delete req.user
    delete req.session.user
    res.redirect('/')
}

module.exports.requireUser = function(req, res, next) {
    if (req.session && req.session.user) {
        return next()
    }
    return res.redirect(`/login?redir=${req.path}`)
}

// ====================================================================================================================
// Private functions
// ====================================================================================================================

const auth = function(username, password, callback) {
    mongodb.read(
        'users',
        { "username": username, "password": password },
        callback,
        { "project": { "password": 0 } }
    )
}