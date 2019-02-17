const createUser = function () {
    let username = $('#signup-username').val()
    let email = $('#signup-email').val()
    let password1 = hash($('#signup-password').val())
    let password2 = hash($('#signup-repeat-password').val())

    

    checkUsername(username)

    $.post('/api/join', {
        username: username,
        email: email,
        password: password1
    })
    .done(function(data) {
        if(data.error) {
            //showErrors(errorContainerSelector, data.error)
        } else {
            console.log('Todo OK')
            //window.location.href = getUrlParam(window.location.href, 'redir') || '/dashboard'
        }
    })
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

// Check if the username exists
const checkUsername = function(username) {
    username = username || $('#signup-username').val()
    $.get(`/api/users/existusername/${username}`, function(result) {
        let code = result.code
        let errorMsg = result.error
        
        if (existingUsernameErrorCode === code) {
            showErrorMsg($('#signup-username'), errorMsg)
        } else {
            hideErrorMsg($('#signup-username'))
        }
    })
}

const hash = function(pass) {
    return CryptoJS.SHA256(pass).toString(CryptoJS.enc.Hex)
}

// Function to hide error message under an input
const hideErrorMsg = function(inputElement) {
    let div = $(inputElement).parent().find('.form-group-error')[0]
    let small = div.children[0]
    inputElement.get(0).setCustomValidity('')
    small.innerText = ''
}

// Function to show error message under an input
const showErrorMsg = function(inputElement, errorMsg) {
    let div = $(inputElement).parent().find('.form-group-error')[0]
    let small = div.children[0]
    let msg = errorMsg ||  $(div).attr('data-err')
    
    inputElement.get(0).setCustomValidity(msg)
    small.innerText = msg
}
