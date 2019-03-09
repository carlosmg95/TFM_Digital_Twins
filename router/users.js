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
    app.get('/profile*', controllers.session.requireUser)
    app.get('/profile', controllers.users.show, controllers.render('users/profile/data', 'layout-users'))
    app.get('/profile/edit', controllers.render('users/profile/edit', 'layout-users'))
}
