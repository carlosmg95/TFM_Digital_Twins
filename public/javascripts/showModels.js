let actions, activeAction, clock, mixer, modelAnimations, modelName, previousAction, stageActions = {}
let canvas
let clickTimer = null, lastSelectedObject = null, selectedObject = null
let content = document.getElementById('models-list')
let events = {
    "click": {},
    "dblclick": {},
    "mousein": {},
    "mouseout": {}
}
let modelScene, scenes = [], renderer
let rotateModel = true

const animate = function() {
    let dt = clock.getDelta()
    if (mixer)
        mixer.update(dt)
    render()
    requestAnimationFrame(animate)
}

const createAlert = function(alert) {
    let element = document.createElement('div')
    element.className = 'col-12 alert alert-warning'
    element.role = 'alert'
    if (alert === 'models')
        element.innerHTML = 'Aún no tines ningún modelo. ¡A qué esperas para <a href="" class="alert-link" data-toggle="modal" data-target="#upload-modal">subir</a> uno!'
    else if (alert === 'stages')
        element.innerHTML = 'Aún no tines ningún escenario. ¡A qué esperas para <a href="/profile/stages/create" class="alert-link">crear</a> uno!'
    content.appendChild(element)
}

const createGUI = function(model, animations) {
    let api = {}
    let gui = new dat.GUI()
    mixer = new THREE.AnimationMixer(model)
    actions = {}

    // animations

    let animationFolder = gui.addFolder('Animaciones')

    function createAnimationCallback(name) {
        api[name] = function() {fadeToAction(name, 0.2)}
        animationFolder.add(api, name)
    }

    for (let i = 0; i < animations.length; i++) {
        let clip = animations[i]
        let action = mixer.clipAction(clip)

        actions[clip.name] = action
        action.clampWhenFinished = true
        action.loop = THREE.LoopOnce

        createAnimationCallback(animations[i].name)
    }

    animationFolder.open()
}

const fadeToAction = function(name, duration) {
    previousAction = activeAction
    activeAction = actions[name]

    if (previousAction && (previousAction !== activeAction)) {
        previousAction.fadeOut(duration)
    }

    activeAction
        .reset()
        .setEffectiveTimeScale(1)
        .setEffectiveWeight(1)
        .fadeIn(duration)
        .play()
}

const getAnimations = function() {
    return modelAnimations && modelAnimations.map((animation) => animation.name)
}

const getIntersects = function(x, y) {
    let mouseVector = new THREE.Vector3()
    let raycaster = new THREE.Raycaster()

    let element = scenes[0].userData.element

    x = (x / element.offsetWidth) * 2 - 1
    y = -(y / element.offsetHeight) * 2 + 1

    mouseVector.set(x, y, 0.5)
    raycaster.setFromCamera(mouseVector, scenes[0].userData.camera)

    return raycaster.intersectObject(modelScene, true)
}

const getModelChildren = function(obj) {
    obj = obj || modelScene
    let children = []

    if (!obj.children) {
        return children
    } else {
        obj.children.forEach(function(child) {
            if (child.isMesh)
                children = [...children, child.name]
            children = [...children, ...getModelChildren(child)]
        })
    }
    return children
}

const getRunningTime = function(values, now) {
    let time = now
    switch(values[0].value) {
        case 'START':
            time = (now - new Date(values[0].timestamp)) / 1000
            break
        case 'PAUSE':
            time = getRunningTime(values.slice(1, values.length), new Date(values[0].timestamp))
            break
        case 'RESUME':
            time = (now - new Date(values[0].timestamp)) / 1000 + getRunningTime(values.slice(1, values.length), new Date(values[0].timestamp))
            break
        case 'STOP':
            time = false
            break
        default:
            break
    }
    return time.toString().indexOf('false') === -1 ? time : false
}

const init = function(element, model, modelActions, modelData, modelEvents, modelStageId) {
    canvas = document.getElementById('c')
    canvas.style.height = `${window.innerHeight}px`
    clock = new THREE.Clock()

    let scene = new THREE.Scene()

    // Look up the element that represents the area
    // we want to render the scene
    scene.userData.element = element.querySelector('.model-body')
    content.appendChild(element)

    // Camera

    let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 100)
    camera.position.set(-5, 3, 10)
    camera.lookAt(new THREE.Vector3(0, 2, 0))
    scene.userData.camera = camera

    // Controls

    let controls = new THREE.OrbitControls(scene.userData.camera, scene.userData.element)
    controls.target.set(0, -0.2, -0.2)
    controls.update()
    scene.userData.controls = controls

    // Models

    let ext = model.ext, loader

    if (ext === 'glb')
        loader = new THREE.GLTFLoader()
    else if (ext === 'fbx')
        loader = new THREE.FBXLoader()

    loader.load(`/api/models/getModel/${model.name}`, function(result) {
        $(`.progress#${model.name}`)[0].hidden = true

        modelAnimations = result.animations
        modelName = model.name
        if (ext === 'glb')
            modelScene = result.scene
        else if (ext === 'fbx')
            modelScene = result


        try {
            if (result.animations.length > 0)
                createGUI(modelScene, modelAnimations)
        } catch(e) {
            // Act normally
        }
        // Scale
        modelScene.scale.x = model.scale.x
        modelScene.scale.y = model.scale.y
        modelScene.scale.z = model.scale.z
        // Rotation
        modelScene.rotation.x = model.rotation.x
        modelScene.rotation.y = model.rotation.y
        modelScene.rotation.z = model.rotation.z

        scene.add(new THREE.HemisphereLight(0xaaaaaa, 0x444444))

        // Light

        let light = new THREE.DirectionalLight(0xffffff, 0.5)
        light.position.set(1, 1, 1)
        scene.add(light)

        scene.background = new THREE.Color(0xffffff)
        scene.fog = new THREE.Fog(0xe0e0e0, 20, 100)
        if (model.background && model.background.type === 'cube') {
            scene.background = new THREE.CubeTextureLoader().load([
                `/api/stage/getbackground/cube/${modelStageId}/posx`,
                `/api/stage/getbackground/cube/${modelStageId}/negx`,
                `/api/stage/getbackground/cube/${modelStageId}/posy`,
                `/api/stage/getbackground/cube/${modelStageId}/negy`,
                `/api/stage/getbackground/cube/${modelStageId}/posz`,
                `/api/stage/getbackground/cube/${modelStageId}/negz`
            ])
            modelScene.traverse(function(child) {
                if (child.isMesh)
                    child.material.envMap = scene.background
            })
        } else if (model.background && model.background.type === 'texture') {
            scene.background = new THREE.TextureLoader().load(`/api/stage/getbackground/texture/${modelStageId}/0`)
        } else{
            // Grid

            let grid = new THREE.GridHelper(200, 40, 0x000000, 0x000000)
            grid.material.opacity = 0.2
            grid.material.transparent = true
            scene.add(grid)
        }

        scene.add(modelScene)
        scenes.push(scene)
        if (modelActions)
            setupActions(modelScene, modelActions)
        if (modelData)
            showData(modelData)
        if (modelEvents) {
            setupEvents(modelScene, modelEvents)
            element.addEventListener('mousedown', onMouseDown, false)
            element.addEventListener('touchstart', onMouseDown, false)
            element.addEventListener('dblclick', onMouseDblClick, false)
            element.addEventListener('mousemove', onMouseMove, false)
            element.addEventListener('touchmove', onMouseMove, false)
        }
    }, function(xhr) {
        let loaded = Math.round((xhr.loaded / xhr.total) * 100)
        let progressBar = $(`.progress#${model.name} .progress-bar`)

        progressBar.css('width', `${loaded}%`)
        progressBar.attr('aria-valuenow', loaded)
        progressBar.text(`${loaded}%`)
    }, function(e) {
        console.error(e)
    })

    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true })
    renderer.setClearColor(0xffffff, 1)
    renderer.setPixelRatio(window.devicePixelRatio)
}

const onMouseDown = function(event) {
    event.preventDefault()

    let intersects = getIntersects(event.layerX, event.layerY)

    if (intersects.length > 0) {
        scenes[0].userData.element.parentElement.removeEventListener('mousedown', onMouseDown, false)
        let res = intersects.filter((res) => res && res.object)[0]
        clearTimeout(clickTimer)
        clickTimer = setTimeout(function() {
            scenes[0].userData.element.parentElement.addEventListener('mousedown', onMouseDown, false)
            selectedObject = res.object
            if (events.click[selectedObject.name])
                sendEvent(events.click[selectedObject.name])
        }, 200)
    }
}

const onMouseDblClick = function(event) {
    event.preventDefault()

    let intersects = getIntersects(event.layerX, event.layerY)

    if (intersects.length > 0) {
        clearTimeout(clickTimer)
        scenes[0].userData.element.parentElement.addEventListener('mousedown', onMouseDown, false)
        let res = intersects.filter((res) => res && res.object)[0]
        selectedObject = res.object
        if (events.dblclick[selectedObject.name])
            sendEvent(events.dblclick[selectedObject.name])
    }
}

const onMouseMove = function(event) {
    event.preventDefault()

    let intersects = getIntersects(event.layerX, event.layerY)

    if (intersects.length > 0) {
        let res = intersects.filter((res) => res && res.object)[0]
        selectedObject = res.object

        if (lastSelectedObject && (selectedObject.name !== lastSelectedObject.name)) {
            if (lastSelectedObject.material) {
                lastSelectedObject.material.emissive.b = 0
                if (events.mousein[selectedObject.name])
                    sendEvent(events.mousein[selectedObject.name])
            }
            if (events.mouseout[selectedObject.name])
                sendEvent(events.mouseout[selectedObject.name])
        } else if (!lastSelectedObject) {
            if (events.mouseout[selectedObject.name])
                sendEvent(events.mouseout[selectedObject.name])
        }
        selectedObject.material.emissive.b = 0.5
        lastSelectedObject = selectedObject
    } else {
        if (lastSelectedObject) {
            lastSelectedObject.material.emissive.b = 0
            if (events.mousein[selectedObject.name])
                sendEvent(events.mousein[selectedObject.name])
            lastSelectedObject = null
        }
    }
}

const render = function() {
    updateSize()

    canvas.style.transform = `translateY(${window.scrollY}px)`

    renderer.setClearColor(0xffffff)
    renderer.setScissorTest(false)
    renderer.clear()

    renderer.setClearColor(0xffffff)
    renderer.setScissorTest(true)

    scenes.forEach(function(scene) {
        if (rotateModel)
            scene.children[0].rotation.y = Date.now() * 0.001  // so something moves

        // get the element that is a place holder for where we want to
        // draw the scene
        let element = scene.userData.element

        // get its position relative to the page's viewport
        let rect = element.getBoundingClientRect()

        // check if it's offscreen. If so skip it
        if (rect.bottom < 0 || rect.top > renderer.domElement.clientHeight ||
           rect.right < 0 || rect.left > renderer.domElement.clientWidth) {

            return  // it's off screen

        }
        if ($(element).parent().hasClass('model-show'))
            element.style.height = `${window.innerHeight * 0.6}px`

        // set the viewport
        let width = rect.right - rect.left
        let height = rect.bottom - rect.top - 10
        let left = rect.left - document.getElementById('accordionSidebar').offsetWidth
        let bottom = renderer.domElement.clientHeight - rect.bottom

        renderer.setViewport(left, bottom, width, height)
        renderer.setScissor(left, bottom, width, height)

        $('.dg.ac').css('top', `${rect.top}px`)
        $('.dg.ac').css('z-index', '5')

        let camera = scene.userData.camera

        camera.aspect = width / height
        camera.updateProjectionMatrix()

        scene.userData.controls.update()
        renderer.render(scene, camera)
    })
}

const rotate = function(op, axis) {
    if (op === '+') {
        modelScene.rotation[axis] = +modelScene.rotation[axis] + 0.1
    } else if (op === '-') {
        modelScene.rotation[axis] = +modelScene.rotation[axis] - 0.1
    }
}

const scale = function(op) {
    let scale = +modelScene.scale.x
    if (op === '+') {
        modelScene.scale.x = 1.1 * scale
        modelScene.scale.y = 1.1 * scale
        modelScene.scale.z = 1.1 * scale
    } else if (op === '-') {
        modelScene.scale.x = 0.9 * scale
        modelScene.scale.y = 0.9 * scale
        modelScene.scale.z = 0.9 * scale
    }
}

const sendEvent = function(event) {
    let socket = io.connect(baseUrl)
    socket.on('connect', function() {
        socket.emit('event', {username, stageId, event})
    })
}

const sendNewData = function(name) {
    $.post('/api/models/setdata?_method=PUT', {
        "name": name,
        "scale": {
            "x": modelScene.scale.x,
            "y": modelScene.scale.y,
            "z": modelScene.scale.z
        },
        "rotation": {
            "x": modelScene.rotation.x,
            "y": modelScene.rotation.y,
            "z": modelScene.rotation.z
        }
    })
}

const setupActions = function(modelScene, modelActions) {
    modelActions = JSON.parse(modelActions)
    
    mixer = new THREE.AnimationMixer(modelScene)

    modelActions.forEach(function(modelAction) {
        stageActions[modelAction.name] = function(status, time) {
            modelAction.animations.forEach(function(animation) {
                let clip = THREE.AnimationClip.findByName(modelAnimations, animation.name)

                let action = mixer.clipAction(clip)
                if (animation.repeat === 0)
                    action.setLoop(THREE.LoopRepeat)
                else if (animation.repeat === 1)
                    action.setLoop(THREE.LoopOnce, 1)
                else
                    action.setLoop(THREE.LoopRepeat, animation.repeat)
                action.clampWhenFinished = animation.fin

                switch(status) {
                    case 'START':
                        action.reset()
                        action.time = time || 0
                        action.fadeIn(0.2).play()
                        break
                    case 'PAUSE':
                        action.paused = true
                        break
                    case 'RESUME':
                        action.paused = false
                        action.play()
                        break
                    case 'STOP':
                        action.paused = false
                        action.fadeOut(0.2).play()
                        break
                    case 'STOP_ALL':
                        modelAnimations.forEach((animation) => mixer.clipAction(animation).fadeOut(0.2).play())
                        break
                    default:
                        break
                }
            })
        }
    })
}

const setupEvents = function(modelScene, modelEvents) {
    modelEvents = JSON.parse(modelEvents)

    modelEvents.forEach(function(event) {
        event.children.forEach(function(child) {
            events[event.event][child] = event.name
        })
    })
}

const showActionsData = function({name, values}) {
    let time = getRunningTime(values, new Date())
    if (values[0].value === 'START' || values[0].value === 'RESUME') {
        if (time)
            stageActions[name]('START', time)
    }

    let idAction = `data-${name}-action-time`
    let idSum = `data-${name}-sum`

    if ($(`#${idAction}`).length === 0) {
        $('#charts').append(`<div id="${idAction}" class="mb-1 col-12 col-lg-6"></div>`)
        $('#charts').append(`<div id="${idSum}" class="mb-1 col-12 col-lg-6"></div>`)
    }

    values = values.map(function(value) {
        if (value.value === 'START')
            value.timestamp = value.first_timestamp || value.timestamp
        return value
    })

    zingchart.render({
        "id": idSum,
        "data": getConfig(idSum, 'pie', name, 'Datos totales', values),
        "height": "100%",
        "width": "97%"
    })
    zingchart.render({
        "id": idAction,
        "data": getConfig(idAction, 'area', name, 'Reparto en tiempo', values),
        "height": "100%",
        "width": "97%"
    })
}

const showCatData = function({name, values, states}) {
    let idBar = `data-${name}-cat-bar`
    let idPie = `data-${name}-cat-pie`

    $('#charts').append(`<div id="${idBar}" class="mb-1 col-12 col-lg-6"></div>`)
    $('#charts').append(`<div id="${idPie}" class="mb-1 col-12 col-lg-6"></div>`)

    zingchart.render({
        "id": idBar,
        "data": getConfig(idBar, 'bar', name, 'Datos totales', values, {states}),
        "height": "100%",
        "width": "97%"
    })
    zingchart.render({
        "id": idPie,
        "data": getConfig(idPie, 'pie', name, 'Porcentaje estados', values, {states}),
        "height": "100%",
        "width": "97%"
    })
}

const showContData = function({name, values, units}) {
    let idCont = `data-${name}-cont`
    let idSum = `data-${name}-sum`

    $('#charts').append(`<div id="${idCont}" class="mb-1 col-12 col-lg-6"></div>`)
    $('#charts').append(`<div id="${idSum}" class="mb-1 col-12 col-lg-6"></div>`)

    zingchart.render({
        "id": idCont,
        "data": getConfig(idCont, 'line', name, 'Datos continuos', values, {units}),
        "height": "100%",
        "width": "97%"
    })
    zingchart.render({
        "id": idSum,
        "data": getConfig(idSum, 'bar', name, 'Datos totales', values),
        "height": "100%",
        "width": "97%"
    })
}

const showData = function(modelData) {
    modelData = JSON.parse(modelData)

    modelData.forEach(function(datum) {
        switch(datum.type) {
            case 0:
                showActionsData(datum)
                break
            case 1:
            case 2:
            case 3:
                showCatData(datum)
                break
            case 4:
                showDisData(datum)
                break
            case 5:
                showContData(datum)
                break
            default:
                return
        }
    })
}

const showDisData = function({name, values, max, min}) {
    let idDis = `data-${name}-dis`
    let idHist = `data-${name}-dis-hist`

    $('#charts').append(`<div id="${idDis}" class="mb-1 col-12 col-lg-6"></div>`)
    $('#charts').append(`<div id="${idHist}" class="mb-1 col-12 col-lg-6"></div>`)

    zingchart.render({
        "id": idDis,
        "data": getConfig(idDis, 'gauge', name, 'Último valor', [values[0].value], {max, min}),
        "height": "100%",
        "width": "97%"
    })
    zingchart.render({
        "id": idHist,
        "data": getConfig(idHist, 'line', `${name}`, 'Histórico', values, {max, min}),
        "height": "100%",
        "width": "97%"
    })
}

const showModel = function(model, className, modelActions, modelData, modelEvents, modelStageId) {
    model = JSON.parse(model)

    content.innerHTML = ''

    if (WEBGL.isWebGLAvailable() === false) {
        $('#models-list').append(WEBGL.getWebGLErrorMessage())
    }

    rotateModel = false

    let template = document.getElementById('template').text

    // make a list item
    let element = document.createElement('div')
    if (className === 'model-item') {
        element.className = 'col-12 col-md-6 col-lg-4 col-xl-3 model-item'
    } else if (className === 'model-show') {
        element.className = 'col-12 model-show'
    } else if (className === 'model-data') {
        element.className = 'col-12 col-lg-8 model-data'
    }
    element.id = `model-${model.name}-${model.ext}`
    element.innerHTML = template.replace(/\$name/g, model.name)

    init(element, model, modelActions, modelData, modelEvents, modelStageId)
    animate()
}

const showModelByName = async function(name, className) {
    let models
    await $.get(`/api/models/getmodels/${name}`)
    .done(function(data) {
        model = data.data[0]
        content.innerHTML = ''

        if (WEBGL.isWebGLAvailable() === false) {
            document.body.appendChild(WEBGL.getWebGLErrorMessage())
        }

        rotateModel = false

        let template = document.getElementById('template').text

        // make a list item
        let element = document.createElement('div')
        if (className === 'model-item') {
            element.className = 'col-12 col-md-6 col-lg-4 col-xl-3 model-item'
        } else if (className === 'model-show') {
            element.className = 'col-12 model-show'
        } else if (className === 'model-data') {
            element.className = 'col-12 model-data'
        }
        element.id = `model-${model.name}-${model.ext}`
        element.innerHTML = template.replace(/\$name/g, model.name)

        init(element, model)
        animate()
    })
}

const showModels = function() {
    let models
    $.get('/api/models/getmodels')
    .done(function(data) {
        models = data.data
        content.innerHTML = ''

        if (!models || models.length === 0) {
            createAlert('models')
        } else {
            if (WEBGL.isWebGLAvailable() === false) {
                document.body.appendChild(WEBGL.getWebGLErrorMessage())
            }

            for (let i in models) {
                let model = models[i]

                let template = document.getElementById('template').text

                // make a list item
                let element = document.createElement('div')
                element.className = 'col-12 col-md-6 col-lg-4 col-xl-3 model-item'
                element.id = `model-${model.name}-${model.ext}`
                element.innerHTML = template.replace('$ext', model.ext)
                element.innerHTML = element.innerHTML.replace(/\$name/g, model.name)
                init(element, model)
            }
            animate()
        }
    })
}

const showStages = function() {
    let models, stages
    $.get('/api/stages/getstages')
    .done(function(data) {
        stages = data.data
        content.innerHTML = ''

        if (!stages || stages.length === 0) {
            createAlert('stages')
        } else {
            if (WEBGL.isWebGLAvailable() === false) {
                document.body.appendChild(WEBGL.getWebGLErrorMessage())
            }

            for (let i in stages) {
                let stage = stages[i]

                let template = document.getElementById('template').text

                // make a list item
                let element = document.createElement('div')
                element.className = 'col-12 col-md-6 col-lg-4 col-xl-3 model-item'
                element.id = `stage-${stage.id_str}`
                element.innerHTML = template.replace(/\$id/g, stage.id_str)
                element.innerHTML = element.innerHTML.replace(/\$name/g, stage.name)
                element.innerHTML = element.innerHTML.replace(/\$modelName/g, stage.model.name)
                init(element, stage.model, null, null, null, stage.id_str)
            }
            animate()
        }
    })
}

const updateSize = function() {
    let width = canvas.clientWidth
    let height = window.innerHeight

    if (canvas.width !== width || canvas.height !== height) {
        renderer.setSize(width, height, false)
    }
}
