const createStage = async function() {
    let idStr = $('input#create-stage-id').val()
    let modelName = $('select#create-stage-model').val()
    let model = {
        "name": modelName,
        "rotation": {
            "x": modelScene.rotation.x,
            "y": modelScene.rotation.y,
            "z": modelScene.rotation.z
        },
        "scale": {
            "x": modelScene.scale.x,
            "y": modelScene.scale.y,
            "z": modelScene.scale.z
        }
    }
    let name = $('input#create-stage-name').val()
    let data = {
        name,
        "id_str": idStr,
        model
    }

    $.ajax({
        type: 'POST',
        url: '/api/stages/create',
        contentType: 'application/json',
        data: JSON.stringify(data)
    })
    .done(function(data) {
        console.log(data)
        /*if(data.error) {
            showError('signup-err', data.error)
        } else {
            hideError('signup-err')
            $.post('/api/users/login', {
                "username": username,
                "password": password1
            })
            .done(function(data) {
                let code = data.code
                let errorMsg = data.error

                if (wrongUserErrorCode === code) {
                    showError('signup-err', errorMsg)
                } else {
                    hideError('signup-err')
                    window.location.href = 'profile'
                }
            })
        }*/
    })
    .always(function() {
        //$('#signup-btn')[0].innerText = strButton  // Recover the last text
        //$('#signup-btn').removeAttr('disabled')  // Enable again the button
    })
    /*let formData = new FormData(document.getElementById('upload-form'))

    strButton = $('#upload-btn')[0].innerText  // Save the text of the button
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
    $('#upload-btn').removeAttr('disabled')  // Enable again the button*/
}