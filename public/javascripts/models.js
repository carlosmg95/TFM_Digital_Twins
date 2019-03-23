// It remove the default submit function
$('#delete-form').on('submit', function(e){
    e.preventDefault()
    let f = $(this)
})
$('#upload-form').on('submit', function(e){
    e.preventDefault()
    let f = $(this)
})

const deleteModel = async function() {
    let name = $('#delete-name').val()
    let password = hash($('#delete-password').val())

    strButton = $('#delete-btn')[0].innerText  // Save the text of the button
    $('#delete-btn')[0].innerHTML = '<i class="fas fa-spinner fa-spin"></i>'  // Show a wait icon
    $('#delete-btn').attr('disabled', 'disabled')  // Disable the button

    let rightPassword = await checkPassword(password, 'delete-password')

    if (rightPassword) {
        $.post('/api/models/deletemodel?_method=DELETE', {
            name,
            password
        })
        .done(function(data) {
            if(data.error) {
                showError('delete-alert', data.error)
            } else {
                $('#delete-password').val('')
                $('#delete-modal').modal('hide')
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

    strButton = $('#upload-btn')[0].innerText  // Save the text of the button
    $('#upload-btn')[0].innerHTML = '<i class="fas fa-spinner fa-spin"></i>'  // Show a wait icon
    $('#upload-btn').attr('disabled', 'disabled')  // Disable the button

    let rightFile = checkFile()
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

const checkFile = function(file) {
    file = file || $('#model-file').val()

    if (!file) {
        showErrorMsg($('#model-file'))
        return false
    } else {
        hideErrorMsg($('#model-file'))
        return true
    }
}

const checkName = async function(name) {
    name = name || $('#model-name').val()
    let existe = false
    let wrongName = name.search(/\s|\?|=|\+|\$|\&|%|~|\*|\//) !== -1

    if (!name) {
        showErrorMsg($('#model-name'))
    }

    if (wrongName) {
        showErrorMsg($('#model-name'), 'El nombre del fichero no puede contener espacios ni caracteres especiales')
    }

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