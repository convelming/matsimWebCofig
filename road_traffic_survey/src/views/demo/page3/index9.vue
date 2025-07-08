<template>
  <div class="p9_index main" v-loading="loading" style="background-color: #000">
    <div id="mapRoot"></div>
    <div class="baseBoxLeft" v-show="pageType === 1">
      <div class="boxTitle">茶叶病虫害预警</div>
      <img src="./layer4/img/left.png" class="first_border" alt="" />
      <div class="firstBox">
        <div class="pic">
          <img src="./layer4/img/demo_pic.png" class="first_top1" alt="" />
          <img src="./layer4/img/data_pic.png" class="first_top2" alt="" />
        </div>
        <div class="picText">
          <span>样本图片</span>
          <span class="text_second">茶叶病虫害大数据库</span>
        </div>
        <div class="voice_animation">
          <canvas id="canvas">Your browser can not support canvas</canvas>
        </div>
        <div class="progress">
          <span class="disease">茶饼病</span>
          <!-- <i class="counter-value">85</i>% -->
          <span class="similar">相似度:85%</span>
          <img src="./layer4/img/progress.gif" alt="" />
        </div>
        <div class="about_illness">
          <div class="symptom">
            <div class="symptom_title">病症症状</div>
            <div class="symptom_content">本模板收集于网络，无需任何付费操作</div>
          </div>
          <div class="prevent">
            <div class="prevent_title">防治方法</div>
            <div class="prevent_content">本模板收集于网络，无需任何付费操作，Gitee免费下载使用 如需获取更多模板，可关注公众号【DreamCoders】</div>
          </div>
        </div>
      </div>
    </div>
    <!-- 左侧下部 -->
    <div class="baseBox centerMainBox2" style="height: 30%" v-show="pageType === 1">
      <img src="./layer4/img/down2.png" class="first_border" alt="" />
      <div class="boxTitle2" style="width: 26%">统计数据</div>
      <div class="boxTitle2" style="width: 26%; margin-left: 22vw; margin-top: -1.4vw">生长数据</div>
      <div class="boxTitle2" style="width: 26%; margin-left: 53vw; margin-top: -1.4vw">气象数据</div>
      <div class="leftBottom">
        <div class="land_data">
          <p>10cm 温度30湿度67</p>
          <p>20cm 温度30湿度67</p>
          <p>30cm 温度30湿度67</p>
        </div>
      </div>
      <div class="right_box">
        <div class="grow_data">
          <img src="./layer4/img/tree_pic.png" alt="" />
          <p>生长周期：8周</p>
          <p>黏土</p>
          <p>10cm茶土：22.88</p>
          <i></i>
          <div class="specialistSuggest">
            <div>专家建议：</div>
            <div>本模板收集于网络，无需任何付费操作，Gitee免费下载使用</div>
          </div>
          <div class="fertilizationSuggest">
            <div>该生长周期施肥建议：</div>
            <div>氮肥含量：1.3-1.5kg</div>
            <div>钾肥含量：1.5-1.7kg</div>
          </div>
        </div>
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
      </div>
    </div>

    <div class="baseBox baseBox1" style="margin-bottom: 15px; height: 40%" v-show="pageType === 1">
      <img src="./layer4/img/right.png" class="hardware" alt="" />

      <div class="boxTitle">硬件设备展示</div>
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
    <div class="baseBox baseBox2" style="margin-bottom: 15px; height: 29.5%" v-show="pageType === 1">
      <img src="./layer4/img/right2.png" alt="" />
      <!-- 四个角描边 end -->
      <div class="boxTitle2">灌溉数据</div>
      <div class="irrigate_data">
        <div class="irrigate_top">
          <div class="centerList">
            <div class="centerListFont">累计灌溉水量（m2）</div>
            <div class="centerListNum">
              <span class="">23678</span>
            </div>
          </div>
          <div class="centerList">
            <div class="centerListFont">灌溉压力（MPa）</div>
            <div class="centerListNum">
              <span class="">0.29</span>
            </div>
          </div>
        </div>
        <div class="irrigate_bottom">
          <div class="every_line">
            <span>当前灌溉流量（m²/h）</span>
            <i class="">0.78</i>
          </div>
          <div class="every_line">
            <span>当前灌溉阀门数量</span>

            <i class="counter-value">49</i>
            <i class="counter-value">2</i>
          </div>
          <div class="every_line">
            <span>茶园水池液位</span>
            <i>2.30</i>
          </div>
        </div>
      </div>
    </div>
    <div class="baseBox baseBox3" style="height: 28%" v-show="pageType === 1">
      <img src="./layer4/img/right3.png" alt="" />
      <!-- 四个角描边 end -->
      <div class="boxTitle2">数据日志</div>
      <!-- <div class="data_day" id="demo" > -->
      <div class="data_day" id="demo" style="width: 100%; overflow: hidden; height: 75%">
        <table style="text-align: left; margin-left: 10%; height: 80%">
          <tbody id="demo1">
            <!-- <tr class="head">
                                    <td>编号</td>
                                    <td>数据类型</td>
                                    <td>数据值</td>
                                    <td>时间</td>
                                </tr> -->
            <tr>
              <td>u78</td>
              <td>传感器数据</td>
              <td>163.28</td>
              <td>2019年10月26日</td>
            </tr>

            <tr>
              <td>006</td>
              <td>无人机数据</td>
              <td>130.67</td>
              <td>2019年10月25日</td>
            </tr>

            <tr>
              <td>s07</td>
              <td>控制器数据</td>
              <td>163.28</td>
              <td>2019年10月25日</td>
            </tr>
            <tr>
              <td>872</td>
              <td>监视器数据</td>
              <td>130.67</td>
              <td>2019年10月24日</td>
            </tr>
            <tr>
              <td>d59</td>
              <td>土壤仪数据</td>
              <td>163.28</td>
              <td>2019年10月23日</td>
            </tr>

            <tr>
              <td>299</td>
              <td>灌溉阀数据</td>
              <td>130.67</td>
              <td>2019年10月23日</td>
            </tr>
            <tr>
              <td>256</td>
              <td>传感器数据</td>
              <td>163.28</td>
              <td>2019年10月22日</td>
            </tr>
            <tr>
              <td>026</td>
              <td>无人机数据</td>
              <td>130.67</td>
              <td>2019年10月20日</td>
            </tr>
            <tr>
              <td>037</td>
              <td>传感器数据</td>
              <td>163.28</td>
              <td>2019年10月22日</td>
            </tr>
          </tbody>
          <tbody id="demo2" style="text-align: left; margin-left: 10%"></tbody>
        </table>
      </div>
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
            <div class="p9_progress_name">{{ playDetail.point.z }}m</div>
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
        <div class="p9_play_btn el-icon-refresh" @click="reset"></div>
      </div>
    </template>
  </div>
</template>

<script>
import { MyMap, MAP_EVENT } from "@/mymap/index.js";
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
      time: 120,
      minTime: 0,
      maxTime: 5000,
      tifOpacity: 1,
      UAVPathClassName: "LinePath", // LinePath CubicBezierPath
    };
  },
  created() {},
  async mounted() {
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
      console.log(error);
    }
    this.loading = false;
  },
  beforeDestroy() {},
  methods: {
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
      });
      this._Map.addLayer(this._Network3DLayer);

      this._UAVListLayer = new UAVListLayer({
        zIndex: 300,
        linkWidth: 2,
        nodeSize: 30,
        time: this.time,
        lockSelect: this.lockSelect,
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
      this.playStart = "play";
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
      this.playStart = "stop";
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

<style scoped src="./layer4/css/reset.css"></style>
<style scoped src="./layer4/css/new_index.css"></style>
<style scoped src="./layer4/css/public.css"></style>

<style lang="scss" scoped>
.p9_index {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

#mapRoot {
  position: absolute;
  left: 0;
  right: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
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
    flex: 1;
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
    flex: 1;
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
        flex: 1;
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
    flex: 1;
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
        flex: 1;
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

.csbaseBox1 {
  // background-color: #275994;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding: 1vh 3vw 3vh 3vw;
  user-select: none;
  color: #fff;
  height: 85%;
  font-size: 12px;
  .boxList {
    display: flex;
    margin-bottom: 3px;
    border-bottom: 1px solid rgb(40, 229, 233);
    .item {
      flex: 1;
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
    flex: 1;
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
</style>
