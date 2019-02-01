// ====================================================================================================================
// Dependencies
// ====================================================================================================================

//  Node modules
const glob = require('glob')
const async = require('async')
const path = require('path')

// ====================================================================================================================
// Module exports
// ====================================================================================================================

module.exports = {
    load : function(args) {
        const files = glob.sync(path.join(__dirname, '*.js'))
        async.eachSeries(files, function(file, cb) {
            if (!/index.js$/.test(file)) {
                require(file).load(args, cb)
            } else { 
                cb() 
            }
        }, function(error) {
            if(error) {
                console.log(error.message || error)
                process.exit(error.code || 1)
            }
        })
    }
}
