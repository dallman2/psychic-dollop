import * as THREE from 'three'
import ScalarMatMap from './ScalarMatMap';
import {Mat} from 'mirada'

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
/**
 * @typedef MapPair
 * @type {object}
 * @prop {Mat} mat1 - x map
 * @prop {Mat} mat2 - y map
 */
/**
 * @typedef DistMapsAndQ
 * @type {object}
 * @prop {MapPair} l - left map pair for undistorting images
 * @prop {MapPair} r - right map pair for undistorting images
 * @prop {Mat} q - the Q mat for reprojecting points
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
  scene = null,
  /** @type {THREE.Scene} the scene used for stereo calibration */
  calibrationScene = new THREE.Scene(),
  /** @type {boolean} render the calibration scene? */
  calibrationMode = false,
  /** @type {boolean} should i capture a frame for calibration on the next render? */
  captureCalibPair = false,
  /** @type {StereoImagePair[]} list of captured pairs to be used in calibration*/
  capturedCalibPairs = [],
  /** @type {DistMapsAndQ} an object with the results of stereo calibration */
  calibResults = null,
  /** @type {StereoBM} stereo bm object */
  stereoMatcher = null,
  /** @type {ScalarMatMap} this class contains mats filled with scalars */
  scalarMap = null,
  /** @type {THREE.Raycaster} used for raycasting, the actual raycaster */
  raycaster = new THREE.Raycaster(),
  /** @type {THREE.Vector2} used for raycasting, stores the location of the mouse on the canvas */
  pointer = new THREE.Vector2(),
  /** @type {THREE.Object3D} used for raycasting, stores the currently intersected object  */
  intersectedObj = null,
  /** @type {THREE.Color} used for raycasting, stores the original color of an object */
  oldColor = null,
  /** @type {THREE.Object3D[]} a list of all objects which are to be passed over during raycasting */
  raycastExcludeList = [],
  /** @type {object.<string, THREE.Object3D>} a map representing all renderable objects currently in the world */
  worldMap = {
    calib: {},
    prod: {},
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
  console.log('resetting')
  camera = null;
  stereoCam = null;
  scene = new THREE.Scene();
  calibrationScene = new THREE.Scene();
  calibrationMode = false;
  captureCalibPair = false;
  capturedCalibPairs = [];
  calibResults = null;
  stereoMatcher = null;
  scalarMap = new ScalarMatMap();
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
 * free memory of all the mats passed in
 * @param {Mat[]} mats
 */
 function freeMats(...mats) {
  mats.forEach((el) => el.delete());
}

export default {
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
  freeMats
};
