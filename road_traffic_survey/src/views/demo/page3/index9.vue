<template>
  <div class="p9_index main" v-loading="loading" style="background-color: #000">
    <div id="mapRoot"></div>
    <div id="mapRoot2" ref="mapRoot2" v-show="pageType === 2"></div>
    <div class="box1" v-show="pageType === 1">
      <!-- <img src="./layer4/img/left.png" class="first_border" alt="" /> -->
      <div class="boxTitle">航路数量</div>
      <div class="chart" ref="chart1"></div>
      <div class="boxTitle">适飞空域</div>
      <div class="chart" ref="chart1_2" style="height: 20vh; flex-grow: 0"></div>
    </div>
    <!-- 左侧下部 -->
    <div class="box2" v-show="pageType === 1">
      <div class="titleList">
        <div class="boxTitle">气象条件</div>
        <div class="boxTitle">低空场景监测</div>
      </div>
      <div class="value">
        <div class="weather_data">
          <div class="weather_text text_one">
            <span>温度：19℃</span>
            <span>湿度：52%</span>
            <span>风向：东南风</span>
            <span>风速：2m/s</span>
          </div>
          <div class="weather_text text_two">
            <span>降雨量：0mm</span>
            <span>蒸发量：0.326mm/h</span>
            <span>气压：0.326MPa</span>
          </div>
        </div>
        <div class="chart progress_list">
          <div class="item">
            <el-progress type="dashboard" color="#85a9a2" :percentage="80" :show-text="false" :stroke-width="15"></el-progress>
            <div class="text2">1673</div>
            <div class="text">物流配送</div>
          </div>
          <div class="item">
            <el-progress type="dashboard" color="#aed9d8" :percentage="50" :show-text="false" :stroke-width="15"></el-progress>
            <div class="text2">203</div>
            <div class="text">低空文旅</div>
          </div>
          <div class="item">
            <el-progress type="dashboard" color="#6bb3c0" :percentage="30" :show-text="false" :stroke-width="15"></el-progress>
            <div class="text2">87</div>
            <div class="text">交通出行</div>
          </div>
          <div class="item">
            <el-progress type="dashboard" color="#f2c494" :percentage="75" :show-text="false" :stroke-width="15"></el-progress>
            <div class="text2">2632</div>
            <div class="text">生产作业</div>
          </div>
          <div class="item">
            <el-progress type="dashboard" color="#99bcdd" :percentage="10" :show-text="false" :stroke-width="15"></el-progress>
            <div class="text2">27</div>
            <div class="text">应急救援</div>
          </div>
          <div class="item">
            <el-progress type="dashboard" color="#99bcdd" :percentage="50" :show-text="false" :stroke-width="15"></el-progress>
            <div class="text2">109</div>
            <div class="text">政务巡检</div>
          </div>
        </div>
      </div>
    </div>

    <!-- <div class="box6" v-show="pageType === 1">
      <div class="boxTitle">试飞空域</div>
    </div> -->

    <div class="box3" v-show="pageType === 1">
      <div class="boxTitle">低空地图控制</div>
      <div class="csbaseBox1">
        <div class="boxList">
          <div class="item" :class="{ item: true, active: tabType == '控制面板' }" @click="tabType = '控制面板'">控制面板</div>
          <div class="item" :class="{ item: true, active: tabType == '无人机' }" @click="tabType = '无人机'">无人机</div>
        </div>
        <div class="p9_card" v-show="tabType == '控制面板'">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px">
            <span class="label">空中路网：</span>
            <el-switch v-model="showNetwork3DLink" :active-value="true" :inactive-value="false" size="mini"></el-switch>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px">
            <span class="label">空中路网节点：</span>
            <el-switch v-model="showNetwork3DNode" :active-value="true" :inactive-value="false" size="mini"></el-switch>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px">
            <span class="label">地形图透明度：</span>
            <el-slider style="margin: 0 15px; flex: 1" v-model="tifOpacity" :min="0" :max="1" :step="0.01" size="mini"></el-slider>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px">
            <span class="label">飞行曲线：</span>
            <el-select v-model="UAVPathClassName" style="width: 0; flex: 1" size="mini">
              <el-option label="LinePath" value="LinePath"> </el-option>
              <el-option label="CubicBezierPath" value="CubicBezierPath"> </el-option>
            </el-select>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 10px">
            <el-button v-show="playStart == 'stop'" size="mini" @click="play">播放</el-button>
            <el-button v-show="playStart == 'play'" size="mini" @click="stop">暂停</el-button>
            <el-button size="mini" @click="reset">重置</el-button>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px">
            <span class="label">锁定视角：</span>
            <el-switch v-model="lockSelect" :active-value="true" :inactive-value="false"></el-switch>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between">
            <span class="label" style="width: 80px">时间：{{ time }}</span>
            <el-slider style="margin: 0 15px; flex: 1" :value="time" @input="setTime" :min="minTime" :max="maxTime"></el-slider>
          </div>
          <!-- <template v-show="playDetail">
              <el-form-item label="时间：">{{ Number(playDetail.time).toFixed(0) }} s</el-form-item>
              <el-form-item label="速度：">{{ Number(playDetail.speed).toFixed(3) }} m/s</el-form-item>
              <el-form-item label="位置：">{{ Number(playDetail.x).toFixed(2) }}, {{ Number(playDetail.y).toFixed(2) }}, {{ Number(playDetail.z).toFixed(2) }}</el-form-item>
            </template> -->
        </div>
        <div class="p9_card" v-show="tabType == '无人机'">
          <UAVBox class="UAVBox"></UAVBox>
        </div>
      </div>
    </div>
    <div class="box4" v-show="pageType === 1">
      <div class="boxTitle">飞行器数量</div>
      <div class="chart" ref="chart4"></div>
    </div>
    <div class="box5" v-show="pageType === 1">
      <div class="boxTitle">高峰时段航路监测</div>
      <div class="chart" ref="chart5"></div>
    </div>
    <template v-if="pageType === 2">
      <div class="p9_return_btn el-icon-arrow-left" @click="lockSelect = false"></div>
      <div class="p9_lc">
        <div class="p9_text">路程：{{ playDetail.dis }} / {{ playDetail.tDis }}</div>
        <div class="p9_progress">
          <div class="p9_value" :style="`width: ${(playDetail.dis / playDetail.tDis) * 100}%`"></div>
        </div>
        <!-- <div class="p9_text">终点</div> -->
      </div>
      <div class="p9_gd">
        <div class="p9_progress_list">
          <div class="p9_progress_box">
            <div class="p9_progress">
              <div class="p9_line">300</div>
              <div class="p9_line" style="top: 50%">150</div>
              <div class="p9_line" style="top: 100%">0</div>
              <div class="p9_value" :style="`height: ${(playDetail.point.z / 300) * 100}%;max-height:100%`"></div>
            </div>
            <div class="p9_progress_name" style="opacity: 0">高度:</div>
            <div class="p9_progress_name">{{ Number(playDetail.point.z).toFixed(2) }}m</div>
          </div>
        </div>
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
            <div class="p9_progress_name">X轴</div>
            <div class="p9_progress_name">{{ playDetail.speedX }}m/s</div>
          </div>
          <div class="p9_progress_box">
            <div class="p9_progress">
              <div class="p9_line">50</div>
              <div class="p9_line" style="top: 50%">25</div>
              <div class="p9_line" style="top: 100%">0</div>
              <div class="p9_value" :style="`height: ${(playDetail.speedY / 50) * 100}%;max-height:100%`"></div>
            </div>
            <div class="p9_progress_name">Y轴</div>
            <div class="p9_progress_name">{{ playDetail.speedY }}m/s</div>
          </div>
          <div class="p9_progress_box">
            <div class="p9_progress">
              <div class="p9_line">50</div>
              <div class="p9_line" style="top: 50%">25</div>
              <div class="p9_line" style="top: 100%">0</div>
              <div class="p9_value" :style="`height: ${(playDetail.speedZ / 50) * 100}%;max-height:100%`"></div>
            </div>
            <div class="p9_progress_name">Z轴</div>
            <div class="p9_progress_name">{{ playDetail.speedZ }}m/s</div>
          </div>
        </div>
        <div class="p9_title">速度 m/s</div>
      </div>

      <div class="p9_play_btn_list">
        <div v-show="playStart == 'stop'" class="p9_play_btn el-icon-video-play" @click="play"></div>
        <div v-show="playStart == 'play'" class="p9_play_btn el-icon-video-pause" @click="stop"></div>
        <!-- <div class="p9_play_btn el-icon-refresh" @click="reset"></div> -->
      </div>
    </template>
  </div>
</template>

<script>
import * as echarts from "echarts";

import { MyMap, MAP_EVENT, MOUSE_BUTTONS } from "@/mymap/index.js";
import { WGS84ToMercator } from "@/mymap/utils/LngLatUtils";

import { Build3DLayer } from "./layer4/Build3DLayer";
import { Network3DLayer, Network } from "./layer4/Network3DLayer";
import { PinkLayer } from "./layer4/PinkLayer";
import { TileLayer } from "./layer4/TileLayer.js";
import { UAVListLayer } from "./layer4/UAVListLayer";

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
      playStart: "stop",
      tabType: "控制面板",
      loading: false,
      showSetting: false,

      startPink: null,
      selectStartPink: false,
      endPink: null,
      selectEndPink: false,
      playDetail: null,
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
    window.addEventListener("resize", this.resizeChart.bind(this));
  },
  async mounted() {
    this.initChart1();
    this.initChart1_2();
    this.initChart4();
    this.initChart5();
    this.loadMapData();
    // this.initMap();
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.resizeChart.bind(this));
    if(this._Map) this._Map.dispose();
  },
  methods: {
    async loadMapData() {
      this.loading = true;
      let zip, pageConfig;
      try {
        const url = this.$route.query.fileName ? process.env.VUE_APP_DEMO_SERVER + "/" + this.$route.query.fileName : "/data.zip";
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
      await this.initMap(pageConfig.mapConfig);
      try {
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
              this._UAVPaths = paths;
              this._UAVListLayer.setPaths(this._UAVPaths, this.UAVPathClassName);
            });
        }
        if (pageConfig.build && zip.file(pageConfig.build)) {
          await zip
            .file(pageConfig.build)
            .async("string")
            .then(parserGeoJSON)
            .then((json) => {
              this._Build3DLayer.setData(json, pageConfig.buildJzgdKey, pageConfig.buildHbgdKey);
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
        linkWidth: 2,
        nodeSize: 5,
        time: this.time,
        lockSelect: this.lockSelect,
        linkColor: "#f2c494",
        nodeColor: "#bbabdO",
        uavColor: "#f3fafa",
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
        // buildColor: "#838385",
        buildColor: "#4198b9",
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
          this.setTime(this.time + (1 / 60));
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
    resizeChart() {
      for (const chart of this._chartList) {
        try {
          chart.resize();
        } catch (error) {}
      }
    },
    initChart1() {
      const chart = echarts.init(this.$refs.chart1);
      const dataAxis = Array.from({ length: 12 }, (v, i) => `${i + 1}月`);
      const data = [10, 20, 30, 45, 50, 66, 99, 120, 110, 90, 80, 80];
      const option = {
        tooltip: {
          trigger: "item",
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "15%",
          top: "10%",
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
            color: "#999",
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
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "#4198b9" },
                { offset: 0.5, color: "#6bb3c0" },
                { offset: 1, color: "#91cfc9" },
              ]),
            },
            data: data,
          },
        ],
      };
      chart.setOption(option);
      this._chartList.push(chart);
    },
    initChart1_2() {
      const chart = echarts.init(this.$refs.chart1_2);
      const option = {
        color: ["#E04355", "#004960"],
        tooltip: {
          trigger: "item",
        },
        title: [
          {
            subtext: "0-120",
            left: "16.67%",
            top: "70%",
            textAlign: "center",
            subtextStyle: {
              color: "#0efcff",
            },
          },
          {
            subtext: "120-300",
            left: "50%",
            top: "70%",
            textAlign: "center",
            subtextStyle: {
              color: "#0efcff",
            },
          },
          {
            subtext: "300-600",
            left: "83.33%",
            top: "70%",
            textAlign: "center",
            subtextStyle: {
              color: "#0efcff",
            },
          },
        ],
        series: [
          {
            name: "0-120",
            type: "pie",
            radius: "40%",
            center: ["16.67%", "45%"],
            data: [
              { value: 27, name: "适飞空域" },
              { value: 100 - 27, name: "不适飞空域" },
            ],
            label: {
              show: false,
            },
            labelLine: {
              show: false,
            },
          },
          {
            name: "120-300",
            type: "pie",
            radius: "40%",
            center: ["50%", "45%"],
            data: [
              { value: 36, name: "适飞空域" },
              { value: 100 - 36, name: "不适飞空域" },
            ],
            label: {
              show: false,
            },
            labelLine: {
              show: false,
            },
          },
          {
            name: "300-600",
            type: "pie",
            radius: "40%",
            center: ["83.33%", "45%"],
            data: [
              { value: 43, name: "适飞空域" },
              { value: 100 - 43, name: "不适飞空域" },
            ],
            label: {
              show: false,
            },
            labelLine: {
              show: false,
            },
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
          left: "3%",
          right: "4%",
          bottom: "15%",
          top: "10%",
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
            color: "#999",
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
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "#2d4e76" },
                { offset: 0.5, color: "#99bcdd" },
                { offset: 1, color: "#c4e5ef" },
              ]),
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
          left: "3%",
          right: "4%",
          bottom: "15%",
          top: "10%",
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
            color: "#999",
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
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "#bbabd0" },
                { offset: 1, color: "#bbabd0" },
              ]),
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

<style lang="scss" scoped>
.p9_index {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
  background: url("./layer4/img/bg.jpg") no-repeat;
  background-size: cover;
}

#mapRoot {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
}

#mapRoot2 {
  position: absolute;
  top: 0;
  // top: 50vh;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 20;
}

.p9_return_btn {
  z-index: 100;
  position: absolute;
  top: 40px;
  left: 30px;
  font-size: 20px;
  color: #00d2ff;
  cursor: pointer;
}

.p9_lc {
  z-index: 50;
  position: absolute;
  top: 40px;
  left: 30%;
  width: 40%;
  display: flex;
  justify-items: center;
  align-items: center;
  gap: 10px;
  .p9_text {
    color: #00d2ff;
  }
  .p9_progress {
    flex-grow: 1;
    width: 0;
    height: 6px;
    border-radius: 3px;
    overflow: hidden;
    background-color: rgba($color: #999, $alpha: 0.5);
    .p9_value {
      width: 100%;
      height: 100%;
      background-color: rgba($color: #00d2ff, $alpha: 1);
    }
  }
}

.p9_sd {
  z-index: 50;
  position: absolute;
  right: 20px;
  top: 25%;
  height: 50%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  .p9_title {
    text-align: center;
    color: #00d2ff;
  }
  .p9_progress_list {
    flex-grow: 1;
    height: 0;
    display: flex;
    gap: 20px;
    .p9_progress_box {
      display: 100%;
      display: flex;
      flex-direction: column;
      gap: 10px;
      .p9_progress_name {
        color: #00d2ff;
      }

      .p9_progress {
        flex-grow: 1;
        height: 0;
        width: 50px;
        position: relative;
        border-left: 1px solid #275994;
        .p9_value {
          z-index: 10;
          position: absolute;
          bottom: 0;
          left: 0;
          width: 10px;
          height: 100%;
          background-color: rgba($color: #00d2ff, $alpha: 1);
          transition: height 0.1s;
        }
        .p9_line {
          z-index: 20;
          position: absolute;
          z-index: 20px;
          display: flex;
          padding-left: 23px;
          transform: translateY(-50%);
          color: #00d2ff;
          &::before {
            position: absolute;
            left: 0;
            top: 50%;
            content: "";
            width: 15px;
            height: 1px;
            background-color: #275994;
          }
        }
      }
    }
  }
}

.p9_gd {
  z-index: 50;
  position: absolute;
  left: 100px;
  top: 25%;
  height: 50%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  .p9_title {
    text-align: center;
    color: #00d2ff;
  }
  .p9_progress_list {
    flex-grow: 1;
    height: 0;
    display: flex;
    gap: 20px;
    .p9_progress_box {
      display: 100%;
      display: flex;
      flex-direction: column;
      gap: 10px;
      .p9_progress_name {
        color: #00d2ff;
      }

      .p9_progress {
        flex-grow: 1;
        height: 0;
        width: 50px;
        position: relative;
        border-left: 1px solid #275994;
        .p9_value {
          z-index: 10;
          position: absolute;
          bottom: 0;
          left: 0;
          width: 10px;
          height: 100%;
          background-color: rgba($color: #00d2ff, $alpha: 1);
          transition: height 0.1s;
        }
        .p9_line {
          z-index: 20;
          position: absolute;
          z-index: 20px;
          display: flex;
          padding-left: 23px;
          transform: translateY(-50%);
          color: #00d2ff;
          &::before {
            position: absolute;
            left: 0;
            top: 50%;
            content: "";
            width: 15px;
            height: 1px;
            background-color: #275994;
          }
        }
      }
    }
  }
}

.p9_play_btn_list {
  position: absolute;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  display: flex;
  gap: 20px;
  font-size: 50px;
  color: #00d2ff;
  .p9_play_btn {
    cursor: pointer;
  }
}

.box1 {
  z-index: 50;
  position: absolute;
  width: 22vw;
  height: 58vh;
  top: 6vh;
  left: 2vw;
  background-image: url("./layer4/img/left.png");
  background-size: 100% 100%;
  .boxTitle {
    font-size: 1.6vh;
    margin-top: 0.8vh;
    margin-left: 2vw;
    color: #0efcff;
  }
  display: flex;
  flex-direction: column;
  .chart {
    flex-grow: 1;
    height: 0;
    width: 80%;
    margin: 0 10%;
  }
}

.progress_list {
  padding-left: 2vw;
  height: 16vh;
  display: flex;
  ::v-deep {
    .el-progress-circle {
      width: 5.5vw !important;
      height: 5.5vw !important;
    }
    .el-progress-circle__track {
      stroke-linecap: round;
      stroke: #414f67;
    }
  }
  .item {
    position: relative;
    flex-grow: 1;
    width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .text2 {
      position: relative;
      top: -3vw;
      font-size: 1.2vh;
      color: #0efcff;
      height: 0;
    }
    .text {
      font-size: 1.2vh;
      color: #0efcff;
    }
  }
}

.box2 {
  z-index: 50;
  position: absolute;
  width: 72vw;
  height: 26.8vh;
  top: 68vh;
  left: 2vw;
  background-image: url("./layer4/img/微信图片_20250709111547.png");
  background-size: 100% 100%;
  .titleList {
    display: flex;
    .boxTitle {
      font-size: 1.6vh;
      margin-top: 0.8vh;
      color: #0efcff;
      text-align: center;
      &:nth-child(1) {
        width: 15.5vw;
        margin-left: 2vw;
      }
      &:nth-child(2) {
        width: 15.5vw;
        margin-left: 5.9vw;
      }
      &:nth-child(3) {
        width: 15.5vw;
        margin-left: 15.6vw;
      }
    }
  }
  display: flex;
  flex-direction: column;
  .value {
    display: flex;
    height: 100%;
  }
  .weather_data {
    margin-top: 5vh;
    margin-left: 3vw;
    position: absolute;
    width: 18vw;
    padding-bottom: 12vw;
    height: 0;
    font-size: 1.2vh;
    /* background-color: yellow; */
    background-image: url("./layer4/img/bottom_icons.png");
    background-size: 100%;
    background-repeat: no-repeat;

    .weather_text {
      color: #0efcff;
    }

    .weather_text span {
      position: absolute;
      white-space: nowrap;
      top: 22%;
      transform: translateX(-50%);
    }

    .weather_text span:nth-of-type(1) {
      left: 2%;
    }

    .weather_text span:nth-of-type(2) {
      left: 34%;
    }

    .weather_text span:nth-of-type(3) {
      left: 63%;
    }

    .weather_text span:nth-of-type(4) {
      left: 95%;
    }

    .text_two span {
      top: 58%;
    }

    .text_two span:nth-of-type(1) {
      left: 10%;
    }

    .text_two span:nth-of-type(2) {
      left: 47%;
    }

    .text_two span:nth-of-type(3) {
      left: 83%;
    }
  }
  .chart {
    padding-left: 22vw;
    flex-grow: 1;
    height: 100%;
    width: 0%;
    // background-color: #fff;
  }
}

.box3 {
  z-index: 50;
  position: absolute;
  width: 22vw;
  height: 32vh;
  top: 6vh;
  right: 2vw;
  background-image: url("./layer4/img/right2.png");
  background-size: 100% 100%;
  .boxTitle {
    font-size: 1.6vh;
    margin: 1.1vh 2vw 0 2vw;
    color: #0efcff;
    text-align: center;
  }

  .csbaseBox1 {
    // background-color: #275994;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    padding: 1.5vh 2vw 2vh 2vw;
    user-select: none;
    color: #fff;
    height: 28vh;
    font-size: 12px;
    .boxList {
      display: flex;
      margin-bottom: 3px;
      border-bottom: 1px solid rgb(40, 229, 233);
      .item {
        flex-grow: 1;
        text-align: center;
        cursor: pointer;
        line-height: 1.4vw;
        &.active {
          color: rgb(40, 229, 233);
          border-top: 0.02vw solid rgb(40, 229, 233);
          border-right: 0.02vw solid rgb(40, 229, 233);
          border-left: 0.02vw solid rgb(40, 229, 233);
        }
      }
    }
    .p9_card {
      height: 0;
      flex-grow: 1;
      overflow-y: scroll;
      overflow-x: hidden;

      &::-webkit-scrollbar {
        display: none;
      }
    }
    .el-form {
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

    .UAVBox {
      width: 100%;
      height: 100%;
    }
  }
}

.box4 {
  z-index: 50;
  position: absolute;
  width: 22vw;
  height: 25vh;
  top: 42vh;
  right: 2vw;
  background-image: url("./layer4/img/right2.png");
  background-size: 100% 100%;
  .boxTitle {
    font-size: 1.6vh;
    margin: 0.8vh 2vw 0 2vw;
    color: #0efcff;
    text-align: center;
  }
  display: flex;
  flex-direction: column;
  .chart {
    flex-grow: 1;
    height: 0;
    width: 80%;
    margin: 0 10%;
  }
}

.box5 {
  z-index: 50;
  position: absolute;
  width: 22vw;
  height: 25vh;
  top: 70vh;
  right: 2vw;
  background-image: url("./layer4/img/right2.png");
  background-size: 100% 100%;
  .boxTitle {
    font-size: 1.6vh;
    margin: 0.8vh 2vw 0 2vw;
    color: #0efcff;
    text-align: center;
  }
  display: flex;
  flex-direction: column;
  .chart {
    flex-grow: 1;
    height: 0;
    width: 80%;
    margin: 0 10%;
  }
}

.box6 {
  z-index: 50;
  position: absolute;
  width: 22vw;
  height: 25vh;
  top: 70vh;
  left: 2vw;
  background-image: url("./layer4/img/right2.png");
  background-size: 100% 100%;
  .boxTitle {
    font-size: 1.6vh;
    margin: 0.8vh 2vw 0 2vw;
    color: #0efcff;
    text-align: center;
  }
  display: flex;
  flex-direction: column;
  .chart {
    flex-grow: 1;
    height: 0;
    width: 80%;
    margin: 0 10%;
  }
}

.baseBox {
  display: none;
}
</style>
