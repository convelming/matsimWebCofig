<template>
  <!-- :style="mainStyle" -->
  <div class="p9_index main" :style="mainStyle" v-loading="loading">
    <div class="title_box">
      <img class="back1" src="./images/top_left@2x.png" alt="" />
      <img class="back2" src="./images/top_center@2x.png" alt="" />
      <img class="back3" src="./images/top_right@2x.png" alt="" />
      <div class="text">广州市低空无人机航路规划</div>
    </div>
    <div class="page1" v-show="pageType === 1">
      <div id="mapRoot"></div>
      <div class="box1">
        <div class="title1">航路数量</div>
        <div class="chart1" ref="chart1"></div>
        <div class="title2">适飞空域</div>
        <div class="chart1_2_box">
          <div class="item">
            <div class="chart">
              <Sector :size="53" :number="0.27" color="url(#linearGradient1)">
                <template v-slot:defs>
                  <!-- background: linear-gradient( 152deg, #8A38F5 0%, #FDC9E6 100%); -->
                  <linearGradient id="linearGradient1" x1="100%" y1="0%" x2="0%" y2="50%">
                    <stop offset="0%" style="stop-color: #8a38f5; stop-opacity: 1" />
                    <stop offset="100%" style="stop-color: #fdc9e6; stop-opacity: 1" />
                  </linearGradient>
                </template>
              </Sector>
            </div>
            <div class="text">0-120</div>
          </div>
          <div class="item">
            <div class="chart">
              <Sector :size="53" :number="0.36" color="url(#linearGradient2)">
                <template v-slot:defs>
                  <!-- background: linear-gradient( 174deg, #0084FF 0%, #07B9B9 100%); -->
                  <linearGradient id="linearGradient2" x1="100%" y1="0%" x2="0%" y2="50%">
                    <stop offset="0%" style="stop-color: #0084ff; stop-opacity: 1" />
                    <stop offset="100%" style="stop-color: #07b9b9; stop-opacity: 1" />
                  </linearGradient>
                </template>
              </Sector>
            </div>
            <div class="text">120-300</div>
          </div>
          <div class="item">
            <div class="chart">
              <Sector :size="53" :number="0.43" color="url(#linearGradient3)">
                <template v-slot:defs>
                  <!-- background: linear-gradient( 168deg, #F2994A 0%, #FFD400 100%); -->
                  <linearGradient id="linearGradient3" x1="100%" y1="0%" x2="0%" y2="50%">
                    <stop offset="0%" style="stop-color: #f2994a; stop-opacity: 1" />
                    <stop offset="100%" style="stop-color: #ffd400; stop-opacity: 1" />
                  </linearGradient>
                </template>
              </Sector>
            </div>
            <div class="text">300-600</div>
          </div>
        </div>
      </div>
      <div class="box2">
        <div class="left">
          <div class="title">
            <img src="./images/icon_gaofeng@2x.png" alt="" class="icon" />
            <span>高峰时段航路监测</span>
          </div>

          <div class="row1">
            <div class="item">
              <img src="./images/icon_wendu@2x.png" alt="" class="img" />
              <div>
                <span class="text1">温度:</span>
                <span class="text2">19℃</span>
              </div>
            </div>
            <div class="item">
              <img src="./images/icon_shidu@2x.png" alt="" class="img" />
              <div>
                <span class="text1">湿度:</span>
                <span class="text2">52%</span>
              </div>
            </div>
            <div class="item">
              <img src="./images/icon_fengxiang@2x.png" alt="" class="img" />
              <div>
                <span class="text1">风向:</span>
                <span class="text2">东南风</span>
              </div>
            </div>
            <div class="item">
              <img src="./images/icon_fengsu@2x.png" alt="" class="img" />
              <div>
                <span class="text1">风速:</span>
                <span class="text2">2m/s</span>
              </div>
            </div>
          </div>
          <div class="row2">
            <div class="item">
              <img src="./images/icon_jyl@2x.png" alt="" class="img" />
              <div>
                <span class="text1">降雨量:</span>
                <span class="text2">0mm</span>
              </div>
            </div>
            <div class="item">
              <img src="./images/icon_zfl@2x.png" alt="" class="img" />
              <div>
                <span class="text1">蒸发量:</span>
                <span class="text2">0.326mm/h</span>
              </div>
            </div>
            <div class="item">
              <img src="./images/icon_qiya@2x.png" alt="" class="img" />
              <div>
                <span class="text1">气压:</span>
                <span class="text2">0.326MPa</span>
              </div>
            </div>
          </div>
        </div>
        <div class="line"></div>
        <div class="right">
          <div class="title">
            <img src="./images/icon_qixiang@2x.png" alt="" class="icon" />
            <span>气象条件</span>
          </div>
          <div class="progress_list">
            <div class="item">
              <el-progress type="dashboard" color="#59FFBE" :percentage="80" :show-text="false" :stroke-width="15"></el-progress>
              <div class="text2">1673</div>
              <div class="text">物流配送</div>
            </div>
            <div class="item">
              <el-progress type="dashboard" color="#FF861B" :percentage="50" :show-text="false" :stroke-width="15"></el-progress>
              <div class="text2">203</div>
              <div class="text">低空文旅</div>
            </div>
            <div class="item">
              <el-progress type="dashboard" color="#7068FF" :percentage="30" :show-text="false" :stroke-width="15"></el-progress>
              <div class="text2">87</div>
              <div class="text">交通出行</div>
            </div>
            <div class="item">
              <el-progress type="dashboard" color="#1327FF" :percentage="75" :show-text="false" :stroke-width="15"></el-progress>
              <div class="text2">2632</div>
              <div class="text">生产作业</div>
            </div>
            <div class="item">
              <el-progress type="dashboard" color="#46B7FD" :percentage="10" :show-text="false" :stroke-width="15"></el-progress>
              <div class="text2">27</div>
              <div class="text">应急救援</div>
            </div>
            <div class="item">
              <el-progress type="dashboard" color="#BB55FF" :percentage="50" :show-text="false" :stroke-width="15"></el-progress>
              <div class="text2">109</div>
              <div class="text">政务巡检</div>
            </div>
          </div>
        </div>
      </div>
      <div class="box3">
        <div class="title">
          <img src="./images/icon_blue_coner_left@2x.png" alt="" class="icon" />
          <span>低空地图控制</span>
          <img src="./images/icon_blue_coner_right@2x.png" alt="" class="icon" />
        </div>
        <div class="boxList">
          <div class="item" :class="{ active: tabType == '控制面板' }" @click="tabType = '控制面板'">控制面板</div>
          <div class="item" :class="{ active: tabType == '无人机' }" @click="tabType = '无人机'">无人机</div>
        </div>
        <div class="card" v-show="tabType == '控制面板'">
          <div class="row">
            <span class="label">空中路网：</span>
            <el-switch v-model="showNetwork3DLink" :active-value="true" :inactive-value="false" size="mini"></el-switch>
          </div>
          <div class="row">
            <span class="label">空中路网节点：</span>
            <el-switch v-model="showNetwork3DNode" :active-value="true" :inactive-value="false" size="mini"></el-switch>
          </div>
          <div class="row">
            <span class="label">地形图透明度：</span>
            <el-slider style="margin: 0 15px; flex: 1" v-model="tifOpacity" :min="0" :max="1" :step="0.01" size="mini"></el-slider>
          </div>
          <div class="row">
            <span class="label">飞行曲线：</span>
            <el-select v-model="UAVPathClassName" style="width: 0; flex: 1" size="mini">
              <el-option label="LinePath" value="LinePath"> </el-option>
              <el-option label="CubicBezierPath" value="CubicBezierPath"> </el-option>
            </el-select>
          </div>
          <div class="row" style="justify-content: flex-start">
            <el-button v-show="playStart == 'stop'" size="mini" type="primary" @click="play">播放</el-button>
            <el-button v-show="playStart == 'play'" size="mini" type="primary" @click="stop">暂停</el-button>
            <el-button size="mini" @click="reset">重置</el-button>
          </div>
          <div class="row">
            <span class="label">锁定视角：</span>
            <el-switch v-model="lockSelect" :active-value="true" :inactive-value="false"></el-switch>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between">
            <span class="label" style="white-space: nowarp; width: 100px">时间：{{ time }}</span>
            <el-slider style="margin: 0 15px; flex: 1" :value="time" @input="setTime" :min="minTime" :max="maxTime"></el-slider>
          </div>
          <!-- <template v-show="playDetail">
              <el-form-item label="时间：">{{ Number(playDetail.time).toFixed(0) }} s</el-form-item>
              <el-form-item label="速度：">{{ Number(playDetail.speed).toFixed(3) }} m/s</el-form-item>
              <el-form-item label="位置：">{{ Number(playDetail.x).toFixed(2) }}, {{ Number(playDetail.y).toFixed(2) }}, {{ Number(playDetail.z).toFixed(2) }}</el-form-item>
            </template> -->
        </div>
        <div class="card" v-show="tabType == '无人机'">
          <UAVBox class="UAVBox"></UAVBox>
        </div>
      </div>
      <div class="box4">
        <div class="title">
          <img src="./images/icon_blue_coner_left@2x.png" alt="" class="icon" />
          <span>飞行器数量</span>
          <img src="./images/icon_blue_coner_right@2x.png" alt="" class="icon" />
        </div>
        <div class="chart" ref="chart4"></div>
      </div>
      <div class="box5">
        <div class="title">
          <img src="./images/icon_blue_coner_left@2x.png" alt="" class="icon" />
          <span>高峰时段航路监测</span>
          <img src="./images/icon_blue_coner_right@2x.png" alt="" class="icon" />
        </div>
        <div class="chart" ref="chart5"></div>
      </div>
    </div>
    <div class="page2" v-show="pageType === 2">
      <div id="mapRoot2" ref="mapRoot2"></div>
      <div class="back"></div>
      <img src="./images/img_line_top_left@2x.png" alt="" class="back1" />
      <img src="./images/img_line_top_middle@2x.png" alt="" class="back2" />
      <img src="./images/img_line_top_right@2x.png" alt="" class="back3" />
      <img src="./images/img_line_down_left@2x.png" alt="" class="back4" />
      <img src="./images/img_line_down_right@2x.png" alt="" class="back5" />
      <div class="back_btn" @click="lockSelect = false">
        <img src="./images/icon_back@2x.png" alt="" class="icon" />
        <span>返回</span>
      </div>
      <template v-if="playDetail">
        <div class="p9_lc">
          <div class="p9_text">路程：{{ playDetail.dis }} / {{ playDetail.tDis }}</div>
          <div class="p9_progress">
            <div class="p9_value" :style="`width: ${(playDetail.dis / playDetail.tDis) * 100}%`"></div>
          </div>
          <!-- <div class="p9_text">终点</div> -->
        </div>

        <div class="p9_gd">
          <div class="p9_progress">
            <div class="p9_line">300</div>
            <div class="p9_line" style="top: 50%">150</div>
            <div class="p9_line" style="top: 100%">0</div>
            <div class="p9_value" :style="`height: ${(playDetail.point.z / 300) * 100}%;max-height:100%`"></div>
          </div>
          <div class="p9_title">{{ Number(playDetail.point.z).toFixed(2) }}m</div>
          <div class="p9_title">高度 m</div>
        </div>

        <div class="p9_sd">
          <div class="p9_progress_list">
            <div class="p9_progress_box">
              <div class="p9_progress">
                <div class="p9_line">50</div>
                <div class="p9_line" style="top: 50%">25</div>
                <div class="p9_line" style="top: 100%">0</div>
                <div class="p9_value" :style="`height: ${(playDetail.speedX / 50) * 100}%;max-height:100%`"></div>
              </div>
              <div class="p9_title">X轴</div>
              <div class="p9_title">{{ playDetail.speedX }}m/s</div>
            </div>
            <div class="p9_progress_box">
              <div class="p9_progress">
                <div class="p9_line">50</div>
                <div class="p9_line" style="top: 50%">25</div>
                <div class="p9_line" style="top: 100%">0</div>
                <div class="p9_value" :style="`height: ${(playDetail.speedY / 50) * 100}%;max-height:100%`"></div>
              </div>
              <div class="p9_title">Y轴</div>
              <div class="p9_title">{{ playDetail.speedY }}m/s</div>
            </div>
            <div class="p9_progress_box">
              <div class="p9_progress">
                <div class="p9_line">50</div>
                <div class="p9_line" style="top: 50%">25</div>
                <div class="p9_line" style="top: 100%">0</div>
                <div class="p9_value" :style="`height: ${(playDetail.speedZ / 50) * 100}%;max-height:100%`"></div>
              </div>
              <div class="p9_title">Z轴</div>
              <div class="p9_title">{{ playDetail.speedZ }}m/s</div>
            </div>
          </div>
          <div class="p9_title">速度 m/s</div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import * as echarts from "echarts";
import Sector from "@/components/Sector.vue";
import { MyMap, MAP_EVENT, MOUSE_BUTTONS } from "@/mymap/index.js";
import { WGS84ToMercator } from "@/mymap/utils/LngLatUtils";

import { Build3DLayer } from "./layer4/Build3DLayer";
import { Network3DLayer, Network } from "./layer4/Network3DLayer2";
import { PinkLayer } from "./layer4/PinkLayer";
import { TileLayer } from "./layer4/TileLayer.js";
import { UAVListLayer } from "./layer4/UAVListLayer2.js";

import NewClock from "@/components/NewClock/index.vue";

import JSZip from "jszip";

import GeoJSONLayerWorker from "./layer/GeoJSONLayer.worker";

import UAVBox from "./UAVBox/index.vue";

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
    Sector,
    NewClock,
    UAVBox,
  },
  provide() {
    return {
      rootVue: this,
    };
  },
  watch: {
    lockSelect: {
      handler(val) {
        this._UAVListLayer.setLockSelect(val);
        // this._UAVListLayer.lockSelect = val;
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
    UAVPathClassName: {
      handler(val) {
        this._UAVListLayer.setPaths(this._UAVPaths, this.UAVPathClassName);
      },
    },
    // showOBJLayer: {
    //   handler(val) {
    //     if (val) {
    //       this._Map.addLayer(this._OBJLayer);
    //     } else {
    //       this._Map.removeLayer(this._OBJLayer);
    //     }
    //   },
    // },
  },
  computed: {
    pageType() {
      if (this.lockSelect && this.playDetail) {
        return 2;
      } else {
        return 1;
      }
    },
  },
  data() {
    return {
      mainStyle: {
        transform: ``,
      },
      playStart: "stop",
      tabType: "控制面板",
      loading: false,
      showSetting: false,

      startPink: null,
      selectStartPink: false,
      endPink: null,
      selectEndPink: false,
      playDetail: null,
      // playDetail: {
      //   point: { x: 1, y: 1, z: 1 },
      //   speed: 0,
      //   speedX: 0,
      //   speedY: 0,
      //   speedZ: 0,
      //   tDis: 100,
      //   dis: 20,
      //   dir: { x: 1, y: 1, z: 1 },
      //   isEnd: true,
      // },
      lockSelect: true,
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
      UAVPathClassName: "LinePath", // LinePath CubicBezierPath
    };
  },
  created() {
    this._chartList = [];
    window.addEventListener("resize", this.windowResize.bind(this));
  },
  async mounted() {
    this.windowResize();
    this.initChart1();
    // this.initChart1_2();
    this.initChart4();
    this.initChart5();
    this.loadMapData();
    // this.initMap();
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.windowResize.bind(this));
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
          tif: list.includes("tif") ? pageConfig.tif : null,
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
    // 初始化地图
    async initMap(
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
        valueName: "flow",
        nodeColor: "#5ab640",
        linkColor: "#00FFFF",
        colorsFunc: function (value) {
          const _value = Number(value || 0);
          if (_value <= 0.2) {
            return "#2c83ba";
          } else if (0.2 < _value && _value <= 0.4) {
            return "#92cba8";
          } else if (0.4 < _value && _value <= 0.6) {
            return "#f6fbbc";
          } else if (0.6 < _value && _value <= 0.8) {
            return "#f99d58";
          } else if (0.8 < _value) {
            return "#d7191b";
          }
        },
      });
      this._Map.addLayer(this._Network3DLayer);

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
        event: {
          playing: (res) => {
            if (this._playTimeout) return;
            this.playDetail = res.data.playDetail;
            this._playTimeout = setTimeout(() => {
              this._playTimeout = null;
            }, 200);
          },
        },
      });
      this._Map.addLayer(this._UAVListLayer);

      this._Build3DLayer = new Build3DLayer({
        zIndex: 220,
        buildOpacity: 0.4,
        buildColor: "#a8adbd",
        // buildColor: "#4198b9",
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
      this.playStart = "play";
      this._interval = setInterval(() => {
        if (this.time + 1 / 60 > this.maxTime) {
          this.stop();
        } else {
          this.setTime(this.time + 1 / 60);
        }
      }, 1000 / 60);
      // if (this._Map) this._Map.addLayer(this._UAVListLayer);
    },
    stop() {
      this.playStart = "stop";
      clearInterval(this._interval);
      this._interval = null;
      // if (this._Map) this._UAVListLayer.removeFromParent();
    },
    reset() {
      this.stop();
      this.setTime(0);
    },
    windowResize() {
      const { innerHeight, innerWidth } = window;
      this.mainStyle.transform = `translate(-50%, -50%) scale(${Math.min(innerHeight / 1080, innerWidth / 1920)})`;

      for (const chart of this._chartList) {
        try {
          chart.resize();
        } catch (error) {}
      }
    },
    initChart1() {
      // background: linear-gradient( 180deg, #158ECF 0%, #00E4FF 100%);
      const chart = echarts.init(this.$refs.chart1);
      const dataAxis = Array.from({ length: 12 }, (v, i) => `${i + 1}月`);
      const data = [10, 20, 30, 45, 50, 66, 99, 120, 110, 90, 80, 80];
      const option = {
        tooltip: {
          trigger: "item",
        },
        grid: {
          left: "0%",
          right: "4%",
          bottom: "0%",
          top: "5%",
          containLabel: true,
        },
        xAxis: {
          data: dataAxis,
          axisLabel: {
            // inside: true,
            color: "#fff",
          },
          axisTick: {
            show: false,
          },
          axisLine: {
            show: false,
          },
          z: 10,
        },
        yAxis: {
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            color: "#fff",
          },
        },
        dataZoom: [
          {
            type: "inside",
          },
        ],
        series: [
          {
            type: "bar",
            showBackground: false,
            itemStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: "#158ECF" },
                  { offset: 1, color: "#00E4FF" },
                ]),
                barBorderRadius: [6, 6, 0, 0],
              },
            },
            data: data,
          },
        ],
      };
      chart.setOption(option);
      this._chartList.push(chart);
    },
    initChart4() {
      const chart = echarts.init(this.$refs.chart4);
      const dataAxis = Array.from({ length: 12 }, (v, i) => `${i + 1}月`);
      const data = [10, 20, 30, 120, 110, 66, 99, 90, 45, 50, 80, 80];
      const option = {
        tooltip: {
          trigger: "item",
        },
        grid: {
          left: "0%",
          right: "4%",
          bottom: "0%",
          top: "5%",
          containLabel: true,
        },
        xAxis: {
          data: dataAxis,
          axisLabel: {
            // inside: true,
            color: "#fff",
          },
          axisTick: {
            show: false,
          },
          axisLine: {
            show: false,
          },
          z: 10,
        },
        yAxis: {
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            color: "#fff",
          },
        },
        dataZoom: [
          {
            type: "inside",
          },
        ],
        series: [
          {
            type: "bar",
            showBackground: false,
            itemStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: "#158ECF" },
                  { offset: 1, color: "#00E4FF" },
                ]),
                barBorderRadius: [6, 6, 0, 0],
              },
            },
            data: data,
          },
        ],
      };
      chart.setOption(option);
      this._chartList.push(chart);
    },
    initChart5() {
      const chart = echarts.init(this.$refs.chart5);
      const dataAxis = Array.from({ length: 12 }, (v, i) => `${i + 1}h`);
      const data = [66, 99, 30, 45, 50, 120, 50, 60, 110, 90, 80, 80];
      const option = {
        tooltip: {
          trigger: "item",
        },
        grid: {
          left: "0%",
          right: "4%",
          bottom: "0%",
          top: "5%",
          containLabel: true,
        },
        xAxis: {
          data: dataAxis,
          axisLabel: {
            // inside: true,
            color: "#fff",
          },
          axisTick: {
            show: false,
          },
          axisLine: {
            show: false,
          },
          z: 10,
        },
        yAxis: {
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            color: "#fff",
          },
        },
        dataZoom: [
          {
            type: "inside",
          },
        ],
        series: [
          {
            type: "line",
            showBackground: false,
            itemStyle: {
              color: "#00E5FF",
            },
            data: data,
          },
        ],
      };
      chart.setOption(option);
      this._chartList.push(chart);
    },
    initChart10() {
      const chart = echarts.init(this.$refs.chart10);
      const option = {};
      chart.setOption(option);
      this._chartList.push(chart);
    },
  },
};
</script>

<!-- <style scoped src="./layer4/css/reset.css"></style>
<style scoped src="./layer4/css/new_index.css"></style>
<style scoped src="./layer4/css/public.css"></style> -->
<style>
body {
  background: #0d111b;
}
</style>
<style lang="scss" scoped>
.p9_index {
  user-select: none;
  background: #0d111b;
  transform: translate(-50%, -50%) scale(0.8);
  position: fixed;
  width: 1920px;
  height: 1080px;
  top: 50%;
  left: 50%;
}
.title_box {
  position: absolute;
  z-index: 200;
  top: 0;
  left: 0;
  width: 100%;
  height: 80px;
  overflow: hidden;
  background: linear-gradient(180deg, #0d111b 0%, #242a3a 100%);
  .back1 {
    position: absolute;
    top: 53px;
    right: calc(50% + 450px);
    width: 500px;
    height: 10px;
  }
  .back2 {
    position: absolute;
    top: -2px;
    left: 50%;
    transform: translateX(-50%);
    width: 907px;
    height: 104px;
  }
  .back3 {
    position: absolute;
    top: 53px;
    left: calc(50% + 450px);
    width: 500px;
    height: 10px;
  }
  .text {
    position: absolute;
    top: 0px;
    left: 50%;
    transform: translateX(-50%);
    color: #fff;
    font-size: 44px;
    font-weight: bold;
  }
}
.page1,
.page2 {
  position: relative;
  z-index: 100;
  // position: fixed;
  width: 1920px;
  height: 1080px;
  overflow: hidden;
}
.page1 {
  #mapRoot {
    position: absolute;
    z-index: 10;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  .box1 {
    position: absolute;
    z-index: 100;
    top: 98px;
    left: 20px;
    width: 300px;
    // height: 538px; 
    background: rgba(34, 39, 53, 0.8);
    box-shadow: inset 0px 4px 10px 0px #075db9;
    border-radius: 22px;
    border: 1px solid #075db9;
    // border: 1px solid ;
    // border-image: linear-gradient(157deg, rgba(120.00000044703484, 165.00000536441803, 214.00000244379044, 1), rgba(255, 255, 255, 0.1599999964237213)) 1 1;
    display: flex;
    flex-direction: column;
    .title1 {
      box-sizing: border-box;
      margin-top: 20px;
      margin-left: 24px;
      width: 252px;
      padding-left: 20px;
      line-height: 36px;
      height: 36px;
      background-image: url("./images/title_01@2x.png");
      background-size: cover;
      color: #fff;
    }
    .chart1 {
      margin-top: 20px;
      margin-left: 24px;
      width: 252px;
      height: 193px;
    }
    .title2 {
      box-sizing: border-box;
      margin-top: 20px;
      margin-left: 24px;
      width: 252px;
      padding-left: 20px;
      line-height: 36px;
      height: 36px;
      background-image: url("./images/title_01@2x.png");
      background-size: cover;
      color: #fff;
    }
    .chart1_2_box {
      margin-top: 20px;
      margin-left: 24px;
      margin-bottom: 25px;
      width: 252px;
      display: flex;
      justify-content: space-between;
      .item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        .chart {
          box-sizing: border-box;
          padding-top: 13px;
          padding-left: 12px;
          width: 76px;
          height: 76px;
          background-image: url("./images/bg_ring@2x.png");
          background-size: cover;
        }
        .text {
          color: #fff;
          font-size: 14px;
        }
      }
    }
  }
  .box2 {
    position: absolute;
    z-index: 100;
    top: 796px;
    left: 20px;
    width: 1548px;
    height: 264px;
    background: rgba(34, 39, 53, 0.8);
    box-shadow: inset 0px 4px 10px 0px #075db9;
    border-radius: 22px 22px 22px 22px;
    border: 1px solid #075db9;
    // border: 1px solid ;
    // border-image: linear-gradient(157deg, rgba(120.00000044703484, 165.00000536441803, 214.00000244379044, 1), rgba(255, 255, 255, 0.1599999964237213)) 1 1;
    display: flex;
    .title {
      width: 276px;
      height: 46px;
      background-image: url("./images/title_03@2x.png");
      background-size: cover;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      .icon {
        width: 20px;
        height: 20px;
      }
      font-size: 18px;
      font-weight: bold;
      color: #fff;
    }
    .left {
      position: relative;
      width: 520px;
      .title {
        position: absolute;
        top: -24px;
        left: 0;
      }

      .item {
        display: flex;
        flex-direction: column;
        align-items: center;
        .img {
          display: block;
          width: 72px;
          height: 72px;
        }
        .text1 {
          color: #00ffe5;
          font-size: 14px;
          font-weight: 700;
        }
        .text2 {
          color: #fff;
          font-size: 14px;
        }
      }
      .row1 {
        display: flex;
        justify-content: space-between;
        padding-top: 33px;
        padding-left: 55px;
        width: 420px;
      }
      .row2 {
        display: flex;
        justify-content: space-between;
        padding-top: 10px;
        padding-left: 80px;
        width: 360px;
      }
    }
    .line {
      margin-top: 40px;
      width: 1px;
      height: 201px;
      background: rgba(255, 255, 255, 0.2);
    }
    .right {
      position: relative;
      flex: 1;
      .title {
        position: absolute;
        top: -24px;
        left: 0;
      }

      .progress_list {
        padding-top: 61px;
        padding-left: 48px;
        display: flex;
        gap: 32px;
        .el-progress {
          background: radial-gradient(ellipse 50% 40%, rgba($color: #29f1fa, $alpha: 0.4), transparent);
        }
        ::v-deep {
          .el-progress-circle {
            width: 120px !important;
            height: 120px !important;
          }
          .el-progress-circle__track {
            stroke-linecap: round;
            stroke: #345376;
          }
        }
        .item {
          position: relative;
          width: 120px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          .text2 {
            position: absolute;
            top: 60px;
            left: 60px;
            transform: translate(-50%, -50%);
            text-align: center;
            color: #29f1fa;
            font-size: 28px;
            font-weight: bold;
          }
          .text {
            font-size: 16px;
            color: #ffffff;
          }
        }
      }
    }
  }
  .box3,
  .box4,
  .box5 {
    .title {
      margin-top: 20px;
      margin-left: 30px;
      width: 260px;
      height: 36px;
      background: linear-gradient(180deg, #475776 0%, #273042 100%);
      border-radius: 6px 6px 6px 6px;
      border: 1px solid rgba(120, 165, 214, 0.5899999737739563);
      // border: 1px solid;
      // border-image: linear-gradient(179deg, rgba(120.00000044703484, 165.00000536441803, 214.00000244379044, 0.5899999737739563), rgba(255, 255, 255, 0)) 1 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 15px;
      .icon {
        display: block;
        width: 14px;
        height: 14px;
      }
      font-size: 18px;
      font-weight: bold;
      color: #fff;
    }
  }
  .box3 {
    position: absolute;
    z-index: 100;
    top: 98px;
    right: 20px;
    width: 320px;
    height: 397px;
    background: rgba(34, 39, 53, 0.8);
    box-shadow: inset 0px 4px 10px 0px #075db9;
    border-radius: 22px;
    border: 1px solid #075db9;
    display: flex;
    flex-direction: column;
    .boxList {
      display: flex;
      margin-top: 12px;
      margin-left: 28px;
      gap: 8px;
      .item {
        width: 128px;
        height: 28px;
        line-height: 28px;
        text-align: center;
        background-image: url("./images/btn_dk_nor@2x.png");
        background-size: cover;
        font-size: 14px;
        color: #fff;
        cursor: pointer;
        &.active {
          background-image: url("./images/btn_dk_sel@2x.png");
        }
      }
    }
    .card {
      margin-top: 12px;
      margin-left: 30px;
      width: 260px;
      height: 270px;
      overflow-y: scroll;
      overflow-x: hidden;
      color: #fff;
      font-size: 14px;

      &::-webkit-scrollbar {
        display: none;
      }
      .row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 12px;
      }
    }

    .UAVBox {
      width: 100%;
      height: 100%;
    }
  }
  .box4 {
    position: absolute;
    z-index: 100;
    top: 507px;
    right: 20px;
    width: 320px;
    height: 277px;
    background: rgba(34, 39, 53, 0.8);
    box-shadow: inset 0px 4px 10px 0px #075db9;
    border-radius: 22px;
    border: 1px solid #075db9;
    display: flex;
    flex-direction: column;

    .chart {
      margin-top: 10px;
      margin-left: 30px;
      width: 260px;
      height: 193px;
    }
  }
  .box5 {
    position: absolute;
    z-index: 100;
    top: 796px;
    right: 20px;
    width: 320px;
    height: 264px;
    background: rgba(34, 39, 53, 0.8);
    box-shadow: inset 0px 4px 10px 0px #075db9;
    border-radius: 22px;
    border: 1px solid #075db9;
    display: flex;
    flex-direction: column;

    .chart {
      margin-top: 10px;
      margin-left: 30px;
      width: 260px;
      height: 185px;
    }
  }
}

.page2 {
  #mapRoot2 {
    position: absolute;
    z-index: 20;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  .back {
    box-shadow: inset 0 50px 150px 120px rgba($color: #0d111b, $alpha: 1);
    position: absolute;
    z-index: 50;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
  .back1 {
    position: absolute;
    z-index: 100;
    width: 704px;
    height: 284px;
    top: 89px;
    left: 43px;
    pointer-events: none;
  }
  .back2 {
    position: absolute;
    z-index: 100;
    width: 420px;
    height: 40px;
    top: 89px;
    left: 50%;
    transform: translateX(-50%);
    pointer-events: none;
  }

  .back3 {
    position: absolute;
    z-index: 100;
    width: 704px;
    height: 284px;
    top: 89px;
    right: 43px;
    pointer-events: none;
  }

  .back4 {
    position: absolute;
    z-index: 100;
    width: 704px;
    height: 284px;
    bottom: 27px;
    left: 43px;
    pointer-events: none;
  }

  .back5 {
    position: absolute;
    z-index: 100;
    width: 704px;
    height: 284px;
    bottom: 27px;
    right: 43px;
    pointer-events: none;
  }
  .back_btn {
    position: absolute;
    z-index: 200;
    top: 160px;
    left: 112px;
    display: flex;
    align-items: center;
    gap: 4px;
    .icon {
      display: block;
      width: 24px;
      height: 24px;
    }
    font-size: 24px;
    color: #00f7ff;
    cursor: pointer;
  }

  .p9_title {
    text-align: center;
    color: #00f7ff;
    margin-bottom: 10px;
    font-size: 14px;
  }

  .p9_progress {
    position: relative;
    border-left: 1px solid #00f7ff;
    .p9_value {
      z-index: 10;
      position: absolute;
      bottom: 0;
      left: 0;
      width: 10px;
      height: 100%;
      background-color: transparent;
      transition: height 0.1s;
      &::before {
        position: absolute;
        left: 0;
        top: 0;
        transform: translateY(-50%);
        content: "";
        width: 16px;
        height: 16px;
        background-image: url("./images/icon_arrow_left@2x.png");
        background-size: cover;
      }
    }
    .p9_line {
      z-index: 20;
      position: absolute;
      z-index: 20px;
      display: flex;
      padding-left: 16px;
      transform: translateY(-50%);
      color: #00f7ff;
      font-size: 14px;
      &::before {
        position: absolute;
        left: 0;
        top: 50%;
        content: "";
        width: 8px;
        height: 1px;
        background-color: #00f7ff;
      }
    }
  }

  .p9_lc {
    z-index: 50;
    position: absolute;
    top: 200px;
    left: 50%;
    width: 1000px;
    transform: translateX(-50%);
    display: flex;
    justify-items: center;
    align-items: center;
    gap: 10px;
    .p9_text {
      color: #fff;
    }
    .p9_progress {
      flex-grow: 1;
      width: 0;
      height: 6px;
      border-radius: 3px;
      overflow: hidden;
      background-color: rgba($color: #fff, $alpha: 0.2);
      .p9_value {
        width: 100%;
        height: 100%;
        background-color: rgba($color: #00f7ff, $alpha: 1);
      }
    }
  }

  .p9_gd {
    z-index: 50;
    position: absolute;
    left: 44px;
    top: 420px;

    .p9_progress {
      margin-bottom: 30px;
      height: 224px;
    }
  }

  .p9_sd {
    z-index: 50;
    position: absolute;
    top: 420px;
    right: 44px;
    .p9_progress_list {
      display: flex;
      gap: 25px;
      margin-bottom: 10px;
      .p9_progress {
        margin-bottom: 30px;
        height: 224px;
      }
    }
  }
}
</style>
