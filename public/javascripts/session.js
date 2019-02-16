let createUser = function () {
    let username = $('#signup-username').val()
    let email = $('#signup-email').val()
    let password = hash($('#signup-password').val())

    $.post('/api/join', {
        username: username,
        email: email,
        password: password
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

function hash(pass) {
    return CryptoJS.SHA256(pass).toString(CryptoJS.enc.Hex)
}