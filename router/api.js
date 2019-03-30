// ====================================================================================================================
// Dependencies
// ====================================================================================================================

// Own modules
const api = require('../api')
const {models, users, render, session} = require('../controllers')

// ====================================================================================================================
// Route definition
// ====================================================================================================================

module.exports = function(app) {
	// Users
    app.post('/api/users/join', users.create, render('index'))
    app.post('/api/users/login', session.create)
    app.get('/api/users/existusername/:username', users.usernameExist, api.common.data)
    app.get('/api/users/existemail/:email', users.emailExist, api.common.data)
    app.get('/api/users/rightpassword/:password', users.rightPassword, api.common.data)
    app.put('/api/users/edituser', users.updateUser, api.common.data)
    app.delete('/api/users/deleteuser', users.deleteUser, api.common.ok)
    // Models
    app.post('/api/models/uploadmodel', models.uploadModel, api.common.data)
    app.get('/api/models/existname/:name', models.nameExist, api.common.data)
    app.get('/api/models/getmodels', models.getModels, api.common.data)
    app.get('/api/models/getmodel/:name', models.getModel, api.common.file)
    app.delete('/api/models/deletemodel', models.deleteModel, api.common.ok)
    app.post('/api/models/setscale', models.updateModel, api.common.ok)
}
