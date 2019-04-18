// ====================================================================================================================
// Dependencies
// ====================================================================================================================

// Node modules
const async = require('async')

// ====================================================================================================================
// Module exports
// ====================================================================================================================

module.exports.create = function(req, res, next) {
    console.log(req.body)
    next()
}

module.exports.new = function(req, res, next) {
    let owenerId = req.session.user.id

    mongodb.read('models', {owenerId}, function(error, docs) {
        if (error) {
            req.error = error
            log.error(req.error)
            return next()
        }
        req.userModels = docs
        next()
    }, { "sort": { "name": 1 } })
}