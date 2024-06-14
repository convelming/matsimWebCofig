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
              <Activity3D :showLayer.sync="showLayerActivity3D" name="Activity3D" />
              <div style="height: 100px"></div>
            </el-collapse>
          </Drawer>
          <div class="Drawer_col">
            <div></div>
            <div class="mapBox">
              <!-- 新版时间钟&&地图选择&&速度调节&&更多功能 -->
              <NewClock v-show="showClock" class="mapClock" :time="time">
                <template slot="Luopan">
                  <Luopan class="mapLuopan" />
                </template>
                <template slot="bottom">
                  <div class="bottom">
                    <div class="form">
                    <div class="form_item" style="padding-bottom: 25px">
                      <!-- <div class="form_label">{{ $l("时间：") }}</div> -->
                      <div class="form_value">
                        <TimeSlider v-model="time" :speed="60 * 60 * 4" :min="minTime" :max="maxTime"></TimeSlider>
                      </div>
                      
                    </div>
                  </div>
                  <el-dropdown  @command="speedCommand" placement="top-start" trigger="click">
                  <div class="speed">
                        <img class="icon" src="@/assets/image/speed_icon.png">
                        <span>X{{ speed }}</span>
                      </div>
                      <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item v-for="item in speedList" :command="item" :key="item" :disabled="speed === item">速度  X{{ item }} </el-dropdown-item>
                </el-dropdown-menu>
                    </el-dropdown>
                  </div>
                </template>
              </NewClock>
              <!-- 旧版时钟&&地图选择 -->
               <!-- <Luopan class="mapLuopan" />  
              <Clock v-show="showClock" :time="time" />  -->
               
              <div id="mapRoot"></div>
            </div>
            <!-- 旧版时间速度调节 -->
            <!-- <Drawer show direction="bottom" :size="180">
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
                    <div class="form_label">
                      <div class="play_btn" :class="timePlay ? 'el-icon-video-pause' : 'el-icon-video-play'" :title="timePlay ? $l('pause') : $l('play')" @click="timePlay = !timePlay"></div>
                    </div>
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
            </Drawer> -->
          </div>
          <Drawer :show.sync="showStopToolbar" direction="right" :size="400">
            <!-- <Toolbar ref="Toolbar" /> -->
            <Toolbar ref="Toolbar" :permanent-list="permanentList" />
          </Drawer>
        </div>
      </div>
      <!-- 旧版更多功能模块 -->
      <!-- <HelpDialog /> -->
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
import NewClock from './component/NewClock.vue'
import mixins from "../operationsAnalysis/mixins";

import PublicTransit from "../operationsAnalysis/component/PublicTransit/index.vue";
import MotorizedTravel from "../operationsAnalysis/component/MotorizedTravel/index.vue";
import Build3D from "../operationsAnalysis/component/Build3D/index.vue";
import Network from "../operationsAnalysis/component/Network/index.vue";
import Activity3D from "../operationsAnalysis/component/Activity3D/index.vue";

import AnalysisReport from "./component/AnalysisReport/index.vue";
import LinesAnalysis from "./component/LinesAnalysis/index.vue";

import HelpDialog from "./component/HelpDialog/index.vue";
import Toolbar from "./component/Toolbar/index.vue";

export default {
  mixins: [mixins],
  components: {
    PublicTransit,
    MotorizedTravel,
    Build3D,
    Network,
    Activity3D,

    AnalysisReport,
    LinesAnalysis,

    HelpDialog,
    Toolbar,
    NewClock
  },

  data() {
    return {
      activeNames: ["LinesAnalysis", "AnalysisReport", "PublicTransit", "MotorizedTravel", "Build3D", "Network", "Activity3D"],

      showLayerLinesAnalysis: true,
      showLayerAnalysisReport: false,

      permanentList: [],
      speedList:[
        0,
        0.5,
        1,
        2,
        4,
        10,
      ]
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
  methods: {
    speedCommand(value){
        this.speed = value
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
    // padding: 10px 10px 0px 20px;
    font-size: 13px;

    &>*+* {
      margin-top: 10px;
    }

    .form_flex {
      display: flex;

      .form_item+.form_item {
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

    .play_btn {
      position: relative;
      top: 3px;
      cursor: pointer;
      color: #409eff;
      font-size: 20px;
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
      // transform: scale(0.8);
      // position: absolute;
      // bottom: 80px;
      // right: 10px;
      // z-index: 1000;
    }

    #mapRoot {
      width: 100%;
      height: 100%;
    }
  }
}

.bottom{
  display: flex;
  align-items: center;
}
.speed {
  height: 26px;
  background: rgba(0, 0, 0, 0.05);
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
  gap: 8px;
  .icon {
    width: 18px;
    height: 18px;

  }

  .text {
    color: #434343;
    font-size: 16px;
    font-weight: 400;
    line-height: 20px;

  }
}
</style>
