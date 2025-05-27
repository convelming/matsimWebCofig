<template>
  <div class="index">
    <div class="grid_root">
      <div class="Drawer_row">
        <div></div>
        <div class="mapBox">
          <div id="mapRoot"></div>
          <div class="box">
            <!-- <div class="title">控制面板</div> -->
            <div class="card">
              <el-form size="small" label-position="left">
                <el-row :gutter="0">
                  <!-- <el-col :span="12" :offset="0">
                  <el-form-item label="建筑：">
                    <el-switch v-model="showBuild" :active-value="true" :inactive-value="false"></el-switch>
                  </el-form-item>
                </el-col>
                <el-col :span="12" :offset="0">
                  <el-form-item label="地面路网：">
                    <el-switch v-model="showNetwork2D" :active-value="true" :inactive-value="false"></el-switch>
                  </el-form-item>
                </el-col> -->
                  <el-col :span="12" :offset="0">
                    <el-form-item label="空中路网：">
                      <el-switch v-model="showNetwork3DLink" :active-value="true" :inactive-value="false"></el-switch>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12" :offset="0">
                    <el-form-item label="空中路网节点：">
                      <el-switch v-model="showNetwork3DNode" :active-value="true" :inactive-value="false"></el-switch>
                    </el-form-item>
                  </el-col>
                  <!-- <el-col :span="12" :offset="0">
                    <el-form-item label="地形图：">
                      <el-switch v-model="showTifLayer" :active-value="true" :inactive-value="false"></el-switch>
                    </el-form-item>
                  </el-col> -->
                  <el-col :span="12" :offset="0">
                    <el-form-item label="实体3维：">
                      <el-switch v-model="showOBJLayer" :active-value="true" :inactive-value="false"></el-switch>
                    </el-form-item>
                  </el-col>
                  <el-col :span="24" :offset="0">
                    <div style="display: flex; align-items: center; justify-content: space-between">
                      <span class="el-form-item__label">地形图透明度：</span>
                      <el-slider style="margin: 0 15px; flex: 1" v-model="tifOpacity" :min="0" :max="1" :step="0.01"></el-slider>
                    </div>
                  </el-col>
                  <el-col :span="24" :offset="0">
                    <el-form-item label-width="0">
                      <el-button size="small" @click="play">播放</el-button>
                      <el-button size="small" @click="stop">暂停</el-button>
                      <el-button size="small" @click="reset">重置</el-button>
                      <span style="margin-left: 20px">锁定视角：</span><el-switch v-model="lockSelect" :active-value="true" :inactive-value="false"></el-switch>
                    </el-form-item>
                  </el-col>
                  <el-col :span="24" :offset="0">
                    <div style="display: flex; align-items: center; justify-content: space-between">
                      <span class="el-form-item__label" style="width: 120px">时间：{{ time }}</span>
                      <el-slider style="margin: 0 15px; flex: 1" :value="time" @input="setTime" :min="minTime" :max="maxTime"></el-slider>
                    </div>
                  </el-col>
                  <template v-if="playDetail">
                    <el-col :span="12" :offset="0">
                      <el-form-item label="时间：">{{ Number(playDetail.time).toFixed(0) }} s</el-form-item>
                    </el-col>
                    <el-col :span="12" :offset="0">
                      <el-form-item label="速度：">{{ Number(playDetail.speed).toFixed(3) }} m/s</el-form-item>
                    </el-col>
                    <el-col :span="24" :offset="0">
                      <el-form-item label="位置：">{{ Number(playDetail.x).toFixed(2) }}, {{ Number(playDetail.y).toFixed(2) }}, {{ Number(playDetail.z).toFixed(2) }}</el-form-item>
                    </el-col>
                  </template>
                </el-row>
              </el-form>
            </div>
          </div>
        </div>
        <div></div>
      </div>
    </div>
  </div>
</template>

<script>
import { MyMap, MAP_EVENT } from "@/mymap/index.js";
import { WGS84ToMercator } from "@/mymap/utils/LngLatUtils";
import { TifLayer } from "./layer/TifLayer";
import { Network3DLayer, Network } from "./layer/Network3DLayer";
import { UAVListLayer } from "./layer/UAVListLayer";
import { Build3DLayer } from "./layer/Build3DLayer";
import { PinkLayer } from "./layer/PinkLayer";
import { MapLayer, MapTile } from "../page4/layer/MapLayer.js";

import NewClock from "@/components/NewClock/index.vue";

import JSZip from "jszip";

import GeoJSONLayerWorker from "./layer/GeoJSONLayer.worker";

import { TileLayer } from "./layer/TileLayer.js";
import { OBJLayer } from "./layer/OBJLayer.js";

import * as GeoTIFF from "geotiff";

function parserGeoJSON(text) {
  return new Promise((resolve, reject) => {
    const worker = new GeoJSONLayerWorker();
    worker.onmessage = (event) => {
      const { range, center, pointArray, lineArray, polygonArray, propertiesListArray, propertiesLabelsArray } = event.data;

      const textDecoder = new TextDecoder();
      const propertiesLabels = JSON.parse(textDecoder.decode(propertiesLabelsArray));
      const propertiesList = JSON.parse(textDecoder.decode(propertiesListArray));

      resolve({ range, center, pointArray, lineArray, polygonArray, propertiesList, propertiesLabels });
      worker.terminate();
    };
    worker.addEventListener("error", (error) => {
      reject(error);
      worker.terminate();
    });

    let textEncoder = new TextEncoder();
    const array = new Int8Array(textEncoder.encode(text));
    worker.postMessage(array, [array.buffer]);
  });
}

function arrayToFloat64(arraybuffer) {
  const dataView = new DataView(arraybuffer);
  const array = [];
  for (let i = 0; i < dataView.byteLength; i += 8) {
    const value = dataView.getFloat64(i, false);
    array.push(value);
  }
  return array;
}

export default {
  components: {
    NewClock,
  },
  provide() {
    return {
      rootVue: this,
    };
  },
  computed: {},
  watch: {
    lockSelect: {
      handler(val) {
        this._UAVListLayer.lockSelect = val;
      },
    },
    showNetwork2D: {
      handler(val) {
        if (val) {
          this._Map.addLayer(this._NetworkLayer);
        } else {
          this._Map.removeLayer(this._NetworkLayer);
        }
      },
    },
    showNetwork3DNode: {
      handler(val) {
        this._Network3DLayer.setShowNode(val);
        this.loadNetwork();
      },
    },
    showNetwork3DLink: {
      handler(val) {
        this._Network3DLayer.setShowLink(val);
        this.loadNetwork();
      },
    },
    tifOpacity: {
      handler(val) {
        this._TifLayer.setOpacity(val);
        this._TileLayer.setOpacity(val);
      },
    },
    showTifLayer: {
      handler(val) {
        if (val) {
          this._Map.addLayer(this._TifLayer);
          this._Map.addLayer(this._TileLayer);
        } else {
          this._Map.removeLayer(this._TifLayer);
          this._Map.removeLayer(this._TileLayer);
        }
      },
    },
    showOBJLayer: {
      handler(val) {
        if (val) {
          this._Map.addLayer(this._OBJLayer);
        } else {
          this._Map.removeLayer(this._OBJLayer);
        }
      },
    },
  },
  data() {
    return {
      startPink: null,
      selectStartPink: false,
      endPink: null,
      selectEndPink: false,
      playDetail: null,
      lockSelect: false,
      buildLoading: false,
      networkloading: false,
      showBuild: false,
      showNetwork2D: false,
      showNetwork3DNode: false,
      showNetwork3DLink: false,
      showTifLayer: true,
      showOBJLayer: false,
      paths: {},
      selectPath: null,
      time: 0,
      minTime: 0,
      maxTime: 5000,
      tifOpacity: 1,
    };
  },
  created() {},
  async mounted() {
    this.initMap();
    this.loadPaths();
    this.loadPaths2();
    // this.loadTif();
    this.loadBuild();
    this.loadPink();
    // this.loadNetwork();
    this.loadNetwork3();
  },
  methods: {
    // 初始化地图
    async initMap() {
      this._Map = new MyMap({
        rootId: "mapRoot",
        center: [12716943.337189136, 2761023.0570991505],
        center: [12712568.18680353, 2760364.2506704303],
        // center: [12702456.02, 2753085.897],
        // zoom: 15,
        zoom: 13.5,
        mapZoomHeight: 600,
        pitch: 30,
        rotation: -10,
        enableRotate: true,
      });
      console.log(this._Map);

      // this._MapLayer = new MapLayer({ tileClass: MapTile, zIndex: -1 });
      // this._Map.addLayer(this._MapLayer);

      this._OBJLayer = new OBJLayer({ zIndex: 30, num: this.$route.query.num });
      if (this.showOBJLayer) this._Map.addLayer(this._OBJLayer);

      this._TifLayer = new TifLayer({ zIndex: 100, opacity: this.tifOpacity });
      if (this.showTifLayer) this._Map.addLayer(this._TifLayer);

      this._TileLayer = new TileLayer({ zIndex: 200, opacity: this.tifOpacity });
      if (this.showTifLayer) this._Map.addLayer(this._TileLayer);

      this._Network3DLayer = new Network3DLayer({
        zIndex: 200,
        usePick: true,
        showLink: this.showNetwork3DLink,
        showNode: this.showNetwork3DNode,
      });
      this._Map.addLayer(this._Network3DLayer);

      this._UAVListLayer = new UAVListLayer({
        zIndex: 300,
        lockSelect: this.lockSelect,
        event: {
          playing: (res) => {
            this.playDetail = res.data;
          },
        },
      });
      // this._Map.addLayer(this._UAVListLayer);

      this._UAVListLayer2 = new UAVListLayer({
        zIndex: 300,
        color: "red",
        lockSelect: this.lockSelect,
        event: {
          playing: (res) => {
            this.playDetail = res.data;
          },
        },
      });
      this._Map.addLayer(this._UAVListLayer2);

      this._Build3DLayer = new Build3DLayer({
        zIndex: 220,
        // buildColor: "#838385",
        buildColor: "#bbb",
      });
      this._Map.addLayer(this._Build3DLayer);

      this._PinkLayer = new PinkLayer({
        zIndex: 240,
      });
      this._Map.addLayer(this._PinkLayer);
    },
    async loadNetwork() {
      if (this._loadNetwork) return;
      this._loadNetwork = true;
      const response = await fetch(process.env.VUE_APP_BASE_API + "/demo/output_network.zip");
      if (response.ok) {
        const blob = await response.blob();
        const zip = await JSZip.loadAsync(blob);
        const xml = await zip.file("output_network.xml").async("string");
        console.time("new Network");
        const network = Network.fromXml(xml);
        console.timeEnd("new Network");
        this._Network3DLayer.setNetwork(network);
      } else {
        console.error(`HTTP error! status: ${response.status}`, response);
      }
    },
    async loadNetwork3() {
      if (this._loadNetwork) return;
      this._loadNetwork = true;
      const response = await fetch(process.env.VUE_APP_BASE_API + "/demo/network.zip");
      if (response.ok) {
        const blob = await response.blob();
        const zip = await JSZip.loadAsync(blob);
        const [nodes, links, nodesId, linksId] = await Promise.all([
          zip.file("node").async("arraybuffer").then(arrayToFloat64),
          zip.file("link").async("arraybuffer").then(arrayToFloat64),
          zip.file("node_id").async("string").then(JSON.parse),
          zip.file("link_id").async("string").then(JSON.parse),
          // zip.file(new RegExp(/[node]$/)).async("arraybuffer").then(arrayToFloat64),
          // zip.file(new RegExp(/[link]$/)).async("arraybuffer").then(arrayToFloat64),
          // zip.file(new RegExp(/[node_id]$/)).async("string").then(JSON.parse),
          // zip.file(new RegExp(/[link_id]$/)).async("string").then(JSON.parse),
        ]);
        const network = Network.fromArray(nodes, links);
        this._Network3DLayer.setNetwork(network);
        this._nodesId = nodesId;
        this._linksId = linksId;
        this._Network3DLayer.addEventListener(MAP_EVENT.HANDLE_PICK_LEFT, (e) => {
          console.log(e.data);
          if (e.data > this._nodesId.length) {
            alert(`linkId:  ${this._linksId[e.data - this._nodesId.length]}`);
          } else {
            alert(`nodeId:  ${this._nodesId[e.data]}`);
          }
        });
      } else {
        console.error(`HTTP error! status: ${response.status}`, response);
      }
    },
    async loadPaths() {
      const response = await fetch(process.env.VUE_APP_BASE_API + "/demo/leg(1).json");
      if (response.ok) {
        const xml = await response.text();
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
        this._UAVListLayer.setPaths(paths);
        this._paths = Object.entries(JSON.parse(xml));
      } else {
        console.error(`HTTP error! status: ${response.status}`, response);
      }
    },
    async loadPaths2() {
      const response = await fetch(process.env.VUE_APP_BASE_API + "/demo/leg3.json");
      if (response.ok) {
        const xml = await response.text();
        const paths = [];
        const list = Object.entries(JSON.parse(xml));
        console.log(list);
        for (const [k, v] of list) {
          const l1 = v.split(",");
          const l2 = l1.map((v2, i) => {
            const l3 = v2.split(" ");
            const [x, y] = WGS84ToMercator(l3[0], l3[1]);
            return [x, y, l3[2], i * 10];
          });
          paths.push({ id: k, nodes: l2, center: l2[0] });
        }
        this._UAVListLayer2.setPaths(paths);
        // this._paths = Object.entries(JSON.parse(xml));
      } else {
        console.error(`HTTP error! status: ${response.status}`, response);
      }
    },
    async loadTif() {
      const tif = await GeoTIFF.fromUrl(process.env.VUE_APP_BASE_API + "/demo/新丰县dem.tif");
      const tifImage = await tif.getImage();
      const tifImageData = await tifImage.readRasters({
        interleave: true,
      });
      const bbox = tifImage.getBoundingBox();
      const [x1, y1] = WGS84ToMercator(bbox[0], bbox[1]);
      const [x2, y2] = WGS84ToMercator(bbox[2], bbox[3]);
      // tifImage.getCanvasTexture();

      const image = {
        imgWidth: tifImage.getWidth(),
        imgHeight: tifImage.getHeight(),
        tl: [x1, y1],
        br: [x2, y2],
        center: [(x1 + x2) / 2, (y1 + y2) / 2],
        width: Math.abs(x2 - x1),
        height: Math.abs(y2 - y1),
        data: tifImageData,
      };
      this._TifLayer.setTifImage(image);
      // this._MapLayer.setTiff(tifImage);
    },
    async loadBuild() {
      // const response = await fetch(process.env.VUE_APP_BASE_API + "/demo/新丰县建筑DEM.geojson");
      const response = await fetch(process.env.VUE_APP_BASE_API + "/demo/新丰县buildingWithDem.geojson");
      if (response.ok) {
        const geoJsonData = await response.text().then(parserGeoJSON);
        this._Build3DLayer.setData(geoJsonData);
      } else {
        console.error(`HTTP error! status: ${response.status}`, response);
      }
    },
    async loadPink() {
      const response = await fetch(process.env.VUE_APP_BASE_API + "/demo/新丰县起降点wgs84_dem.json");
      if (response.ok) {
        const text = await response.text();
        this._PinkLayer.setPinkList(JSON.parse(text));

        this._pinks = JSON.parse(text);
        this.computedPathsAndPink();
      } else {
        console.error(`HTTP error! status: ${response.status}`, response);
      }
    },
    setTime(time) {
      if (time > this.maxTime) time = this.maxTime;
      this.time = Number(Number(time).toFixed(3));
      this._UAVListLayer.setTime(this.time);
    },
    play() {
      if (this._interval) clearInterval(this._interval);
      this._interval = setInterval(() => {
        if (this.time + 1 / 60 > this.maxTime) {
          this.stop();
        } else {
          this.setTime(this.time + (1 / 60) * 10);
        }
      }, 1000 / 60);
      this._Map.addLayer(this._UAVListLayer);
    },
    stop() {
      clearInterval(this._interval);
      this._interval = null;
      this._UAVListLayer.removeFromParent();
    },
    reset() {
      this.stop();
      this.setTime(0);
    },
    computedPathsAndPink() {
      return;
      if (!this._pinks || !this._paths) return;
      const list = [];
      for (const path of this._paths) {
        const obj = {};
        obj.id = path[0];
        obj.nodes = path[1];
        const [x1, y1] = obj.nodes[0];
        const [x2, y2] = obj.nodes[obj.nodes.length - 1];
        for (const pink of this._pinks) {
          const { wgs_lon: x, wgs_lat: y } = pink;
          console.log(Math.abs(x1 - x), Math.abs(y1 - y), Math.abs(x2 - x), Math.abs(y2 - y));
          const offset = 0.001;
          if (Math.abs(x1 - x) <= offset && Math.abs(y1 - y) <= offset) {
            obj.start = pink;
          }
          if (Math.abs(x2 - x) <= offset && Math.abs(y2 - y) <= offset) {
            obj.end = pink;
          }
        }
        list.push(obj);
      }
      console.log(list);
    },
  },
};
</script>

<style lang="scss" scoped>
.index {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;

  .grid_root {
    width: 100vw;
    height: 100vh;
  }

  .mapBox {
    position: relative;
    z-index: 20;

    #mapRoot {
      width: 100%;
      height: 100%;
    }
  }
}
.box {
  width: 500px;
  position: absolute;
  right: 0;
  top: 68px;
  z-index: 1500;
  background-color: #275994;
  user-select: none;
  color: #fff;
  .card {
    background-image: url("./data/card.svg");
    background-size: 100% 100%;
    padding: 25px;
  }
  .el-form {
    height: 200px;
    overflow-y: scroll;
    overflow-x: hidden;

    .el-form-item {
      margin-bottom: 8px;
      color: #fff;
      // color: orange;
    }
    ::v-deep {
      .el-form-item__label {
        color: #fff !important;
        font-size: 14px;
      }
    }
    &::-webkit-scrollbar {
      display: none;
    }
  }

  .title {
    height: 70px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: bold;
    margin: 8px 0;
    background-image: url("./data/title.svg");
    background-size: 100% 100%;
  }
}

.NewClock {
  position: absolute;
  right: 20px;
  top: 20px;
  z-index: 1000;
}
</style>
