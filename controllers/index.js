// ====================================================================================================================
// Dependencies
// ====================================================================================================================

// Node modules
const glob = require('glob')
const path = require('path')

// Own modules
global.crypt = require('../tools/crypt')
global.errors = require('../tools/errors')
global.fns = require('../tools/functions')


// ====================================================================================================================
// Module exports
// ====================================================================================================================

// Init
module.exports.init = function(req, res, next) {
    // Append renderError function to 'res' object
    res.renderError = renderError(req, res)
    let cookies = req.headers.cookie ? req.headers.cookie.split(';') : []
    next()
}

// Index message
module.exports.index = function(req, res, next) {
    // Export and call next
    req.data = config.introMsg.trim()
    return next()
}

// Render common locals
module.exports.prerender = function(req, res) {    
    res.locals.baseUrl = 'http://' + config.domain + (config.port === 80 ? '' : ':' + config.port)
    res.locals.fns =      fns
    res.locals.path =     req.path
    res.locals.user =     req.user || req.session.user || null
}

// Function to render a page
module.exports.render = function(page, layout, data) {
    // Get layout
    layout = layout || 'layout-main'
    return function(req, res) {
        // Prerender
        module.exports.prerender(req, res)
        res.locals = fns.concatObjects(res.locals, data)
        // Render page
        log.debug('Rendering page: "%s" with layout: "%s"', page, layout)
        res.render(page, {layout: layout})
    }
}

// Function to redirect
module.exports.redirect = function(url) {
    return function(req, res) {
        return res.redirect(url)
    }
}

// Default fallback
module.exports.fallback = function(req, res, next) {
    log.debug('Unknown endpoint: "%s"', req.path)
    return renderError(req, res)(404)
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
        global[name] = require(file)
    }
})

// Function to render an error page
const renderError = function(req, res) {
    return function(errorCode, trace, layout) {
        // Get layout and trace
        layout = layout || 'layout-main'
        // Prerender
        module.exports.prerender(req, res)
        // Build error object
        res.locals.error = {
            code: errors[errorCode].code,
            message: trace || errors[errorCode].message,
            image: errors[errorCode].image
        }
        // Render page
        log.error(res.locals.error.message)
        log.debug('Rendering error page "%d"', errorCode)
        return res.render('error', {layout: layout})
    }
}
