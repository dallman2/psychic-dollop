import * as THREE from 'three';
import ScalarMatMap from './ScalarMatMap';
import { Mat } from 'mirada';
import { ref } from 'vue';

/** @type {GFXState} the singleton instance */
let classInstance = null;

class StereoMatcher {
  constructor() {
    this.stereoBM = null;
  }
  setBM(inst) {
    this.stereoBM = inst;
  }
}
/**
 * this is a singleton class of the state object. we use this
 * state object rather than pinia for *pure speed*
 */
class GFXState {
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

  constructor() {
    this.HIGHLIGHT_COLOR = 0xff0000;
    this.origin = new THREE.Vector3(0, 0, 0);
    /** @type {ViewerDimensions} holds dims of our viewer */
    this.viewerDims = {
      w: 1280,
      h: 720,
    };
    /** @type {THREE.PerspectiveCamera} the camera we use to look at the scene */
    this.camera = {};
    /** @type {THREE.StereoCamera} the stereo cam helper obj used for stereo vis */
    this.stereoCam = {};
    /** @type {THREE.Scene} the scene */
    this.scene = new THREE.Scene();
    /** @type {THREE.Scene} the scene used for stereo calibration */
    this.calibrationScene = new THREE.Scene();
    /** @type {{value: boolean}} render the calibration scene? */
    this.calibrationMode = ref(false);
    /** @type {{value: boolean}} should i capture a frame for calibration on the next render? */
    this.captureCalibPair = ref(false);
    /** @type {StereoImagePair[]} list of captured pairs to be used in calibration*/
    this.capturedCalibPairs = [];
    /** @type {DistMapsAndQ} an object with the results of stereo calibration */
    this.calibResults = {};
    /** @type {{value: boolean}} do we have calibration results to show? */
    this.haveCalibResults = ref(false);
    /** @type {StereoMatcher} stereo bm object */
    this.stereoMatcher = new StereoMatcher();
    /** @type {ScalarMatMap} this class contains mats filled with scalars */
    this.scalarMap = null;
    /** @type {THREE.Raycaster} used for raycasting, the actual raycaster */
    this.raycaster = new THREE.Raycaster();
    /** @type {THREE.Vector2} used for raycasting, stores the location of the mouse on the canvas */
    this.pointer = new THREE.Vector2();
    /** @type {THREE.Object3D} used for raycasting, stores the currently intersected object  */
    this.intersectedObj = null;
    /** @type {THREE.Color} used for raycasting, stores the original color of an object */
    this.oldColor = null;
    /** @type {THREE.Object3D[]} a list of all objects which are to be passed over during raycasting */
    this.raycastExcludeList = [];
    /** @type {object.<string, THREE.Object3D>} a map representing all renderable objects currently in the world */
    this.worldMap = {
      calib: {},
      prod: {},
    };
    /** @type {{value: number}} frame counter */
    this.f = ref(0);

    this.resetState();
  }
  /**
   * this function just resets the hidden state in this file.
   * We have to do this because we might navigate away from the page that is rendering.
   * When we navigate back, the attachAndRender function is called again, which would
   * duplicate items and cause all sorts of issues if everything is not in the original state
   */
  resetState() {
    this.camera = {};
    this.stereoCam = {};
    this.scene = new THREE.Scene();
    this.calibrationScene = new THREE.Scene();
    this.calibrationMode.value = false;
    this.captureCalibPair.value = false;
    this.capturedCalibPairs = [];
    this.calibResults = {};
    this.haveCalibResults.value = false;
    this.stereoMatcher = new StereoMatcher();
    this.scalarMap = new ScalarMatMap();
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.intersectedObj = null;
    this.oldColor = null;
    this.raycastExcludeList = [];
    this.worldMap = {
      calib: {},
      prod: {},
    };
    this.f = ref(0);

    this.scene.background = new THREE.Color(0xf0f0f0);
    this.scene.name = 'prod';
    this.calibrationScene.background = new THREE.Color(0xffffff);
    this.calibrationScene.name = 'calib';
  }

  /**
   * free memory of all the mats passed in
   * @param {Mat[]} mats
   */
  freeMats(mats) {
    mats.forEach((el) => el.delete());
  }

  stateAPI() {
    return {
      HIGHLIGHT_COLOR: this.HIGHLIGHT_COLOR,
      origin: this.origin,
      viewerDims: this.viewerDims,
      camera: this.camera,
      stereoCam: this.stereoCam,
      scene: this.scene,
      calibrationScene: this.calibrationScene,
      calibrationMode: this.calibrationMode,
      captureCalibPair: this.captureCalibPair,
      capturedCalibPairs: this.capturedCalibPairs,
      calibResults: this.calibResults,
      haveCalibResults: this.haveCalibResults,
      stereoMatcher: this.stereoMatcher,
      scalarMap: this.scalarMap,
      raycaster: this.raycaster,
      pointer: this.pointer,
      intersectedObj: this.intersectedObj,
      oldColor: this.oldColor,
      raycastExcludeList: this.raycastExcludeList,
      worldMap: this.worldMap,
      f: this.f,
      resetState: () => this.resetState(),
      freeMats: (...mats) => this.freeMats(mats),
    };
  }
}
/**
 * to be called at the very beginning to set up the instance
 */
function init() {
  console.log('gfxstate init');
  if (!classInstance) classInstance = new GFXState();
}
/**
 * @returns the singleton instances properties as a callable function
 */
function getAPI() {
  return classInstance.stateAPI();
}

export { init, getAPI };
