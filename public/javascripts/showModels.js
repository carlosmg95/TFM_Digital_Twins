let canvas
let content = document.getElementById('models-list')
let modelScene, scenes = [], renderer
let rotateModel = true

const animate = function() {
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

const init = function(models, className) {
    canvas = document.getElementById('c')
    canvas.style.height = `${window.innerHeight}px`

    for (let i in models) {
        let model = models[i]

        let scene = new THREE.Scene()

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
        element.innerHTML = template.replace('$ext', model.ext)
        element.innerHTML = element.innerHTML.replace(/\$name/g, model.name)

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
            modelScene = gltf.scene
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
        }, undefined, function(e) {
            console.error(e)
        })
    }

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

const sendNewData = function(name) {
    $.post('/api/models/setdata', {
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

const showModel = function(model, className) {
    model = model.replace(/&#34;/gi, '"')
    model = JSON.parse(model)

    content.innerHTML = ''

    if (WEBGL.isWebGLAvailable() === false) {
        $('#models-list').append(WEBGL.getWebGLErrorMessage())
    }

    rotateModel = false

    init([model], className)
    animate()
}

const showModelByName = async function(name, className) {
    let models
    await $.get(`/api/models/getmodels/${name}`)
    .done(function(data) {
        model = data.data
        content.innerHTML = ''

        if (WEBGL.isWebGLAvailable() === false) {
            document.body.appendChild(WEBGL.getWebGLErrorMessage())
        }

        rotateModel = false

        init(model, className)
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

            init(models, 'model-item')
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

            models = stages.map(stage => stage.model)
            init(models, 'model-item')
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
