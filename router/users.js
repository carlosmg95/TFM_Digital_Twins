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
    app.get('/profile*', controllers.session.requireUser, controllers.users.show)
    app.get('/profile', controllers.render('users/profile/data', 'layout-users'))
    app.get('/profile/settings', controllers.render('users/profile/conf', 'layout-users'))
    app.get('/profile/models', controllers.render('users/profile/models', 'layout-users'))
}
