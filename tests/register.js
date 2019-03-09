// ====================================================================================================================
// Dependencies
// ====================================================================================================================

// Own modules
const config = require('../nightwatch.json')
const errors = require('../tools/errors')
const fns = require('../tools/functions')

let username = `${Math.random()}carlos${Math.random()}`

// ====================================================================================================================
// Module exports
// ====================================================================================================================

module.exports = {
    '@tags': ['create', 'user'],
    before: function(browser) {
        console.log('Starting create new user test...')
        browser
            // Show register page
            .url('http://localhost:3000/join')
            .waitForElementVisible('body')
    },

    after: function(browser) {
        console.log('Create new user test finished')
        browser.end()
    },

    beforeEach : function(browser) {
        browser
            .getAttribute('form', 'id', function(result) {
                if (result.value && result.value === 'signup-form') {
                    browser
                        .clearValue('form#signup-form input[name=signup-username]')
                        .clearValue('form#signup-form input[name=signup-email]')
                        .clearValue('form#signup-form input[name=signup-password]')
                        .clearValue('form#signup-form input[name=signup-repeat-password]')
                        .setValue('form#signup-form input[name=signup-username]', username)
                        .setValue('form#signup-form input[name=signup-email]', `${Math.random()}carlos${Math.random()}@prueba.com`)
                        .setValue('form#signup-form input[name=signup-password]', '1234')
                        .setValue('form#signup-form input[name=signup-repeat-password]', '1234')
                } else if (result.value && result.value === 'login-form') {
                    browser
                        .clearValue('form#login-form input[name=login-username]')
                        .clearValue('form#login-form input[name=login-password]')
                        .setValue('form#login-form input[name=login-username]', username)
                        .setValue('form#login-form input[name=login-password]', '1234')
                }
            })
    },

    // Try to send empty form - Should FAIL -> Error in every input
    'Try to send empty form': function(browser) {
        browser
            .clearValue('form#signup-form input[name=signup-username]')
            .clearValue('form#signup-form input[name=signup-email]')
            .clearValue('form#signup-form input[name=signup-password]')
            .clearValue('form#signup-form input[name=signup-repeat-password]')
            .click('button#signup-btn')
            .waitForElementVisible('form#signup-form input[name=signup-username] + div.form-group-error', 'Error appears')
            .assert.containsText('form#signup-form input[name=signup-username] + div.form-group-error', 'Rellenar username', 'Error because empty username')
            .waitForElementVisible('form#signup-form input[name=signup-email] + div.form-group-error', 'Error appears')
            .assert.containsText('form#signup-form input[name=signup-email] + div.form-group-error', 'Formato incorrecto', 'Error because wrong email format')
            .waitForElementVisible('form#signup-form input[name=signup-password] + div.form-group-error', 'Error appears')
            .assert.containsText('form#signup-form input[name=signup-password] + div.form-group-error', 'Rellenar contraseña', 'Error because empty password1')
            .waitForElementVisible('form#signup-form input[name=signup-repeat-password] + div.form-group-error', 'Error appears')
            .assert.containsText('form#signup-form input[name=signup-repeat-password] + div.form-group-error', 'Rellenar contraseña', 'Error because empty password2')
            .assert.containsText('button#signup-btn', 'Registrarse', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/join', 'It cannot send no data')
            .saveScreenshot('tests/screenshots/emptyForm.png')
    },

    // Try to send form with empty username - Should FAIL -> Error in username input
    'Try to send form with empty username': function(browser) {
        browser
            .clearValue('form#signup-form input[name=signup-username]')
            .click('button#signup-btn')
            .waitForElementVisible('form#signup-form input[name=signup-username] + div.form-group-error', 'Error appears')
            .assert.containsText('form#signup-form input[name=signup-username] + div.form-group-error', 'Rellenar username', 'Error because empty username')
            .assert.containsText('button#signup-btn', 'Registrarse', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/join', 'It cannot send no data')
            .saveScreenshot('tests/screenshots/emptyUsername.png')
    },

    // Try to send form with existing username - Should FAIL -> Error in username input
    'Try to send form with existing username': function(browser) {
        let localUsername = 'carlosmg95'
        browser
            .clearValue('form#signup-form input[name=signup-username]')
            .setValue('form#signup-form input[name=signup-username]', localUsername)
            .click('button#signup-btn')
            .waitForElementVisible('form#signup-form input[name=signup-username] + div.form-group-error', 'Error appears')
            .assert.containsText('form#signup-form input[name=signup-username] + div.form-group-error', fns.formatError(errors.EXISTING_USERNAME, localUsername).message, 'Error because the username exists')
            .assert.containsText('button#signup-btn', 'Registrarse', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/join', 'It cannot send no data')
            .saveScreenshot('tests/screenshots/existingUsername.png')
    },

    // Try to send form with wrong username - Should FAIL -> Error in username input
    'Try to send form with wrong username': function(browser) {
        let usernames = ['espa cio', 'car?los', 'car=', '+carlos', '$echo', 'm&t', '100%', '~user', '**', '/home']
        for (let i in usernames) {
            browser
                .clearValue('form#signup-form input[name=signup-username]')
                .setValue('form#signup-form input[name=signup-username]', usernames[i])
                .click('button#signup-btn')
                .waitForElementVisible('form#signup-form input[name=signup-username] + div.form-group-error', 'Error appears')
                .assert.containsText('form#signup-form input[name=signup-username] + div.form-group-error', 'El nombre de usuario no puede contener espacios ni caracteres especiales', 'Error because wrong username format')
                .assert.containsText('button#signup-btn', 'Registrarse', 'We are not waiting for data')
                .assert.urlEquals('http://localhost:3000/join', 'It cannot send no data')
                .saveScreenshot(`tests/screenshots/wrongUsername${i}.png`)
        }
    },

    // Try to send form with empty email - Should FAIL -> Error in email input
    'Try to send form with empty email': function(browser) {
        browser
            .clearValue('form#signup-form input[name=signup-email]')
            .click('button#signup-btn')
            .waitForElementVisible('form#signup-form input[name=signup-email] + div.form-group-error', 'Error appears')
            .assert.containsText('form#signup-form input[name=signup-email] + div.form-group-error', 'Formato incorrecto', 'Error because empty email')
            .assert.containsText('button#signup-btn', 'Registrarse', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/join', 'It cannot send no data')
            .saveScreenshot('tests/screenshots/emptyEmail.png')
    },

    // Try to send form with existing email - Should FAIL -> Error in email input
    'Try to send form with existing email': function(browser) {
        let email = 'carlosmoro95@gmail.com'
        browser
            .clearValue('form#signup-form input[name=signup-email]')
            .setValue('form#signup-form input[name=signup-email]', email)
            .click('button#signup-btn')
            .waitForElementVisible('form#signup-form input[name=signup-email] + div.form-group-error', 'Error appears')
            .assert.containsText('form#signup-form input[name=signup-email] + div.form-group-error', fns.formatError(errors.EXISTING_EMAIL, email).message, 'Error because the email exists')
            .assert.containsText('button#signup-btn', 'Registrarse', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/join', 'It cannot send no data')
            .saveScreenshot('tests/screenshots/existingEmail.png')
    },

    // Try to send form with wrong email - Should FAIL -> Error in email input
    'Try to send form with wrong email': function(browser) {
        let emails = ['carlos', 'carlos@', 'carlos@gmail']
        for (let i in emails) {
            browser
                .clearValue('form#signup-form input[name=signup-email]')
                .setValue('form#signup-form input[name=signup-email]', emails[i])
                .click('button#signup-btn')
                .waitForElementVisible('form#signup-form input[name=signup-email] + div.form-group-error', 'Error appears')
                .assert.containsText('form#signup-form input[name=signup-email] + div.form-group-error', 'Formato incorrecto', 'Error because wrong email format')
                .assert.containsText('button#signup-btn', 'Registrarse', 'We are not waiting for data')
                .assert.urlEquals('http://localhost:3000/join', 'It cannot send no data')
                .saveScreenshot(`tests/screenshots/wrongEmail${i}.png`)
        }
    },

    // Try to send form with empty password1 - Should FAIL -> Error in passwprd1 input
    'Try to send form with empty password1': function(browser) {
        browser
            .clearValue('form#signup-form input[name=signup-password]')
            .click('button#signup-btn')
            .waitForElementVisible('form#signup-form input[name=signup-password] + div.form-group-error', 'Error appears')
            .assert.containsText('form#signup-form input[name=signup-password] + div.form-group-error', 'Rellenar contraseña', 'Error because empty password1')
            .assert.containsText('button#signup-btn', 'Registrarse', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/join', 'It cannot send no data')
            .saveScreenshot('tests/screenshots/emptyPassword1.png')
    },

    // Try to send form with empty password2 - Should FAIL -> Error in passwprd1 input
    'Try to send form with empty password2': function(browser) {
        browser
            .clearValue('form#signup-form input[name=signup-repeat-password]')
            .click('button#signup-btn')
            .waitForElementVisible('form#signup-form input[name=signup-repeat-password] + div.form-group-error', 'Error appears')
            .assert.containsText('form#signup-form input[name=signup-repeat-password] + div.form-group-error', 'Rellenar contraseña', 'Error because empty password2')
            .assert.containsText('button#signup-btn', 'Registrarse', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/join', 'It cannot send no data')
            .saveScreenshot('tests/screenshots/emptyPassword2.png')
    },

    // Try to send form with different passwords - Should FAIL -> Error in passwprd2 input
    'Try to send form with different passwords': function(browser) {
        browser
            .clearValue('form#signup-form input[name=signup-repeat-password]')
            .setValue('form#signup-form input[name=signup-repeat-password]', '5678')
            .click('button#signup-btn')
            .waitForElementVisible('form#signup-form input[name=signup-repeat-password] + div.form-group-error', 'Error appears')
            .assert.containsText('form#signup-form input[name=signup-repeat-password] + div.form-group-error', 'Las contraseñas deben ser igual', 'Error because different passwords')
            .assert.containsText('button#signup-btn', 'Registrarse', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/join', 'It cannot send no data')
            .saveScreenshot('tests/screenshots/differentPasswords.png')
    },

    // Try to send good form - Should SUCCESS -> Show /profile url
    'Try to send good form': function(browser) {
        browser
            .click('button#signup-btn')
            .waitForElementVisible('body')
            .assert.urlEquals('http://localhost:3000/profile', 'It access to the profile page')
            .assert.containsText('span.mr-2.d-none.d-lg-inline.text-gray-600.small', `${username}`, 'Correct user')
            .saveScreenshot('tests/screenshots/rightForm.png')
            .click('li#setting-profile-btn')
            .click('a#logout-link')
            .waitForElementVisible('body')
            .click('a#login-link')
            .waitForElementVisible('body')
            .assert.urlEquals('http://localhost:3000/login', 'Succed logout')
    },

    // Try to login without username - Should FAIL -> Show /login url and error username input
    'Try to login without username': function(browser) {
        browser
            .clearValue('form#login-form input[name=login-username]')
            .click('button#login-btn')
            .waitForElementVisible('form#login-form input[name=login-username] + div.form-group-error', 'Error appears')
            .assert.containsText('form#login-form input[name=login-username] + div.form-group-error', 'Introduzca el usuario', 'Error because empty username')
            .assert.containsText('button#login-btn', 'Iniciar sesión', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/login', 'It cannot send no data')
            .saveScreenshot('tests/screenshots/emptyUsernameLogin.png')
    },

    // Try to login without password - Should FAIL -> Show /login url and error email input
    'Try to login without password': function(browser) {
        browser
            .clearValue('form#login-form input[name=login-password]')
            .click('button#login-btn')
            .waitForElementVisible('form#login-form input[name=login-password] + div.form-group-error', 'Error appears')
            .assert.containsText('form#login-form input[name=login-password] + div.form-group-error', 'Introduzca la contraseña', 'Error because empty password')
            .assert.containsText('button#login-btn', 'Iniciar sesión', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/login', 'It cannot send no data')
            .saveScreenshot('tests/screenshots/emptyPasswordLogin.png')
    },

    // Try to login with wrong username - Should FAIL -> Show /login url and error wrong user
    'Try to login with wrong username': function(browser) {
        browser
            .setValue('form#login-form input[name=login-username]', username)
            .click('button#login-btn')
            .waitForElementVisible('div#login-err', 'Error appears')
            .assert.containsText('div#login-err', 'Usuario o contraseña incorrecta', 'Error because wrong username')
            .assert.containsText('button#login-btn', 'Iniciar sesión', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/login', 'It cannot send no data')
            .saveScreenshot('tests/screenshots/wrongUsernameLogin.png')
    },

    // Try to login with wrong password - Should FAIL -> Show /login url and error wrong user
    'Try to login with wrong password': function(browser) {
        browser
            .clearValue('form#login-form input[name=login-password]')
            .setValue('form#login-form input[name=login-password]', '5678')
            .click('button#login-btn')
            .waitForElementVisible('div#login-err', 'Error appears')
            .assert.containsText('div#login-err', 'Usuario o contraseña incorrecta', 'Error because wrong password')
            .assert.containsText('button#login-btn', 'Iniciar sesión', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/login', 'It cannot send no data')
            .saveScreenshot('tests/screenshots/wrongPasswordLogin.png')
    },

    // Try to login with good form - Should SUCCESS -> Show /profile url
    'Try to login with good form': function(browser) {
        browser
            .click('button#login-btn')
            .waitForElementVisible('body')
            .assert.urlEquals('http://localhost:3000/profile', 'It access to the profile page')
            .assert.containsText('span.mr-2.d-none.d-lg-inline.text-gray-600.small', `${username}`, 'Correct user')
            .saveScreenshot('tests/screenshots/rightLoginForm.png')
    }
}
