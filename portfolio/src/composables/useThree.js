import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// import { TransformControls } from "three/examples/jsm/controls/TransformControls";

let camera,
  stereoCam,
  scene = new THREE.Scene(),
  raycaster = new THREE.Raycaster(),
  pointer = new THREE.Vector2(),
  intersectedObj,
  oldColor,
  raycastExcludeList = [],
  worldMap = {};

const HIGHLIGHT_COLOR = 0xff0000;

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
 * @param {THREE.Object3D} obj the object you want to add to the scene
 * @param {boolean} exclude should we exclude this object from the raycasting process? default false
 */
function addObjToScene(obj, exclude = false) {
  if (exclude) raycastExcludeList.push(obj.id);
  worldMap[obj.id] = obj;
  scene.add(obj);
}

/**
 *
 * @param {THREE.Object3D} obj the object you want to add to a group
 * @param {THREE.Group} group the group you want to add it to
 * @param {boolean} exclude should we exclude this object from the raycasting process? default false
 */
function addObjToGroup(obj, group, exclude = false) {
  if (exclude) raycastExcludeList.push(obj.id);
  worldMap[obj.id] = obj;
  group.add(obj);
}

/**
 *
 * @param {DomElement} el
 */
function attachAndRender(el) {
  let viewerDims = {
    w: 1280,
    h: 720,
  };
  camera = new THREE.PerspectiveCamera(
    90,
    viewerDims.w / 2 / viewerDims.h,
    0.1,
    1000
  );
  camera.position.set(10, 10, 10);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  scene.background = new THREE.Color(0xf0f0f0);
  addObjToScene(new THREE.AmbientLight(0xffffff, 0.3));

  const lightGroup = new THREE.Group();
  const helper = new THREE.Box3Helper(
    new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(2, 2, 2)),
    0x000000
  );
  helper.position.set(0, 0, 0);
  addObjToGroup(helper, lightGroup, true);

  const light1 = new THREE.PointLight(0xffffff, 0.8);
  light1.position.set(1, 1, 1);
  addObjToGroup(light1, lightGroup, true);

  lightGroup.position.set(10, 75, 10);
  addObjToScene(lightGroup);

  const gridHelper = new THREE.GridHelper(10, 10, 0x00ffff, 0xff00ff);
  gridHelper.position.set(0, -10, 0);
  addObjToScene(gridHelper, true);

  const geometry = new THREE.BoxBufferGeometry(1, 1, 1);
  const colors = [
    0x00ff00, 0x44ff00, 0x00ff88, 0x88ff00, 0x00ffcc, 0xccff00, 0x00ffee,
  ];
  colors.forEach((c, idx) => {
    const cube = new THREE.Mesh(
      geometry,
      new THREE.MeshLambertMaterial({ color: c })
    );
    cube.position.set(idx * 2, 0, idx);
    addObjToScene(cube);
  });

  stereoCam = new THREE.StereoCamera();
  stereoCam.update(camera);
  stereoCam.eyeSep = 0.5;
  console.log(stereoCam);

  let renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(viewerDims.w, viewerDims.h);

  // let controls = new TransformControls(camera, renderer.domElement);
  let controls = new OrbitControls(camera, renderer.domElement);

  el.appendChild(renderer.domElement);
  renderer.domElement.addEventListener('pointermove', (ev) => {
    // calculate pointer position in normalized device coordinates
    // (-1 to +1) for both components
    pointer.y = -(ev.offsetY / viewerDims.h) * 2 + 1;
    pointer.x = (ev.offsetX / viewerDims.w) * 2 - 1;
  });
  renderer.domElement.addEventListener('click', (ev) => {
    if (intersectedObj?.type == 'Mesh') console.log(intersectedObj.uuid);
  });
  render();

  function render() {
    camera.lookAt(scene.position);
    camera.updateMatrixWorld();

    checkIntersections();

    renderer.clear();
    renderer.render(scene, camera);

    {
      // we need to manually update camera matrix
      // because it will not be passed directly to
      // renderer.render were it would normally be
      // updated

      camera.updateWorldMatrix();
      stereoCam.update(camera);

      const size = new THREE.Vector2();
      renderer.getSize(size);

      renderer.setScissorTest(true);

      renderer.setScissor(0, 0, size.width / 2, size.height);
      renderer.setViewport(0, 0, size.width / 2, size.height);
      renderer.render(scene, stereoCam.cameraL);

      renderer.setScissor(size.width / 2, 0, size.width / 2, size.height);
      renderer.setViewport(size.width / 2, 0, size.width / 2, size.height);
      renderer.render(scene, stereoCam.cameraR);

      renderer.setScissorTest(false);
    }

    window.requestAnimationFrame(render, renderer.domElement);
  }
}

export default function useThree() {
  return {
    attachAndRender,
    addObjToScene,
    addObjToGroup,
  };
}
