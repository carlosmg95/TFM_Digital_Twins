// It remove the default submit function
$('#upload-form').on('submit', function(e){
    e.preventDefault()
    let f = $(this)
})

const uploadFile = async function() {
    let formData = new FormData(document.getElementById('upload-form'))

    strButton = $('#upload-btn')[0].innerText  // Save the text of the button
    $('#upload-btn')[0].innerHTML = '<i class="fas fa-spinner fa-spin"></i>'  // Show a wait icon
    $('#upload-btn').attr('disabled', 'disabled')  // Disable the button

    let rightFile = checkFile()
    let rightName = await checkName()

    if (rightName && rightFile) {
        $.ajax({
            url: '/api/uploadmodel',
            type: 'post',
            dataType: 'html',
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            success: function(data) {
                let code = JSON.parse(data).code
                if (code === 0)
                    $('#upload-modal').modal('hide')
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

    await $.get(`/api/model/existname/${name}`, function(result) {
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