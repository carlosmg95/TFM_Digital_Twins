// ====================================================================================================================
// Dependencies
// ====================================================================================================================

// Own modules
const fns = require('../tools/functions')
const {users, render, session} = require('../controllers')

// ====================================================================================================================
// Route definition
// ====================================================================================================================

module.exports = function(app) {
    // Index
    app.get('/profile*', session.requireUser, users.show)
    app.get('/profile', render('users/profile', 'layout-users'))
    app.get('/profile/settings', render('users/profile/conf', 'layout-users'))
    app.get('/profile/models', render('users/profile/models', 'layout-users'))
}
