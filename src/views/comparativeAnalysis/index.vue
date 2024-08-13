<template>
  <div class="index" v-loading="loading">
    <template v-if="!loading">
      <div class="grid_root">
        <div class="Drawer_row">
          <Drawer class="left_toolber" show direction="left" :size="300">
            <el-collapse v-model="activeNames">
              <LinesAnalysis :showLayer.sync="showLayerLinesAnalysis" :lock2D.sync="lock2DLinesAnalysis" name="LinesAnalysis" ref="LinesAnalysis" />
              <AnalysisReport :showLayer.sync="showLayerAnalysisReport" :lock2D.sync="lock2DAnalysisReport" name="AnalysisReport" ref="AnalysisReport" />

              <PublicTransit :showLayer.sync="showLayerPublicTransit" :lock2D.sync="lock2DPublicTransit" name="PublicTransit" />
              <MotorizedTravel :showLayer.sync="showLayerMotorizedTravel" :lock2D.sync="lock2DMotorizedTravel" name="MotorizedTravel" />
              <CarTravel :showLayer.sync="showLayerCarTravel" :lock2D.sync="lock2DCarTravel" name="CarTravel" />
              <Build3D :showLayer.sync="showLayerBuild3D" :lock2D.sync="lock2DBuild3D" name="Build3D" />
              <Network :showLayer.sync="showLayerNetwork" :lock2D.sync="lock2DNetwork" name="Network" />
              <Activity3D :showLayer.sync="showLayerActivity3D" :lock2D.sync="lock2DActivity3D" name="Activity3D" />
              <GeoJSON :showLayer.sync="showLayerGeoJSON" :lock2D.sync="lock2DGeoJSON" name="GeoJSON" />
              <Parking :showLayer.sync="showLayerParking" :lock2D.sync="lock2DParking" name="Parking" />
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



<script>
import mixins from "../operationsAnalysis/mixins";

import PublicTransit from "../operationsAnalysis/component/PublicTransit/index.vue";
import MotorizedTravel from "../operationsAnalysis/component/MotorizedTravel/index.vue";
import Build3D from "../operationsAnalysis/component/Build3D/index.vue";
import Network from "../operationsAnalysis/component/Network/index.vue";
import Activity3D from "../operationsAnalysis/component/Activity3D/index.vue";
import GeoJSON from "../operationsAnalysis/component/GeoJSON/index.vue";
import CarTravel from "../operationsAnalysis/component/CarTravel/index.vue";
import Parking from "../operationsAnalysis/component/Parking/index.vue";

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
    CarTravel,

    AnalysisReport,
    LinesAnalysis,

    HelpDialog,
    Toolbar,
    NewClock,
    Parking
  },

  data() {
    return {
      activeNames: ["LinesAnalysis", "AnalysisReport", "PublicTransit", "MotorizedTravel", "Build3D", "Network", "Activity3D", "GeoJSON", "CarTravel"],

      showLayerLinesAnalysis: true,
      lock2DLinesAnalysis: false,
      showLayerAnalysisReport: false,
      lock2DAnalysisReport: false,

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
      this.handleChangeTimeSpeed();
      this.handleChangeMapCameraControls();
    },
    lock2DAnalysisReport(val) {
      this.handleChangeTimeSpeed();
      this.handleChangeMapCameraControls();
    },
    showLayerLinesAnalysis(val) {
      this.handleChangeTimeSpeed();
      this.handleChangeMapCameraControls();
    },
    lock2DLinesAnalysis(val) {
      this.handleChangeTimeSpeed();
      this.handleChangeMapCameraControls();
    },
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
    handleChangeMapCameraControls() {
      let enableRotate = true;
      if (this.showLayerLinesAnalysis && this.lock2DLinesAnalysis) enableRotate = false;
      if (this.showLayerAnalysisReport && this.lock2DAnalysisReport) enableRotate = false;

      if (this.showLayerPublicTransit && this.lock2DPublicTransit) enableRotate = false;
      if (this.showLayerMotorizedTravel && this.lock2DMotorizedTravel) enableRotate = false;
      if (this.showLayerBuild3D && this.lock2DBuild3D) enableRotate = false;
      if (this.showLayerNetwork && this.lock2DNetwork) enableRotate = false;
      if (this.showLayerActivity3D && this.lock2DActivity3D) enableRotate = false;
      if (this.showLayerGeoJSON && this.lock2DGeoJSON) enableRotate = false;
      if (this.showLayerCarTravel && this.lock2DCarTravel) enableRotate = false;
      if (this.showLayerParking && this.lock2DParking) enableRotate = false;
      if (enableRotate) {
        this._Map.enableRotate = true;
      } else {
        this._Map.enableRotate = false;
        this._Map.setPitchAndRotation(90, 0);
      }
    },
    handleChangeTimeSpeed() {
      let enableRotate = false;
      if (this.showLayerLinesAnalysis) enableRotate = true;
      if (this.showLayerAnalysisReport) enableRotate = true;

      if (this.showLayerPublicTransit) enableRotate = true;
      if (this.showLayerMotorizedTravel) enableRotate = true;
      if (this.showLayerBuild3D) enableRotate = true;
      if (this.showLayerNetwork) enableRotate = true;
      if (this.showLayerActivity3D) enableRotate = true;
      if (this.showLayerGeoJSON) enableRotate = true;
      if (this.showLayerCarTravel) enableRotate = true;
      if (this.showLayerParking) enableRotate = true;
      if (enableRotate) {
        this.speed = 10;
      } else {
        this.speed = 0;
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
    .el-input__inner {
      background-color: rgba(0, 0, 0, 0.05);
    }
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
