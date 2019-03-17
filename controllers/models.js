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

module.exports.uploadModel = function(req, res, next) {
    let file = req.files['model-file']
    let filePath = path.join(__dirname, '../public/models')
    let name = req.body['model-name']

    file.mv(`${filePath}/${file.name}`, function(error) {
        if (!error)
            next()
        else
            console.log(error)
    })
}
