// ====================================================================================================================
// Dependencies
// ====================================================================================================================

// Node modules
const fs = require('fs')
const path = require('path')
const colors = require('colors')

// Own modules
const fns = require('../tools/functions')
const log = require('../tools/logger')()
const validate = require('../tools/validator')
const defaultConfig = require('../conf/config.dist')

// ====================================================================================================================
// Parameters
// ====================================================================================================================

// Package configuration (from package.json)
let packageConfig = {}
// Extra configuration properties
let extraConfig = {}

const loadExtraConfiguration = function(customConfig) {
    // Package config (from package.json)
    packageConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'))

    // Extra configuration properties
    extraConfig.faviconLocation = 'public/favicon.ico'
    extraConfig.logo = fns.getLogoASCII().white
    extraConfig.introMsg = "" + 
        (packageConfig.name ?     "Project: " + packageConfig.name.bgBlack +     ".\n" : "") + 
        (packageConfig.version ?  "Version: " + packageConfig.version.bgBlack +  ".\n" : "") + 
        (packageConfig.homepage ? "Docs:    " + packageConfig.homepage.bgBlack + ".\n" : "")
}

// ====================================================================================================================
// Module exports
// ====================================================================================================================

// Load
// Parameters:
// - cb:   [Function] Callback.
module.exports.load = function(cb) {

    // Check that configuration file exists
    if(!fs.existsSync(path.join(__dirname, '..', 'conf', 'config.js'))) {
        log.error('File "config.js" not found in ' + path.join(__dirname, '..', 'conf'))
        console.log('')
        process.exit(1)
    }

    // Validate config object
    let customConfig = validate(require('../conf/config'))

    // Load extra configuration
    loadExtraConfiguration(customConfig)

    // Append package.json properties and extra config properties to config
    customConfig = fns.concatObjects(customConfig, extraConfig)
    customConfig = fns.concatObjects(customConfig, {project:   packageConfig})

    // Return config object
    global.config = customConfig

    // Callback
    cb()
}
