// ====================================================================================================================
// Dependencies
// ====================================================================================================================

// Node modules
const async = require('async')
const fs = require('fs')
const glob = require('glob')
const path = require('path')

// Own modules
const config = require('../conf/config')
const entities = require('../tools/entities')
const errors = require('../tools/errors')

// ====================================================================================================================
// Generic functions
// ====================================================================================================================

// Return true if an array contains an element
module.exports.arrayContains = function(arr, element) {
    return arr.indexOf(element) !== -1
}

// Convert a buffer to ascii
module.exports.bufferToAscii = function(buffer) {
    let arrayAscii = []
    buffer.forEach(function(char, i) {
        this[i] = String.fromCharCode(char)
    }, arrayAscii)
    return arrayAscii
}

// Check if the format is wrong
module.exports.checkWrongName = function(name) {
    let regexp = new RegExp(config.wrongPatterns)
    return name.match(regexp)
}

// Concatenates two objects
module.exports.concatObjects = function(obj1, obj2) {
    let obj = {...obj1, ...obj2}
    return obj
}

// Get properties from .properties file and convert them to JS object
module.exports.convertJavaProperties = function(fileName) {
    // Read file
    let fileContent = fs.readFileSync(fileName, 'utf8')
    // Initialize result
    let r = {}
    let configLines = fileContent.split(/[\n\r]/g)
    for(let i in configLines) {
        if(/[ ]*=[ ]*/.test(configLines[i]) && configLines[i][0] !== '#') {
            let parts = configLines[i].split(/[ ]*=[ ]*/)
            r[parts[0]] = (['true', 'false'].indexOf(parts[1]) === -1 ? parts[1] : eval(parts[1]))
        }
    }
    return r
}

// Encode a string for HTML
module.exports.encodeForHtml = function(str) {
    for(let char in entities) {
        str = str.replace(new RegExp(char, 'gi'), entities[char].name)
    }
    return str
}

// Replace characters '%p' with parameters
String.prototype.format = function(params, replaceChar) {
    replaceChar = replaceChar || '%p'
    if(!params) {
        return this
    }
    if(typeof(params)!=='object') {
        params = [params]
    }
    let r = this
    for(let i in params) {
        r = r.replace(replaceChar, params[i])
    }
    return r
}

// Substitutes a character in an error object
module.exports.formatError = function(error, replaceContent, replaceChar) {
    let err = {
        "code": error.code,
        "message": error.message.format(replaceContent, replaceChar)
    }
    return err
}

// Get the code of an error
module.exports.getErrorCode = function(error) {
    return errors[error].code
}

// Return sbmsimulator logo
module.exports.getLogoASCII = function() {
    // Generated with http://patorjk.com/software/taag
    return "" +
        "  ██████╗  ██████╗ ██╗ ██████╗ ████████╗██╗    ██╗██╗███╗   ██╗███████╗" + "\n" +
        "  ██╔══██╗██╔════╝ ██║██╔═══██╗╚══██╔══╝██║    ██║██║████╗  ██║██╔════╝" + "\n" +
        "  ██║  ██║██║  ███╗██║██║   ██║   ██║   ██║ █╗ ██║██║██╔██╗ ██║███████╗" + "\n" +
        "  ██║  ██║██║   ██║██║██║   ██║   ██║   ██║███╗██║██║██║╚██╗██║╚════██║" + "\n" +
        "  ██████╔╝╚██████╔╝██║╚██████╔╝   ██║   ╚███╔███╔╝██║██║ ╚████║███████║" + "\n" +
        "  ╚═════╝  ╚═════╝ ╚═╝ ╚═════╝    ╚═╝    ╚══╝╚══╝ ╚═╝╚═╝  ╚═══╝╚══════╝" + "\n" 
}

// Validates a request body
module.exports.getRequestBodyErrors = function(options) {
    for(let i in options.requiredFields) {
        if(!options.content[options.requiredFields[i]]) {
            return module.exports.formatError(errors.MISSING_FIELDS, options.requiredFields[i])
        }
    }
    return null
}

// Get the reserved words
module.exports.getReservedWords = function() {
    return config.reservedWords
}

// Get parameters from an Url
module.exports.getUrlParams = function(url) {
    var parts = url.split('?')
    if(parts.length < 2) {
        return []
    }
    return parts[1].split('&').map(function(queryStr) {
        var param = queryStr.split('=')
        return {
            key: param[0],
            value: param[1] || null
        }
    })
}

// Get the wrongPatterns var
module.exports.getWrongPatterns = function() {
    return config.wrongPatterns.replace(/\\/g, '\\\\')
}

// Returns true if the path is like the string provided
module.exports.pathLike = function(path, string, regExp) {
    var noParamsPath = path.split('?')[0]
    var relativeUrl = noParamsPath.replace(`${config.baseUrl}/`, '')
    if(regExp) {
        var regExp = new RegExp(regExp)
        const match = relativeUrl.match(regExp)
        return match && match[0] ? true : false
    }
    return relativeUrl === string
}

// Read the MQTT msg
module.exports.readMQTT = function(buffer) {
    if ((buffer[0] & 0xd0) !== 0xd0)
        return
    if ((buffer[0] & 0x08) !== 0)
        return
    let len = buffer[1]
    let type = buffer[0] & 0x7
    let data = +buffer.toString('ascii', 2, len + 2).replace(',', '.')
    return { data, len, type }
}

// Remove a string slice in every element from an array
module.exports.removeFromArrayElements = function(arr, contentToRemove) {
    if(typeof(contentToRemove) !== 'object') {
        contentToRemove = [contentToRemove]
    }
    for(let j in contentToRemove) {
        for(let i in arr) {
            arr[i] = arr[i].replace((new RegExp(contentToRemove[j], 'g')), '')
        }
    }
    return arr
}

// Checks that two objects have the same properties
module.exports.sameProperties = function(obj, referenceObj) {
    let r = true
    for(let i in referenceObj) {
        if(!obj[i]) {
            r = false
        } else {
            if(typeof(referenceObj[i]) === 'object') {
                r = module.exports.sameProperties(obj[i], referenceObj[i])
            }
        }
    }
    return r
}

// Return true if a string contains a character
module.exports.stringContains = function(str, element) {
    return str.indexOf(element) !== -1
}
