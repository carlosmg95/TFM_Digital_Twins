// ====================================================================================================================
// Requirements
// ====================================================================================================================

// NPM modules
const path = require('path')

// Own modules
const getDefaults = require('./defaults')

// ====================================================================================================================
// Aux functions
// ====================================================================================================================

// Exit with error
const exitWithError = function(config, defaults, error) {
    require('./logger')(config.logLevel || defaults.logLevel.default)
        .error('Error in file ' + path.join(__dirname, '..', 'conf', 'config.js') + ': ' + error)
    console.log('')
    process.exit(1)
}

// ====================================================================================================================
// Module exports
// ====================================================================================================================

module.exports = function(config) {

    // Get defaults
    let defaults = getDefaults(config)

    // Validate configuration
    for(let attr in defaults) {
        if(!config[attr]) {
            // If field is missing but required, exit
            if(defaults[attr].required === true) {
                return exitWithError(config, defaults, '"' + attr + '" is a required field')
            // If missing but not required, set default value
            } else {
                config[attr] = defaults[attr].default
            }
        }
        if(config[attr] !== null) {
            // If type of attribute is not the required one, exit
            if(defaults[attr].type !== typeof(config[attr])) {
                return exitWithError(config, defaults, 
                    '"' + attr + '" must be a ' + defaults[attr].type + ', not a ' + typeof(config[attr]))
            }
            // If field is not validated, exit
            if(!defaults[attr].validate(config[attr])) {
                return exitWithError(config, defaults, '"' + attr + '" ' + defaults[attr].errMsg)
            }
        }
    }

    // Return validated config
    return config
}
