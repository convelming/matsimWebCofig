<template>
  <div id="threeId" ref="elementRef"></div>
</template>

<script setup lang="ts">
import { checkboxGroupEmits } from "element-plus";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ref, onMounted } from "vue";
let width, height;
let scene, camera, renderer, controls;
let spotLight, dirLight, torusKnot, ground;
let torusMaterial;
const elementRef = ref(null);
onMounted(() => {
  const element = elementRef.value;
  width = element.offsetWidth;
  height = element.offsetHeight;
  initScene();
  initLights();
  initMeshes();
  enableShadow();
  initCameraHelper();
  enableCliping();
  render();
});
function initScene() {
  // 初始化场景: 创建场景，相机，物体，渲染器
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x808080);
  camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
  camera.position.set(10, 5, 10);
  scene.add(camera);
  // 三维坐标
  // const axesHelper = new THREE.AxesHelper(40)
  // scene.add(axesHelper)
  // antialias：是否执行抗锯齿
  renderer = new THREE.WebGLRenderer({ antialias: true });
  // 设备像素比
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  elementRef.value.appendChild(renderer.domElement);
  controls = new OrbitControls(camera, renderer.domElement);
}
function initLights() {
  scene.add(new THREE.AmbientLight(0x404040));

  spotLight = new THREE.SpotLight(0xffffff);
  spotLight.name = "Spot light";
  spotLight.angle = Math.PI / 5;
  spotLight.penumbra - 0.3;
  spotLight.position.set(10, 10, 5);
  scene.add(spotLight);

  dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.name = "Dir light";
  dirLight.position.set(0, 10, 0);
  scene.add(dirLight);
}
function initMeshes() {
  // torus 圆环扭结几何体
  let geomery = new THREE.TorusKnotGeometry(1, 0.2, 200, 20);
  torusMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    // 设置物体的正背面都渲染
    side: THREE.DoubleSide,
  });
  torusKnot = new THREE.Mesh(geomery, torusMaterial);
  torusKnot.position.y = 2;
  scene.add(torusKnot);

  // ground
  geomery = new THREE.BoxGeometry(10, 0.15, 10);
  let material = new THREE.MeshPhongMaterial({
    color: 0xa0adaf,
    shininess: 150,
    specular: 0x111111,
  });
  ground = new THREE.Mesh(geomery, material);
  ground.scale.multiplyScalar(3);
  scene.add(ground);
}
function enableShadow() {
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.BasicShadowMap;

  spotLight.castShadow = true;
  dirLight.castShadow = true;

  torusKnot.castShadow = true;
  torusKnot.receiveShadow = true;

  ground.castShadow = false;
  ground.receiveShadow = true;
}
function initCameraHelper() {
  spotLight.shadow.camera.near = 8;
  spotLight.shadow.camera.far = 30;
  spotLight.shadow.mapSize.width = 1024;
  spotLight.shadow.mapSize.height = 1024;

  dirLight.shadow.camera.near = 1;
  dirLight.shadow.camera.far = 10;
  dirLight.shadow.camera.right = 15;
  dirLight.shadow.camera.left = -15;
  dirLight.shadow.camera.top = 15;
  dirLight.shadow.camera.bottom = -15;
}
function enableCliping() {
  // 创建一条线用来剪切圆环扭结
  const plane = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0.5);
  const plane2 = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 1);
  // localclipping
  torusMaterial.clippingPlanes = [plane, plane2];
  // 设置阴影也要跟着变化
  torusMaterial.clipShadows = true;
  renderer.localClippingEnabled = true;

  //globalClipping 这个效果是renderer剪切
  // renderer.clippingPlanes = [plane]
}
function render() {
  requestAnimationFrame(render);
  controls.update();
  renderer.render(scene, camera);
}
</script>

<style scoped>
#threeId {
  width: 100%;
  height: 100%;
}
</style>
