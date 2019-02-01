// ====================================================================================================================
// Module exports
// ====================================================================================================================

// API errors
module.exports = {
    WRONG_SYNTAX:       {code: 100, message: 'Wrong syntax'},
    UNKNOWN_AP:         {code: 101, message: 'Unknown access point'},
    RESOURCE_NOT_FOUND: {code: 200, message: 'Resource not found'},
    MISSING_FIELDS:     {code: 300, message: 'Missing field "%p"'},
    WRONG_TYPE:         {code: 301, message: 'Wrong type "%p" for field "%p"'},
    WRONG_FIELDS:       {code: 302, message: 'Error in field "%p": %p'}
}