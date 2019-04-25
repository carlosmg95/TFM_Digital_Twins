let actions, activeAction, clock, mixer, modelAnimations, modelName, previousAction, stageActions = {}
let canvas
let content = document.getElementById('models-list')
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

const init = function(element, model) {
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

    let loader = new THREE.GLTFLoader()
    loader.load(`/api/models/getModel/${model.name}`, function(gltf) {
        $(`.progress#${model.name}`)[0].hidden = true

        modelAnimations = gltf.animations
        modelScene = gltf.scene
        modelName = model.name
        try {
            if (gltf.animations.length > 0)
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

        scene.add(modelScene)
        scene.add(new THREE.HemisphereLight(0xaaaaaa, 0x444444))

        // Light

        let light = new THREE.DirectionalLight(0xffffff, 0.5)
        light.position.set(1, 1, 1)
        scene.add(light)

        scene.background = new THREE.Color(0xffffff)
        scene.fog = new THREE.Fog(0xe0e0e0, 20, 100)

        // Grid

        let grid = new THREE.GridHelper(200, 40, 0x000000, 0x000000)
        grid.material.opacity = 0.2
        grid.material.transparent = true
        scene.add(grid)

        scenes.push(scene)
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
            element.style.height = `${window.innerHeight - rect.top - document.getElementById('user-footer').clientHeight - document.getElementById('vr-btn').clientHeight - 10}px`

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

const setupActions = function(modelActions) {
    modelActions = modelActions.replace(/&#34;/gi, '"')
    modelActions = JSON.parse(modelActions)

    let animationsTimer = setInterval(function() {
        if (modelScene !== undefined) {
            clearInterval(animationsTimer)

            mixer = new THREE.AnimationMixer(modelScene)

            modelActions.forEach(function(modelAction) {
                stageActions[modelAction.name] = function() {
                    modelAction.animations.forEach(function(animation) {
                        let clip = THREE.AnimationClip.findByName(modelAnimations, animation.name)
                        clip.name = Math.random() + ''

                        let action = mixer.clipAction(clip)
                        if (animation.repeat === 0)
                            action.setLoop(THREE.LoopRepeat)
                        else if (animation.repeat === 1)
                            action.setLoop(THREE.LoopOnce, 1)
                        else
                            action.setLoop(THREE.LoopRepeat, animation.repeat)
                        action.clampWhenFinished = animation.fin
                        action.timeScale = animation.reverse ? -1 : 1
                        action.fadeIn(0.2).play()
                    })
                }
            })
        }
    }, 100)
}

const showModel = function(model, className) {
    model = model.replace(/&#34;/gi, '"')
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

    init(element, model)
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
            element.className = 'col-12 col-lg-8 model-data'
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
                init(element, stage.model)
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
