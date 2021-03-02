let camera, container, pointer, scene, rendererVR
let clickTime = new Date(), clickTimerVr = null, gamepads = [], isPresenting = false, lastStatusClick = false, lastSelectedObjectVR = null, selectedObjectVR = null

const eventPointerDblClick = new CustomEvent('pointerdblclick')
const eventPointerDown = new CustomEvent('pointerdown')
const eventPointerUp = new CustomEvent('pointerup')

const animateVR = function() {
    rendererVR.setAnimationLoop(renderVR)
}

const checkGamepads = function() {
    let gamepads = navigator.getGamepads && navigator.getGamepads()
    let isClick = false
    let modelSceneVr = scene.children[scene.children.length - 1]

    for (let i = 0; i < gamepads.length; i++) {
        let gamepad = gamepads[i]

        if (!gamepad) continue

        isClick = gamepad.buttons.some((btn) => btn.pressed || btn.touched)

        if (gamepad.axes.length > 0) {
            if (gamepad.axes[0] > 0.5) {
                modelSceneVr.rotation['y'] = +modelSceneVr.rotation['y'] - 0.1
                isClick = false
            } else if (gamepad.axes[0] < -0.5) {
                modelSceneVr.rotation['y'] = +modelSceneVr.rotation['y'] + 0.1
                isClick = false
            }
            if (gamepad.axes[1] > 0.5) {
                modelSceneVr.rotation['z'] = +modelSceneVr.rotation['z'] - 0.1
                isClick = false
            } else if (gamepad.axes[1] < -0.5) {
                modelSceneVr.rotation['z'] = +modelSceneVr.rotation['z'] + 0.1
                isClick = false
            }
        }
    }

    if (isClick && !lastStatusClick) {
        dispatchEvent(eventPointerDown)
        let time = new Date()
        if (time - clickTime < 200) {
            dispatchEvent(eventPointerDblClick)
        }
        clickTime = time
    } else if (!isClick && lastStatusClick) {
        dispatchEvent(eventPointerUp)
    }
    lastStatusClick = isClick
}

const getIntersectsVR = function() {
    let mouseVector = new THREE.Vector3()
    let raycaster = new THREE.Raycaster()

    raycaster.setFromCamera({x:0,y:0}, camera)

    return raycaster.intersectObject(scene.children[scene.children.length - 1], true)
}

const initVR = function(model, modelActions, modelData, modelEvents) {
    container = document.createElement('div')
    container.className = 'model'

    let content = document.getElementById('models-list')
    content.innerHTML = ''
    content.appendChild(container)

    scene = new THREE.Scene()

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 10)
    scene.add(camera)

    let circle = new THREE.CircleBufferGeometry(0.01, 32)
    let ring = new THREE.RingBufferGeometry(0.02, 0.04, 32)

    pointer = new THREE.Mesh(
        ring,
        new THREE.MeshBasicMaterial({
            color: 0xffffff,
            opacity: 0.5,
            transparent: true
        })
    )
    pointer.userData.geometries = [circle, ring]
    pointer.position.z = -2
    camera.add(pointer)

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
                `/api/stage/getbackground/cube/${stageId}/posx`,
                `/api/stage/getbackground/cube/${stageId}/negx`,
                `/api/stage/getbackground/cube/${stageId}/posy`,
                `/api/stage/getbackground/cube/${stageId}/negy`,
                `/api/stage/getbackground/cube/${stageId}/posz`,
                `/api/stage/getbackground/cube/${stageId}/negz`
            ])
            modelSceneVr.traverse(function(child) {
                if (child.isMesh)
                    child.material.envMap = scene.background
            })
        } else if (model.background && model.background.type === 'texture') {
            scene.background = new THREE.TextureLoader().load(`/api/stage/getbackground/texture/${stageId}`)
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
        if (modelEvents)
            setupEvents(modelSceneVr, modelEvents)
    }, undefined, function(e) {
        console.error(e)
    })

    rendererVR = new THREE.WebGLRenderer({ antialias: true })
    rendererVR.setPixelRatio(window.devicePixelRatio)
    rendererVR.setSize(window.innerWidth, window.innerHeight)
    rendererVR.vr.enabled = true
    container.appendChild(rendererVR.domElement)

    if (navigator.getVRDisplays)
        navigator.getVRDisplays().then((displays) => window.addEventListener('vrdisplaypresentchange', () => isPresenting = displays[0].isPresenting))

    window.addEventListener('pointerdblclick', onPointerDblClick, false)
    window.addEventListener('pointerdown', onPointerDown, false)
    window.addEventListener('pointerup', onPointerUp, false)
    window.addEventListener('resize', onWindowResize, false)
    window.addEventListener('vrdisplaypointerrestricted', onPointerRestricted, false)
    window.addEventListener('vrdisplaypointerunrestricted', onPointerUnrestricted, false)

    content.appendChild(WEBVR.createButton(rendererVR))
}

const onPointerDblClick = function() {
    let intersects = getIntersectsVR()

    if (intersects.length > 0) {
        clearTimeout(clickTimerVr)
        window.addEventListener('pointerdown', onPointerDown, false)
        let res = intersects.filter((res) => res && res.object)[0]
        selectedObjectVR = res.object
        if (events.dblclick[selectedObjectVR.name])
            sendEvent(events.dblclick[selectedObjectVR.name])
    }
}

const onPointerDown = function() {
    pointer.scale.x = 0.5
    pointer.scale.y = 0.5
    pointer.scale.z = 0.5

    let intersects = getIntersectsVR()

    if (intersects.length > 0) {
        window.removeEventListener('pointerdown', onPointerDown, false)
        let res = intersects.filter((res) => res && res.object)[0]
        clearTimeout(clickTimerVr)
        clickTimerVr = setTimeout(function() {
            window.addEventListener('pointerdown', onPointerDown, false)
            selectedObjectVR = res.object
            if (events.click[selectedObjectVR.name])
                sendEvent(events.click[selectedObjectVR.name])
        }, 200)
    }
}

const onPointerMove = function() {
    let intersects = getIntersectsVR()

    if (intersects.length > 0) {
        let res = intersects.filter((res) => res && res.object)[0]
        selectedObjectVR = res.object

        pointer.geometry = pointer.userData.geometries[1]

        if (lastSelectedObjectVR && (selectedObjectVR.name !== lastSelectedObjectVR.name)) {
            if (lastSelectedObjectVR.material) {
                lastSelectedObjectVR.material.emissive.b = 0
                if (events.mousein[selectedObjectVR.name])
                    sendEvent(events.mousein[selectedObjectVR.name])
            }
            if (events.mouseout[selectedObjectVR.name])
                sendEvent(events.mouseout[selectedObjectVR.name])
        } else if (!lastSelectedObjectVR) {
            if (events.mouseout[selectedObjectVR.name])
                sendEvent(events.mouseout[selectedObjectVR.name])
        }
        selectedObjectVR.material.emissive.b = 0.5
        lastSelectedObjectVR = selectedObjectVR
    } else {
        pointer.geometry = pointer.userData.geometries[0]
        if (lastSelectedObjectVR) {
            lastSelectedObjectVR.material.emissive.b = 0
            if (events.mousein[selectedObjectVR.name])
                sendEvent(events.mousein[selectedObjectVR.name])
            lastSelectedObjectVR = null
        }
    }
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

const onPointerUp = function() {
    pointer.scale.x = 1
    pointer.scale.y = 1
    pointer.scale.z = 1
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
    if (isPresenting)
        checkGamepads()
    onPointerMove()
    let dt = clock.getDelta()
    if (mixer)
        mixer.update(dt)
    rendererVR.render(scene, camera)
}

const showVRModel = function(model, modelActions, modelData, modelEvents) {
    model = model.replace(/&#34;/gi, '"')
    model = JSON.parse(model)

    if (WEBGL.isWebGLAvailable() === false) {
        $('#models-list').append(WEBGL.getWebGLErrorMessage())
    }

    initVR(model, modelActions, modelData, modelEvents)
    animateVR()
}
