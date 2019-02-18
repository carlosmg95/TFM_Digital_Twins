// ====================================================================================================================
// Dependencies
// ====================================================================================================================

// Own modules
const api = require('../api')
const controllers = require('../controllers')

// ====================================================================================================================
// Route definition
// ====================================================================================================================

module.exports = function(app) {
    app.post('/api/join', controllers.users.create, controllers.render('index'))
    app.get('/api/users/existusername/:username', controllers.users.usernameExist, api.common.data)
    app.get('/api/users/existemail/:email', controllers.users.emailExist, api.common.data)
}
