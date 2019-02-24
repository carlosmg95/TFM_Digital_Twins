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
    app.get('/', controllers.render('index'))
    app.get('/login', controllers.render('login'))
    app.get('/join', controllers.render('join'))
    app.delete('/session', controllers.session.destroy)
}
