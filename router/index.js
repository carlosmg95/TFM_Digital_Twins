// ====================================================================================================================
// Dependencies
// ====================================================================================================================

// Node modules
const path = require('path')
const glob = require('glob')

// Own modules
const api = require('../api')

// ====================================================================================================================
// Module exports
// ====================================================================================================================

module.exports = {
    // Function for initializingthe router
    mount: function(app){
        // Prepare the error handler
        app.use('/*', api.error)
        // Init the res obj in api calls
        app.all('/*', api.init)

        return glob(path.join(__dirname, '*.js'), function(err, files) {
            for (let i in files) {
                let filename = files[i]

                if (/index.js$/.test(filename)) {
                    continue
                }

                let router = require(filename)
                router(app)
            }
            //  Default fallback
            app.all('/*', api.fallback)
        })
    }
}
