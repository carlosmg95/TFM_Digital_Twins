// ====================================================================================================================
// Dependencies
// ====================================================================================================================

// Node modules
const glob = require('glob')
const path = require('path')

// Own modules
const fns = require('../tools/functions')
const errors = require('../tools/errors')

// ====================================================================================================================
// Module exports
// ====================================================================================================================

// Index message
module.exports.index = function(req, res, next) {
    // Export and call next
    req.data = config.introMsg.trim()
    return next()
}

// Render common locals
module.exports.prerender = function(req, res) {
    res.locals.path =     req.path
    res.locals.baseUrl = 'http://' + config.domain + (config.port === 80 ? '' : ':' + config.port)
    res.locals.fns =      fns
}

//  Function to render a page
module.exports.render = function(page, data) {
    return function(req, res, next) {
        // Append path to locals
        module.exports.prerender(req, res)
        //  Render page
        res.render(page, data)
    }
}

// Function to redirect
module.exports.redirect = function(url) {
    return function(req, res) {
        return res.redirect(url)
    }
}

// ====================================================================================================================
// Export other controllers
// ====================================================================================================================

// Export JS files in same folder as part of controllers
let files = glob.sync(path.join(__dirname, '*.js'))
files.forEach(function(file) {
    name = path.basename(file, '.js')
    if(name != 'index') {
        module.exports[name] = require(file)
    }
})
