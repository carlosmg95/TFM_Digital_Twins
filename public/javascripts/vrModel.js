let camera, container, scene, rendererVR

const animateVR = function() {
    rendererVR.setAnimationLoop(renderVR)
}

const initVR = function(model) {
    container = document.createElement('div')
    container.className = 'model'

    let content = document.getElementById('models-list')
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

    rendererVR = new THREE.WebGLRenderer({ antialias: true })
    rendererVR.setPixelRatio(window.devicePixelRatio)
    rendererVR.setSize(window.innerWidth, window.innerHeight)
    rendererVR.vr.enabled = true
    container.appendChild(rendererVR.domElement)

    window.addEventListener('resize', onWindowResize, false)

    window.addEventListener('vrdisplaypointerrestricted', onPointerRestricted, false)
    window.addEventListener('vrdisplaypointerunrestricted', onPointerUnrestricted, false)

    content.appendChild(WEBVR.createButton(rendererVR))
}

const onPointerRestricted = function() {
    let pointerLockElement = rendererVR.domElement
    if (pointerLockElement && typeof (pointerLockElement.requestPointerLock) === 'function') {
        pointerLockElement.requestPointerLock()
    }
}

const onPointerUnrestricted = function() {
    let currentPointerLockElement = document.pointerLockElement
    let expectedPointerLockElement = rendererVR.domElement
    if (currentPointerLockElement && currentPointerLockElement === expectedPointerLockElement && typeof (document.exitPointerLock) === 'function') {
        document.exitPointerLock()
    }
}

const onWindowResize = function() {
    let rect = container.getBoundingClientRect()

    // set the viewport
    let width = rect.width
    let height = window.innerHeight - rect.top - document.getElementById('user-footer').clientHeight - document.getElementById('vr-btn').clientHeight - 10

    camera.aspect = width / height
    camera.updateProjectionMatrix()

    rendererVR.setSize(width, height)
}

const renderVR = function() {
    onWindowResize()
    rendererVR.render(scene, camera)
}

const showVRModel = function(model) {
    model = model.replace(/&#34;/gi, '"')
    model = JSON.parse(model)

    if (WEBGL.isWebGLAvailable() === false) {
        $('#models-list').append(WEBGL.getWebGLErrorMessage())
    }

    initVR(model)
    animateVR()
}