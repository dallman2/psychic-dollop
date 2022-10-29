import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { doStereoCalibration } from 'src/js/stereoCalibration';
import { doStereoVis } from 'src/js/stereoVision';
import { prepareCalibrationScene, generateProps } from 'src/js/sceneCreation';
import opencv from 'src/js/opencv_js.js';
import stateAPI from 'src/js/gfxState';

let {
  HIGHLIGHT_COLOR,
  origin,
  viewerDims,
  camera,
  stereoCam,
  scene,
  calibrationScene,
  calibrationMode,
  captureCalibPair,
  capturedCalibPairs,
  calibResults,
  stereoMatcher,
  scalarMap,
  raycaster,
  pointer,
  intersectedObj,
  oldColor,
  raycastExcludeList,
  worldMap,
  f,
  resetState,
  freeMats,
} = stateAPI;

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
 * stuff that only has to happen on first load
 * @param {HTMLCanvasElement} el
 * @param {HTMLCanvasElement} stereoEl
 */
function gfxSetup(el, stereoEl) {
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
  prepareCalibrationScene(8, 8)
  // create some props and add them
  generateProps();
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

  return { renderer, stereoRenderer };
}

/**
 * calls the setup method, preps the render function,
 * and attaches the render loop to the resolution of the
 * opencv promise
 * @param {HTMLCanvasElement} el
 * @param {HTMLCanvasElement} stereoEl
 * @param {HTMLCanvasElement} leftOut
 * @param {HTMLCanvasElement} rightOut
 * @param {HTMLCanvasElement} dispMapEl
 * @param {ref} cvReady
 */
function attachAndRender(el, stereoEl, leftOut, rightOut, dispMapEl, cvReady) {
  let { renderer, stereoRenderer } = gfxSetup(el, stereoEl);

  /**
   * this is the render loop. it performs dark magic
   */
  function render() {
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
        doStereoVis(stereoRenderer.domElement, leftOut, rightOut, dispMapEl);
      } catch (e) {
        console.log('fug');
        console.log(e);
      }
    }

    // complete the recursion
    f = window.requestAnimationFrame(render, renderer.domElement);
  }
  // call the render loop as a promise fulfillment because this module is lorg
  opencv().then((val) => {
    cv = val;
    cvReady();
    render();
  });
}

export default function useThree() {
  return {
    attachAndRender,
    toggleCalibrationMode,
    captureCalibrationPair,
    doStereoCalibration,
  };
}
