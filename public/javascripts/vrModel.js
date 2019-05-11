let camera, container, scene, rendererVR

const animateVR = function() {
    rendererVR.setAnimationLoop(renderVR)
}

const initVR = function(model, modelActions, modelData, idStr) {
    container = document.createElement('div')
    container.className = 'model'

    let content = document.getElementById('models-list')
    content.innerHTML = ''
    content.appendChild(container)

    scene = new THREE.Scene()

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

    scene.add(new THREE.HemisphereLight(0x606060, 0x404040))

    let light = new THREE.DirectionalLight(0xffffff)
    light.position.set(1, 1, 1).normalize()
    scene.add(light)

    // model

    let ext = model.ext, loader

    if (ext === 'glb')
        loader = new THREE.GLTFLoader()
    else if (ext === 'fbx')
        loader = new THREE.FBXLoader()

    loader.load(`/api/models/getModel/${model.name}`, function(result) {
        let modelSceneVr
        if (ext === 'glb')
            modelSceneVr = result.scene
        else if (ext === 'fbx')
            modelSceneVr = result
        // Scale
        modelSceneVr.scale.x = model.scale.x * 0.4
        modelSceneVr.scale.y = model.scale.y * 0.4
        modelSceneVr.scale.z = model.scale.z * 0.4
        // Rotation
        modelSceneVr.rotation.x = model.rotation.x
        modelSceneVr.rotation.y = model.rotation.y
        modelSceneVr.rotation.z = model.rotation.z

        modelSceneVr.position.y = 1.5
        modelSceneVr.position.z = -3

        scene.background = new THREE.Color(0x505050)

        if (model.background && model.background.type === 'cube') {
            scene.background = new THREE.CubeTextureLoader().load([
                `/api/stage/getbackground/cube/${idStr}/posx`,
                `/api/stage/getbackground/cube/${idStr}/negx`,
                `/api/stage/getbackground/cube/${idStr}/posy`,
                `/api/stage/getbackground/cube/${idStr}/negy`,
                `/api/stage/getbackground/cube/${idStr}/posz`,
                `/api/stage/getbackground/cube/${idStr}/negz`
            ])
            modelSceneVr.traverse(function(child) {
                if (child.isMesh)
                    child.material.envMap = scene.background
            })
        } else if (model.background && model.background.type === 'texture') {
            scene.background = new THREE.TextureLoader().load(`/api/stage/getbackground/texture/${idStr}`)
        } else{
            room = new THREE.LineSegments(
                new THREE.BoxLineGeometry(6, 6, 10, 10, 10, 10),
                new THREE.LineBasicMaterial({ color: 0x808080 })
            )
            room.position.y = 3
            scene.add(room)
        }

        scene.add(modelSceneVr)

        if (modelActions)
            setupActions(modelSceneVr, modelActions)
        if (modelData)
            showData(modelData)
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
    let dt = clock.getDelta()
    if (mixer)
        mixer.update(dt)
    rendererVR.render(scene, camera)
}

const showVRModel = function(model, modelActions, modelData, idStr) {
    model = model.replace(/&#34;/gi, '"')
    model = JSON.parse(model)

    if (WEBGL.isWebGLAvailable() === false) {
        $('#models-list').append(WEBGL.getWebGLErrorMessage())
    }

    initVR(model, modelActions, modelData, idStr)
    animateVR()
}
