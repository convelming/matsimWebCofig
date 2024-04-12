<template>
  <div>
    <div id="container"></div>
  </div>
</template>
<script>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { BloomPass } from "three/examples/jsm/postprocessing/BloomPass";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass";

export default {
  data() {
    return {};
  },
  mounted() {
    this.init();
  },
  methods: {
    // 初始化
    init() {
      const el = document.getElementById("container");
      this._scene = new THREE.Scene();
      this._scene.background = new THREE.Color("#fff");
      
      this._bloomScene = new THREE.Scene();

      this._camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      this._camera.position.set(0, 5, 0);
      this._camera.lookAt(new THREE.Vector3(0, 0, 0));

      this._renderer = new THREE.WebGLRenderer();
      this._renderer.setSize(window.innerWidth, window.innerHeight);
      el.appendChild(this._renderer.domElement);

      const geometry = new THREE.BoxGeometry(2, 2, 2);
      const material = new THREE.MeshBasicMaterial({ color: "#00ffff" });
      this._cube = new THREE.Mesh(geometry, material);
      this._cube2 = new THREE.Mesh(geometry, material);
      this._cube2.position.set(5, 0, 0);

      this._scene.add(this._cube);
      this._bloomScene.add(this._cube2);
      
      let bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0, 1, 0);
      bloomPass.renderToScreen = false;

      this._bloomComposer

      this._composer = new EffectComposer(this._renderer);
      this._composer.setSize(window.innerWidth, window.innerHeight);
      this._composer.addPass(new RenderPass(this._scene, this._camera));
      // this._composer.addPass(bloomPass);
      this._composer.addPass(new UnrealBloomPass());

      new OrbitControls(this._camera, this._renderer.domElement);

      this.requestAnimationFrame();
    },
    requestAnimationFrame() {
      this._composer.render();
      requestAnimationFrame(this.requestAnimationFrame);
    },
  },
};
</script>
