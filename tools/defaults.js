// ====================================================================================================================
// Requirements
// ====================================================================================================================

//  NPM requirements
const fs = require('fs')
const path = require('path')

// Own modules
const fns = require('./functions')

// ====================================================================================================================
// Module exports
// ====================================================================================================================

// Configuration file definition
module.exports = function(config) {
    return {
        // Server port
        port: {
            required: false,
            type: 'number',
            default: 3000,
            validate: function(port) {
                // Must be a number between 1 and 65535
                return (!isNaN(port) && (1<=Number(port) && 65535>=Number(port)))
            },
            errMsg: 'must be a number between 1 and 65535'
        },
        // Server domain
        domain: {
            required: false,
            type: 'string',
            default: 'localhost',
            validate: function(domain) {
                // Must be either 'localhost' or a valid IP/domain
                let ipRegex = /(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}/
                let domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/
                return (ipRegex.test(domain) || domainRegex.test(domain) || domain === 'localhost')
            },
            errMsg: 'must be either "localhost" or a valid IP/domain'
        },
        // Logging level
        logLevel: {
            required: false,
            type: 'number',
            default: 1,
            validate: function(logLevel) {
                // Must be a number between 0 and 4
                return [1, 2, 3, 4].indexOf(logLevel) !== -1
            },
            errMsg: 'must be a number between 1 and 4'
        }
    }
}