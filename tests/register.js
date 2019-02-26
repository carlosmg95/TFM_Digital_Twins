let config = require('../nightwatch.json')
let errors = require('../tools/errors')
let fns = require('../tools/functions')

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
            .clearValue('form#signup-form input[name=signup-username]')
            .clearValue('form#signup-form input[name=signup-email]')
            .clearValue('form#signup-form input[name=signup-password]')
            .clearValue('form#signup-form input[name=signup-repeat-password]')
    },

    // Try to send empty form - Should FAIL -> Error in every input
    'Try to send empty form': function(browser) {
        browser
            .click('button#signup-btn')
            .waitForElementVisible('form#signup-form input[name=signup-email] + div.form-group-error', 'Error appears')
            .assert.containsText('form#signup-form input[name=signup-email] + div.form-group-error', 'Formato incorrecto', 'Error because wrong email format')
            .assert.containsText('button#signup-btn', 'Registrarse', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/join', 'It cannot send no data')
            .saveScreenshot('tests/screenshots/emptyForm.png')
    },

    // Try to send form with only username - Should FAIL -> Error in every input but username
    'Try to send form with only username': function(browser) {
        browser
            .setValue('form#signup-form input[name=signup-username]', 'Carlos')
            .click('button#signup-btn')
            .waitForElementVisible('form#signup-form input[name=signup-email] + div.form-group-error', 'Error appears')
            .assert.containsText('form#signup-form input[name=signup-email] + div.form-group-error', 'Formato incorrecto', 'Error because wrong email format')
            .assert.containsText('button#signup-btn', 'Registrarse', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/join', 'It cannot send no data')
            .saveScreenshot('tests/screenshots/emptyFormButUsername.png')
    },

    // Try to send form with existing username - Should FAIL -> Error in username input
    'Try to send form with existing username': function(browser) {
        let username = 'carlosmg95'
        browser
            .setValue('form#signup-form input[name=signup-username]', username)
            .click('button#signup-btn')
            .waitForElementVisible('form#signup-form input[name=signup-username] + div.form-group-error', 'Error appears')
            .assert.containsText('form#signup-form input[name=signup-username] + div.form-group-error', fns.formatError(errors.EXISTING_USERNAME, username).message, 'Error because the username exists')
            .assert.containsText('button#signup-btn', 'Registrarse', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/join', 'It cannot send no data')
            .saveScreenshot('tests/screenshots/existingUsername.png')
    },

    // Try to send form with wrong username - Should FAIL -> Error in username input
    'Try to send form with wrong username': function(browser) {
        let usernames = ['espa cio', 'car?los', 'car=', '+carlos', '$echo', 'm&t', '100%', '~user', '**', '/home']
        for (let i in usernames) {
            browser
                .setValue('form#signup-form input[name=signup-username]', usernames[i])
                .click('button#signup-btn')
                .waitForElementVisible('form#signup-form input[name=signup-username] + div.form-group-error', 'Error appears')
                .assert.containsText('form#signup-form input[name=signup-username] + div.form-group-error', 'El nombre de usuario no puede contener espacios ni caracteres especiales', 'Error because wrong username format')
                .assert.containsText('button#signup-btn', 'Registrarse', 'We are not waiting for data')
                .assert.urlEquals('http://localhost:3000/join', 'It cannot send no data')
                .saveScreenshot(`tests/screenshots/wrongUsername${i}.png`)
                .clearValue('form#signup-form input[name=signup-username]')
            }
    }
}