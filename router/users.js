// ====================================================================================================================
// Dependencies
// ====================================================================================================================

// Own modules
const fns = require('../tools/functions')
const {models, users, render, session} = require('../controllers')

// ====================================================================================================================
// Route definition
// ====================================================================================================================

module.exports = function(app) {
    app.get('/profile*', session.requireUser, users.show)
    // Index
    app.get('/profile', render('users/profile', 'layout-users'))
    // Settings
    app.get('/profile/settings', render('users/profile/conf', 'layout-users'))
    // Models
    app.get('/profile/models', render('users/profile/models', 'layout-users'))
    app.get('/profile/models/:name', models.getModels, render('users/profile/models/model', 'layout-users'))
    // Stages
    app.get('/profile/stages', render('users/profile/stages', 'layout-users'))
}
