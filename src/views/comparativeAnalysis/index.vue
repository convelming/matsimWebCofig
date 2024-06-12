<template>
  <div class="index" v-loading="loading">
    <template v-if="!loading">
      <div class="grid_root">
        <div class="Drawer_row">
          <Drawer show direction="left" :size="400">
            <el-collapse v-model="activeNames">
              <LinesAnalysis :showLayer.sync="showLayerLinesAnalysis" name="LinesAnalysis" ref="LinesAnalysis" />
              <AnalysisReport :showLayer.sync="showLayerAnalysisReport" name="AnalysisReport" ref="AnalysisReport" />
              <PublicTransit :showLayer.sync="showLayerPublicTransit" name="PublicTransit" ref="PublicTransit" />
              <MotorizedTravel :showLayer.sync="showLayerMotorizedTravel" name="MotorizedTravel" ref="MotorizedTravel" />
              <Build3D :showLayer.sync="showLayerBuild3D" name="Build3D" ref="Build3D" />
              <Network :showLayer.sync="showLayerNetwork" name="Network" ref="Network" />
              <div style="height: 100px"></div>
            </el-collapse>
          </Drawer>
          <div class="Drawer_col">
            <div></div>
            <div class="mapBox">
              <Clock v-show="showClock" class="mapClock" :time="time" />
              <Luopan class="mapLuopan" />
              <div id="mapRoot"></div>
            </div>
            <Drawer show direction="bottom" :size="180">
              <div class="form">
                <div class="form_flex">
                  <div class="form_item">
                    <div class="form_label">{{ $l("时钟：") }}</div>
                    <div class="form_value">
                      <el-switch v-model="showClock" />
                    </div>
                  </div>
                  <div class="form_item">
                    <div class="form_label">{{ $l("速度：") }}</div>
                    <div class="form_value">
                      <el-slider style="padding: 0 calc(2em - 10px)" v-model="speed" :step="0.1" :min="0" :max="30" :marks="speedMarks" :format-tooltip="formatSpeed"> </el-slider>
                    </div>
                  </div>
                </div>
                <div class="form_item" style="padding-bottom: 25px">
                  <div class="form_label">{{ $l("时间：") }}</div>
                  <div class="form_value">
                    <TimeSlider v-model="time" :speed="60 * 60 * 4" :min="minTime" :max="maxTime"></TimeSlider>
                  </div>
                </div>
              </div>
            </Drawer>
          </div>
          <Drawer :show.sync="showStopToolbar" direction="right" :size="400">
            <!-- <Toolbar ref="Toolbar" /> -->
            <Toolbar ref="Toolbar" :permanent-list="permanentList" />
          </Drawer>
        </div>
      </div>
      <HelpDialog />
    </template>
  </div>
</template>

<language>
{
  "时钟：":{
    "zh-CN": "时钟：",
    "en-US": "clocks："
  },
  "速度：":{
    "zh-CN": "速度：",
    "en-US": "tempo："
  },
  "时间：":{
    "zh-CN": "时间：",
    "en-US": "times："
  },
  "分/秒":{
    "zh-CN": "分/秒",
    "en-US": "minute/second"
  },
}
</language>

<script>
import "@/mymap/style.css";
import { Map, LocalMapLayer } from "@/mymap/index.js";

import PublicTransit from "../operationsAnalysis/component/PublicTransit/index.vue";
import MotorizedTravel from "../operationsAnalysis/component/MotorizedTravel/index.vue";
import Build3D from "../operationsAnalysis/component/Build3D/index.vue";
import Network from "../operationsAnalysis/component/Network/index.vue";

import AnalysisReport from "./component/AnalysisReport/index.vue";
import LinesAnalysis from "./component/LinesAnalysis/index.vue";

import HelpDialog from "./component/HelpDialog/index.vue";
import Toolbar from "./component/Toolbar/index.vue";

export default {
  components: {
    HelpDialog,
    PublicTransit,
    Toolbar,
    MotorizedTravel,
    Build3D,
    Network,
    LinesAnalysis,
    AnalysisReport,
  },
  watch: {
    page_language: {
      handler(val) {
        this.speedMarks = {
          [-30]: "-30", // + this.$l("分/秒"),
          [-10]: "-2", // + this.$l("分/秒"),
          0: "0", // + this.$l("分/秒"),
          [10]: "2", // + this.$l("分/秒"),
          30: "30", // + this.$l("分/秒"),
        };
      },
      immediate: true,
    },
  },

  data() {
    return {
      loading: false,
      _Map: null,
      _MapLayer: null,
      activeNames: ["LinesAnalysis", "AnalysisReport", "PublicTransit", "MotorizedTravel", "Build3D", "Network"],

      showLayerLinesAnalysis: true,
      showLayerAnalysisReport: false,
      showLayerPublicTransit: false,
      showLayerMotorizedTravel: false,
      showLayerBuild3D: false,
      showLayerNetwork: false,

      showStopToolbar: true,

      showClock: true,

      time: 0,
      speed: 0,
      minTime: 0,
      maxTime: 3600 * 28,
      speedMarks: {},

      permanentList: [],
    };
  },
  watch: {
    showLayerAnalysisReport(val) {
      if (this.$refs.Toolbar) {
        if (val) {
          this.$refs.Toolbar.activeName = "ReportToolbar";
          this.showStopToolbar = true;
        } else if (this.$refs.Toolbar.activeName == "ReportToolbar") {
          this.$refs.Toolbar.activeName = "";
        }
      }
    },
    showLayerLinesAnalysis(val) {
      this.handleChangeMapCameraControls();
    },
    showLayerPublicTransit(val) {
      this.handleChangeMapCameraControls();
    },
    showLayerMotorizedTravel(val) {
      if (val) {
        this.speed = 5;
      } else {
        this.speed = 0;
      }
      this.handleChangeMapCameraControls();
    },
    showLayerBuild3D(val) {
      this.handleChangeMapCameraControls();
    },
    showLayerNetwork(val) {
      this.handleChangeMapCameraControls();
    },
  },
  provide() {
    return {
      rootVue: this,
    };
  },
  created() {
    const { database1, datasource1, database2, datasource2 } = this.$route.params;
    this.$store.dispatch("setDataBase", database1);
    this.$store.dispatch("setDataSource", database1 + "/" + datasource1);
  },
  mounted() {
    this.initLayer();
    this.initMap();
    this.handleChangeMapCameraControls();

    this._timeInterval = setInterval(() => {
      this.time += this.formatSpeed(this.speed);
      if (this.time > this.maxTime) {
        this.time = this.minTime;
      }
      if (this.time < this.minTime) {
        this.time = this.maxTime;
      }
      this.$emit("timeChange", this.time);
    }, 1000 / 60);
  },
  beforeDestroy() {
    clearInterval(this._timeInterval);
  },
  methods: {
    // 格式化速度
    formatSpeed(val) {
      let speed = 0;
      if (Math.abs(val) <= 10) {
        speed = val * 0.2;
      } else if (val > 0) {
        speed = 2 + ((val - 10) * 28) / 20;
      } else if (val < 0) {
        speed = ((val + 10) * 28) / 20 - 2;
      }
      return Math.floor(speed * 100) / 100;
    },
    handleChangeMapCameraControls() {
      // let enableRotate = false;
      // enableRotate = enableRotate || this.showLayerLinesAnalysis;
      // // enableRotate = enableRotate || this.showLayerPublicTransit;
      // enableRotate = enableRotate || this.showLayerMotorizedTravel;
      // enableRotate = enableRotate || this.showLayerBuild3D;
      // enableRotate = enableRotate || this.showLayerNetwork;
      // if (enableRotate) {
      //   this._Map.enableRotate = true;
      // } else {
      //   this._Map.enableRotate = false;
      //   this._Map.setPitchAndRotation(90, 0);
      // }
    },
    initMap() {
      this._Map = new Map({
        rootId: "mapRoot",
        zoom: 11,
        enableRotate: true,
        zoom: 15,
        // minPitch: -90,
      });
      this._Map.addLayer(this._MapLayer);
      window._Map = this._Map;
    },
    initLayer() {
      this._MapLayer = new LocalMapLayer({ zIndex: -1 });
    },
    handleShowStopAndRoute(selectStopIds) {
      if (this.$refs.Toolbar) {
        this.$refs.Toolbar.add("StopAndRoute", {
          ids: selectStopIds,
        });
        this.showStopToolbar = true;
      }
    },
    handleShowStopDetailByStopId(stopId) {
      if (this.$refs.Toolbar) {
        this.$refs.Toolbar.add("StopDetail", {
          stopId: stopId,
        });
        this.showStopToolbar = true;
      }
    },
    handleShowStopDetailByStopData(stopData) {
      if (this.$refs.Toolbar) {
        this.$refs.Toolbar.add("StopDetail", {
          stopData: stopData,
        });
        this.showStopToolbar = true;
      }
    },
    handleShowRouteDetail(routeId) {
      if (this.$refs.Toolbar) {
        this.$refs.Toolbar.add("RouteDetail", {
          routeId: routeId,
        });
        this.showStopToolbar = true;
      }
    },
    handleShowRouteDepartures(routeId) {
      if (this.$refs.Toolbar) {
        this.$refs.Toolbar.add("RouteDepartures", {
          routeId: routeId,
        });
        this.showStopToolbar = true;
      }
    },
    handleShowBusDetail({ uuid, busDetail }) {
      if (this.$refs.Toolbar) {
        this.$refs.Toolbar.add("BusDetail", {
          uuid: uuid,
          busDetail: busDetail,
        });
        this.showStopToolbar = true;
      }
    },
    handleShowSubwayDetail({ uuid, subwayDetail }) {
      if (this.$refs.Toolbar) {
        this.$refs.Toolbar.add("SubwayDetail", {
          uuid: uuid,
          subwayDetail: subwayDetail,
        });
        this.showStopToolbar = true;
      }
    },
    handleShowCarDetail({ uuid, carDetail }) {
      if (this.$refs.Toolbar) {
        this.$refs.Toolbar.add("CarDetail", {
          uuid: uuid,
          carDetail: carDetail,
        });
        this.showStopToolbar = true;
      }
    },
    handleShowBuildDetail({ uuid, buildDetail }) {
      if (this.$refs.Toolbar) {
        this.$refs.Toolbar.add("BuildDetail", {
          uuid: uuid,
          buildDetail: buildDetail,
        });
        this.showStopToolbar = true;
      }
    },
    handleShowLineDetail({ uuid, lineDetail }) {
      if (this.$refs.Toolbar) {
        this.$refs.Toolbar.add("LineDetail", {
          uuid: uuid,
          lineDetail: lineDetail,
        });
        this.showStopToolbar = true;
      }
    },
    handleShowNodeDetail({ uuid, nodeDetail }) {
      if (this.$refs.Toolbar) {
        this.$refs.Toolbar.add("NodeDetail", {
          uuid: uuid,
          nodeDetail: nodeDetail,
        });
        this.showStopToolbar = true;
      }
    },
    handleShowSelectLinkAnalysis({ uuid, lineDetail }) {
      if (this.$refs.Toolbar) {
        this.$refs.Toolbar.add("SelectLinkAnalysis", {
          uuid: uuid,
          lineDetail: lineDetail,
        });
        this.showStopToolbar = true;
      }
    },
    handleShowSelectBuildAnalysis({ uuid, buildDetail }) {
      if (this.$refs.Toolbar) {
        this.$refs.Toolbar.add("SelectBuildAnalysis", {
          uuid: uuid,
          buildDetail: buildDetail,
        });
        this.showStopToolbar = true;
      }
    },
    handleShowRouteFlows({ uuid, routeDetail }) {
      if (this.$refs.Toolbar) {
        this.$refs.Toolbar.add("RouteFlows", {
          uuid: uuid,
          routeDetail: routeDetail,
        });
        this.showStopToolbar = true;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep {
  .el-collapse {
    border-bottom: 0;
  }
}
.index {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  .grid_root {
    width: 100vw;
    height: 100vh;
  }
  .map_box {
    position: relative;
    z-index: 20;
  }

  .form {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 10px 10px 0px 20px;
    font-size: 13px;
    & > * + * {
      margin-top: 10px;
    }
    .form_flex {
      display: flex;
      .form_item + .form_item {
        margin-top: 0;
      }
    }

    .form_item {
      width: 100%;
      display: flex;
      line-height: 40px;
      .form_label {
        flex-shrink: 0;
        padding-right: 10px;
      }
      .form_value {
        width: 100%;
      }
    }
  }

  .HelpDialog {
    bottom: 20px;
    left: 20px;
    position: absolute;
    z-index: 20;
  }

  .mapBox {
    position: relative;
    .mapClock {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 1000;
    }
    .mapLuopan {
      position: absolute;
      bottom: 80px;
      right: 10px;
      z-index: 1000;
    }
    #mapRoot {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
