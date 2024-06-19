<template>
  <div class="index" v-loading="loading">
    <template v-if="!loading">
      <div class="grid_root">
        <div class="Drawer_row">
          <Drawer class="left_toolber" show direction="left" :size="300">
            <el-collapse v-model="activeNames">
              <LinesAnalysis :showLayer.sync="showLayerLinesAnalysis" name="LinesAnalysis" ref="LinesAnalysis" />
              <AnalysisReport :showLayer.sync="showLayerAnalysisReport" name="AnalysisReport" ref="AnalysisReport" />
              <PublicTransit :showLayer.sync="showLayerPublicTransit" name="PublicTransit" ref="PublicTransit" />
              <MotorizedTravel :showLayer.sync="showLayerMotorizedTravel" name="MotorizedTravel" ref="MotorizedTravel" />
              <Build3D :showLayer.sync="showLayerBuild3D" name="Build3D" ref="Build3D" />
              <Network :showLayer.sync="showLayerNetwork" name="Network" ref="Network" />
              <Activity3D :showLayer.sync="showLayerActivity3D" name="Activity3D" />
              <GeoJSON :showLayer.sync="showLayerGeoJSON" name="GeoJSON" />
              <div style="height: 100px"></div>
            </el-collapse>
          </Drawer>
          <div class="Drawer_col">
            <div></div>
            <div class="mapBox">
              <NewClock class="NewClock" :time="time" :speed.sync="speed" :minTime="minTime" :maxTime="maxTime" @update:time="handleUpdateTime" @showHelp="handleShowHelp"></NewClock>
              <div id="mapRoot"></div>
            </div>
          </div>
          <Drawer :show.sync="showStopToolbar" direction="right" :size="300">
            <!-- <Toolbar ref="Toolbar" /> -->
            <Toolbar ref="Toolbar" :permanent-list="permanentList" />
          </Drawer>
        </div>
      </div>
      <HelpDialog :visible.sync="showHelpDialog" />
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
import mixins from "../operationsAnalysis/mixins";

import PublicTransit from "../operationsAnalysis/component/PublicTransit/index.vue";
import MotorizedTravel from "../operationsAnalysis/component/MotorizedTravel/index.vue";
import Build3D from "../operationsAnalysis/component/Build3D/index.vue";
import Network from "../operationsAnalysis/component/Network/index.vue";
import Activity3D from "../operationsAnalysis/component/Activity3D/index.vue";
import GeoJSON from "../operationsAnalysis/component/GeoJSON/index.vue";

import AnalysisReport from "./component/AnalysisReport/index.vue";
import LinesAnalysis from "./component/LinesAnalysis/index.vue";

import HelpDialog from "./component/HelpDialog/index.vue";
import Toolbar from "./component/Toolbar/index.vue";

import NewClock from "@/components/NewClock/index.vue";

export default {
  mixins: [mixins],
  components: {
    PublicTransit,
    MotorizedTravel,
    Build3D,
    Network,
    Activity3D,
    GeoJSON,

    AnalysisReport,
    LinesAnalysis,

    HelpDialog,
    Toolbar,
    NewClock,
  },

  data() {
    return {
      activeNames: ["LinesAnalysis", "AnalysisReport", "PublicTransit", "MotorizedTravel", "Build3D", "Network", "Activity3D", "GeoJSON"],

      showLayerLinesAnalysis: true,
      showLayerAnalysisReport: false,

      showStopToolbar: true,

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
      this.handleChangeMapCameraControls();
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

  .left_toolber {
    background-color: #eef2fd;
    .el-input__inner,
    .el-collapse-item__wrap {
      background-color: #eef2fd;
    }
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

    .play_btn {
      position: relative;
      top: 3px;
      cursor: pointer;
      color: #409eff;
      font-size: 20px;
    }
  }

  .mapBox {
    position: relative;

    .NewClock {
      position: absolute;
      right: 20px;
      top: 20px;
      z-index: 1000;
    }

    #mapRoot {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
