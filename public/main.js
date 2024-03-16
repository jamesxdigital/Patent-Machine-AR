let isWasmLoaded = false;
// Create the style element
const style = document.createElement('style');
style.innerHTML = `
  body,
  html {
    margin: 0;
    padding: 0;
    overflow: hidden;
  }
  
  #outputCanvas,
  #video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  #renderCanvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
`;
// Append the style element to the document head
document.head.appendChild(style);




///////////////////////////////////////////////////////////
///// WASM                                             ////
///////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////

function onWasmLoaded() {
    console.log("output.js is loaded!");
  
    //THE FOLLOWING ARE THE EMSCRIPTEN INITIALIZERS AND MAPPING FUNCTIONS. DO NOT MODIFY THESE
    let js_wrapped_setCamMatrix = Module.cwrap("setCamMatrixHelper", "", [
      "number",
      "number",
      "number",
      "number",
      "number",
      "number",
    ]);
    let js_wrapped_setImageToDetectHelper = Module.cwrap(
      "setImageToDetectHelper",
      "",
      ["number", "number", "number"]
    );
  
    let js_wrapped_createBuffer = Module.cwrap("createBuffer", "number", [
      "number",
      "number",
    ]);
    let js_wrapped_destroyBuffer = Module.cwrap("destroyBuffer", "", ["number"]);
    let js_wrapped_matrixFromPointer = Module.cwrap(
      "matrixFromPointer",
      "number",
      ["number", "number", "number"]
    );
    let js_wrapped_getResultPointer = Module.cwrap("getResultPointer", "number");
    let js_wrapped_getVideoResultPointer = Module.cwrap(
      "getVideoResultPointer",
      "number"
    );
    let js_wrapped_getResultSize = Module.cwrap("getResultSize", "number");
  
    let js_wrapped_getVideoResultSize = Module.cwrap(
      "getVideoResultSize",
      "number"
    );
    let js_wrapped_getResultTrackStatus = Module.cwrap(
      "getResultTrackStatus",
      "number"
    );
    //EMSCRIPTEN INITIALIZERS END HERE
    //===================================================
    //===================================================
    //===================================================
    //===================================================
    //===================================================
    //==========================================================
  
    let fps = 30;
    let videoHeight = 480;
    let videoWidth = 640;
    let video = document.querySelector("#video");
    let cnv = document.createElement("canvas");
    cnv.width = videoWidth;
    cnv.height = videoHeight;
    let tempCanvasCtx = cnv.getContext("2d");

    let et = document.createElement("div");
    let etParent = document.querySelector("#container");
    etParent.appendChild(et);
    let temporaryDetectCanvas = document.createElement("canvas");
    //================================
  
    let animationLoopId = undefined;
    let stopVideo = false;
  
    //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  
    //hacked code to simply fit the image to detect inside the little canvas
    //This is not really needed
    //===========================================Image to detect=========
  
    var fitImageOn = function (canvas, imageObj) {
      var context = canvas.getContext("2d");
      var imageAspectRatio = imageObj.width / imageObj.height;
      var canvasAspectRatio = canvas.width / canvas.height;
      var renderableHeight, renderableWidth, xStart, yStart;
  
      // If image's aspect ratio is less than canvas's we fit on height
      // and place the image centrally along width
      if (imageAspectRatio < canvasAspectRatio) {
        renderableHeight = canvas.height;
        renderableWidth = imageObj.width * (renderableHeight / imageObj.height);
        xStart = (canvas.width - renderableWidth) / 2;
        yStart = 0;
      }
  
      // If image's aspect ratio is greater than canvas's we fit on width
      // and place the image centrally along height
      else if (imageAspectRatio > canvasAspectRatio) {
        renderableWidth = canvas.width;
        renderableHeight = imageObj.height * (renderableWidth / imageObj.width);
        xStart = 0;
        yStart = (canvas.height - renderableHeight) / 2;
      } else {
        renderableHeight = canvas.height;
        renderableWidth = canvas.width;
        xStart = 0;
        yStart = 0;
      }
      context.drawImage(
        imageObj,
        xStart,
        yStart,
        renderableWidth,
        renderableHeight
      );
    };
  
    async function imageToUint8ClampedArray(image, canvasDetect) {
      return new Promise((resolve, reject) => {
        //the following function call actually fits the image in the little canvas
        fitImageOn(canvasDetect, image);
        //================================
        //the following bit of code returns the proper aspect ratio and size of the image
        //we need it to put the buffer size in wasm
        //WE ARE CONVERTING THE DETECTION IMAGE TO THE CANVAS DISPLAYED ON PAGE AND THEN SENDING IT TO WASM.
        //THIS IS REQUIRED FOR THE LENGTH TO MEET MULTIPLE OF 4.
        temporaryDetectCanvas.width = image.width;
        temporaryDetectCanvas.height = image.height;
        const context = temporaryDetectCanvas.getContext("2d");
        context.drawImage(image, 0, 0);
        context.canvas.toBlob((blob) =>
          blob
            .arrayBuffer()
            .then((buffer) => {
              resolve(context.getImageData(0, 0, image.width, image.height).data);
            })
            .catch(reject)
        );
      });
    }
  
    const imageToDetect = new Image();
    imageToDetect.src = `target.jpg`; /////////// Change image
    const canvasDetect = document.querySelector("#canvasImageToDetect");
    let imageToDetectData = undefined;
  
    imageToDetect.onload = async () => {
      const view = await imageToUint8ClampedArray(imageToDetect, canvasDetect);
      // use the view...
      imageToDetectData = view;
    };
    //
    //
    //
    //===================================================
    //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // Basic code for getting the video stream from cam
    //===================================================
    let devices = navigator.mediaDevices.enumerateDevices();
    console.log("here are the devices", devices);
    let init = async function () {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: videoWidth,
          height: videoHeight,
          facingMode: "environment",
        },
      });
      video.srcObject = stream;
      video.setAttribute("playsinline", "true");
      await video.play();
    };
  
    let captureVideoImage = function () {
      tempCanvasCtx.drawImage(video, 0, 0);
      const imageData = tempCanvasCtx.getImageData(0, 0, videoWidth, videoHeight);
      return imageData;
    };
    //=========================================================
    //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  
    //console.log(context.drawImage(video, 0, 0));
    let looper = async function (fps) {
      const initialisations = await init();
      const ax = js_wrapped_setCamMatrix(480, 640, 60, 60, 1, 1.5); // this is the settings for the image to detect
      const imgToDetectPtr = js_wrapped_createBuffer(
        temporaryDetectCanvas.width,
        temporaryDetectCanvas.height
      );
      console.log("temporary canvas size");
      console.log(temporaryDetectCanvas.width);
      console.log(temporaryDetectCanvas.height);
  
      Module.HEAP8.set(imageToDetectData, imgToDetectPtr);
      js_wrapped_setImageToDetectHelper(
        imgToDetectPtr,
        temporaryDetectCanvas.width,
        temporaryDetectCanvas.height
      );
      let destroyDetectionImageBuffer = js_wrapped_destroyBuffer(imgToDetectPtr);
  
      //initialization is over
      //===========================================
      (function loop() {
        let begin = Date.now();
        try {
          const imageFrameData = captureVideoImage();
          const p = js_wrapped_createBuffer(videoWidth, videoHeight);
          Module.HEAP8.set(imageFrameData.data, p);
  
          let executionTime = js_wrapped_matrixFromPointer(
            p,
            videoWidth,
            videoHeight
          ); //width, height
          //et.innerHTML = executionTime;
  
          let destroyBuffer = js_wrapped_destroyBuffer(p);
  
          const resultPointer = js_wrapped_getResultPointer();
          const resultSize = js_wrapped_getResultSize();
          const resultTrackStatus = js_wrapped_getResultTrackStatus();
          const resultView = new Float32Array(
            Module.HEAP8.buffer,
            resultPointer,
            resultSize
          );
          destroyBuffer = js_wrapped_destroyBuffer(resultPointer);
          //======================
          //============================
          //MODIFY THE AR OBJECT ORIENTATION HERE==========
          //TODO: change the video shown based on the track status
          updateARObject(resultView);
          //console.log(resultTrackStatus);
          //===============================================
          //DISPLAYING THE PROCESSED VIDEO
          if (resultTrackStatus == 1) {
            // console.log("wasm output playing!");
   
            // video.style.visibility = "hidden";
            const videoResultPointer = js_wrapped_getVideoResultPointer();
            const videoResultSize = js_wrapped_getVideoResultSize();
  
            const videoResultView = new Uint8Array(
              Module.HEAP8.buffer,
              videoResultPointer,
              videoResultSize
            );
            const videoResult = new Uint8Array(videoResultView);
  
            destroyBuffer = js_wrapped_destroyBuffer(videoResultPointer);
  
            //:Use U8A to create image data object:
            let imageDataArrayClamped = new Uint8ClampedArray(
              videoResultView,
              videoWidth,
              videoHeight
            );
            var outputImageData = new ImageData(
              imageDataArrayClamped,
              videoWidth,
              videoHeight
            );
            canvas.style.visibility = "visible";
            
      
       
          } else {
    
            canvas.style.visibility = "hidden";
                      }
        } catch (e) {
          console.log("error is: ", e);
        }
        //====================================
        if (!stopVideo) {
          let delay = 1000 / fps - (Date.now() - begin);
          setTimeout(loop, delay);
        }
        // animationLoopId = window.requestAnimationFrame(loop);
      })();
    };
    looper(fps);
  
    //press esc to stop the video process
    let a = document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        stop(e);
      }
    });
  
    //==================
    function stop(e) {
      console.log("video stopped!");
      var stream = video.srcObject;
      var tracks = stream.getTracks();
  
      for (var i = 0; i < tracks.length; i++) {
        var track = tracks[i];
        track.stop();
      }
      video.srcObject = null;
      stopVideo = true;
    }
  }
  ///////////////////////////////////////////////////////////
  ///// Main Part                                        ////
  ///////////////////////////////////////////////////////////
    

var canvas = document.getElementById("renderCanvas");
var renderer = null;
var scene = null;
var sceneToRender = null;
var camera = null;

var createDefaultRenderer = function () {
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setClearColor( 0xffffff, 0);
  return renderer;
};

var createScene = function () {
  var scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    75,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 0);

  var light = new THREE.HemisphereLight(0xffffff, 0x000000, 0.8);

  var size = 0.5;
  var geometry = new THREE.BoxGeometry(size, size, size);
  var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  var box = new THREE.Mesh(geometry, material);

  var cloudTarget = new THREE.Object3D();
  cloudTarget.name = "cloudTarget";
  cloudTarget.add(box);
  

  scene.add(camera);
  scene.add(light);
  scene.add(cloudTarget);

  return scene;
};

window.initFunction = async function () {
  var asyncRendererCreation = async function () {
    try {
      return createDefaultRenderer();
    } catch (e) {
      console.log(
        "the available createRenderer function failed. Creating the default renderer instead"
      );
      return createDefaultRenderer();
    }
  };

  window.renderer = await asyncRendererCreation();
  if (!renderer) throw "renderer should not be null.";
  window.scene = createScene();
};

initFunction().then(() => {
  sceneToRender = scene;
  function animate() {
    requestAnimationFrame(animate);
    if (sceneToRender && sceneToRender.children.length > 0) {
      renderer.render(sceneToRender, camera);
    }
  }
  animate();
});

// Resize
window.addEventListener("resize", function () {
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
});

function handleDeviceOrientation(event) {
  var alpha = event.alpha;
  var beta = event.beta;
  var gamma = event.gamma;

  // Convert the device orientation angles to radians
  var alphaRad = alpha * (Math.PI / 180);
  var betaRad = beta * (Math.PI / 180);
  var gammaRad = gamma * (Math.PI / 180);

  // Calculate the rotation matrix
  var euler = new THREE.Euler(betaRad, alphaRad, -gammaRad, "YXZ");
  camera.quaternion.setFromEuler(euler);
}

window.addEventListener("deviceorientation", handleDeviceOrientation);

const updateARObject = function (transformationMatArray, groundPlaneEnabled) {
  const rotMat = new THREE.Matrix4().fromArray(transformationMatArray);
  const rotQuaternion = new THREE.Quaternion().setFromRotationMatrix(rotMat);

  const qCorrected = new THREE.Quaternion(
    -rotQuaternion.x,
    rotQuaternion.y,
    rotQuaternion.z,
    -rotQuaternion.w
  );
  const qInverse = qCorrected.clone().invert();

  var cloudTarget = scene.getObjectByName("cloudTarget");
  if (cloudTarget) {
    if (!groundPlaneEnabled) {
      cloudTarget.quaternion.copy(qInverse);
    }

    cloudTarget.position.set(
      transformationMatArray[3],
      -transformationMatArray[7],
      -transformationMatArray[11]
    );
  }
};