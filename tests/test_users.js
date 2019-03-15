// ====================================================================================================================
// Dependencies
// ====================================================================================================================

// Own modules
const config = require('../nightwatch.json')
const errors = require('../tools/errors')
const fns = require('../tools/functions')

let email = 'carlos@prueba.com'
let password = '1234'
let username = 'carlos'

// ====================================================================================================================
// Module exports
// ====================================================================================================================

module.exports = {
    '@tags': ['create', 'delete', 'edit', 'login', 'user'],
    before: function(browser) {
        console.log('Starting create/edit/delete user test...')
        browser
            // Show main page
            .url('http://localhost:3000')
            .waitForElementVisible('body', 'Show the page')
            // Show register page
            .click('a#register-link')
            .waitForElementVisible('body', 'Show the page')
    },

    after: function(browser) {
        console.log('Create/edit/delete user test finished')
        browser.end()
    },

    beforeEach : function(browser) {
        // Set values
        browser
            .getAttribute('form.user', 'id', function(result) {
                if (result.value && result.value === 'signup-form') {
                    this
                        // Clear all values
                        .clearValue('form#signup-form input[name=signup-username]')
                        .clearValue('form#signup-form input[name=signup-email]')
                        .clearValue('form#signup-form input[name=signup-password]')
                        .clearValue('form#signup-form input[name=signup-repeat-password]')
                        // Set original signup values
                        .setValue('form#signup-form input[name=signup-username]', username)
                        .setValue('form#signup-form input[name=signup-email]', email)
                        .setValue('form#signup-form input[name=signup-password]', password)
                        .setValue('form#signup-form input[name=signup-repeat-password]', password)
                } else if (result.value && result.value === 'login-form') {
                    this
                        // Clear all values
                        .clearValue('form#login-form input[name=login-username]')
                        .clearValue('form#login-form input[name=login-password]')
                        // Set original login values
                        .setValue('form#login-form input[name=login-username]', username)
                        .setValue('form#login-form input[name=login-password]', password)
                } else if (result.value && result.value === 'edit-form') {
                    this
                        .isVisible('div#delete-modal', function(result) {
                            // If the delete modal is hidden
                            if (!result.value)
                                this
                                    // Clear all values
                                    .clearValue('form#edit-form input[name=edit-username]')
                                    .clearValue('form#edit-form input[name=edit-email]')
                                    // Set original values
                                    .setValue('form#edit-form input[name=edit-username]', username)
                                    .setValue('form#edit-form input[name=edit-email]', email)
                                    .isVisible('div#passwords', function(result) {
                                        // If the passwords box is opened
                                        if (result.value)
                                            this
                                                // Clear all passwords
                                                .clearValue('form#edit-form input[name=edit-old-password]')
                                                .clearValue('form#edit-form input[name=edit-new-password]')
                                                .clearValue('form#edit-form input[name=edit-new-password-repeat]')
                                                // Set the original old password and the new passwords
                                                .setValue('form#edit-form input[name=edit-old-password]', password)
                                                .setValue('form#edit-form input[name=edit-new-password]', '5678')
                                                .setValue('form#edit-form input[name=edit-new-password-repeat]', '5678')
                                    })
                        })
                }
            })
    },

    // Try to send empty form - Should FAIL -> Error because of every input
    'Try to send empty form': function(browser) {
        browser
            // Clear the values
            .clearValue('form#signup-form input[name=signup-username]')
            .clearValue('form#signup-form input[name=signup-email]')
            .clearValue('form#signup-form input[name=signup-password]')
            .clearValue('form#signup-form input[name=signup-repeat-password]')
            // Send data
            .click('button#signup-btn')
            // Show errors
            .waitForElementVisible('form#signup-form input[name=signup-username] + div.form-group-error', 'Error appears')
            .assert.containsText('form#signup-form input[name=signup-username] + div.form-group-error', 'Rellenar username', 'Error because empty username')
            .waitForElementVisible('form#signup-form input[name=signup-email] + div.form-group-error', 'Error appears')
            .assert.containsText('form#signup-form input[name=signup-email] + div.form-group-error', 'Formato incorrecto', 'Error because wrong email format')
            .waitForElementVisible('form#signup-form input[name=signup-password] + div.form-group-error', 'Error appears')
            .assert.containsText('form#signup-form input[name=signup-password] + div.form-group-error', 'Rellenar contraseña', 'Error because empty password1')
            .waitForElementVisible('form#signup-form input[name=signup-repeat-password] + div.form-group-error', 'Error appears')
            .assert.containsText('form#signup-form input[name=signup-repeat-password] + div.form-group-error', 'Rellenar contraseña', 'Error because empty password2')
            // Check the server response
            .assert.containsText('button#signup-btn', 'Registrarse', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/join', 'It cannot send no data')
            .saveScreenshot('tests/screenshots/registerEmptyForm.png')
    },

    // Try to send form with empty username - Should FAIL -> Error because of username input
    'Try to send form with empty username': function(browser) {
        browser
            // Clear the username value
            .clearValue('form#signup-form input[name=signup-username]')
            // Send data
            .click('button#signup-btn')
            // Show errors
            .waitForElementVisible('form#signup-form input[name=signup-username] + div.form-group-error', 'Error appears')
            .assert.containsText('form#signup-form input[name=signup-username] + div.form-group-error', 'Rellenar username', 'Error because empty username')
            // Check the server response
            .assert.containsText('button#signup-btn', 'Registrarse', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/join', 'It cannot send no data')
            .saveScreenshot('tests/screenshots/registerEmptyUsername.png')
    },

    // Try to send form with existing username - Should FAIL -> Error because of username input
    'Try to send form with existing username': function(browser) {
        let localUsername = 'carlosmg95'
        browser
            // Clear the username and set an existing username
            .clearValue('form#signup-form input[name=signup-username]')
            .setValue('form#signup-form input[name=signup-username]', localUsername)
            // Send data
            .click('button#signup-btn')
            // Show errors
            .waitForElementVisible('form#signup-form input[name=signup-username] + div.form-group-error', 'Error appears')
            .assert.containsText('form#signup-form input[name=signup-username] + div.form-group-error', fns.formatError(errors.EXISTING_USERNAME, localUsername).message, 'Error because the username exists')
            // Check the server response
            .assert.containsText('button#signup-btn', 'Registrarse', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/join', 'It cannot send existing data')
            .saveScreenshot('tests/screenshots/registerExistingUsername.png')
    },

    // Try to send form with wrong username - Should FAIL -> Error because of username input
    'Try to send form with wrong username': function(browser) {
        let usernames = ['espa cio', 'car?los', 'car=', '+carlos', '$echo', 'm&t', '100%', '~user', '**', '/home']
        // Try some wrong usernames
        for (let i in usernames) {
            browser
                // Clear the username and set an wrong username
                .clearValue('form#signup-form input[name=signup-username]')
                .setValue('form#signup-form input[name=signup-username]', usernames[i])
                // Send data
                .click('button#signup-btn')
                // Show errors
                .waitForElementVisible('form#signup-form input[name=signup-username] + div.form-group-error', 'Error appears')
                .assert.containsText('form#signup-form input[name=signup-username] + div.form-group-error', 'El nombre de usuario no puede contener espacios ni caracteres especiales', 'Error because wrong username format')
                // Check the server response
                .assert.containsText('button#signup-btn', 'Registrarse', 'We are not waiting for data')
                .assert.urlEquals('http://localhost:3000/join', 'It cannot send wrong data')
                .saveScreenshot(`tests/screenshots/registerWrongUsername${i}.png`)
        }
    },

    // Try to send form with empty email - Should FAIL -> Error because of email input
    'Try to send form with empty email': function(browser) {
        browser
            // Clear the email
            .clearValue('form#signup-form input[name=signup-email]')
            // Send data
            .click('button#signup-btn')
            // Show errors
            .waitForElementVisible('form#signup-form input[name=signup-email] + div.form-group-error', 'Error appears')
            .assert.containsText('form#signup-form input[name=signup-email] + div.form-group-error', 'Formato incorrecto', 'Error because empty email')
            // Check the server response
            .assert.containsText('button#signup-btn', 'Registrarse', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/join', 'It cannot send no data')
            .saveScreenshot('tests/screenshots/registerEmptyEmail.png')
    },

    // Try to send form with existing email - Should FAIL -> Error because of email input
    'Try to send form with existing email': function(browser) {
        let email = 'carlosmoro95@gmail.com'
        browser
            // Clear the email and set an existing email
            .clearValue('form#signup-form input[name=signup-email]')
            .setValue('form#signup-form input[name=signup-email]', email)
            // Send data
            .click('button#signup-btn')
            // Show errors
            .waitForElementVisible('form#signup-form input[name=signup-email] + div.form-group-error', 'Error appears')
            .assert.containsText('form#signup-form input[name=signup-email] + div.form-group-error', fns.formatError(errors.EXISTING_EMAIL, email).message, 'Error because the email exists')
            // Check the server response
            .assert.containsText('button#signup-btn', 'Registrarse', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/join', 'It cannot send existing data')
            .saveScreenshot('tests/screenshots/registerExistingEmail.png')
    },

    // Try to send form with wrong email - Should FAIL -> Error because of email input
    'Try to send form with wrong email': function(browser) {
        let emails = ['carlos', 'carlos@', 'carlos@gmail']
        // Try some wrong emails
        for (let i in emails) {
            browser
                // Clear email and set a wrong email
                .clearValue('form#signup-form input[name=signup-email]')
                .setValue('form#signup-form input[name=signup-email]', emails[i])
                // Send data
                .click('button#signup-btn')
                // Show errors
                .waitForElementVisible('form#signup-form input[name=signup-email] + div.form-group-error', 'Error appears')
                .assert.containsText('form#signup-form input[name=signup-email] + div.form-group-error', 'Formato incorrecto', 'Error because wrong email format')
                // Check the server response
                .assert.containsText('button#signup-btn', 'Registrarse', 'We are not waiting for data')
                .assert.urlEquals('http://localhost:3000/join', 'It cannot send wrong data')
                .saveScreenshot(`tests/screenshots/registerWrongEmail${i}.png`)
        }
    },

    // Try to send form with empty password1 - Should FAIL -> Error because of passwprd1 input
    'Try to send form with empty password1': function(browser) {
        browser
            // Clear password value
            .clearValue('form#signup-form input[name=signup-password]')
            // Send data
            .click('button#signup-btn')
            // Show errors
            .waitForElementVisible('form#signup-form input[name=signup-password] + div.form-group-error', 'Error appears')
            .assert.containsText('form#signup-form input[name=signup-password] + div.form-group-error', 'Rellenar contraseña', 'Error because empty password1')
            // Check the server response
            .assert.containsText('button#signup-btn', 'Registrarse', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/join', 'It cannot send no data')
            .saveScreenshot('tests/screenshots/registerEmptyPassword1.png')
    },

    // Try to send form with empty password2 - Should FAIL -> Error because of passwprd1 input
    'Try to send form with empty password2': function(browser) {
        browser
            // Clear repeat password value
            .clearValue('form#signup-form input[name=signup-repeat-password]')
            // Send data
            .click('button#signup-btn')
            // Show errors
            .waitForElementVisible('form#signup-form input[name=signup-repeat-password] + div.form-group-error', 'Error appears')
            .assert.containsText('form#signup-form input[name=signup-repeat-password] + div.form-group-error', 'Rellenar contraseña', 'Error because empty password2')
            // Check the server response
            .assert.containsText('button#signup-btn', 'Registrarse', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/join', 'It cannot send no data')
            .saveScreenshot('tests/screenshots/registerEmptyPassword2.png')
    },

    // Try to send form with different passwords - Should FAIL -> Error because of passwprd2 input
    'Try to send form with different passwords': function(browser) {
        browser
            // Clear repeat password value and set a different password
            .clearValue('form#signup-form input[name=signup-repeat-password]')
            .setValue('form#signup-form input[name=signup-repeat-password]', '5678')
            // Send data
            .click('button#signup-btn')
            // Show errors
            .waitForElementVisible('form#signup-form input[name=signup-repeat-password] + div.form-group-error', 'Error appears')
            .assert.containsText('form#signup-form input[name=signup-repeat-password] + div.form-group-error', 'Las contraseñas deben ser igual', 'Error because different passwords')
            // Check the server response
            .assert.containsText('button#signup-btn', 'Registrarse', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/join', 'It cannot send wrong data')
            .saveScreenshot('tests/screenshots/registerDifferentPasswords.png')
    },

    // Try to send good form - Should SUCCESS -> Show /profile url
    'Try to send good form': function(browser) {
        browser
            // Send data
            .click('button#signup-btn')
            // Check we can enter in the profile page
            .waitForElementVisible('body', 'Show the page')
            .assert.urlEquals('http://localhost:3000/profile', 'It access to the profile page')
            // Check the username is correct
            .assert.containsText('span.mr-2.d-none.d-lg-inline.text-gray-600.small', `${username}`, 'Correct user')
            .saveScreenshot('tests/screenshots/registerRightForm.png')
            // Logout
            .click('li#setting-profile-btn')
            .click('a#logout-link')
            .waitForElementVisible('body', 'Show the page')
            // Login
            .click('a#login-link')
            .waitForElementVisible('body', 'Show the page')
            .assert.urlEquals('http://localhost:3000/login', 'Succed logout')
    },

    // Try to login without username - Should FAIL -> Show /login url and error username input
    'Try to login without username': function(browser) {
        browser
            // Clear username value
            .clearValue('form#login-form input[name=login-username]')
            // Send data
            .click('button#login-btn')
            // Show errors
            .waitForElementVisible('form#login-form input[name=login-username] + div.form-group-error', 'Error appears')
            .assert.containsText('form#login-form input[name=login-username] + div.form-group-error', 'Introduzca el usuario', 'Error because empty username')
            // Check the server response
            .assert.containsText('button#login-btn', 'Iniciar sesión', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/login', 'It cannot send no data')
            .saveScreenshot('tests/screenshots/loginEmptyUsername.png')
    },

    // Try to login without password - Should FAIL -> Show /login url and error email input
    'Try to login without password': function(browser) {
        browser
            // Clear password value
            .clearValue('form#login-form input[name=login-password]')
            // Send data
            .click('button#login-btn')
            // Show errors
            .waitForElementVisible('form#login-form input[name=login-password] + div.form-group-error', 'Error appears')
            .assert.containsText('form#login-form input[name=login-password] + div.form-group-error', 'Introduzca la contraseña', 'Error because empty password')
            // Check the server response
            .assert.containsText('button#login-btn', 'Iniciar sesión', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/login', 'It cannot send no data')
            .saveScreenshot('tests/screenshots/loginEmptyPassword.png')
    },

    // Try to login with wrong username - Should FAIL -> Show /login url and error wrong user
    'Try to login with wrong username': function(browser) {
        browser
            // Set a no existing username
            .setValue('form#login-form input[name=login-username]', username)
            // Send data
            .click('button#login-btn')
            // Show errors
            .waitForElementVisible('div#login-err', 'Error appears')
            .assert.containsText('div#login-err', 'Usuario o contraseña incorrecta', 'Error because wrong username')
            // Check the server response
            .assert.containsText('button#login-btn', 'Iniciar sesión', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/login', 'It cannot send wrong data')
            .saveScreenshot('tests/screenshots/loginWrongUsername.png')
    },

    // Try to login with wrong password - Should FAIL -> Show /login url and error wrong user
    'Try to login with wrong password': function(browser) {
        browser
            // Set a wrong password
            .setValue('form#login-form input[name=login-password]', '5678')
            // Send data
            .click('button#login-btn')
            // Show errors
            .waitForElementVisible('div#login-err', 'Error appears')
            .assert.containsText('div#login-err', 'Usuario o contraseña incorrecta', 'Error because wrong password')
            // Check the server response
            .assert.containsText('button#login-btn', 'Iniciar sesión', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/login', 'It cannot send wrong data')
            .saveScreenshot('tests/screenshots/loginWrongPassword.png')
    },

    // Try to login with good form - Should SUCCESS -> Show /profile url
    'Try to login with good form': function(browser) {
        browser
            // Send data
            .click('button#login-btn')
            // Check we can enter in the profile page
            .waitForElementVisible('body', 'Show the page')            
            .assert.urlEquals('http://localhost:3000/profile', 'It access to the profile page')
            // Check the username is correct
            .assert.containsText('span.mr-2.d-none.d-lg-inline.text-gray-600.small', `${username}`, 'Correct user')
            .saveScreenshot('tests/screenshots/loginRightForm.png')
            // Go to setting page
            .click('li#setting-profile-btn')
            .click('a#settings-link')
            .waitForElementVisible('body', 'Show the page')
            .assert.urlEquals('http://localhost:3000/profile/settings', 'Correct url')
    },

    // Try to edit user with empty username - Should SUCCESS -> Show /profile/settings and the username is the same
    'Try to edit user with empty username': function(browser) {
        browser
            // Clear username value
            .clearValue('form#edit-form input[name=edit-username]')
            // Send data
            .click('button#edit-btn')
            // Check the server response
            .assert.urlEquals('http://localhost:3000/profile/settings', 'It is in the same url')
            .assert.value('form#edit-form input[name=edit-username]', username, 'The username has not been changed')
            .saveScreenshot('tests/screenshots/editWithoutUsername.png')
    },

    // Try to edit user with wrong username - Should FAIL -> Show /profile/settings and the username has an error
    'Try to edit user with wrong username': function(browser) {
        let usernames = ['espa cio', 'car?los', 'car=', '+carlos', '$echo', 'm&t', '100%', '~user', '**', '/home']
        // Try some wrong usernames
        for (let i in usernames) {
            browser
                // Clear username value and set a wrong username
                .clearValue('form#edit-form input[name=edit-username]')
                .setValue('form#edit-form input[name=edit-username]', usernames[i])
                // Send data
                .click('button#edit-btn')
                // Show errors
                .waitForElementVisible('form#edit-form input[name=edit-username] + div.form-group-error', 'Error appears')
                .assert.containsText('form#edit-form input[name=edit-username] + div.form-group-error', 'El nombre de usuario no puede contener espacios ni caracteres especiales', 'Error because wrong username format')
                // Check the server response
                .assert.containsText('button#edit-btn', 'Enviar nuevos valores', 'We are not waiting for data')
                .assert.urlEquals('http://localhost:3000/profile/settings', 'It cannot send wrong data')
                .saveScreenshot(`tests/screenshots/editWrongUsername${i}.png`)
        }
    },

    // Try to edit user with the same username - Should SUCCESS -> Show /profile/settings and the username is the same
    'Try to edit user with the same username': function(browser) {
        browser
            // Send data
            .click('button#edit-btn')
            // Check username value
            .assert.urlEquals('http://localhost:3000/profile/settings', 'It is in the same url')
            .assert.value('form#edit-form input[name=edit-username]', username, 'The username has not been changed')
            .saveScreenshot('tests/screenshots/editWithTheSameUsername.png')
    },

    // Try to edit user with existing username - Should FAIL -> Error because of username input
    'Try to edit user with existing username': function(browser) {
        let localUsername = 'carlosmg95'
        browser
            // Clear username value and set an existing username
            .clearValue('form#edit-form input[name=edit-username]')
            .setValue('form#edit-form input[name=edit-username]', localUsername)
            // Send data
            .click('button#edit-btn')
            // Show errors
            .waitForElementVisible('form#edit-form input[name=edit-username] + div.form-group-error', 'Error appears')
            .assert.containsText('form#edit-form input[name=edit-username] + div.form-group-error', fns.formatError(errors.EXISTING_USERNAME, localUsername).message, 'Error because the username exists')
            // Check the server response
            .assert.containsText('button#edit-btn', 'Enviar nuevos valores', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/profile/settings', 'It cannot send existing data')
            .saveScreenshot('tests/screenshots/editExistingEmail.png')
    },

    // Try to edit user with empty email - Should SUCCESS -> Show /profile/settings and the email is the same
    'Try to edit user with empty email': function(browser) {
        browser
            // Clear email value
            .clearValue('form#edit-form input[name=edit-email]')
            // Send data
            .click('button#edit-btn')
            // Check the server response
            .assert.urlEquals('http://localhost:3000/profile/settings', 'It is in the same url')
            .assert.value('form#edit-form input[name=edit-email]', email, 'The  has not been changed')
            .saveScreenshot('tests/screenshots/editWithoutEmail.png')
    },

    // Try to edit user with wrong email - Should FAIL -> Show /profile/settings and the email has an error
    'Try to edit user with wrong email': function(browser) {
        let emails = ['carlos', 'carlos@', 'carlos@gmail']
        // Try some wrong emails
        for (let i in emails) {
            browser
                // Clear email value and set a wrong email
                .clearValue('form#edit-form input[name=edit-email]')
                .setValue('form#edit-form input[name=edit-email]', emails[i])
                // Send data
                .click('button#edit-btn')
                // Show errors
                .waitForElementVisible('form#edit-form input[name=edit-email] + div.form-group-error', 'Error appears')
                .assert.containsText('form#edit-form input[name=edit-email] + div.form-group-error', 'Formato incorrecto', 'Error because wrong username format')
                // Check the server response
                .assert.containsText('button#edit-btn', 'Enviar nuevos valores', 'We are not waiting for data')
                .assert.urlEquals('http://localhost:3000/profile/settings', 'It cannot send wrong data')
                .saveScreenshot(`tests/screenshots/editWrongEmail${i}.png`)
        }
    },

    // Try to edit user with the same email - Should SUCCESS -> Show /profile/settings and the email is the same
    'Try to edit user with the same email': function(browser) {
        browser
            // Send data
            .click('button#edit-btn')
            // Check the server response
            .assert.urlEquals('http://localhost:3000/profile/settings', 'It is in the same url')
            .assert.value('form#edit-form input[name=edit-email]', email, 'The email has not been changed')
            .saveScreenshot('tests/screenshots/editWithTheSameEmail.png')
    },

    // Try to edit user with existing email - Should FAIL -> Error because of email input
    'Try to edit user with existing email': function(browser) {
        let localEmail = 'carlosmoro95@gmail.com'
        browser
            // Clear email value and set an existing email
            .clearValue('form#edit-form input[name=edit-email]')
            .setValue('form#edit-form input[name=edit-email]', localEmail)
            // Send data
            .click('button#edit-btn')
            // Show errors
            .waitForElementVisible('form#edit-form input[name=edit-email] + div.form-group-error', 'Error appears')
            .assert.containsText('form#edit-form input[name=edit-email] + div.form-group-error', fns.formatError(errors.EXISTING_EMAIL, localEmail).message, 'Error because the email exists')
            // Check the server response
            .assert.containsText('button#edit-btn', 'Enviar nuevos valores', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/profile/settings', 'It cannot send existing data')
            .saveScreenshot('tests/screenshots/editExistingEmail.png')
    },

    // Try to edit user username - Should SUCCESS -> Show /profile/settings and new username
    'Try to edit user username': function(browser) {
        browser
            // Clear username value and set a new username
            .clearValue('form#edit-form input[name=edit-username]')
            .setValue('form#edit-form input[name=edit-username]', 'carlos2')
            // Send data
            .click('button#edit-btn')
            // Check the username has changed in the input box and in the menu
            .waitForElementNotVisible('div#edit-alert', 'Success alert disappears')
            .assert.value('form#edit-form input[name=edit-username]', 'carlos2', 'Correct username in form')
            .assert.containsText('span#menu-username', 'carlos2', 'Correct username in menu')
            // Check the server response
            .assert.containsText('button#edit-btn', 'Enviar nuevos valores', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/profile/settings', 'Correct page')
            .saveScreenshot('tests/screenshots/editSuccessUsername.png')
    },

    // Try to edit user email - Should SUCCESS -> Show /profile/settings and new email
    'Try to edit user email': function(browser) {
        browser
            // Clear email value and set a new email
            .clearValue('form#edit-form input[name=edit-email]')
            .setValue('form#edit-form input[name=edit-email]', 'carlos2@prueba.com')
            // Send data
            .click('button#edit-btn')
            // Check the email has changed in the input box
            .waitForElementNotVisible('div#edit-alert', 'Success alert disappears')
            .assert.value('form#edit-form input[name=edit-email]', 'carlos2@prueba.com', 'Correct email in form')
            // Check the server response
            .assert.containsText('button#edit-btn', 'Enviar nuevos valores', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/profile/settings', 'Correct page')
            .saveScreenshot('tests/screenshots/editSuccessEmail.png')
            // Show passwords inputs
            .click('button#show-passwords-btn')
            .waitForElementVisible('div#passwords', 'Show the password inputs')
    },

    // Try to edit user with empty passwords - Should FAIL -> Show /profile/settings and wrong error because of old password
    'Try to edit user with empty passwords': function(browser) {
        browser
            // Clear old password value
            .clearValue('form#edit-form input[name=edit-old-password]')
            .clearValue('form#edit-form input[name=edit-new-password]')
            .clearValue('form#edit-form input[name=edit-new-password-repeat]')
            // Send data
            .click('button#edit-btn')
            // Show errors
            .waitForElementVisible('form#edit-form input[name=edit-old-password] + div.form-group-error', 'Error appears')
            .waitForElementVisible('form#edit-form input[name=edit-new-password] + div.form-group-error', 'Right passwords')
            .waitForElementVisible('form#edit-form input[name=edit-new-password-repeat] + div.form-group-error', 'Right passwords')
            .assert.containsText('form#edit-form input[name=edit-old-password] + div.form-group-error', 'Contraseña incorrecta', 'Error because empty password')
            .assert.containsText('form#edit-form input[name=edit-new-password] + div.form-group-error', 'Este campo se debe rellenar', 'Error because empty password')
            .assert.containsText('form#edit-form input[name=edit-new-password-repeat] + div.form-group-error', 'Este campo se debe rellenar', 'Error because empty password')
            // Check the server response
            .assert.containsText('button#edit-btn', 'Enviar nuevos valores', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/profile/settings', 'It cannot send empty data')
            .saveScreenshot('tests/screenshots/editEmptyPasswords.png')
    },

    // Try to edit user without new password - Should FAIL -> Show /profile/settings and empty error because of new passwords
    'Try to edit user without new password': function(browser) {
        browser
            // Clear new passwords
            .clearValue('form#edit-form input[name=edit-new-password]')
            .clearValue('form#edit-form input[name=edit-new-password-repeat]')
            // Send data
            .click('button#edit-btn')
            // Show errors in new passwords and no error because of old password
            .waitForElementVisible('form#edit-form input[name=edit-new-password] + div.form-group-error', 'Error appears')
            .waitForElementVisible('form#edit-form input[name=edit-new-password-repeat] + div.form-group-error', 'Error appears')
            .assert.hidden('form#edit-form input[name=edit-old-password] + div.form-group-error', 'Right password')
            .assert.containsText('form#edit-form input[name=edit-new-password] + div.form-group-error', 'Este campo se debe rellenar', 'Error because empty password')
            .assert.containsText('form#edit-form input[name=edit-new-password-repeat] + div.form-group-error', 'Este campo se debe rellenar', 'Error because empty password')
            // Check the server response
            .assert.containsText('button#edit-btn', 'Enviar nuevos valores', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/profile/settings', 'It cannot send empty data')
            .saveScreenshot('tests/screenshots/editEmptyNewPasswords.png')
    },

    // Try to edit user with wrong old password - Should FAIL -> Show /profile/settings and wrong error because of old password
    'Try to edit user with wrong old password': function(browser) {
        browser
            // Set wrong old password and equals new password and repeat new password
            .setValue('form#edit-form input[name=edit-old-password]', '5678')
            // Send data
            .click('button#edit-btn')
            // Show error because of the old password and no error beacuse of new passwords
            .waitForElementVisible('form#edit-form input[name=edit-old-password] + div.form-group-error', 'Error appears')
            .assert.hidden('form#edit-form input[name=edit-new-password] + div.form-group-error', 'Right passwords')
            .assert.hidden('form#edit-form input[name=edit-new-password-repeat] + div.form-group-error', 'Right passwords')
            .assert.containsText('form#edit-form input[name=edit-old-password] + div.form-group-error', 'Contraseña incorrecta', 'Error because wrong password')
            // Check the server response
            .assert.containsText('button#edit-btn', 'Enviar nuevos valores', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/profile/settings', 'It cannot send wrong data')
            .saveScreenshot('tests/screenshots/editWrongOldPassword.png')
    },

    // Try to edit user with different passwords - Should FAIL -> Show /profile/settings and error because of different new passwords
    'Try to edit user with different passwords': function(browser) {
        browser
            // Set differents new password and repeat new password
            .setValue('form#edit-form input[name=edit-new-password]', '5678')
            .setValue('form#edit-form input[name=edit-new-password-repeat]', '0000')
            // Send data
            .click('button#edit-btn')
            // Show errors because of the new passwords and no error because of old password
            .assert.hidden('form#edit-form input[name=edit-old-password] + div.form-group-error', 'Right passwords')
            .waitForElementVisible('form#edit-form input[name=edit-new-password-repeat] + div.form-group-error', 'Error appears')
            .assert.containsText('form#edit-form input[name=edit-new-password-repeat] + div.form-group-error', 'Las contraseñas deben ser igual', 'Error because wrong password')
            // Check the server response
            .assert.containsText('button#edit-btn', 'Enviar nuevos valores', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/profile/settings', 'It cannot send wrong data')
            .saveScreenshot('tests/screenshots/editDifferentPasswords.png')
    },

    // Try to edit user with empty old password - Should FAIL -> Show /profile/settings and empty old password error
    'Try to edit user with empty old password': function(browser) {
        browser
            // Clear old password value
            .clearValue('form#edit-form input[name=edit-old-password]')
            // Send data
            .click('button#edit-btn')
            // Show error because of old password and no error because of new passwords
            .waitForElementVisible('form#edit-form input[name=edit-old-password] + div.form-group-error', 'Error appears')
            .assert.hidden('form#edit-form input[name=edit-new-password] + div.form-group-error', 'Right passwords')
            .assert.hidden('form#edit-form input[name=edit-new-password-repeat] + div.form-group-error', 'Right passwords')
            .assert.containsText('form#edit-form input[name=edit-old-password] + div.form-group-error', 'Contraseña incorrecta', 'Error because wrong password')
            .assert.containsText('button#edit-btn', 'Enviar nuevos valores', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/profile/settings', 'It cannot send empty data')
            .saveScreenshot('tests/screenshots/editEmptyOldPassword.png')
    },

    // Try to edit user password - Should SUCCESS -> Show /profile/settings
    'Try to edit user password': function(browser) {
        browser
            // Send data
            .click('button#edit-btn')
            .waitForElementNotVisible('div#edit-alert', 'Success alert disappears')
            // Check the server response
            .assert.containsText('button#edit-btn', 'Enviar nuevos valores', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/profile/settings', 'Correct page')
            .saveScreenshot('tests/screenshots/editSuccessPassword.png')
    },

    // Try to delete with empty password - Should FAIL -> Show /profile/settings and wrong password error
    'Try to delete with empty password': function(browser) {
        browser
            // Show delete modal
            .click('button#show-delete-modal')
            .waitForElementVisible('div#delete-modal', 'Show the modal with the password')
            // Send data
            .click('button#delete-btn')
            // Show error
            .waitForElementVisible('form#delete-form input[name=delete-password] + div.form-group-error', 'Error appears')
            .assert.containsText('form#delete-form input[name=delete-password] + div.form-group-error', 'Contraseña incorrecta', 'Error because wrong password')
            // Check the server response
            .assert.containsText('button#delete-btn', 'Borrar usuario', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/profile/settings', 'It cannot send wrong data')
            .saveScreenshot('tests/screenshots/deleteEmptyPassword.png')
    },

    // Try to delete with wrong password - Should FAIL -> Show /profile/settings and wrong password error
    'Try to delete with wrong password': function(browser) {
        browser
            // Set a wrong password
            .setValue('form#delete-form input[name=delete-password]', '0000')
            // Send data
            .click('button#delete-btn')
            // Show errors
            .waitForElementVisible('form#delete-form input[name=delete-password] + div.form-group-error', 'Error appears')
            .assert.containsText('form#delete-form input[name=delete-password] + div.form-group-error', 'Contraseña incorrecta', 'Error because wrong password')
            // Check the server response
            .assert.containsText('button#delete-btn', 'Borrar usuario', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/profile/settings', 'It cannot send wrong data')
            .saveScreenshot('tests/screenshots/deleteWrongPassword.png')
    },

    // Try to delete correctly - Should SUCCESS -> Show /
    // Thanks to this function, we can check the password has been correctly changed
    'Try to delete correctly': function(browser) {
        browser
            // Clear password value and add the right password
            .clearValue('form#delete-form input[name=delete-password]')
            .setValue('form#delete-form input[name=delete-password]', '5678')
            // Send data
            .click('button#delete-btn')
            // Check it goes to the main page
            .assert.urlEquals('http://localhost:3000/', 'Show the main page')
            .saveScreenshot('tests/screenshots/deleteSuccess.png')
    }
}
