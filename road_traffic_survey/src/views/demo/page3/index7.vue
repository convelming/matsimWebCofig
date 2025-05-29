<template>
  <div class="index" v-loading="loading">
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
                      <el-switch v-model="showTiffLayer" :active-value="true" :inactive-value="false"></el-switch>
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

import { Build3DLayer } from "./layer2/Build3DLayer";
import { Network3DLayer, Network } from "./layer2/Network3DLayer";
import { PinkLayer } from "./layer2/PinkLayer";
import { TileLayer } from "./layer2/TileLayer.js";
import { UAVListLayer } from "./layer2/UAVListLayer";

import NewClock from "@/components/NewClock/index.vue";

import JSZip from "jszip";

import GeoJSONLayerWorker from "./layer/GeoJSONLayer.worker";

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

// const pageConfig = {
//   mapConfig: {
//     center: [12613317.745000001, 2649719.39],
//     zoom: 13.5,
//     mapZoomHeight: 600,
//     pitch: 30,
//     rotation: -10,
//     enableRotate: true,
//   },
//   tif: process.env.VUE_APP_DEMO_SERVER + "/广州中心四区.tif",
//   network: process.env.VUE_APP_DEMO_SERVER + "/network.zip",
//   networkXmlUrl: process.env.VUE_APP_DEMO_SERVER + "/coords_100m_gz4_250529.zip",
//   paths: process.env.VUE_APP_DEMO_SERVER + "/leg(1).json",
//   build: process.env.VUE_APP_DEMO_SERVER + "/buildingCentral4demWgs84.geojson",
//   pink: process.env.VUE_APP_DEMO_SERVER + "/新丰县起降点wgs84_dem.json",
// };

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
        this._TileLayer.setOpacity(val);
      },
    },
    showTiffLayer: {
      handler(val) {
        if (val) {
          this._Map.addLayer(this._TileLayer);
        } else {
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
      loading: true,

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
      showTiffLayer: true,
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
    this.loading = true;
    try {
      const response = await fetch(process.env.VUE_APP_DEMO_SERVER + "/" + this.$route.query.fileName);

      const blob = await response.blob();
      const zip = await JSZip.loadAsync(blob);
      console.log(zip);

      const config = await zip.file("config.json").async("string");
      const pageConfig = JSON.parse(config);
      this.pageConfig = pageConfig;
      await this.initMap();
      if (pageConfig.tif) {
        await zip
          .file(pageConfig.tif)
          .async("arraybuffer")
          .then((array) => {
            return this._TileLayer.setTif(array);
          });
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
            console.log(e.data);
            if (e.data > this._nodesId.length) {
              alert(`linkId:  ${this._linksId[e.data - this._nodesId.length]}`);
            } else {
              alert(`nodeId:  ${this._nodesId[e.data]}`);
            }
          });
        });
      } else if (pageConfig.networkXmlUrl && zip.file(pageConfig.networkXmlUrl)) {
        await zip
          .file(pageConfig.networkXmlUrl)
          .async("string")
          .then((xml) => {
            const network = Network.fromXml(xml);
            this._Network3DLayer.setNetwork(network);
          });
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
            this._UAVListLayer.setPaths(paths);
          });
      }
      if (pageConfig.build && zip.file(pageConfig.build)) {
        await zip
          .file(pageConfig.build)
          .async("string")
          .then(parserGeoJSON)
          .then((json) => {
            this._Build3DLayer.setData(json);
          });
      }
      if (pageConfig.pink && zip.file(pageConfig.pink)) {
        await zip
          .file(pageConfig.pink)
          .async("string")
          .then(JSON.parse)
          .then((json) => {
            this._PinkLayer.setPinkList(json);
          });
      }
    } catch (error) {
      console.error(`HTTP error! status: ${response.status}`, response);
    }
    this.loading = false;
  },
  methods: {
    // 初始化地图
    async initMap() {
      this._Map = new MyMap({
        rootId: "mapRoot",
        ...this.pageConfig.mapConfig,
      });
      console.log(this._Map);

      this._TileLayer = new TileLayer({
        zIndex: 200,
        opacity: this.tifOpacity,
      });
      if (this.showTiffLayer) this._Map.addLayer(this._TileLayer);

      this._Network3DLayer = new Network3DLayer({
        zIndex: 200,
        usePick: true,
        showLink: this.showNetwork3DLink,
        showNode: this.showNetwork3DNode,
      });
      this._Map.addLayer(this._Network3DLayer);

      this._UAVListLayer = new UAVListLayer({
        zIndex: 300,
        linkWidth: 20,
        nodeSize: 30,
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
        // buildColor: "#838385",
        buildColor: "#bbb",
      });
      this._Map.addLayer(this._Build3DLayer);

      this._PinkLayer = new PinkLayer({
        zIndex: 240,
      });
      this._Map.addLayer(this._PinkLayer);
    },
    setTime(time) {
      if (time > this.maxTime) time = this.maxTime;
      this.time = Number(Number(time).toFixed(3));
      if (this._Map) this._UAVListLayer.setTime(this.time);
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
      // if (this._Map) this._Map.addLayer(this._UAVListLayer);
    },
    stop() {
      clearInterval(this._interval);
      this._interval = null;
      // if (this._Map) this._UAVListLayer.removeFromParent();
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
