// ====================================================================================================================
// Dependencies
// ====================================================================================================================

// Node modules
const util = require('util')

// ====================================================================================================================
// Generic functions
// ====================================================================================================================

// Logger function
const log = function(type, message) {
    console.log(`[${type}] ${message}`)
}

// Get formatted message
const getFormattedMessage = function(argsObject) {
    let argsArray = Array.prototype.slice.call(argsObject)
    return eval('util.format(\'' + argsArray.join('\',\'') + '\')')
}

// ====================================================================================================================
// Module exports
// ====================================================================================================================

module.exports = function(logLevel) {
    logLevel = logLevel || 1
    return {
        error: function() {
            if(logLevel <= 1) {
                return log('error', getFormattedMessage(arguments))
            }
        },
        warn: function() {
            if(logLevel <= 2) {
                return log('warn', getFormattedMessage(arguments))
            }
        },
        info: function() {
            if(logLevel <= 3) {
                return log('info', getFormattedMessage(arguments))
            }
        },
        debug: function() {
            if(logLevel <= 4) {
                return log('debug', getFormattedMessage(arguments))
            }
        }
    }
}