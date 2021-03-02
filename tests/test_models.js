// ====================================================================================================================
// Dependencies
// ====================================================================================================================

// Node modules
const path = require('path')

// Own modules
const config = require('../nightwatch.json')
const fns = require('../tools/functions')

// ====================================================================================================================
// Module exports
// ====================================================================================================================

module.exports = {
    '@tags': ['delete', 'model', 'upload'],
    before: function(browser) {
        console.log('Starting models test...')
        browser
            // Show main page
            .url('http://localhost:3000')
            .waitForElementVisible('body', 'Show the page')
            // Show register page
            .click('a#register-link')
            .waitForElementVisible('body', 'Show the page')
            // Create a new user
            .setValue('form#signup-form input[name=signup-username]', 'username')
            .setValue('form#signup-form input[name=signup-email]', 'email@email.com')
            .setValue('form#signup-form input[name=signup-password]', 'password')
            .setValue('form#signup-form input[name=signup-repeat-password]', 'password')
            .click('button#signup-btn')
            // Check we can enter in the profile page
            .waitForElementVisible('body', 'Show the page')
            .assert.urlEquals('http://localhost:3000/profile', 'Correct url')
    },

    after: function(browser) {
        browser
            // Go to setting page
            //.url('http://localhost:3000/profile/settings')
            .click('li#setting-profile-btn')
            .click('a#settings-link')
            .waitForElementVisible('body', 'Show the page')
            .assert.urlEquals('http://localhost:3000/profile/settings', 'Correct url')
            // Show delete modal
            .click('button#show-delete-modal')
            .waitForElementVisible('div#delete-modal', 'Show the modal with the password')
            .setValue('form#delete-form input[name=delete-password]', 'password')
            // Send data
            .click('button#delete-btn')
            // Check it goes to the main page
            .assert.urlEquals('http://localhost:3000/', 'Show the main page')
            .end()
        console.log('Models test finished')
        
    },

    // Try to upload a model with empty data - Should FAIL -> Error because of every input
    'Try to upload a model with empty data': function(browser) {
        browser
            // Go to models page
            .click('li#models-page')
            .waitForElementVisible('body', 'Show the page')
            .assert.urlEquals('http://localhost:3000/profile/models', 'Correct url')
            // Show upload modal
            .click('a#upload-link')
            .waitForElementVisible('div#upload-modal', 'Show the upload modal')
            // Send data
            .click('button#upload-btn')
            // Show error
            .waitForElementVisible('form#upload-form input[name=model-name] + div.form-group-error', 'Error appears')
            .assert.containsText('form#upload-form input[name=model-name] + div.form-group-error', 'Se debe rellenar el nombre del fichero', 'Error because no name')
            .waitForElementVisible('form#upload-form input[name=model-file] + div.form-group-error', 'Error appears')
            .assert.containsText('form#upload-form input[name=model-file] + div.form-group-error', 'Se debe proporcionar un fichero', 'Error because no file')
            .saveScreenshot('tests/screenshots/models/uploadModelEmptyData.png')
    },

    // Try to upload a model without name - Should FAIL -> Error because of name input
    'Try to upload a model without name': function(browser) {
        browser
            // Clear the name and set  a file
            .clearValue('form#upload-form input[name=model-name]')
            .setValue('form#upload-form input[name=model-file]', path.resolve('/home/carlos/Documentos/MIOT/TFM/three.js/examples/models/gltf/Horse.glb'))
            // Send data
            .click('button#upload-btn')
            // Show error
            .waitForElementVisible('form#upload-form input[name=model-name] + div.form-group-error', 'Error appears')
            .assert.containsText('form#upload-form input[name=model-name] + div.form-group-error', 'Se debe rellenar el nombre del fichero', 'Error because no name')
            .assert.hidden('form#upload-form input[name=model-file] + div.form-group-error', 'Error no appears')
            .saveScreenshot('tests/screenshots/models/uploadModelWithoutName.png')
    },

    // Try to upload a model with wrong name - Should FAIL -> Error because of name input
    'Try to upload a model with wrong name': function(browser) {
        let names = ['espa cio', 'na?me', 'nam=', '+name', '$echo', 'm&t', '100%', '~user', '**', '/home', '.name', 'name.']        // Try some wrong names
        for (let i in names) {
            browser
                // Clear the name and set an wrong name
                .clearValue('form#upload-form input[name=model-name]')
                .setValue('form#upload-form input[name=model-name]', names[i])
                // Send data
                .click('button#upload-btn')
                // Show error
                .waitForElementVisible('form#upload-form input[name=model-name] + div.form-group-error', 'Error appears')
                .assert.containsText('form#upload-form input[name=model-name] + div.form-group-error', 'El nombre del fichero no puede contener espacios ni caracteres especiales', 'Error because wrong name')
                .assert.hidden('form#upload-form input[name=model-file] + div.form-group-error', 'Error no appears')
                .saveScreenshot(`tests/screenshots/models/uploadModelWrongName${i}.png`)
            }
    },

    // Try to upload a model without file - Should FAIL -> Error because of file input
    'Try to upload a model without file': function(browser) {
        browser
            // Clear the file and the name and set an right name
            .clearValue('form#upload-form input[name=model-file]')
            .clearValue('form#upload-form input[name=model-name]')
            .setValue('form#upload-form input[name=model-name]', 'name')
            // Send data
            .click('button#upload-btn')
            // Show error
            .waitForElementVisible('form#upload-form input[name=model-file] + div.form-group-error', 'Error appears')
            .assert.containsText('form#upload-form input[name=model-file] + div.form-group-error', 'Se debe proporcionar un fichero', 'Error because no name')
            .assert.hidden('form#upload-form input[name=model-name] + div.form-group-error', 'Error no appears')
            .saveScreenshot('tests/screenshots/models/uploadModelWithoutFile.png')
    },

    // Try to upload a model with a file too large - Should FAIL -> Error because of file input
    'Try to upload a model with a file too large': function(browser) {
        if (config.maxSize)
            browser
                // Set a file
                .setValue('form#upload-form input[name=model-file]', path.resolve('/home/carlos/Documentos/MIOT/TFM/three.js/examples/models/gltf/BoomBox/glTF-Binary/BoomBox.glb'))
                // Send data
                .click('button#upload-btn')
                // Show error
                .waitForElementVisible('form#upload-form input[name=model-file] + div.form-group-error', 'Error appears')
                .assert.containsText('form#upload-form input[name=model-file] + div.form-group-error', `El archivo supera los ${config.maxSize} MB máximos`, 'Error because file too large')
                .assert.hidden('form#upload-form input[name=model-name] + div.form-group-error', 'Error no appears')
                .saveScreenshot('tests/screenshots/models/uploadModelTooLarge.png')
    },

    // Try to upload a right model - Should SUCCESS -> No modal and show new model-item
    'Try to upload a right model': function(browser) {
        browser
            // Set a file
            .clearValue('form#upload-form input[name=model-file]')
            .setValue('form#upload-form input[name=model-file]', path.resolve('/home/carlos/Documentos/MIOT/TFM/three.js/examples/models/gltf/Horse.glb'))
            // Send data
            .click('button#upload-btn')
            .waitForElementNotVisible('div#upload-modal', 'Hide the upload modal')
            // Show model
            .waitForElementVisible('div#model-name-glb', 'Show the new model')
            .saveScreenshot('tests/screenshots/models/uploadModelRight.png')
    },

    // Try to upload a model with an existing name - Should FAIL -> Error because of name input
    'Try to upload a model with an existing name': function(browser) {
        let names = ['name', ...fns.getReservedWords()]
        browser
            // Show upload modal
            .click('a#upload-link')
            .waitForElementVisible('div#upload-modal', 'Show the upload modal')
        for (let i in names) {
            browser
                // Clear name and set a new one
                .clearValue('form#upload-form input[name=model-name]')
                .setValue('form#upload-form input[name=model-name]', names[i])
                // Send data
                .click('button#upload-btn')
                // Show error
                .waitForElementVisible('form#upload-form input[name=model-name] + div.form-group-error', 'Error appears')
                .assert.containsText('form#upload-form input[name=model-name] + div.form-group-error', `El nombre "${names[i]}" ya existe`, 'Error because existing name')
                .assert.hidden('form#upload-form input[name=model-file] + div.form-group-error', 'Error no appears')
                .saveScreenshot(`tests/screenshots/models/uploadModelWithExistingName${i}.png`)
        }
        browser
            // Close modal
            .click('button.close')
            .waitForElementNotVisible('div#upload-modal', 'Hide the upload modal')
            .pause(1000)
    },

    // Try to edit a model since index - Should SUCCESS -> Show model page and edit panel is visible
    'Try to edit a model since index': function(browser) {
        browser
            // Show edit page
            .click('a#menu-name')
            .waitForElementVisible('div[aria-labelledby=menu-name]', 'Show the menu')
            .click('div[aria-labelledby=menu-name] a.edit')
            // Check data
            .waitForElementVisible('body', 'Show the page')
            .assert.urlEquals('http://localhost:3000/profile/models/name?edit', 'Correct url')
            .assert.visible('div#edit-model', 'Edit panel appears')
            .saveScreenshot('tests/screenshots/models/editModelIndex.png')
            .click('div#edit-model i.fas.fa-times')
            .waitForElementNotVisible('div#edit-model', 'Hide the edit panel')
            .assert.urlEquals('http://localhost:3000/profile/models/name', 'Correct url')
            .assert.hidden('div#edit-model', 'Edit panel disappears')
    },

    // Try to delete with empty password since model page - Should FAIL -> Show /profile/models/name and wrong password error
    'Try to delete with empty password since model page': function(browser) {
        browser
            // Show delete modal
            .click('a.delete')
            .waitForElementVisible('div#delete-modal', 'Show the modal with the password')
            // Send data
            .click('button#delete-btn')
            // Show error
            .waitForElementVisible('form#delete-form input[name=delete-password] + div.form-group-error', 'Error appears')
            .assert.containsText('form#delete-form input[name=delete-password] + div.form-group-error', 'Contraseña incorrecta', 'Error because wrong password')
            // Check the server response
            .assert.containsText('button#delete-btn', 'Borrar', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/profile/models/name', 'It cannot send wrong data')
            .saveScreenshot('tests/screenshots/models/deleteModelEmptyPasswordModelPage.png')
    },

    // Try to delete with wrong password since model page - Should FAIL -> Show /profile/models/name and wrong password error
    'Try to delete with wrong password since model page': function(browser) {
        browser
            // Set a wrong password
            .setValue('form#delete-form input[name=delete-password]', '0000')
            // Send data
            .click('button#delete-btn')
            // Show errors
            .waitForElementVisible('form#delete-form input[name=delete-password] + div.form-group-error', 'Error appears')
            .assert.containsText('form#delete-form input[name=delete-password] + div.form-group-error', 'Contraseña incorrecta', 'Error because wrong password')
            // Check the server response
            .assert.containsText('button#delete-btn', 'Borrar', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/profile/models/name', 'It cannot send wrong data')
            .saveScreenshot('tests/screenshots/models/deleteModelWrongPasswordModelPage.png')
    },

    // Try to delete correctly since model page - Should SUCCESS -> Show /profile/models
    'Try to delete correctly since model page': function(browser) {
        browser
            // Clear password value and add the right password
            .clearValue('form#delete-form input[name=delete-password]')
            .setValue('form#delete-form input[name=delete-password]', 'password')
            // Send data
            .click('button#delete-btn')
            // Check it goes to the main page
            .waitForElementVisible('body', 'Show the page')
            .assert.urlEquals('http://localhost:3000/profile/models', 'Show the main page')
            .saveScreenshot('tests/screenshots/models/deleteSuccessModelPage.png')
    },

    // Upload a new model
    'Upload a new model': function(browser) {
        browser
            // Show upload modal
            .click('a#upload-link')
            .waitForElementVisible('div#upload-modal', 'Show the upload modal')
            // Set a file
            .setValue('form#upload-form input[name=model-name]', 'name')
            .setValue('form#upload-form input[name=model-file]', path.resolve('/home/carlos/Documentos/MIOT/TFM/three.js/examples/models/gltf/Horse.glb'))
            // Send data
            .pause(500)

.pause(500)            .click('button#upload-btn')
            .waitForElementNotVisible('div#upload-modal', 'Hide the upload modal')
            // Show model
            .waitForElementVisible('div#model-name-glb', 'Show the new model')
            .pause(1000)
    },

    // Try to delete with empty password since index - Should FAIL -> Show /profile/models and wrong password error
    'Try to delete with empty password since index': function(browser) {
        browser
            // Show delete modal
            .click('a#menu-name')
            .waitForElementVisible('div[aria-labelledby=menu-name]', 'Show the menu')
            .click('div[aria-labelledby=menu-name] a.delete')
            .waitForElementVisible('div#delete-modal', 'Show the modal with the password')
            // Send data
            .click('button#delete-btn')
            // Show error
            .waitForElementVisible('form#delete-form input[name=delete-password] + div.form-group-error', 'Error appears')
            .assert.containsText('form#delete-form input[name=delete-password] + div.form-group-error', 'Contraseña incorrecta', 'Error because wrong password')
            // Check the server response
            .assert.containsText('button#delete-btn', 'Borrar', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/profile/models', 'It cannot send wrong data')
            .saveScreenshot('tests/screenshots/models/deleteModelEmptyPasswordIndex.png')
    },

    // Try to delete with wrong password since index - Should FAIL -> Show /profile/models/name and wrong password error
    'Try to delete with wrong password since index': function(browser) {
        browser
            // Set a wrong password
            .setValue('form#delete-form input[name=delete-password]', '0000')
            // Send data
            .click('button#delete-btn')
            // Show errors
            .waitForElementVisible('form#delete-form input[name=delete-password] + div.form-group-error', 'Error appears')
            .assert.containsText('form#delete-form input[name=delete-password] + div.form-group-error', 'Contraseña incorrecta', 'Error because wrong password')
            // Check the server response
            .assert.containsText('button#delete-btn', 'Borrar', 'We are not waiting for data')
            .assert.urlEquals('http://localhost:3000/profile/models', 'It cannot send wrong data')
            .saveScreenshot('tests/screenshots/models/deleteModelWrongPasswordIndex.png')
    },

    // Try to delete correctly since index - Should SUCCESS -> Show /profile/models
    'Try to delete correctly since index': function(browser) {
        browser
            // Clear password value and add the right password
            .clearValue('form#delete-form input[name=delete-password]')
            .setValue('form#delete-form input[name=delete-password]', 'password')
            // Send data
            .click('button#delete-btn')
            // Check it goes to the main page
            .waitForElementVisible('body', 'Show the page')
            .assert.urlEquals('http://localhost:3000/profile/models', 'Show the main page')
            .saveScreenshot('tests/screenshots/models/deleteSuccessIndex.png')
            .waitForElementNotVisible('div#delete-modal', 'Hide the delete modal')
    },

    // Upload a new model
    'Upload a new model 2': function(browser) {
        browser
            // Show upload modal
            .click('a#upload-link')
            .waitForElementVisible('div#upload-modal', 'Show the upload modal')
            // Set a file
            .clearValue('form#upload-form input[name=model-name]')
            .clearValue('form#upload-form input[name=model-file]')
            .setValue('form#upload-form input[name=model-name]', 'name')
            .setValue('form#upload-form input[name=model-file]', path.resolve('/home/carlos/Documentos/MIOT/TFM/three.js/examples/models/gltf/Horse.glb'))
            // Send data
            .pause(500)
            .click('button#upload-btn')
            .waitForElementNotVisible('div#upload-modal', 'Hide the upload modal')
            // Show model
            .waitForElementVisible('div#model-name-glb', 'Show the new model')
            .pause(1000)
    },

    // Try to edit a model since model page - Should SUCCESS -> Show model page and edit panel is visible
    'Try to edit a model since model page': function(browser) {
        browser
            // Show model page
            .click('div#model-name-glb div.model-title > a')
            .assert.urlEquals('http://localhost:3000/profile/models/name', 'Correct url')
            // Show edit panel
            .click('a.edit')
            // Check data
            .waitForElementVisible('body', 'Show the page')
            .assert.urlEquals('http://localhost:3000/profile/models/name?edit', 'Correct url')
            .assert.visible('div#edit-model', 'Edit panel appears')
            .saveScreenshot('tests/screenshots/models/editModelModelPage.png')
            .click('div#edit-model i.fas.fa-times')
            .waitForElementNotVisible('div#edit-model', 'Hide the edit panel')
            .assert.urlEquals('http://localhost:3000/profile/models/name', 'Correct url')
            .assert.hidden('div#edit-model', 'Edit panel disappears')
    }
}
