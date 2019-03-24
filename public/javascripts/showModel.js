let canvas
let content = document.getElementById('models-list')
let scenes = [], renderer

const animate = function() {
    render()
    requestAnimationFrame(animate)
}

const init = function(model) {
    canvas = document.getElementById('c')
    canvas.style.height = `${window.innerHeight}px`

    let scene = new THREE.Scene()

    let template = document.getElementById('template').text

    // make a list item
    let element = document.createElement('div')
    element.className = 'col-12 model'
    element.innerHTML = template.replace('$ext', model.ext)
    element.innerHTML = element.innerHTML.replace(/\$name/g, model.name)
    $(element).css('height', `${+window.innerHeight - $(content).offset().top * 2}px`)

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

const showModel = async function(model) {
    model = model.replace(/&#34;/gi, '"')
    model = JSON.parse(model)

    if (WEBGL.isWebGLAvailable() === false) {
        document.body.appendChild(WEBGL.getWebGLErrorMessage())
    }

    init(model)
    animate()
}

const updateSize = function() {
    let width = canvas.clientWidth
    let height = window.innerHeight

    if (canvas.width !== width || canvas.height !== height) {
        renderer.setSize(width, height, false)
    }
}
