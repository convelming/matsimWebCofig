<template>
  <div class="app">
    <div id="three"></div>
    <div class="btns">
      <button @click="setLayer(0)">layers.set(0)</button>
      <button @click="setLayer(1)">layers.set(1)</button>
      <button @click="setLayer(2)">layers.set(2)</button>
      <br>
      <button @click="enableLayer(0)">layers.enable(0)</button>
      <button @click="enableLayer(1)">layers.enable(1)</button>
      <button @click="enableLayer(2)">layers.enable(2)</button>
      <br>
      <button @click="toggleLayer(0)">layers.toggle(0)</button>
      <button @click="toggleLayer(1)">layers.toggle(1)</button>
      <button @click="toggleLayer(2)">layers.toggle(2)</button>
      <br>
      <button @click="enableAll">layers.enableAll()</button>
      <button @click="reset">重置</button>
    </div>
  </div>
</template>
 
<script setup>
import { onMounted, ref } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
 
const camera = ref(null)
onMounted(() => {
  const threeContainer = document.getElementById('three')
  // 创建场景
  const scene = new THREE.Scene()
  // 创建相机
  camera.value = new THREE.PerspectiveCamera( 75, threeContainer.offsetWidth / threeContainer.offsetHeight, 0.1, 1000 )
  // const camera = new THREE.OrthographicCamera(
  //   -5*threeContainer?.offsetWidth / threeContainer?.offsetHeight, 
  //   5*threeContainer?.offsetWidth / threeContainer?.offsetHeight, 
  //   5, -5, 
  //   0.1, 
  //   1000 
  // ) //正交视角
  // 设置相机位置
  camera.value.position.set(0, 0, 10)
  // 将相机添加到场景中
  scene.add(camera.value)
 
  // 创建渲染器
  const renderer = new THREE.WebGLRenderer({
    antialias: true //开启抗锯齿
  })
  // 设置渲染的尺寸和大小
  renderer.setSize(threeContainer.offsetWidth, threeContainer.offsetHeight)
  // 将webgl渲染的canvas内容添加到DOM容器
  threeContainer.appendChild(renderer.domElement)
 
 
  /*创建几何体*/ 
  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1) //几何体对象
  const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 }) //材质
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial) //根据几何体和材质创建物体
  // 将几何体添加到场景当中
  scene.add(cube)
  cube.layers.set(0)
 
  const cubeGeometry1 = new THREE.BoxGeometry(1, 1, 1) //几何体对象
  const cubeMaterial1 = new THREE.MeshBasicMaterial({ color: 'hotpink' }) //材质
  const cube1 = new THREE.Mesh(cubeGeometry1, cubeMaterial1) //根据几何体和材质创建物体
  // 将几何体添加到场景当中
  scene.add(cube1)
  cube1.position.set(1,0,0)
  cube1.layers.set(1)
 
  const cubeGeometry2 = new THREE.BoxGeometry(1, 1, 1) //几何体对象
  const cubeMaterial2 = new THREE.MeshBasicMaterial({ color: 'skyblue' }) //材质
  const cube2 = new THREE.Mesh(cubeGeometry2, cubeMaterial2) //根据几何体和材质创建物体
  // 将几何体添加到场景当中
  scene.add(cube2)
  cube2.position.set(2,0,0)
  cube2.layers.set(2)
 
  // 添加坐标轴辅助器
  const axesHelper = new THREE.AxesHelper(5)
  scene.add(axesHelper)
  axesHelper.layers.enableAll()
 
  // 轨道控制器
  const controls  = new OrbitControls(camera.value, renderer.domElement)
  // 循环渲染
  function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera.value)
    controls.update()
  }
  animate()
 
  window.addEventListener("resize", () => {
    // 更新摄像头
    camera.value.aspect = threeContainer.offsetWidth / threeContainer.offsetHeight
    //   更新摄像机的投影矩阵
    camera.value.updateProjectionMatrix()
    //   更新渲染器
    renderer.setSize(threeContainer.offsetWidth, threeContainer.offsetHeight)
    //   设置渲染器的像素比
    renderer.setPixelRatio(threeContainer.devicePixelRatio)
  })
})
 
const setLayer = (num) => {
  camera.value.layers.set(num)
}
const enableLayer = (num) => {
  camera.value.layers.enable(num)
}
const toggleLayer = (num) => {
  camera.value.layers.toggle(num)
}
const enableAll = () => {
  camera.value.layers.enableAll()
}
const reset = () => {
  camera.value.layers.disableAll()
  camera.value.layers.set(0)
}
</script>
 
<style lang="scss" scoped>
.app{
  width: 100vw;
  height: 100vh;
  position: relative;
  #three{
    width: 100%;
    height: 100%;
    background-color: skyblue;
  }
  .btns{
    position: absolute;
    top: 10px;
    right: 20px;
    button{
      cursor: pointer;
      margin-right: 10px;
      margin-top: 10px;
    }
  }
}
</style>