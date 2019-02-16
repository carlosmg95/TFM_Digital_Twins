// ====================================================================================================================
// Dependencies
// ====================================================================================================================

// Node modules
const mongo = require('./mongodb')
const path = require('path')

// Own modules
const fns = require('../tools/functions')

// ====================================================================================================================
// Module exports
// ====================================================================================================================

module.exports.create = function (req, res, next) {
    let { username, email, password } = req.body
    let article = { username, email, password }
    mongo.create('users', article, function(error, result) {
        if (error) {
            log.error(error)
            return next()
        }
        log.debug(`Inserted user with ID: ${result.insertedId}`)
        next()
    })
}