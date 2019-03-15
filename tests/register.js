// ====================================================================================================================
// Dependencies
// ====================================================================================================================

// Own modules
const config = require('../nightwatch.json')
const errors = require('../tools/errors')
const fns = require('../tools/functions')

let email = 'carlos@prueba.com'
let username = 'carlos'

// ====================================================================================================================
// Module exports
// ====================================================================================================================

module.exports = {
    '@tags': ['create', 'user'],
    before: function(browser) {
        console.log('Starting create/edit/delete user test...')
        browser
            // Show register page
            .url('http://localhost:3000')
            .waitForElementVisible('body', 'Show the page')
            .click('a#register-link')
            .waitForElementVisible('body', 'Show the page')
    },

    after: function(browser) {
        console.log('Create/edit/delete user test finished')
        browser.end()
    },

    beforeEach : function(browser) {
        browser
            .getAttribute('form.user', 'id', function(result) {
                if (result.value && result.value === 'signup-form') {
                    this
                        .clearValue('form#signup-form input[name=signup-username]')
                        .clearValue('form#signup-form input[name=signup-email]')
                        .clearValue('form#signup-form input[name=signup-password]')
                        .clearValue('form#signup-form input[name=signup-repeat-password]')
                        .setValue('form#signup-form input[name=signup-username]', username)
                        .setValue('form#signup-form input[name=signup-email]', email)
                        .setValue('form#signup-form input[name=signup-password]', '1234')
                        .setValue('form#signup-form input[name=signup-repeat-password]', '1234')
                } else if (result.value && result.value === 'login-form') {
                    this
                        .clearValue('form#login-form input[name=login-username]')
                        .clearValue('form#login-form input[name=login-password]')
                        .setValue('form#login-form input[name=login-username]', username)
                        .setValue('form#login-form input[name=login-password]', '1234')
                } else if (result.value && result.value === 'edit-form') {
                    this
                        .isVisible('div#delete-modal', function(result) {
                            if (!result.value)
                                this
                                    .clearValue('form#edit-form input[name=edit-username]')
                                    .clearValue('form#edit-form input[name=edit-email]')
                                    .setValue('form#edit-form input[name=edit-username]', username)
                                    .setValue('form#edit-form input[name=edit-email]', email)
                                    .isVisible('div#passwords', function(result) {
                                        if (result.value)
                                            this
                                                .clearValue('form#edit-form input[name=edit-old-password]')
                                                .clearValue('form#edit-form input[name=edit-new-password]')
                                                .clearValue('form#edit-form input[name=edit-new-password-repeat]')
                                                .setValue('form#edit-form input[name=edit-old-password]', '1234')
                                    })
                        })
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
            .assert.urlEquals('http://localhost:3000/join', 'It cannot send existing data')
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
                .assert.urlEquals('http://localhost:3000/join', 'It cannot send wrong data')
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
            .assert.urlEquals('http://localhost:3000/join', 'It cannot send existing data')
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
                .assert.urlEquals('http://localhost:3000/join', 'It cannot send wrong data')
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
            .assert.urlEquals('http://localhost:3000/join', 'It cannot send wrong data')
            .saveScreenshot('tests/screenshots/differentPasswords.png')
    },

    // Try to send good form - Should SUCCESS -> Show /profile url
    'Try to send good form': function(browser) {
        browser
            .click('button#signup-btn')
            .waitForElementVisible('body', 'Show the page')
            .assert.urlEquals('http://localhost:3000/profile', 'It access to the profile page')
            .assert.containsText('span.mr-2.d-none.d-lg-inline.text-gray-600.small', `${username}`, 'Correct user')
            .saveScreenshot('tests/screenshots/rightForm.png')
            .click('li#setting-profile-btn')
            .click('a#logout-link')
            .waitForElementVisible('body', 'Show the page')
            .click('a#login-link')
            .waitForElementVisible('body', 'Show the page')
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
            .assert.urlEquals('http://localhost:3000/login', 'It cannot send wrong data')
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
            .assert.urlEquals('http://localhost:3000/login', 'It cannot send wrong data')
            .saveScreenshot('tests/screenshots/wrongPasswordLogin.png')
    },

    // Try to login with good form - Should SUCCESS -> Show /profile url
    'Try to login with good form': function(browser) {
        browser
            .click('button#login-btn')
            .waitForElementVisible('body', 'Show the page')
            .assert.urlEquals('http://localhost:3000/profile', 'It access to the profile page')
            .assert.containsText('span.mr-2.d-none.d-lg-inline.text-gray-600.small', `${username}`, 'Correct user')
            .saveScreenshot('tests/screenshots/rightLoginForm.png')
            .click('li#setting-profile-btn')
            .click('a#settings-link')
            .waitForElementVisible('body', 'Show the page')
            .assert.urlEquals('http://localhost:3000/profile/settings', 'Correct url')
    },

    // Try to edit user with empty username - Should SUCCESS -> Show /profile/settings and the username is the same
    'Try to edit user with empty username': function(browser) {
        browser            
            .clearValue('form#edit-form input[name=edit-username]')
            .click('button#edit-btn')
            .assert.urlEquals('http://localhost:3000/profile/settings', 'It is in the same url')
            .assert.value('form#edit-form input[name=edit-username]', username, 'The username has not been changed')
            .saveScreenshot('tests/screenshots/editWithoutUsername.png')
    },

    // Try to edit user with wrong username - Should FAIL -> Show /profile/settings and the username has an error
    'Try to edit user with wrong username': function(browser) {
        let usernames = ['espa cio', 'car?los', 'car=', '+carlos', '$echo', 'm&t', '100%', '~user', '**', '/home']
        for (let i in usernames) {
            browser
                .clearValue('form#edit-form input[name=edit-username]')
                .setValue('form#edit-form input[name=edit-username]', usernames[i])
                .click('button#edit-btn')
                .waitForElementVisible('form#edit-form input[name=edit-username] + div.form-group-error', 'Error appears')
                .assert.containsText('form#edit-form input[name=edit-username] + div.form-group-error', 'El nombre de usuario no puede contener espacios ni caracteres especiales', 'Error because wrong username format')
                .assert.containsText('button#edit-btn', 'Enviar nuevos valores', 'We are not waiting for data')
                .assert.urlEquals('http://localhost:3000/profile/settings', 'It cannot send wrong data')
                .saveScreenshot(`tests/screenshots/wrongUsernameEdit${i}.png`)
        }
    },

    // Try to edit user with the same username - Should SUCCESS -> Show /profile/settings and the username is the same
    'Try to edit user with the same username': function(browser) {
        browser
            .click('button#edit-btn')
            .assert.urlEquals('http://localhost:3000/profile/settings', 'It is in the same url')
            .assert.value('form#edit-form input[name=edit-username]', username, 'The username has not been changed')
            .saveScreenshot('tests/screenshots/editWithTheSameUsername.png')
    },

    // Try to edit user with existing username - Should FAIL -> Error in username input
    'Try to edit user with existing username': function(browser) {
        let localUsername = 'carlosmg95'
        browser
            .clearValue('form#edit-form input[name=edit-username]')
            .setValue('form#edit-form input[name=edit-username]', localUsername)
            .click('button#edit-btn')
            .waitForElementVisible('form#edit-form input[name=edit-username] + div.form-group-error', 'Error appears')
            .assert.containsText('form#edit-form input[name=edit-username] + div.form-group-error', fns.formatError(errors.EXISTING_USERNAME, localUsername).message, 'Error because the username exists')
            .assert.containsText('button#edit-btn', 'Enviar nuevos valores', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/profile/settings', 'It cannot send existing data')
            .saveScreenshot('tests/screenshots/existingEmailEdit.png')
    },

    // Try to edit user with empty email - Should SUCCESS -> Show /profile/settings and the email is the same
    'Try to edit user with empty email': function(browser) {
        browser
            .clearValue('form#edit-form input[name=edit-email]')
            .click('button#edit-btn')
            .assert.urlEquals('http://localhost:3000/profile/settings', 'It is in the same url')
            .assert.value('form#edit-form input[name=edit-email]', email, 'The  has not been changed')
            .saveScreenshot('tests/screenshots/editWithoutEmail.png')
    },

    // Try to edit user with wrong email - Should FAIL -> Show /profile/settings and the email has an error
    'Try to edit user with wrong email': function(browser) {
        let emails = ['carlos', 'carlos@', 'carlos@gmail']
        for (let i in emails) {
            browser
                .clearValue('form#edit-form input[name=edit-email]')
                .setValue('form#edit-form input[name=edit-email]', emails[i])
                .click('button#edit-btn')
                .waitForElementVisible('form#edit-form input[name=edit-email] + div.form-group-error', 'Error appears')
                .assert.containsText('form#edit-form input[name=edit-email] + div.form-group-error', 'Formato incorrecto', 'Error because wrong username format')
                .assert.containsText('button#edit-btn', 'Enviar nuevos valores', 'We are not waiting for data')
                .assert.urlEquals('http://localhost:3000/profile/settings', 'It cannot send wrong data')
                .saveScreenshot(`tests/screenshots/wrongEmailEdit${i}.png`)
        }
    },

    // Try to edit user with the same email - Should SUCCESS -> Show /profile/settings and the email is the same
    'Try to edit user with the same email': function(browser) {
        browser
            .click('button#edit-btn')
            .assert.urlEquals('http://localhost:3000/profile/settings', 'It is in the same url')
            .assert.value('form#edit-form input[name=edit-email]', email, 'The email has not been changed')
            .saveScreenshot('tests/screenshots/editWithTheSameEmail.png')
    },

    // Try to edit user with existing email - Should FAIL -> Error in email input
    'Try to edit user with existing email': function(browser) {
        let localEmail = 'carlosmoro95@gmail.com'
        browser
            .clearValue('form#edit-form input[name=edit-email]')
            .setValue('form#edit-form input[name=edit-email]', localEmail)
            .click('button#edit-btn')
            .waitForElementVisible('form#edit-form input[name=edit-email] + div.form-group-error', 'Error appears')
            .assert.containsText('form#edit-form input[name=edit-email] + div.form-group-error', fns.formatError(errors.EXISTING_EMAIL, localEmail).message, 'Error because the email exists')
            .assert.containsText('button#edit-btn', 'Enviar nuevos valores', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/profile/settings', 'It cannot send existing data')
            .saveScreenshot('tests/screenshots/existingEmailEdit.png')
    },

    // Try to edit user username - Should SUCCESS -> Show /profile/settings and new username
    'Try to edit user username': function(browser) {
        browser
            .clearValue('form#edit-form input[name=edit-username]')
            .setValue('form#edit-form input[name=edit-username]', 'carlos2')
            .click('button#edit-btn')
            .waitForElementNotVisible('div#edit-alert', 'Success alert disappears')
            .assert.value('form#edit-form input[name=edit-username]', 'carlos2', 'Correct username in form')
            .assert.containsText('span#menu-username', 'carlos2', 'Correct username in menu')
            .assert.containsText('button#edit-btn', 'Enviar nuevos valores', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/profile/settings', 'Correct page')
            .saveScreenshot('tests/screenshots/successUsernameEdit.png')
    },

    // Try to edit user email - Should SUCCESS -> Show /profile/settings and new email
    'Try to edit user email': function(browser) {
        browser
            .clearValue('form#edit-form input[name=edit-email]')
            .setValue('form#edit-form input[name=edit-email]', 'carlos2@prueba.com')
            .click('button#edit-btn')
            .waitForElementNotVisible('div#edit-alert', 'Success alert disappears')
            .assert.value('form#edit-form input[name=edit-email]', 'carlos2@prueba.com', 'Correct email in form')
            .assert.containsText('button#edit-btn', 'Enviar nuevos valores', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/profile/settings', 'Correct page')
            .saveScreenshot('tests/screenshots/successEmailEdit.png')
            .click('button#show-passwords-btn')
            .waitForElementVisible('div#passwords', 'Show the password inputs')
    },

    // Try to edit user with empty passwords - Should FAIL -> Show /profile/settings and wrong error
    'Try to edit user with empty passwords': function(browser) {
        browser
            .clearValue('form#edit-form input[name=edit-old-password]')
            .click('button#edit-btn')
            .waitForElementVisible('form#edit-form input[name=edit-old-password] + div.form-group-error', 'Error appears')
            .waitForElementVisible('form#edit-form input[name=edit-new-password] + div.form-group-error', 'Right passwords')
            .waitForElementVisible('form#edit-form input[name=edit-new-password-repeat] + div.form-group-error', 'Right passwords')
            .assert.containsText('form#edit-form input[name=edit-old-password] + div.form-group-error', 'Contraseña incorrecta', 'Error because empty password')
            .assert.containsText('form#edit-form input[name=edit-new-password] + div.form-group-error', 'Este campo se debe rellenar', 'Error because empty password')
            .assert.containsText('form#edit-form input[name=edit-new-password-repeat] + div.form-group-error', 'Este campo se debe rellenar', 'Error because empty password')
            .assert.containsText('button#edit-btn', 'Enviar nuevos valores', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/profile/settings', 'It cannot send empty data')
            .saveScreenshot('tests/screenshots/emptyPasswordsEdit.png')
    },

    // Try to edit user without new password - Should FAIL -> Show /profile/settings and empty error
    'Try to edit user without new password': function(browser) {
        browser
            .click('button#edit-btn')
            .waitForElementVisible('form#edit-form input[name=edit-new-password] + div.form-group-error', 'Error appears')
            .waitForElementVisible('form#edit-form input[name=edit-new-password-repeat] + div.form-group-error', 'Error appears')
            .assert.hidden('form#edit-form input[name=edit-old-password] + div.form-group-error', 'Right password')
            .assert.containsText('form#edit-form input[name=edit-new-password] + div.form-group-error', 'Este campo se debe rellenar', 'Error because empty password')
            .assert.containsText('form#edit-form input[name=edit-new-password-repeat] + div.form-group-error', 'Este campo se debe rellenar', 'Error because empty password')
            .assert.containsText('button#edit-btn', 'Enviar nuevos valores', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/profile/settings', 'It cannot send empty data')
            .saveScreenshot('tests/screenshots/emptyNewPasswordsEdit.png')
    },

    // Try to edit user with wrong old password - Should FAIL -> Show /profile/settings and wrong error
    'Try to edit user with wrong old password': function(browser) {
        browser
            .setValue('form#edit-form input[name=edit-old-password]', '5678')
            .setValue('form#edit-form input[name=edit-new-password]', '0000')
            .setValue('form#edit-form input[name=edit-new-password-repeat]', '0000')
            .click('button#edit-btn')
            .waitForElementVisible('form#edit-form input[name=edit-old-password] + div.form-group-error', 'Error appears')
            .assert.hidden('form#edit-form input[name=edit-new-password] + div.form-group-error', 'Right passwords')
            .assert.hidden('form#edit-form input[name=edit-new-password-repeat] + div.form-group-error', 'Right passwords')
            .assert.containsText('form#edit-form input[name=edit-old-password] + div.form-group-error', 'Contraseña incorrecta', 'Error because wrong password')
            .assert.containsText('button#edit-btn', 'Enviar nuevos valores', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/profile/settings', 'It cannot send wrong data')
            .saveScreenshot('tests/screenshots/wrongOldPasswordEdit.png')
    },

    // Try to edit user with different passwords - Should FAIL -> Show /profile/settings and wrong error
    'Try to edit user with different passwords': function(browser) {
        browser
            .setValue('form#edit-form input[name=edit-new-password]', '5678')
            .setValue('form#edit-form input[name=edit-new-password-repeat]', '0000')
            .click('button#edit-btn')
            .assert.hidden('form#edit-form input[name=edit-old-password] + div.form-group-error', 'Right passwords')
            .waitForElementVisible('form#edit-form input[name=edit-new-password-repeat] + div.form-group-error', 'Error appears')
            .assert.containsText('form#edit-form input[name=edit-new-password-repeat] + div.form-group-error', 'Las contraseñas deben ser igual', 'Error because wrong password')
            .assert.containsText('button#edit-btn', 'Enviar nuevos valores', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/profile/settings', 'It cannot send wrong data')
            .saveScreenshot('tests/screenshots/differentPasswordsEdit.png')
    },

    // Try to edit user with empty old password - Should FAIL -> Show /profile/settings and wrong error
    'Try to edit user with empty old password': function(browser) {
        browser
            .clearValue('form#edit-form input[name=edit-old-password]')
            .setValue('form#edit-form input[name=edit-new-password]', '0000')
            .setValue('form#edit-form input[name=edit-new-password-repeat]', '0000')
            .click('button#edit-btn')
            .waitForElementVisible('form#edit-form input[name=edit-old-password] + div.form-group-error', 'Error appears')
            .assert.hidden('form#edit-form input[name=edit-new-password] + div.form-group-error', 'Right passwords')
            .assert.hidden('form#edit-form input[name=edit-new-password-repeat] + div.form-group-error', 'Right passwords')
            .assert.containsText('form#edit-form input[name=edit-old-password] + div.form-group-error', 'Contraseña incorrecta', 'Error because wrong password')
            .assert.containsText('button#edit-btn', 'Enviar nuevos valores', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/profile/settings', 'It cannot send empty data')
            .saveScreenshot('tests/screenshots/emptyOldPasswordEdit.png')
    },

    // Try to edit user password - Should SUCCESS -> Show /profile/settings
    'Try to edit user password': function(browser) {
        browser
            .setValue('form#edit-form input[name=edit-new-password]', '5678')
            .setValue('form#edit-form input[name=edit-new-password-repeat]', '5678')
            .click('button#edit-btn')
            .waitForElementNotVisible('div#edit-alert', 'Success alert disappears')
            .assert.containsText('button#edit-btn', 'Enviar nuevos valores', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/profile/settings', 'Correct page')
            .saveScreenshot('tests/screenshots/successPasswordEdit.png')
    }
}
