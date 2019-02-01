// ====================================================================================================================
// Dependencies
// ====================================================================================================================

// Own modules
const api = require('../api')

// ====================================================================================================================
// Common API responses
// ====================================================================================================================

//  Generic API response
module.exports.ok = function(req, res) {
    if(req.error) {
        return res.api.error(req.error)
    }
    // Return OK
    res.api.ok()
}

//  API response to get data
module.exports.data = function(req, res) {
    if(req.error) {
        return res.api.error(req.error)
    }
    // Return data
    res.api.ok(req.data)
}

//  API response to retrieve a file
module.exports.file = function(req, res) {
    if(req.error) {
        return res.api.error(req.error)
    }
    // Return file
    res.sendFile(req.file)
}

// API response to redirect to a file
module.exports.redirect = function(req, res) {
    if(req.error) {
        return res.api.error(req.error)
    }
    // Redirect to req.url
    res.redirect(req.url)
}
