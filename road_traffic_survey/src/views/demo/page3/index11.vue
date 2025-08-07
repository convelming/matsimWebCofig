<!-- index10 -->
<template>
  <div id="mapRoot"></div>
</template>

<script>
import { MyMap, MapLayer, MAP_LAYER_STYLE, MAP_EVENT } from "@/mymap/index.js";
import * as THREE from "three";

import { STLLoader } from "three/addons/loaders/STLLoader.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { Birds } from "./layer4/Birds.js";

export default {
  name: "index10",
  props: {},
  components: {},
  computed: {},
  watch: {},
  data() {
    return {};
  },
  created() {},
  async mounted() {
    this.initMap();
  },
  beforeDestroy() {
    if (this._Map) this._Map.dispose();
  },
  methods: {
    initMap() {
      this._Map = new MyMap({
        rootId: "mapRoot",
        center: [12589820.87789668, 2528880.8548412393],
        zoom: 15,
        minPitch: -90,
        // mapZoomHeight: 600,
        enableRotate: true,
      });

      this._MapLayer = new MapLayer({ tileClass: MAP_LAYER_STYLE[MAP_LAYER_STYLE.length - 1], zIndex: -1 });
      this._Map.addLayer(this._MapLayer);

      this._Birds = new Birds(this._Map.renderer);
      this._Map.world.add(this._Birds);
      this._Map.addEventListener(MAP_EVENT.LAYER_BEFORE_RENDER, () => {
        this._Birds.beforeRender();
      });
      this._Birds.position.set(0, 0, 100000);

      new STLLoader().load(process.env.VUE_APP_BASE_API + "/models/无人机2.stl", (geometry) => {
        const m4 = new THREE.Matrix4().makeScale(1, 1, 1);
        // m4.multiply(new THREE.Matrix4().makeRotationZ(Math.PI / 2));
        m4.multiply(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
        geometry.applyMatrix4(m4);
        const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: "#275994" }));
        this._Map.world.add(mesh);
      });
      const ma1 = new THREE.MeshStandardMaterial({ color: "#275994" });
      const ma2 = new THREE.MeshStandardMaterial({ color: "#999", wireframe: true, wireframeLinewidth: 2 });

      new GLTFLoader().load(process.env.VUE_APP_BASE_API + "/models/无人机.glb", (gltf) => {
        let lxjs = [];
        gltf.scene.traverse((child) => {
          console.log(child.isMesh);
          if (child.isMesh) {
            child.material = ma1;
            child.renderOrder = 1;
            const mesh = child.clone();
            mesh.material = ma2;
            mesh.renderOrder = 2;
            child.parent.add(mesh);

            if (String(child.name || "").includes("螺旋桨")) {
              lxjs.push(child);
              lxjs.push(mesh);
            }
          }
        });

        setInterval(() => {
          for (const mesh of lxjs) {
            mesh.rotation.z += Math.PI / 30;
            if (mesh.rotation.z >= 2 * Math.PI) mesh.rotation.z = 0;
          }
          // gltf.scene.position.z += 1;
          // this._Birds.position.copy(gltf.scene.position);
        }, 1000 / 60);

        console.log(gltf);
        gltf.scene.position.set(0, 0, 100);
        this._Birds.position.copy(gltf.scene.position);
        // gltf.scene.scale.set(10, 10, 10);
        this._Map.world.add(gltf.scene);
      });
    },
  },
};
</script>

<style lang="scss" scoped>
#mapRoot {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>
