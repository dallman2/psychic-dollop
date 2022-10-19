import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { Mat, TermCriteria } from 'mirada';
import { ref } from 'vue';

/**
 * @typedef ViewerDimensions
 * @type {object}
 * @prop {number} w - width of viewer
 * @prop {number} h - height of viewer
 */
/**
 * @typedef StereoImagePair
 * @type {object}
 * @prop {Mat} l - left eye image
 * @prop {Mat} r - right eye image
 */

const HIGHLIGHT_COLOR = 0xff0000,
  origin = new THREE.Vector3(0, 0, 0),
  /** @type {ViewerDimensions} holds dims of our viewer */
  viewerDims = {
    w: 1280,
    h: 720,
  };
/** @type {THREE.PerspectiveCamera} the camera we use to look at the scene */
let camera = null,
  /** @type {THREE.StereoCamera} the stereo cam helper obj used for stereo vis */
  stereoCam = null,
  /** @type {THREE.Scene} the scene */
  scene = new THREE.Scene(),
  /** @type {THREE.Scene} the scene used for stereo calibration */
  calibrationScene = new THREE.Scene(),
  /** @type {boolean} render the calibration scene? */
  calibrationMode = false,
  /** @type {boolean} should i capture a frame for calibration on the next render? */
  captureCalibPair = false,
  /** @type {StereoImagePair[]} list of captured pairs to be used in calibration*/
  capturedCalibPairs = [],
  /** @type {THREE.Raycaster} used for raycasting, the actual raycaster */
  raycaster = new THREE.Raycaster(),
  /** @type {THREE.Vector2} used for raycasting, stores the location of the mouse on the canvas */
  pointer = new THREE.Vector2(),
  /** @type {THREE.Object3D} used for raycasting, stores the currently intersected object  */
  intersectedObj = null,
  /** @type {THREE.Color} used for raycasting, stores the original color of an object */
  oldColor = null,
  /** @type {array.<THREE.Object3D>} a list of all objects which are to be passed over during raycasting */
  raycastExcludeList = [],
  /** @type {object.<string, THREE.Object3D>} a map representing all renderable objects currently in the world */
  worldMap = {
    prod: {},
    default: {},
  },
  /** @type {number} frame counter */
  f = 0;

/**
 * this function just resets the hidden state in this file.
 * We have to do this because we might navigate away from the page that is rendering.
 * When we navigate back, the attachAndRender function is called again, which would
 * duplicate items and cause all sorts of issues if everything is not in the original state
 */
function resetState() {
  camera = null;
  stereoCam = null;
  scene = new THREE.Scene();
  calibrationScene = new THREE.Scene();
  calibrationMode = false;
  captureCalibPair = false;
  capturedCalibPairs = [];
  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();
  intersectedObj = null;
  oldColor = null;
  raycastExcludeList = [];
  worldMap = {
    calib: {},
    prod: {},
  };
  f = 0;

  scene.background = new THREE.Color(0xf0f0f0);
  scene.name = 'prod';
  calibrationScene.background = new THREE.Color(0xffffff);
  calibrationScene.name = 'calib';
}
/**
 * A timer for measuring performance. call start(), then call finish(). easy.
 */
class Timer {
  constructor() {
    this.begin = 0;
    this.end = 0;
    this.label = '';
  }
  /**
   * @param {string} label what should the timer call this when it prints it
   */
  start(label) {
    this.label = label;
    this.begin = performance.now();
  }
  finish() {
    this.end = performance.now();
    console.log(`Timer: ${this.label} took ${this.end - this.begin}ms`);
  }
}

/**
 * @returns {THREE.Scene} the active scene
 */
function getScene() {
  return calibrationMode ? calibrationScene : scene;
}

/**
 * this function acts as a toggle switch
 * between calibration mode and normal mode
 * @return {boolean} the new state of calibrationMode
 */
function toggleCalibrationMode() {
  calibrationMode = !calibrationMode;
  return calibrationMode;
}

/**
 * set the capture flag to true, a frame will be captured on the next render loop
 * @return {number} the number of image pairs AFTER the next one is captured
 */
function captureCalibrationPair() {
  captureCalibPair = true;
  return capturedCalibPairs.length + 1;
}

/**
 * do a chessboard calibration for each of the stereo cameras.
 * i followed the guide found here pretty closely:
 * https://docs.opencv.org/3.4/dc/dbb/tutorial_py_calibration.html
 * @returns
 */
function doStereoCalibration() {
  // dont do it if there arent pairs
  if (!capturedCalibPairs.length) return;
  const rows = 7,
    cols = 7,
    dims = 3,
    tc = new cv.TermCriteria(
      cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER,
      30,
      0.001
    );

  let imgPointsL = [],
    imgPointsR = [],
    objPointsL = [],
    objPointsR = [];
  /** the prefab matrix which yields the same output as
   * ```
   * objp = np.zeros((6*7,3), np.float32)
   * objp[:,:2] = np.mgrid[0:7,0:6].T.reshape(-1,2)
   * ```
   */
  const prefabbedPoints = cv.Mat.zeros(
    new cv.Size(rows * cols, dims),
    cv.CV_32F
  );
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      prefabbedPoints.data32F[i * cols * dims + j * dims + 0] = j;
      prefabbedPoints.data32F[i * cols * dims + j * dims + 1] = i;
    }
  }

  /**
   * Perform vision calibration on one image for one camera,
   * to avoid having two of every call
   * @param {Mat} img the image to calibrate on
   * @param {number} r number of inner rows in the chessboard
   * @param {number} c number of inner cols in the chessboard
   * @param {Mat} prePoints grid representing inner corners, use ```prefabbedPoints``` for this
   * @param {Array} objPoints part of parallel array, stores the grid
   * @param {Array} imgPoints other part of parallel array, stores the distorted grid
   * @param {TermCriteria} crit term critera for finding subpixel corners
   */
  function singleImageCalib(img, r, c, prePoints, objPoints, imgPoints, crit) {
    let gray = new cv.Mat(),
      corners = new cv.Mat();
    cv.cvtColor(img, gray, cv.COLOR_BGR2GRAY);
    let found = cv.findChessboardCorners(gray, new cv.Size(r, c), corners);

    if (found) {
      // this is going to be double the length and cause a problem
      objPoints.push(prePoints);
      // get this from img proc
      let betterCorners = cv.cornerSubPix(
        gray,
        corners,
        new cv.Size(11, 11),
        new cv.Size(-1, -1),
        crit
      );
      imgPoints.push(betterCorners);
      // a drawChessboardCorners hook goes here
    }
  }

  capturedCalibPairs.forEach((pair) => {
    let { l, r } = pair;
    singleImageCalib(
      l,
      rows,
      cols,
      prefabbedPoints,
      objPointsL,
      imgPointsL,
      tc
    );
    singleImageCalib(
      r,
      rows,
      cols,
      prefabbedPoints,
      objPointsR,
      imgPointsR,
      tc
    );
    // let camMat = new cv.Mat(new cv.Size(3, 3), cv.CV_32F),
    // distCoeffs = new cv.Mat(),
    // rvecs = new cv.Mat(),
    // tvecs = new cv.Mat(),
    // stdDevInt = new cv.Mat(),
    // stdDevExt = new cv.Mat(),
    // perViewErr = new cv.Mat();
    let err = cv.stereoCalibrate(
      objPoints
      // imgPoints,
      // gray.size(),
      // camMat,
      // distCoeffs,
      // rvecs,
      // tvecs,
      // stdDevInt,
      // stdDevExt,
      // perViewErr
      //flags
      //tc
    );
    console.log(err);
  });
}

/**
 * create the scene for calibration
 * @param {number} rows rows in the chessboard
 * @param {number} cols cols in the chessboard
 * @return {obj<string, array>} an object with two keys, ```inc``` and ```exc```, refering to objects to include and exclude
 */
function _prepareCalibrationScene(rows, cols) {
  const ambLight = new THREE.AmbientLight(0xffffff, 0.5),
    geometry = new THREE.PlaneGeometry(1, 1),
    blackMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      side: THREE.DoubleSide,
    }),
    whiteMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
    });

  let squares = [];
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      // every other square should be white
      let square;
      if ((i % 2 && j % 2) || (!(i % 2) && !(j % 2)))
        square = new THREE.Mesh(geometry, blackMaterial);
      else square = new THREE.Mesh(geometry, whiteMaterial);
      square.position.set(i - cols / 2, j - rows / 2, 0);
      squares.push(square);
    }
  }

  return {
    calibInc: [...squares],
    calibExc: [ambLight],
  };
}

/**
 * @return {obj<string, array>} an object with two keys, ```inc``` and ```exc```, refering to objects to include and exclude
 */
function _generateProps() {
  const ambLight = new THREE.AmbientLight(0xffffff, 0.3),
    lightGroup = new THREE.Group(),
    light1 = new THREE.PointLight(0xffffff, 0.8),
    helper = new THREE.Box3Helper(
      new THREE.Box3(origin, new THREE.Vector3(2, 2, 2)),
      0x000000
    ),
    gridHelper = new THREE.GridHelper(10, 10, 0x00ffff, 0xff00ff),
    geometry = new THREE.BoxBufferGeometry(1, 1, 1);

  helper.position.set(origin);
  light1.position.set(1, 1, 1);
  addObjToGroup([helper, light1], lightGroup, true);
  lightGroup.position.set(10, 75, 10);
  gridHelper.position.set(0, -10, 0);

  const cubes = [
    0x00ff00, 0x44ff00, 0x00ff88, 0x88ff00, 0x00ffcc, 0xccff00, 0x00ffee,
  ].map((c, idx) => {
    const cube = new THREE.Mesh(
      geometry,
      new THREE.MeshLambertMaterial({ color: c })
    );
    cube.position.set(idx * 2, 0, idx);
    return cube;
  });

  return {
    inc: [...cubes],
    exc: [gridHelper, ambLight, lightGroup],
  };
}

/**
 * do the thing, ya know?
 * @param {HTMLCanvasElement} stereoCamDomEl
 * @param {HTMLCanvasElement} leftOut
 * @param {HTMLCanvasElement} rightOut
 */
function _doStereoVis(stereoCamDomEl, leftOut, rightOut) {
  let gl = stereoCamDomEl.getContext('webgl2');
  const pixels = new Uint8Array(
      gl.drawingBufferHeight * gl.drawingBufferWidth * 4
    ),
    h = gl.drawingBufferHeight,
    w = gl.drawingBufferWidth,
    t = new Timer();

  // get image from stereo canvas
  gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  // create a mat for the flipped version of the image
  const orig = cv.matFromArray(h, w, cv.CV_8UC4, pixels),
    flipped = new cv.Mat(new cv.Size(w, h), cv.CV_8UC4);
  // flip it
  cv.flip(orig, flipped, 0);
  // cut into left and right eye views
  const leftEye = flipped.roi(new cv.Rect(0, 0, w / 2, h));
  const rightEye = flipped.roi(new cv.Rect(w / 2, 0, w / 2, h));

  let del = true;
  if (calibrationMode && captureCalibPair) {
    capturedCalibPairs.push({ l: leftEye, r: rightEye });
    captureCalibPair = false;
    del = false;
    console.log(capturedCalibPairs);
  }

  cv.imshow(leftOut, leftEye);
  cv.imshow(rightOut, rightEye);

  orig.delete();
  flipped.delete();
  if (del) {
    leftEye.delete();
    rightEye.delete();
  }
}

/**
 * calculate objects intersecting the picking ray
 * effectively, the emissiveity property 'travels' from object to object
 * thats why we have an intersectedObj variable
 */
function checkIntersections() {
  // update the picking ray with the camera and pointer position
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(scene.children, false);
  //are there objects in the intersection list and are they NOT excluded?
  if (
    intersects.length > 0 &&
    !raycastExcludeList.includes(intersects[0].object.id)
  ) {
    //is the intersected object from the last frame the same as the current intersected object?
    if (intersectedObj != intersects[0].object) {
      // does the previous intersected object exist? (ie, are we going from one object straight to another?)
      if (intersectedObj) {
        //set the emissivity back to the old color, this prevents us from leaving a 'trail' of highlighted objects
        intersectedObj.material.emissive.setHex(oldColor);
      }
      // set the intersected object to the currently moused over object
      intersectedObj = intersects[0].object;
      //save the old emissivity color before changing it
      oldColor = intersectedObj.material.emissive.getHex();
      // set the emissive light color of the newly moused over obj
      intersectedObj.material.emissive.setHex(HIGHLIGHT_COLOR);
    }
  } else {
    // if we had an object that was intersected before, but now we dont, set its color back to original
    // then we set it to null
    if (intersectedObj) {
      intersectedObj.material.emissive.setHex(oldColor);
    }
    intersectedObj = null;
  }
}

/**
 *
 * @param {THREE.Object3D | [THREE.Object3D]} obj the object(s) you want to add to the scene
 * @param {THREE.Scene} scene which scene should this object be added to?
 * @param {boolean} exclude should we exclude this object from the raycasting process? default false
 */
function addObjToScene(obj, scene, exclude = false) {
  if (typeof obj == THREE.Object3D) obj = [obj];
  if (exclude) obj?.forEach((el) => raycastExcludeList.push(el.id));
  obj?.forEach((el) => {
    worldMap[scene.name][el.id] = el;
    scene.add(el);
  });
}

/**
 * @param {THREE.Object3D | [THREE.Object3D]} obj the object(s) you want to add to a group
 * @param {THREE.Group} group the group you want to add it to
 * @param {boolean} exclude should we exclude this object from the raycasting process? default false
 */
function addObjToGroup(obj, group, exclude = false) {
  if (typeof obj == THREE.Object3D) obj = [obj];
  if (exclude) obj.forEach((el) => raycastExcludeList.push(el.id));
  obj.forEach((el) => {
    worldMap[el.id] = el;
    group.add(el);
  });
}

/**
 *
 * @param {HTMLCanvasElement} el
 * @param {HTMLCanvasElement} stereoEl
 * @param {HTMLCanvasElement} leftOut
 * @param {HTMLCanvasElement} rightOut
 * @param {ref} cvReady
 */
function attachAndRender(el, stereoEl, leftOut, rightOut, cvReady) {
  resetState();
  // create the camera and set it up
  camera = new THREE.PerspectiveCamera(
    90,
    viewerDims.w / viewerDims.h,
    0.1,
    1000
  );
  camera.position.set(10, 10, 10);
  camera.lookAt(origin);

  // // create the calibration props for stereo vis
  const { calibInc, calibExc } = _prepareCalibrationScene(8, 8);
  addObjToScene(calibInc, calibrationScene);
  addObjToScene(calibExc, calibrationScene, true);
  // create some props and add them
  const { inc, exc } = _generateProps();
  addObjToScene(inc, scene);
  addObjToScene(exc, scene, true);
  // create the stereo cam
  stereoCam = new THREE.StereoCamera();
  stereoCam.update(camera);
  // create the renderers
  let renderer = new THREE.WebGLRenderer({ antialias: true }),
    stereoRenderer = new THREE.WebGLRenderer({ antialias: true });
  // setup for renderers
  renderer.setSize(viewerDims.w, viewerDims.h);
  stereoRenderer.setSize(viewerDims.w, viewerDims.h / 2);
  // dont really know where to put this
  let controls = new OrbitControls(camera, renderer.domElement);
  // attach the renderers
  el.appendChild(renderer.domElement);
  stereoEl.appendChild(stereoRenderer.domElement);
  // setup event listeners for raycasting stuff
  renderer.domElement.addEventListener('pointermove', (ev) => {
    // calculate pointer position in normalized device coordinates
    // (-1 to +1) for both components
    pointer.y = -(ev.offsetY / viewerDims.h) * 2 + 1;
    pointer.x = (ev.offsetX / viewerDims.w) * 2 - 1;
  });
  renderer.domElement.addEventListener('click', (ev) => {
    if (intersectedObj?.type == 'Mesh') console.log(intersectedObj.uuid);
  });

  /**
   * this is the render loop. it performs dark magic
   */
  function render() {
    // console.log(f);
    camera.lookAt(origin);
    camera.updateMatrixWorld();
    // do the raycasting
    checkIntersections();

    renderer.clear();
    renderer.render(getScene(), camera);

    // ============================================================================
    // code from stackoverflow https://stackoverflow.com/questions/61052900/can-anyone-explain-what-is-going-on-in-this-code-for-three-js-stereoeffect
    const size = new THREE.Vector2();
    camera.updateWorldMatrix();
    stereoCam.update(camera);
    // baseline setter
    stereoCam.eyeSep = 0.5;
    // this is described in the post on stackoverflow
    stereoRenderer.getSize(size);
    stereoRenderer.setScissorTest(true);
    stereoRenderer.setScissor(0, 0, size.width / 2, size.height);
    stereoRenderer.setViewport(0, 0, size.width / 2, size.height);
    stereoRenderer.render(getScene(), stereoCam.cameraL);
    stereoRenderer.setScissor(size.width / 2, 0, size.width / 2, size.height);
    stereoRenderer.setViewport(size.width / 2, 0, size.width / 2, size.height);
    stereoRenderer.render(getScene(), stereoCam.cameraR);

    stereoRenderer.setScissorTest(false);
    // ============================================================================

    // every fourth frame, do stereovis
    if (f % 4 == 0) {
      try {
        _doStereoVis(stereoRenderer.domElement, leftOut, rightOut);
      } catch (e) {
        console.log('fug');
        console.log(e);
      }
    }

    // complete the recursion
    f = window.requestAnimationFrame(render, renderer.domElement);
  }
  // call the render loop after a bit because we need the cv lib to actually load
  if (!cv.Mat) {
    cv.then((val) => {
      console.log(val);
      cv = val;
      cvReady();
      render();
    });
  } else {
    cvReady();
    render();
  }
}

export default function useThree() {
  return {
    attachAndRender,
    toggleCalibrationMode,
    captureCalibrationPair,
    doStereoCalibration,
  };
}
