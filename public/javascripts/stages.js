const createStage = async function() {
    let rightValues = true
    // Stage data
    let background = new FormData(document.getElementById('create-stage-form'))
    let idStr = $('input#create-stage-id').val()
    let modelName = $('select#create-stage-model').val()
    let name = $('input#create-stage-name').val()

    let rightId = await checkId(idStr)
    let rightModel = checkModel(modelName)
    let rightName = checkName(name)

    rightValues &= (rightId && rightModel && rightName)

    if (!rightModel)
        return false

    // Model data
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

    // Actions data
    let actions = $('div[id^=action-item-]')
    let actionsData = []
    let actionsNames = []

    for (let i = 0; i < actions.length; i++) {
        let action = actions[i]
        let n = i + 1
        if ($(action).hasClass('hidden'))
            continue
        let actionName = $(action).find('input.action-name').val()
        let animations = $(`div[id^=form-animation-${n}-`)
        let animationsData = []

        let rightActionName = checkActionName(actionName, n)
        rightActionName &= notRepeatActionName(actionName, actionsNames, n)

        rightValues &= rightActionName

        if (rightActionName) {
            actionsNames.push(actionName)
            hideErrorMsg($(`#action-name-${n}`))
        }

        for (let j = 0; j < animations.length; j++) {
            let animation = animations[j]
            let animationName = $(animation).find('select.action-animations').val()
            let fin = $(animation).find('input[name^=action-fin-]:checked').val() === 'end'
            let nRepeat = +$(animation).find('input.action-repeat').val()
            let y = j + 1

            let rightAnimationName = checkAnimationName(animationName, n, y)

            rightValues &= rightAnimationName
            
            animationsData.push({
                "name": animationName,
                "repeat": nRepeat,
                fin
            })
        }
        actionsData.push({
            "name": actionName,
            "animations": animationsData
        })
        animationsData = []
    }

    // Complet data

    let data = {
        name,
        "id_str": idStr,
        model,
        "actions": actionsData
    }

    background.append('data', JSON.stringify(data))

    if (rightValues) {
        let strButton = $('#create-stage-btn')[0].innerText  // Save the text of the button
        $('#create-stage-btn')[0].innerHTML = '<i class="fas fa-spinner fa-spin"></i>'  // Show a wait icon
        $('#create-stage-btn').attr('disabled', 'disabled')  // Disable the button

        $.ajax({
            type: 'POST',
            url: '/api/stages/create',
            data: background,
            cache: false,
            contentType: false,
            processData: false,
        })
        .done(function(data) {
            if(data.error) {
                showError('create-stage-err', data.error)
            } else {
                hideError('create-stage-err')
                window.location.href = `/profile/stages/${idStr}`
            }
        })
        .always(function() {
            $('#create-stage-btn')[0].innerText = strButton  // Recover the last text
            $('#create-stage-btn').removeAttr('disabled')  // Enable again the button
        })
    }
}

// ================================================================================================================== //
//  Private functions                                                                                                 //
// ================================================================================================================== //

const checkActionName = function(actionName, n) {
    if (!actionName) {
        showErrorMsg($(`#action-name-${n}`))
        return false
    } else {
        let wrongActionName = actionName.search(wrongRegexp) !== -1

        if (wrongActionName) {
            showErrorMsg($(`#action-name-${n}`), 'El nombre no puede contener espacios ni caracteres especiales')
            return false
        } else {
            hideErrorMsg($(`#action-name-${n}`))
            return true
        }
    }
}

const checkAnimationName = function(animationName, n, y) {
    if (animationName === '-- Selecciona --') {
        showErrorMsg($(`#animation-name-${n}-${y}`))
        return false
    } else {
        hideErrorMsg($(`#animation-name-${n}-${y}`))
        return true
    }
}

const checkId = async function(idStr) {
    idStr = idStr || $('#create-stage-id').val()
    let exists = false
    let wrongIdStr = idStr.search(wrongRegexp) !== -1

    if (!idStr) {
        showErrorMsg($('#create-stage-id'), 'Este campo se debe rellenar')
        return false
    } else {
        hideErrorMsg($('#create-stage-id'))
    }

    if (wrongIdStr) {
        showErrorMsg($('#create-stage-id'))
        return false
    } else {
        hideErrorMsg($('#create-stage-id'))
    }

    await $.get(`/api/stage/existid/${idStr}`, function(result) {
        let code = result.code
        let errorMsg = result.error

        if (existingIdStrErrorCode === code) {
            showErrorMsg($('#create-stage-id'), errorMsg)
            exists = true
        } else {
            hideErrorMsg($('#create-stage-id'))
            exists = false
        }
    })
    return !exists
}

const checkModel = function(modelName) {
    modelName = modelName || $('select#create-stage-model').val()

    if (modelName === '-- Selecciona --' || modelName === 'Subir modelo') {
        showErrorMsg($('#create-stage-model'))
        return false
    } else {
        hideErrorMsg($('#create-stage-model'))
        return true
    }
}

const checkName = function(name) {
    name = name || $('select#create-stage-name').val()

    if (!name) {
        showErrorMsg($('#create-stage-name'))
        return false
    } else {
        hideErrorMsg($('#create-stage-name'))
        return true
    }
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

const notRepeatActionName = function(item, total, n) {
    if (total.indexOf(item) > -1) {
        showErrorMsg($(`#action-name-${n}`), 'El nombre está repetido')
        return false
    } else {
        return true
    }
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