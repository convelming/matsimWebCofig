<!-- index10 -->
<template>
  <div>
    <div id="mapRoot"></div>
    <div id="mapRoot2" ref="mapRoot2"></div>
  </div>
</template>

<script>
import { MyMap, MapLayer, MAP_LAYER_STYLE, MAP_EVENT, MOUSE_BUTTONS } from "@/mymap/index.js";
import * as THREE from "three";

import { STLLoader } from "three/addons/loaders/STLLoader.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { Birds } from "./layer4/Birds2.js";

import { WGS84ToMercator } from "@/mymap/utils/LngLatUtils";
import JSZip from "jszip";
import { UAVListLayer } from "./layer4/UAVListLayer2";

export default {
  name: "index10",
  props: {},
  components: {},
  computed: {},
  watch: {},
  data() {
    return {
      time: 100,
      lockSelect: true,
    };
  },
  created() {},
  async mounted() {
    // await this.loadMapData();
    await this.initMap();
  },
  beforeDestroy() {
    if (this._Map) this._Map.dispose();
  },
  methods: {
    async loadMapData() {
      this.loading = true;
      let zip, pageConfig;
      const { fileName, onlyLoad } = this.$route.query;
      try {
        const url = fileName ? `${process.env.VUE_APP_DEMO_SERVER}/${fileName}` : "/data.zip";
        console.log(url);
        const response = await fetch(url);

        const blob = await response.blob();
        zip = await JSZip.loadAsync(blob);

        const config = await zip.file("config.json").async("string");
        pageConfig = JSON.parse(config);
      } catch (error) {
        console.log(error);
        pageConfig = {};
      }
      console.log(pageConfig);
      await this.initMap(pageConfig.mapConfig);
      console.log("loaded map");
      console.log(onlyLoad);
      if (onlyLoad) {
        const list = String(onlyLoad).split(",");
        const _pageConfig = {
          network: list.includes("tif") ? pageConfig.tif : null,
          network: list.includes("network") ? pageConfig.network : null,
          networkXmlUrl: list.includes("networkXmlUrl") ? pageConfig.networkXmlUrl : null,
          paths: list.includes("paths") ? pageConfig.paths : null,
          build: list.includes("build") ? pageConfig.build : null,
          pink: list.includes("pink") ? pageConfig.pink : null,
        };
        console.log(_pageConfig);
        pageConfig = _pageConfig;
      }
      try {
        if (pageConfig.tif && zip.file(pageConfig.tif)) {
          await zip
            .file(pageConfig.tif)
            .async("arraybuffer")
            .then((array) => {
              return this._TileLayer.setTif(array);
            });
          console.log("loaded tif");
        }
        if (pageConfig.network && zip.file(pageConfig.network)) {
          await Promise.all([
            zip
              .file(pageConfig.network + "/node")
              .async("arraybuffer")
              .then(arrayToFloat64),
            zip
              .file(pageConfig.network + "/link")
              .async("arraybuffer")
              .then(arrayToFloat64),
            zip
              .file(pageConfig.network + "/node_id")
              .async("string")
              .then(JSON.parse),
            zip
              .file(pageConfig.network + "/link_id")
              .async("string")
              .then(JSON.parse),
          ]).then(([nodes, links, nodesId, linksId]) => {
            const network = Network.fromArray(nodes, links);
            this._Network3DLayer.setNetwork(network);
            this._nodesId = nodesId;
            this._linksId = linksId;
            this._Network3DLayer.addEventListener(MAP_EVENT.HANDLE_PICK_LEFT, (e) => {
              if (e.data > this._nodesId.length) {
                alert(`linkId:  ${this._linksId[e.data - this._nodesId.length]}`);
              } else {
                alert(`nodeId:  ${this._nodesId[e.data]}`);
              }
            });
          });
          console.log("loaded network");
        } else if (pageConfig.networkXmlUrl && zip.file(pageConfig.networkXmlUrl)) {
          await zip
            .file(pageConfig.networkXmlUrl)
            .async("string")
            .then((xml) => {
              const network = Network.fromXml(xml);
              this._Network3DLayer.setNetwork(network);
            });
          console.log("loaded networkXmlUrl");
        }
        if (pageConfig.paths && zip.file(pageConfig.paths)) {
          await zip
            .file(pageConfig.paths)
            .async("string")
            .then((xml) => {
              const paths = [];
              const list = Object.entries(JSON.parse(xml));
              for (const v of list) {
                for (const v1 of v[1]) {
                  const [x, y] = WGS84ToMercator(v1[0], v1[1]);
                  v1[0] = x;
                  v1[1] = y;
                }
                paths.push({ id: v[0], nodes: v[1], center: v[1][0] });
              }
              this._UAVPaths = paths;
              this._UAVListLayer.setPaths(this._UAVPaths, this.UAVPathClassName);
              setInterval(() => {
                this.time += 1 / 60;
                this._UAVListLayer.setTime(this.time);
              }, 1000 / 60);
            });
          console.log("loaded paths");
        }
        if (pageConfig.build && zip.file(pageConfig.build)) {
          await zip
            .file(pageConfig.build)
            .async("string")
            .then(parserGeoJSON)
            .then((json) => {
              this._Build3DLayer.setData(json, pageConfig.buildJzgdKey, pageConfig.buildHbgdKey);
            });
          console.log("loaded build");
        }
        if (pageConfig.pink && zip.file(pageConfig.pink)) {
          await zip
            .file(pageConfig.pink)
            .async("string")
            .then(JSON.parse)
            .then((json) => {
              this._PinkLayer.setPinkList(json);
            });
          console.log("loaded pink");
        }
      } catch (error) {
        console.log(error);
      }
      this.loading = false;
    },
    initMap(
      mapConfig = {
        center: [12613317.745000001, 2649719.39],
        zoom: 13.5,
        mapZoomHeight: 300,
        background: "#1b1b1b",
        pitch: 30,
        rotation: -10,
        enableRotate: true,
      }
    ) {
      this._Map = new MyMap({
        rootId: "mapRoot",
        ...mapConfig,
        background: "#1b1b1b",
        mapZoomHeight: 300,
        mouseButtons: MOUSE_BUTTONS.RIGHT,
        // center: [12598360.73, 2640607.15],
      });

      // this._MapLayer = new MapLayer({ tileClass: MAP_LAYER_STYLE[MAP_LAYER_STYLE.length - 1], zIndex: -1 });
      this._MapLayer = new MapLayer({ tileClass: MAP_LAYER_STYLE[0], zIndex: -1 });
      // this._Map.addLayer(this._MapLayer);

      this._UAVListLayer = new UAVListLayer({
        zIndex: 300,

        linkWidth: 1,
        selectLinkWidth: 5,
        linkColor: "#D8D8D8",
        selectLinkColor: "#FF7B00",

        nodeSize: 5,
        selectNodeSize: 10,
        nodeColor: "#D8D8D8",
        selectNodeColor: "#FF7B00",

        time: this.time,
        lockSelect: this.lockSelect,
        uavColor: "#53e7ef",
        selectUavColor: "#ff2c08",
        rootDoc: this.$refs.mapRoot2,
      });
      this._Map.addLayer(this._UAVListLayer);

      this._Birds = new Birds(this._Map.renderer);
      this._Birds.position.set(0, 0, 0);
      // this._Birds.scale.set(0.5, 0.5, 0.5);
      this._Map.world.add(this._Birds);
      this._Map.addEventListener(MAP_EVENT.LAYER_BEFORE_RENDER, () => {
        this._Birds.render();
      });

      new OBJLoader().load(process.env.VUE_APP_BASE_API + "/models/Bus.obj", (object) => {
        console.log(object);
        this._Map.world.add(object);
      });

      // new STLLoader().load(process.env.VUE_APP_BASE_API + "/models/Bus.stl", (geometry) => {
      //   const m4 = new THREE.Matrix4().makeScale(1000, 1000, 1000);
      //   // m4.multiply(new THREE.Matrix4().makeRotationZ(Math.PI / 2));
      //   // m4.multiply(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
      //   geometry.applyMatrix4(m4);
      //   console.log(geometry);
        
      //   const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: "#275994", map: new THREE.TextureLoader().load(process.env.VUE_APP_BASE_API + "/models/Bus.png") }));
      //   this._Map.world.add(mesh);
      // });

      // new STLLoader().load(process.env.VUE_APP_BASE_API + "/models/无人机2.stl", (geometry) => {
      //   const m4 = new THREE.Matrix4().makeScale(1, 1, 1);
      //   // m4.multiply(new THREE.Matrix4().makeRotationZ(Math.PI / 2));
      //   m4.multiply(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
      //   geometry.applyMatrix4(m4);
      //   const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: "#275994" }));
      //   this._Map.world.add(mesh);
      // });
      // const ma1 = new THREE.MeshStandardMaterial({ color: "#275994" });
      // const ma2 = new THREE.MeshStandardMaterial({ color: "#999", wireframe: true, wireframeLinewidth: 2 });

      // new GLTFLoader().load(process.env.VUE_APP_BASE_API + "/models/无人机.glb", (gltf) => {
      //   gltf.lxjs = [];
      //   gltf.birds = new Birds(this._Map.renderer);
      //   gltf.scene.add(gltf.birds);

      //   gltf.scene.traverse((child) => {
      //     if (child.isMesh) {
      //       child.material = ma1;
      //       if (String(child.name || "").includes("螺旋桨")) {
      //         gltf.lxjs.push(child);
      //       }
      //     }
      //   });

      //   gltf.interval = setInterval(() => {
      //     for (const mesh of gltf.lxjs) {
      //       mesh.rotation.z += (Math.PI * 2) / 60;
      //       if (mesh.rotation.z >= 2 * Math.PI) mesh.rotation.z = 0;
      //     }
      //     gltf.birds.render();
      //   }, 1000 / 60);
      //   gltf.scene.rotation.z = Math.PI / 2;
      //   gltf.scene.position.set(0, 0, 1000);

      //   this._Map.world.add(gltf.scene);
      // });
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

#mapRoot2 {
  position: fixed;
  z-index: 100;
  top: 0;
  left: 0;
  width: 30vw;
  height: 30vh;
  overflow: hidden;
}
</style>
