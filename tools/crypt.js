// ====================================================================================================================
// Dependencies
// ====================================================================================================================

// Node modules
const CryptoJS = require('crypto-js')

// ====================================================================================================================
// Module exports
// ====================================================================================================================

module.exports = {}

// Define backend encryption function
module.exports = function(data) {
	return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex)
}
