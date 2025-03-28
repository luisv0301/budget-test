import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import GUI from "lil-gui";

/**
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/*Load model
const loader = new FBXLoader();
loader.load(
  "/model/taquilla-single.fbx",
  (fbx) => {
    fbx.scale.setScalar(0.07); // Adjust this value as needed
    fbx.position.set(4, 6, 0);

    // Add it to the scene
    scene.add(fbx);

    console.log("el object", fbx);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);
*/

/**
 * Floor
 */
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial({
    color: "#444444",
    metalness: 0,
    roughness: 0.5,
  })
);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI * 0.5;
scene.add(floor);

floor.userData.ground = true;

//Object

const object = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial({
    color: "#ff0000",
    metalness: 0,
    roughness: 0.5,
  })
);
object.position.x = 2;
object.position.y = 1;
object.receiveShadow = true;
scene.add(object);

object.userData.draggable = true;
object.userData.name = "CYLINDER";

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(2, 2, 2);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0.75, 0);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

//Raycaster

const raycaster = new THREE.Raycaster(); // create once
const clickMouse = new THREE.Vector2(); // create once
const moveMouse = new THREE.Vector2(); // create once
var draggable;

function intersect(pos) {
  raycaster.setFromCamera(pos, camera);
  return raycaster.intersectObjects(scene.children);
}

window.addEventListener("click", (event) => {
  if (draggable != null) {
    console.log(`dropping draggable ${draggable.userData.name}`);
    draggable = null;
    return;
  }

  // THREE RAYCASTER
  clickMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  clickMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  const found = intersect(clickMouse);
  if (found.length > 0) {
    if (found[0].object.userData.draggable) {
      draggable = found[0].object;
      console.log(`found draggable ${draggable.userData.name}`);
    }
  }
});

window.addEventListener("mousemove", (event) => {
  moveMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  moveMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

function dragObject() {
  if (draggable != null) {
    const found = intersect(moveMouse);
    if (found.length > 0) {
      for (let o of found) {
        if (!o.object.userData.ground) continue;

        draggable.position.x = o.point.x;
        draggable.position.z = o.point.z;
      }
    }
  }
}

//Color
document.querySelector(".verde").addEventListener("click", () => {
  console.log("verde");
  object.material.color.set(0x00ff00);
});

document.querySelector(".rojo").addEventListener("click", () => {
  console.log("rojo");
  object.material.color.set("#ff0000");
});

//Size
document.querySelector(".normal").addEventListener("click", () => {
  console.log("normal");
  object.scale.set(1, 1, 1);
});

document.querySelector(".big").addEventListener("click", () => {
  console.log("big");
  object.scale.set(1.5, 1.5, 1.5);
});

//rotation
const rotationSlider = document.getElementById("rotation-slider");
const rotationValue = document.getElementById("rotation-value");

rotationSlider.addEventListener("input", function (e) {
  const degrees = parseInt(e.target.value);
  rotationValue.textContent = degrees + "°";

  // Convert degrees to radians for Three.js rotation
  const radians = THREE.MathUtils.degToRad(degrees);
  object.rotation.y = radians;
});

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  // Update controls
  //controls.update();
  dragObject();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
