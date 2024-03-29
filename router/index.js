// ====================================================================================================================
// Dependencies
// ====================================================================================================================

// Node modules
const path = require('path')
const glob = require('glob')

// Own modules
const api = require('../api')
const controllers = require('../controllers')

// ====================================================================================================================
// Module exports
// ====================================================================================================================

module.exports = {
    // Function for initializing the router
    mount: function(app) {
        // Prepare the error handler
        app.use('/api/*', api.error)
        // Init the res obj in api calls
        app.all('/api/*', api.init)
        // Init the res obj in controllers
        app.all('/*', controllers.init)

        return glob(path.join(__dirname, '*.js'), function(err, files) {
            for (let i in files) {
                let filename = files[i]

                if (/index\.js$|mqtt\.js$/.test(filename)) {
                    continue
                }

                let router = require(filename)
                router(app)
            }
            //  Default fallback
            app.all('/api/*', api.fallback)
            app.all('/*', controllers.fallback)
        })
    },

    // Function for initializing the MQTT router
    mountMQTT: function(client) {
        return glob(path.join(__dirname, '*.js'), function(err, files) {
            for (let i in files) {
                let filename = files[i]

                if (/mqtt\.js$/.test(filename)) {
                    let router = require(filename)
                    router(client)
                }
            }
        })
    }
}
