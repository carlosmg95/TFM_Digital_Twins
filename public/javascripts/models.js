// It remove the default submit function
$('#delete-form').on('submit', function(e){
    e.preventDefault()
})
$('#upload-form').on('submit', function(e){
    e.preventDefault()
})

const deleteModel = async function(modelName) {
    let ext = $('#delete-extension').val()
    let name = modelName || $('#delete-name').val()
    let password = hash($('#delete-password').val())

    let strButton = $('#delete-btn')[0].innerText  // Save the text of the button
    $('#delete-btn')[0].innerHTML = '<i class="fas fa-spinner fa-spin"></i>'  // Show a wait icon
    $('#delete-btn').attr('disabled', 'disabled')  // Disable the button

    let rightPassword = await checkPassword(password, 'delete-password')

    if (rightPassword) {
        $.post('/api/models/deletemodel?_method=DELETE', {
            ext,
            name,
            password
        })
        .done(function(data) {
            if(data.error) {
                showError('delete-alert', data.error)
            } else {
                $('#delete-password').val('')
                $('#delete-modal').modal('hide')
                hideError('delete-alert')
                if (modelName)
                    window.location.href = '/profile/models'
                else
                    showModels()
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

const uploadFile = async function() {
    let formData = new FormData(document.getElementById('upload-form'))

    let strButton = $('#upload-btn')[0].innerText  // Save the text of the button
    $('#upload-btn')[0].innerHTML = '<i class="fas fa-spinner fa-spin"></i>'  // Show a wait icon
    $('#upload-btn').attr('disabled', 'disabled')  // Disable the button

    let rightFile = await checkFile()
    let rightName = await checkName()

    if (rightName && rightFile) {
        $.ajax({
            url: '/api/models/uploadmodel',
            type: 'post',
            dataType: 'html',
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            success: function(data) {
                let code = JSON.parse(data).code
                if (code === 0) {
                    $('#upload-modal').modal('hide')
                    showModels()
                }
            }
        })
    }
    $('#upload-btn')[0].innerText = strButton  // Recover the last text
    $('#upload-btn').removeAttr('disabled')  // Enable again the button
}

// ================================================================================================================== //
//  Private functions                                                                                                 //
// ================================================================================================================== //

const checkFile = async function(file) {
    file = file || $('#model-file').val()
    let rightFile = true
    let rightSize = true

    if (!file) {
        showErrorMsg($('#model-file'))
        rightFile = false
    } else {
        let size = $('#model-file')[0].files[0].size
        await $.get(`/api/models/checksize/${size}`, function(result) {
            let code = result.code
            let errorMsg = result.error

            if (tooLargeErrorCode === code) {
                showErrorMsg($('#model-file'), errorMsg)
                rightSize = false
            } else {
                rightSize = true
            }
        })
    }
    
    if (rightFile && rightSize) {
        hideErrorMsg($('#model-file'))
        return true
    }

    return false
}

const checkName = async function(name) {
    name = name || $('#model-name').val()
    let existe = false
    let wrongName = name.search(wrongRegexp) !== -1

    if (!name) {
        showErrorMsg($('#model-name'))
    } else if (wrongName) {
        showErrorMsg($('#model-name'), 'El nombre del fichero no puede contener espacios ni caracteres especiales')
    } else {
        await $.get(`/api/models/existname/${name}`, function(result) {
            let code = result.code
            let errorMsg = result.error

            if (existingNameErrorCode === code) {
                showErrorMsg($('#model-name'), errorMsg)
                exists = true
            } else {
                hideErrorMsg($('#model-name'))
                exists = false
            }
        })
    }

    if (name && !wrongName && !exists) {
        hideErrorMsg($('#model-name'))
        return true
    }

    return false
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

const hash = function(pass) {
    return CryptoJS.SHA256(pass).toString(CryptoJS.enc.Hex)
}

// Function to hide error message under a form
const hideError = function(id) {
    let div = $(`#${id}`)[0]

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
    let msg = errorMsg ||  $(div).attr('data-err')

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
