// ====================================================================================================================
// Requirements
// ====================================================================================================================

// Node modules
const _ = require('underscore')
const colors = require('colors')

// ====================================================================================================================
// Generic functions
// ====================================================================================================================

// Logger function
const log = function(type, message) {
    console.log.apply(this, ['[' + type + '] ' + _.first(message)].concat(_.rest(message)))
}

// ====================================================================================================================
// Module exports
// ====================================================================================================================

// Export order
module.exports.order = 2

// Load
// Parameters:
// - cb:   [Function] Callback.
exports.load = function(cb) {
    // Export global logging function
    global.log = {
        error: function() {
            if(config.logLevel >= 1) {
                return log('error'.red, arguments)
            }
        },
        warn: function() {
            if(config.logLevel >= 2) {
                return log('warn'.green, arguments)
            }
        },
        info: function() {
            if(config.logLevel >= 3) {
                return log('info'.blue, arguments)
            }
        },
        success: function() {
            // Same log level as 'info'
            if(config.logLevel >= 3) {
                return log('success'.green, arguments)
            }
        },
        query: function() {
            // Same log level as 'info'
            if(config.logLevel >= 3) {
                return log('query'.yellow, arguments)
            }
        },
        debug: function() {
            if(config.logLevel >= 4) {
                return log('debug'.grey, arguments)
            }
        }
    }
    cb()
}