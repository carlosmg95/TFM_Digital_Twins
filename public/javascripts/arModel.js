let arToolkitContext, arToolkitSource, rendererAR

const initAR = function(model, modelActions, modelData, idStr) {
    let onRenderFcts = []

    rendererAR = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    })
    rendererAR.setClearColor(new THREE.Color('lightgrey'), 0)
    rendererAR.setSize(640, 480)
    rendererAR.domElement.style.position = 'absolute'
    rendererAR.domElement.style.top = '0px'
    rendererAR.domElement.style.left = '0px'
    document.body.append(rendererAR.domElement)

    let scene = new THREE.Scene()

    let camera = new THREE.Camera()
    scene.add(camera)

    // Handle arToolkitSource

    arToolkitSource = new THREEx.ArToolkitSource({
        // to read from the webcam 
        sourceType : 'webcam'
        
        // // to read from an image
        // sourceType : 'image',
        // sourceUrl : THREEx.ArToolkitContext.baseURL + '../data/images/img.jpg',      

        // to read from a video
        // sourceType : 'video',
        // sourceUrl : THREEx.ArToolkitContext.baseURL + '../data/videos/headtracking.mp4',     
    })

    arToolkitSource.init(function onReady(){
        onResize()
    })
    
    // handle resize
    window.addEventListener('resize', function(){
        onResize()
    })

    // Initialize arToolkitContext

    // create atToolkitContext
    arToolkitContext = new THREEx.ArToolkitContext({
        cameraParametersUrl: '/javascripts/camera_para.dat',
        detectionMode: 'mono'
    })
    // initialize it
    arToolkitContext.init(function onCompleted(){
        // copy projection matrix to camera
        camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix())
    })

    // update artoolkit on every frame
    onRenderFcts.push(function(){
        if(arToolkitSource.ready === false)   return

        arToolkitContext.update(arToolkitSource.domElement)
        
        // update scene.visible if the marker is seen
        scene.visible = camera.visible
    })

    // Create a ArMarkerControls

    // init controls for camera
    let markerControls = new THREEx.ArMarkerControls(arToolkitContext, camera, {
        type : 'pattern',
        patternUrl : '/javascripts/patt.hiro',
        // as we controls the camera, set changeMatrixMode: 'cameraTransformMatrix'
        changeMatrixMode: 'cameraTransformMatrix'
    })
    // as we do changeMatrixMode: 'cameraTransformMatrix', start with invisible scene
    scene.visible = false

    // Add an object in the scene

    let light = new THREE.HemisphereLight(0xbbbbff, 0x444422)
    light.position.set(0, 1, 0)
    scene.add(light)

    let geometry = new THREE.CubeGeometry(1,1,1)
    let material = new THREE.MeshNormalMaterial({
        transparent : true,
        opacity: 0,
        side: THREE.DoubleSide
    })

    let mesh = new THREE.Mesh(geometry, material)
    mesh.position.y = geometry.parameters.height / 2
    scene.add(mesh)

    let loader = new THREE.GLTFLoader()
    loader.load(`/api/models/getModel/${model.name}`, function(gltf) {
        let modelSceneAr = gltf.scene
        // Scale
        modelSceneAr.scale.x = model.scale.x * 0.2
        modelSceneAr.scale.y = model.scale.y * 0.2
        modelSceneAr.scale.z = model.scale.z * 0.2
        // Rotation
        modelSceneAr.rotation.x = model.rotation.x
        modelSceneAr.rotation.y = model.rotation.y
        modelSceneAr.rotation.z = model.rotation.z

        //modelSceneAr.position.y = 1.5
        //modelSceneAr.position.z = -3

        scene.add(modelSceneAr)

        if (modelActions)
            setupActions(modelSceneAr, modelActions)
        if (modelData)
            showData(modelData)
    }, undefined, function(e) {
        console.error(e)
    })

    onRenderFcts.push(function(delta){
        mesh.rotation.x += Math.PI * delta
    })

    // Render the whole thing on the page

    // render the scene
    onRenderFcts.push(function(){
        rendererAR.render(scene, camera)
    })

    // run the rendering loop
    let lastTimeMsec = null
    requestAnimationFrame(function animate(nowMsec){
        // keep looping
        requestAnimationFrame(animate)

        let dt = clock.getDelta()

        if (mixer) mixer.update(dt)

        // measure time
        lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60
        let deltaMsec = Math.min(200, nowMsec - lastTimeMsec)
        lastTimeMsec = nowMsec

        // call each update function
        onRenderFcts.forEach(function(onRenderFct){
            onRenderFct(deltaMsec / 1000, nowMsec / 1000)
        })
    })
}

function onResize(){
    arToolkitSource.onResize()  
    arToolkitSource.copySizeTo(rendererAR.domElement)

    if(arToolkitContext.arController !== null) {
        arToolkitSource.copySizeTo(arToolkitContext.arController.canvas)    
    }
}

const showARModel = function(model, modelActions, modelData, idStr) {
    model = model.replace(/&#34;/gi, '"')
    model = JSON.parse(model)

    if (WEBGL.isWebGLAvailable() === false) {
        $('#models-list').append(WEBGL.getWebGLErrorMessage())
    }

    initAR(model, modelActions, modelData, idStr)
}
