// ====================================================================================================================
// Dependencies
// ====================================================================================================================

// Node modules
const glob = require('glob')
const path = require('path')

// Own modules
const errors = require('../tools/errors')

// ====================================================================================================================
// Functions
// ====================================================================================================================

// OK response
let api_ok = function(res) {
    return function(data) {
        return res.json({
            code: 0,
            data: data
        })
    }
}
// Not OK response
let api_err = function(res) {
    return function(err, code) {
        let e = err

        if (err instanceof Error) {
            e = err.name + ':' + err.message
            console.log(e.stack)
        }

        if (err && err.code && err.message) {
            code = err.code
            e = err.message
        }
        return res.json({
            code: code || 1,
            error: e
        })
    }
}

// ====================================================================================================================
// Module exports
// ====================================================================================================================

// Module exports
module.exports = {

    // Initialization
    init: function(req, res, next) {
        res.api = {}
        res.api.ok = api_ok(res)
        res.api.error = api_err(res)
        next()
    },

    // Error handler
    error: function(err, req, res, next) {
        if (err) {
            console.error("Body: " + err.body)
            console.error("Stack: " + err.stack)
            return api_err(res)(errors.WRONG_SYNTAX)
        } else {
            next()
        }
    },

    // Default fallback
    fallback: function(req, res) {
        return api_err(res)(errors.UNKNOWN_AP)
    }
}

// ====================================================================================================================
// Export other controllers
// ====================================================================================================================

// Export JS files in same folder as part of API
let files = glob.sync(path.join(__dirname, '*.js'))
files.forEach(function(file) {
    name = path.basename(file, '.js')
    if(name != 'index') {
        module.exports[name] = require(file)
    }
})
