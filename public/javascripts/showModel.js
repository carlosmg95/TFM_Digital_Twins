let camera, container, scene, renderer, model

const animate = function() {
    requestAnimationFrame(animate)
    onWindowResize()
    renderer.render(scene, camera)
}

const init = function(model, vr) {
    container = document.createElement('div')
    container.className = 'model'
    let content = document.getElementById('model-content')
    content.appendChild(container)

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 100)
    camera.position.set(-5, 3, 10)
    camera.lookAt(new THREE.Vector3(0, 2, 0))

    scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf8f9fc)
    scene.fog = new THREE.Fog(0xf8f9fc, 20, 100)

    // lights

    let light = new THREE.HemisphereLight(0xffffff, 0x444444)
    light.position.set(0, 20, 0)
    scene.add(light)

    light = new THREE.DirectionalLight(0xffffff)
    light.position.set(0, 20, 10)
    scene.add(light)

    // ground

    let mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2000, 2000), new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false }))
    mesh.rotation.x = -Math.PI / 2
    scene.add(mesh)

    let grid = new THREE.GridHelper(200, 40, 0x000000, 0x000000)
    grid.material.opacity = 0.2
    grid.material.transparent = true
    scene.add(grid)

    let controls = new THREE.OrbitControls(camera)
    controls.target.set(0, -0.2, -0.2)
    controls.update()

    // model

    let loader = new THREE.GLTFLoader()
    loader.load(`/api/models/getModel/${model.name}`, function(gltf) {
        scene.add(gltf.scene)
    }, undefined, function(e) {
        console.error(e)
    } )

    let rect = container.getBoundingClientRect()

    console.log(document.getElementById('vr-btn').clientHeight)

    // set the viewport
    let width = rect.width
    let height = window.innerHeight - rect.top - document.getElementById('user-footer').clientHeight - document.getElementById('vr-btn').clientHeight -10

    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(width, height)
    renderer.gammaOutput = true
    renderer.gammaFactor = 2.2
    container.appendChild(renderer.domElement)

    window.addEventListener('resize', onWindowResize, false)
}

const onWindowResize = function() {
    let rect = container.getBoundingClientRect()

    // set the viewport
    let width = rect.width
    let height = window.innerHeight - rect.top - document.getElementById('user-footer').clientHeight - document.getElementById('vr-btn').clientHeight -10

    camera.aspect = width / height
    camera.updateProjectionMatrix()

    renderer.setSize(width, height)
}

const showModel = async function(model, vr) {
    model = model.replace(/&#34;/gi, '"')
    model = JSON.parse(model)

    if (WEBGL.isWebGLAvailable() === false) {
        $('#models-list').append(WEBGL.getWebGLErrorMessage())
    }

    init(model, vr)
    animate(vr)
}
