import Timer from 'src/js/Timer';
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
 * do the thing, ya know?
 * the block matching/ calib stuff tutorial was found on
 * https://learnopencv.com/depth-perception-using-stereo-camera-python-c/#block-matching-for-dense-stereo-correspondence
 * as well as
 * https://docs.opencv.org/3.4/dc/dbb/tutorial_py_calibration.html
 * @param {HTMLCanvasElement} stereoCamDomEl
 * @param {HTMLCanvasElement} leftOut
 * @param {HTMLCanvasElement} rightOut
 * @param {HTMLCanvasElement} dispMapEl
 */
 function doStereoVis(stereoCamDomEl, leftOut, rightOut, dispMapEl) {
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

  // the user has issued a command to capture a stereo image pair
  let del = true;
  if (calibrationMode && captureCalibPair) {
    capturedCalibPairs.push({ l: leftEye, r: rightEye });
    captureCalibPair = false;
    del = false;
    console.log(capturedCalibPairs);
  }

  // if we have loaded in or found a mapping
  if (calibResults) {
    // make sure we have a block matcher
    if (!stereoMatcher) {
      stereoMatcher = new cv.StereoBM();
    }
    let undistL = new cv.Mat(),
      undistR = new cv.Mat(),
      grayL = new cv.Mat(),
      grayR = new cv.Mat(),
      dispMap = new cv.Mat(),
      dispMapConv = new cv.Mat();
    cv.cvtColor(leftEye, grayL, cv.COLOR_BGR2GRAY);
    cv.cvtColor(rightEye, grayR, cv.COLOR_BGR2GRAY);
    cv.remap(
      grayL,
      undistL,
      calibResults.l.map1,
      calibResults.l.map2,
      cv.INTER_LANCZOS4,
      cv.BORDER_CONSTANT
    );
    cv.remap(
      grayR,
      undistR,
      calibResults.r.map1,
      calibResults.r.map2,
      cv.INTER_LANCZOS4,
      cv.BORDER_CONSTANT
    );
    cv.imshow(leftOut, undistL);
    cv.imshow(rightOut, undistR);
    // compute disp
    stereoMatcher.compute(undistL, undistR, dispMap);
    // do the conversion
    dispMap.convertTo(dispMapConv, cv.CV_32F);
    // dispMapConv = dispMapConv / 16;
    cv.divide(
      dispMapConv,
      scalarMap.getMat(leftEye.size(), 16, cv.CV_32F),
      dispMapConv
    );
    // dispMapConv = dispMapConv - stereoMatcher.getMinDisparity();
    cv.subtract(
      dispMapConv,
      scalarMap.getMat(
        leftEye.size(),
        stereoMatcher.getMinDisparity(),
        cv.CV_32F
      ),
      dispMapConv
    );
    // dispMapConv = dispMapConv / stereoMatcher.getNumDisparities();
    cv.divide(
      dispMapConv,
      scalarMap.getMat(
        leftEye.size(),
        stereoMatcher.getNumDisparities(),
        cv.CV_32F
      ),
      dispMapConv
    );

    cv.imshow(dispMapEl, dispMapConv);
    // clean up
    freeMats(undistL, undistR, grayL, grayR, dispMap, dispMapConv);
  } else {
    cv.imshow(leftOut, leftEye);
    cv.imshow(rightOut, rightEye);
  }

  freeMats(orig, flipped);
  if (del) {
    freeMats(leftEye, rightEye);
  }
}

export {
  doStereoVis
}
