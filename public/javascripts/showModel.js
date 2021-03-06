let camera, container, scene, renderer

const animate = function(vr) {
    if (vr) {
        renderer.setAnimationLoop(renderVr)
    } else {
        renderNormal()
        requestAnimationFrame(animate)
    }
}
const init = function(model, vr) {
    if (vr)
        initVr(model)
    else
        initNormal(model)
}

const initNormal = function(model) {
    container = document.createElement('div')
    container.className = 'model'
    let content = document.getElementById('model-content')
    content.innerHTML = ''
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

    let grid = new THREE.GridHelper(200, 40, 0x000000, 0x000000)
    grid.material.opacity = 0.2
    grid.material.transparent = true
    scene.add(grid)

    // controls

    let controls = new THREE.OrbitControls(camera)
    controls.target.set(0, -0.2, -0.2)
    controls.update()

    // model

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
    }, undefined, function(e) {
        console.error(e)
    })

    let rect = container.getBoundingClientRect()

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

const initVr = function(model) {
    container = document.createElement('div')
    container.className = 'model'
    let content = document.getElementById('model-content')
    content.innerHTML = ''
    content.appendChild(container)

    scene = new THREE.Scene()
    scene.background = new THREE.Color(0x505050)

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 10)
    scene.add(camera)

    crosshair = new THREE.Mesh(
        new THREE.RingBufferGeometry(0.02, 0.04, 32),
        new THREE.MeshBasicMaterial({
            color: 0xffffff,
            opacity: 0.5,
            transparent: true
        })
    )
    crosshair.position.z = -2
    camera.add(crosshair)

    room = new THREE.LineSegments(
        new THREE.BoxLineGeometry(6, 6, 10, 10, 10, 10),
        new THREE.LineBasicMaterial({ color: 0x808080 })
    )
    room.position.y = 3
    scene.add(room)

    scene.add(new THREE.HemisphereLight(0x606060, 0x404040))

    let light = new THREE.DirectionalLight(0xffffff)
    light.position.set(1, 1, 1).normalize()
    scene.add(light)

    // model

    let loader = new THREE.GLTFLoader()
    loader.load(`/api/models/getModel/${model.name}`, function(gltf) {
        let object = gltf.scene
        // Scale
        object.scale.x = model.scale.x * 0.4
        object.scale.y = model.scale.y * 0.4
        object.scale.z = model.scale.z * 0.4
        // Rotation
        object.rotation.x = model.rotation.x
        object.rotation.y = model.rotation.y
        object.rotation.z = model.rotation.z

        object.position.y = 1.5
        object.position.z = -3
        scene.add(object)
    }, undefined, function(e) {
        console.error(e)
    })

    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.vr.enabled = true
    container.appendChild(renderer.domElement)

    window.addEventListener('resize', onWindowResize, false)

    window.addEventListener('vrdisplaypointerrestricted', onPointerRestricted, false)
    window.addEventListener('vrdisplaypointerunrestricted', onPointerUnrestricted, false)

    content.appendChild(WEBVR.createButton(renderer))
}

const onPointerRestricted = function() {
    let pointerLockElement = renderer.domElement
    if (pointerLockElement && typeof (pointerLockElement.requestPointerLock) === 'function') {
        pointerLockElement.requestPointerLock()
    }
}

const onPointerUnrestricted = function() {
    let currentPointerLockElement = document.pointerLockElement
    let expectedPointerLockElement = renderer.domElement
    if (currentPointerLockElement && currentPointerLockElement === expectedPointerLockElement && typeof (document.exitPointerLock) === 'function') {
        document.exitPointerLock()
    }
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

const renderNormal = function() {
    onWindowResize()
    renderer.render(scene, camera)
}

const renderVr = function() {
    onWindowResize()
    renderer.render(scene, camera)
}

const rotate = function(op, axis) {
    if (op === '+') {
        scene.children[3].rotation[axis] = +scene.children[3].rotation[axis] + 0.1
    } else if (op === '-') {
        scene.children[3].rotation[axis] = +scene.children[3].rotation[axis] - 0.1
    }
}

const sendNewData = function(name) {
    $.post('/api/models/setdata', {
        "name": name,
        "scale": {
            "x": scene.children[3].scale.x,
            "y": scene.children[3].scale.y,
            "z": scene.children[3].scale.z
        },
        "rotation": {
            "x": scene.children[3].rotation.x,
            "y": scene.children[3].rotation.y,
            "z": scene.children[3].rotation.z
        }
    })
}

const scale = function(op) {
    let scale = +scene.children[3].scale.x
    if (op === '+') {
        scene.children[3].scale.x = 1.1 * scale
        scene.children[3].scale.y = 1.1 * scale
        scene.children[3].scale.z = 1.1 * scale
    } else if (op === '-') {
        scene.children[3].scale.x = 0.9 * scale
        scene.children[3].scale.y = 0.9 * scale
        scene.children[3].scale.z = 0.9 * scale
    }
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
