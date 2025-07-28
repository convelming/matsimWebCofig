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

      new STLLoader().load(process.env.VUE_APP_BASE_API + "/models/无人机.stl", (geometry) => {
        const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: "#275994" }));
        this._Map.world.add(mesh);
      });
      new GLTFLoader().load(process.env.VUE_APP_BASE_API + "/models/无人机.glb", (gltf) => {
        let lxjs = [];
        gltf.scene.traverse((child) => {
          console.log(child.isMesh);
          if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({ color: "#275994" });
          }
          if (child.isMesh && String(child.name || "").includes("螺旋桨")) {
            lxjs.push(child);
          }
        });

        setInterval(() => {
          for (const mesh of lxjs) {
            mesh.rotation.z += Math.PI / 30;
            if (mesh.rotation.z >= 2 * Math.PI) mesh.rotation.z = 0;
          }
        }, 1000 / 60);
        
        console.log(gltf);
        gltf.scene.position.set(0, 0, 100);
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
