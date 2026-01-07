<template>
  <div class="index">
    <div class="grid_root">
      <div class="Drawer_row">
        <div></div>
        <div class="mapBox">
          <div id="mapRoot"></div>
          <div class="box" style="width: 350px">
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
                </el-col>
                <el-col :span="24" :offset="0">
                  <div style="display: flex; align-items: center; justify-content: space-between">
                    <span style="font-size: 14px;  width: 110px">地形图透明度：</span>
                    <el-slider style="margin: 0 15px; flex: 1" v-model="tifOpacity" :min="0" :max="1" :step="0.01"></el-slider>
                  </div>
                </el-col> -->
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
                    <span style="font-size: 14px; width: 110px">时间：{{ time }}</span>
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
        <div></div>
      </div>
    </div>
  </div>
</template>

<script>
import { MyMap, MapLayer, MAP_LAYER_STYLE, MAP_EVENT } from "@/mymap/index.js";
import { WGS84ToMercator } from "@/mymap/utils/LngLatUtils";
import { TifLayer } from "./layer/TifLayer";
import { Network3DLayer, Network } from "./layer/Network3DLayer";
import { UAVListLayer } from "./layer/UAVListLayer";
import { Build3DLayer } from "./layer/Build3DLayer";
import { PinkLayer } from "./layer/PinkLayer";

import NewClock from "@/components/NewClock/index.vue";

import JSZip from "jszip";

import GeoJSONLayerWorker from "./layer/GeoJSONLayer.worker";

import { TileLayer } from "./layer/TileLayer.js";

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
      },
    },
    showNetwork3DLink: {
      handler(val) {
        this._Network3DLayer.setShowLink(val);
      },
    },
    tifOpacity: {
      handler(val) {
        this._TifLayer.setOpacity(val);
      },
    },
    showTifLayer: {
      handler(val) {
        if (val) {
          this._Map.addLayer(this._TifLayer);
        } else {
          this._Map.removeLayer(this._TifLayer);
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
      showNetwork3DNode: true,
      showNetwork3DLink: true,
      showTifLayer: true,
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
    this.loadTif();
    // this.loadNetwork();
    this.loadBuild();
    this.loadPink();
  },
  methods: {
    // 初始化地图
    async initMap() {
      this._Map = new MyMap({
        rootId: "mapRoot",
        // center: [12707787.79, 2759380.11],
        center: [12716943.337189136, 2761023.0570991505],
        zoom: 13.5,
        minPitch: -90,
        mapZoomHeight: 600,
      });
      console.log(this._Map);

      this._Map.cameraControls.enableRotate = true;
      // this._MapLayer = new MapLayer({ tileClass: MAP_LAYER_STYLE[MAP_LAYER_STYLE.length - 1], zIndex: -1 });
      // this._Map.addLayer(this._MapLayer);

      this._TileLayer = new TileLayer({ zIndex: 10 });
      this._Map.addLayer(this._TileLayer);

      // this._TifLayer = new TifLayer({ zIndex: 100, opacity: this.tifOpacity });
      // if (this.showTifLayer) this._Map.addLayer(this._TifLayer);

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
      this._Map.addLayer(this._UAVListLayer);

      this._Build3DLayer = new Build3DLayer({
        zIndex: 220,
        buildColor: "#838385",
      });
      this._Map.addLayer(this._Build3DLayer);

      this._PinkLayer = new PinkLayer({
        zIndex: 240,
      });
      this._Map.addLayer(this._PinkLayer);
    },
    async loadNetwork() {
      const response = await fetch(process.env.VUE_APP_DEMO_SERVER + "/output_network.zip");
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
    async loadPaths() {
      const response = await fetch(process.env.VUE_APP_DEMO_SERVER + "/leg(1).json");
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
      } else {
        console.error(`HTTP error! status: ${response.status}`, response);
      }
    },
    async loadTif() {
      // const tif = await GeoTIFF.fromUrl(process.env.VUE_APP_DEMO_SERVER + "/新丰县dem.tif");
      // const tifImage = await tif.getImage();
      // const tifImageData = await tifImage.readRasters({
      //   interleave: true,
      // });
      // const bbox = tifImage.getBoundingBox();
      // const [x1, y1] = WGS84ToMercator(bbox[0], bbox[1]);
      // const [x2, y2] = WGS84ToMercator(bbox[2], bbox[3]);
      // // tifImage.getCanvasTexture();
      // const image = {
      //   imgWidth: tifImage.getWidth(),
      //   imgHeight: tifImage.getHeight(),
      //   tl: [x1, y1],
      //   br: [x2, y2],
      //   center: [(x1 + x2) / 2, (y1 + y2) / 2],
      //   width: Math.abs(x2 - x1),
      //   height: Math.abs(y2 - y1),
      //   data: tifImageData,
      // };
      // this._TifLayer.setTifImage(image);
      // this._MapLayer.setTiff(tifImage);
    },
    async loadBuild() {
      const response = await fetch(process.env.VUE_APP_DEMO_SERVER + "/新丰县建筑DEM.geojson");
      if (response.ok) {
        const geoJsonData = await response.text().then(parserGeoJSON);
        this._Build3DLayer.setData(geoJsonData);
      } else {
        console.error(`HTTP error! status: ${response.status}`, response);
      }
    },
    async loadPink() {
      const response = await fetch(process.env.VUE_APP_DEMO_SERVER + "/新丰县起降点wgs84_dem.json");
      if (response.ok) {
        const text = await response.text();
        this._PinkLayer.setPinkList(JSON.parse(text));
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
          this.setTime(this.time + 1 / 60);
        }
      }, 1000 / 60);
    },
    stop() {
      clearInterval(this._interval);
      this._interval = null;
    },
    reset() {
      this.stop();
      this.setTime(0);
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
  width: 400px;
  position: absolute;
  right: 20px;
  top: 20px;
  z-index: 1500;
  background-color: #ffffffaa;
  user-select: none;
  padding: 12px;
  background: #ffffff;
  box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  .el-form-item {
    margin-bottom: 8px;
    // color: orange;
  }
}

.NewClock {
  position: absolute;
  right: 20px;
  top: 20px;
  z-index: 1000;
}
</style>
