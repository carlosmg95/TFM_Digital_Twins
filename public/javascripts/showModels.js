let canvas
let content = document.getElementById('models-list')
let scenes = [], renderer

const animate = function() {
    render()
    requestAnimationFrame(animate)
}

const createAlert = function() {
    let element = document.createElement('div')
    element.className = 'col-12 alert alert-warning'
    element.role = 'alert'
    element.innerHTML = 'Aún no tines ningún modelo. ¡A qué esperas para <a href="" class="alert-link" data-toggle="modal" data-target="#upload-modal">subir</a> uno!'

    content.appendChild(element)
}

const init = function(models) {
    canvas = document.getElementById('c')
    canvas.style.height = `${window.innerHeight}px`

    for (let i in models) {
        let model = models[i]

        let scene = new THREE.Scene()

        let template = document.getElementById('template').text

        // make a list item
        let element = document.createElement('div')
        element.className = 'col-12 col-md-6 col-lg-4 col-xl-3 model-item'
        element.id = `model-${model.name}-${model.ext}`
        element.innerHTML = template.replace('$ext', model.ext)
        element.innerHTML = element.innerHTML.replace(/\$name/g, model.name)

        // Look up the element that represents the area
        // we want to render the scene
        scene.userData.element = element.querySelector('.model-body')
        content.appendChild(element)

        let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 100)
        camera.position.set(-5, 3, 10)
        camera.lookAt(new THREE.Vector3(0, 2, 0))
        scene.userData.camera = camera

        let controls = new THREE.OrbitControls(scene.userData.camera, scene.userData.element)
        controls.target.set(0, -0.2, -0.2)
        controls.update()
        scene.userData.controls = controls

        let loader = new THREE.GLTFLoader()
        loader.load(`/api/models/getModel/${model.name}`, function(gltf) {
            // Scale
            gltf.scene.scale.x = model.scale.x
            gltf.scene.scale.y = model.scale.y
            gltf.scene.scale.z = model.scale.z
            // Rotation
            gltf.scene.rotation.x = model.rotation.x
            gltf.scene.rotation.y = model.rotation.y
            gltf.scene.rotation.z = model.rotation.z

            scene.add(gltf.scene)
            scene.add(new THREE.HemisphereLight(0xaaaaaa, 0x444444))

            let light = new THREE.DirectionalLight(0xffffff, 0.5)
            light.position.set(1, 1, 1)
            scene.add(light)

            scene.background = new THREE.Color(0xffffff)
            scene.fog = new THREE.Fog(0xe0e0e0, 20, 100)

            let grid = new THREE.GridHelper(200, 40, 0x000000, 0x000000)
            grid.material.opacity = 0.2
            grid.material.transparent = true
            scene.add(grid)

            scenes.push(scene)
        }, undefined, function(e) {
            console.error(e)
        })
    }

    renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true })
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

        // so something moves
        scene.children[0].rotation.y = Date.now() * 0.001

        // get the element that is a place holder for where we want to
        // draw the scene
        let element = scene.userData.element

        // get its position relative to the page's viewport
        let rect = element.getBoundingClientRect()

        // check if it's offscreen. If so skip it
        if (rect.bottom < 0 || rect.top > renderer.domElement.clientHeight ||
             rect.right < 0 || rect.left > renderer.domElement.clientWidth) {

            return // it's off screen

        }

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

const showModels = async function() {
    let models
    await $.get('/api/models/getmodels')
    .done(function(data) {
        models = data.data
        content.innerHTML = ''
    })

    if (models.length === 0) {
        createAlert()
    } else {
        if (WEBGL.isWebGLAvailable() === false) {
            document.body.appendChild(WEBGL.getWebGLErrorMessage())
        }

        init(models)
        animate()
    }
}

const updateSize = function() {
    let width = canvas.clientWidth
    let height = window.innerHeight

    if (canvas.width !== width || canvas.height !== height) {
        renderer.setSize(width, height, false)
    }
}

showModels()