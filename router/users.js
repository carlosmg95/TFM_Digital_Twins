// ====================================================================================================================
// Dependencies
// ====================================================================================================================

// Own modules
const fns = require('../tools/functions')
const controllers = require('../controllers')

// ====================================================================================================================
// Route definition
// ====================================================================================================================

module.exports = function(app) {
    // Index
    // TODO: require user for /profile
    app.get('/profile', controllers.users.show, controllers.render('users/profile/data'))
    app.get('/profile/:username', controllers.users.show, controllers.render('users/profile/data'))
}
