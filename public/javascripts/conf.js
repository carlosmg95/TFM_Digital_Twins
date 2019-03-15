let newUsername = false
let newEmail = false
let newPassword = false

const deleteUser = async function() {
    let username = $('#delete-username').val()
    let password = hash($('#delete-password').val())

    strButton = $('#delete-btn')[0].innerText  // Save the text of the button
    $('#delete-btn')[0].innerHTML = '<i class="fas fa-spinner fa-spin"></i>'  // Show a wait icon
    $('#delete-btn').attr('disabled', 'disabled')  // Disable the button

    let rightPassword = await checkPassword(password, 'delete-password')

    if (rightPassword) {
        await $.post('/api/deleteuser?_method=DELETE', {
            username,
            password
        })
        .done(function(data) {
            if(data.error) {
                showError('delete-alert', data.error)
            } else {
                window.location.href = '/'
            }
        })
        .always(function() {
            $('#delete-btn')[0].innerText = strButton  // Recover the last text
            $('#delete-btn').removeAttr('disabled')  // Enable again the button
        })
    }
    $('#delete-btn')[0].innerText = strButton  // Recover the last text
    $('#delete-btn').removeAttr('disabled')  // Enable again the button
}

const editUser = async function() {
    let username = $('#edit-username').val()
    let email = $('#edit-email').val()
    let passwordOld = hash($('#edit-old-password').val())
    let passwordNew = hash($('#edit-new-password').val())
    let passwordNew2 = hash($('#edit-new-password-repeat').val())

    strButton = $('#edit-btn')[0].innerText  // Save the text of the button
    $('#edit-btn')[0].innerHTML = '<i class="fas fa-spinner fa-spin"></i>'  // Show a wait icon
    $('#edit-btn').attr('disabled', 'disabled')  // Disable the button

    let rightUsername = await checkUsername(username)
    let rightEmail = await checkEmail(email)
    let rightPassword = await checkPasswords(passwordOld, passwordNew, passwordNew2)

    if (rightUsername && rightEmail && rightPassword ) {
        let post = {}
        if (newUsername)
            post = { ...post, username }
        if (newEmail)
            post = { ...post, email }
        if (newPassword)
            post = { ...post, "password": passwordNew }

        if (newUsername || newEmail || newPassword) {
            await $.post('/api/edituser?_method=PUT', post)
            .done(function(data) {
                if(data.error) {
                    showError('edit-alert', data.error)
                } else {
                    showSuccess('edit-alert', 'Usuario editado con éxito')
                    location.reload()
                }
            })
            .always(function() {
                $('#edit-btn')[0].innerText = strButton  // Recover the last text
                $('#edit-btn').removeAttr('disabled')  // Enable again the button
            })
        }
    }
    $('#edit-btn')[0].innerText = strButton  // Recover the last text
    $('#edit-btn').removeAttr('disabled')  // Enable again the button
}

const showPasswords = function() {
    $('div#passwords')[0].hidden = false
    $('button#show-passwords-btn')[0].hidden = true
}

// ================================================================================================================== //
//  Private functions                                                                                                 //
// ================================================================================================================== //

// Check if the email exists
const checkEmail = async function(email) {
    email = email || $('#edit-email').val()
    emailOld = $('#edit-email-old').val()

    let exists = false
    let wrongEmail = !validateEmail(email)

    if (wrongEmail) {
        showErrorMsg($('#edit-email'))
        newEmail = false
        return false
    } else {
        hideErrorMsg($('#edit-email'))
    }

    if (email === emailOld || email === '') {
        newEmail = false
        return true
    } else {
        await $.get(`/api/users/existemail/${email}`, function(result) {
            let code = result.code
            let errorMsg = result.error

            if (existingEmailErrorCode === code) {
                showErrorMsg($('#edit-email'), errorMsg)
                exists = true
            } else {
                hideErrorMsg($('#edit-email'))
                exists = false
                newEmail = true
            }
        })
        return !exists
    }
}

// Check if every password is ok
const checkPasswords = async function(passOld, pass1, pass2) {
    passOld = passOld || hash($('#edit-old-password').val())
    pass1 = pass1 || hash($('#edit-new-password').val())
    pass2 = pass2 || hash($('#edit-new-password-repeat').val())
    let changePassword = !$('div#passwords')[0].hidden
    let rightPassword = true

    if (changePassword) {
        let equals = pass1 === pass2

        if (equals) {
            hideErrorMsg($('#edit-new-password-repeat'))
            
            if (!$('#edit-new-password').val()) {
                showErrorMsg($('#edit-new-password'), 'Este campo se debe rellenar')
                rightPassword &= false
            } else {
                hideErrorMsg($('#edit-new-password'))
            }

            if (!$('#edit-new-password-repeat').val()) {
                showErrorMsg($('#edit-new-password-repeat'), 'Este campo se debe rellenar')
                rightPassword &= false
            } else {
                hideErrorMsg($('#edit-new-password-repeat'))
            }   
        } else {
            showErrorMsg($('#edit-new-password-repeat'))
            rightPassword &= false
        }

        rightPassword &= await checkPassword(passOld, 'edit-old-password')
        return rightPassword
    } else {
        newPassword = false
        return true
    }
}

// Check if the password is right
const checkPassword = async function(pass, idDiv) {
    await $.get(`/api/users/rightpassword/${pass}`, function(result) {
        let code = result.code
        let errorMsg = result.error

        if (wrongPassErrorCode === code) {
            showErrorMsg($(`#${idDiv}`), errorMsg)
            rightPassword = false
        } else {
            hideErrorMsg($(`#${idDiv}`))
            exists = false
            newPassword = true
            rightPassword = true
        }
    })
    return rightPassword
}

// Check if the username exists
const checkUsername = async function(username) {
    username = username || $('#edit-username').val()
    usernameOld = $('#edit-username-old').val()

    let exists = false
    let wrongUsername = username.search(/\s|\?|=|\+|\$|\&|%|~|\*|\//) !== -1

    if (wrongUsername) {
        showErrorMsg($('#edit-username'))
        return false
    } else {
        hideErrorMsg($('#edit-username'))
    }

    if (username === usernameOld || username === '') {
        newUsername = false
        return true
    } else {
        await $.get(`/api/users/existusername/${username}`, function(result) {
            let code = result.code
            let errorMsg = result.error

            if (existingUsernameErrorCode === code) {
                showErrorMsg($('#edit-username'), errorMsg)
                exists = true
            } else {
                hideErrorMsg($('#edit-username'))
                exists = false
                newUsername = true
            }
        })
        return !exists
    }
}

const hash = function(pass) {
    return CryptoJS.SHA256(pass).toString(CryptoJS.enc.Hex)
}

// Function to hide error message under a form
const hideError = function(id) {
    let div = $(`#${id}`)[0]
    let card = $(div).parent().find('.card')[0]
    let cardBody = $(card).find('.card-body')[0]

    $(card).removeClass('border-danger')
    $(card).addClass('border-primary')

    $(cardBody).removeClass('text-danger')
    $(cardBody).addClass('text-primary')

    div.hidden = true
    div.innerText = ''
}

// Function to hide error message under an input
const hideErrorMsg = function(inputElement) {
    let div = $(inputElement).parent().find('.form-group-error')[0]
    let small = div.children[0]
    inputElement.get(0).setCustomValidity('')
    small.innerText = ''
}

// Function to show error message
const showError = function(id, errorMsg) {
    let div = $(`#${id}`)[0]
    let msg = errorMsg ||  $(div).attr('data-err')

    $(div).removeClass('border-bottom-success')
    $(div).removeClass('alert-success')
    $(div).addClass('border-bottom-danger')
    $(div).addClass('alert-danger')

    div.hidden = false
    div.innerText = msg
    div.innerHTML += '<button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button>'
}

// Function to show error message under an input
const showErrorMsg = function(inputElement, errorMsg) {
    let div = $(inputElement).parent().find('.form-group-error')[0]
    let small = div.children[0]
    let msg = errorMsg ||  $(div).attr('data-err')

    inputElement.get(0).setCustomValidity(msg)
    small.innerText = msg
}

// Function to show success message
const showSuccess = function(id, errorMsg) {
    let div = $(`#${id}`)[0]
    let msg = errorMsg ||  $(div).attr('data-err')

    $(div).removeClass('border-bottom-danger')
    $(div).removeClass('alert-danger')
    $(div).addClass('border-bottom-success')
    $(div).addClass('alert-success')

    div.hidden = false
    div.innerText = msg
    div.innerHTML += '<button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button>'
}

// Validate an email
const validateEmail = function(email) {
    return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)
}
