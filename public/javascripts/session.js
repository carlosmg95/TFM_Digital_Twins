const createUser = async function() {
    let username = $('#signup-username').val()
    let email = $('#signup-email').val()
    let password1 = hash($('#signup-password').val())
    let password2 = hash($('#signup-repeat-password').val())

    strButton = $('#signup-btn')[0].innerText  // Save the text of the button
    $('#signup-btn')[0].innerHTML = '<i class="fas fa-spinner fa-spin"></i>'  // Show a wait icon

    let rightUsername = await checkUsername(username)
    let rightEmail = await checkEmail(email)
    let rightPasswords = checkPasswords(password1, password2)
    
    if (rightUsername && rightEmail && rightPasswords) {
        $.post('/api/join', {
            username: username,
            email: email,
            password: password1
        })
        .done(function(data) {
            if(data.error) {
                showError('signup-err', data.error)
            } else {
                hideError('signup-err')
                window.location.href = /*getUrlParam(window.location.href, 'redir') ||*/ `/profile/${username}`
            }
        })
        .always(function() {
            $('#signup-btn')[0].innerText = strButton  // Recover the last text
        })
    } else {
        $('#signup-btn')[0].innerText = strButton  // Recover the last text
    }
}

const login = async function() {
    let username = $('#login-username').val()
    let password = hash($('#login-password').val())

    strButton = $('#login-btn')[0].innerText  // Save the text of the button
    $('#login-btn')[0].innerHTML = '<i class="fas fa-spinner fa-spin"></i>'  // Show a wait icon
    
    if (username && $('#login-password').val()) {
        await $.post('/api/login', {
            username: username,
            password: password
        })
        .done(function(data) {
            let code = data.code
            let errorMsg = data.error

            if (wrongUserErrorCode === code) {
                showError('login-err', errorMsg)
            } else {
                hideError('login-err')
                window.location.href = /*getUrlParam(window.location.href, 'redir') ||*/ `/profile`
            }
        })
        .always(function() {
            $('#login-btn')[0].innerText = strButton  // Recover the last text
        })
    } else {
        if (!username) {
            showErrorMsg($('#login-username'))
        } else {
            hideErrorMsg($('#login-username'))
        }
        if (!$('#login-password').val()) {
            showErrorMsg($('#login-password'))
        } else {
            hideErrorMsg($('#login-password'))
        }
        $('#login-btn')[0].innerText = strButton  // Recover the last text
    }
}

// ================================================================================================================== //
//  Private functions                                                                                                 //
// ================================================================================================================== //

const checkPasswords = function(pass1, pass2) {
    pass1 = pass1 || hash($('#signup-password').val())
    pass2 = pass2 || hash($('#signup-repeat-password').val())
    let equals = pass1 === pass2

    if (equals) {
        hideErrorMsg($('#signup-repeat-password'))
    } else {
        showErrorMsg($('#signup-repeat-password'))
    }
    return equals
}

// Check if the email exists
const checkEmail = async function(email) {
    email = email || $('#signup-email').val()
    let exists = false
    let wrongEmail = !validateEmail(email)

    if (wrongEmail) {
        showErrorMsg($('#signup-email'))
        return false
    } else {
        hideErrorMsg($('#signup-email'))
    }

    await $.get(`/api/users/existemail/${email}`, function(result) {
        let code = result.code
        let errorMsg = result.error

        if (existingEmailErrorCode === code) {
            showErrorMsg($('#signup-email'), errorMsg)
            exists = true
        } else {
            hideErrorMsg($('#signup-email'))
            exists = false
        }
    })
    return !exists
}

// Check if the username exists
const checkUsername = async function(username) {
    username = username || $('#signup-username').val()
    let exists = false
    let wrongUsername = username.search(/\s|\?|=|\+|\$|\&|%|~/) !== -1

    if (wrongUsername) {
        showErrorMsg($('#signup-username'))
        return false
    } else {
        hideErrorMsg($('#signup-username'))
    }

    await $.get(`/api/users/existusername/${username}`, function(result) {
        let code = result.code
        let errorMsg = result.error

        if (existingUsernameErrorCode === code) {
            showErrorMsg($('#signup-username'), errorMsg)
            exists = true
        } else {
            hideErrorMsg($('#signup-username'))
            exists = false
        }
    })
    return !exists
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

// Function to show error message under a form
const showError = function(id, errorMsg) {
    let div = $(`#${id}`)[0]
    let card = $(div).parent().find('.card')[0]
    let cardBody = $(card).find('.card-body')[0]
    let msg = errorMsg ||  $(div).attr('data-err')

    $(card).removeClass('border-primary')
    $(card).addClass('border-danger')

    $(cardBody).removeClass('text-primary')
    $(cardBody).addClass('text-danger')

    div.hidden = false
    div.innerText = msg
}

// Function to show error message under an input
const showErrorMsg = function(inputElement, errorMsg) {
    let div = $(inputElement).parent().find('.form-group-error')[0]
    let small = div.children[0]
    let msg = errorMsg ||  $(div).attr('data-err')

    inputElement.get(0).setCustomValidity(msg)
    small.innerText = msg
}

// Validate an email
const validateEmail = function(email) {
    return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)
}
