<template>
  <div class="index" v-loading="loading">
    <template v-if="!loading">
      <div class="grid_root">
        <div class="Drawer_row">
          <Drawer class="left_toolber" :show.sync="showLeftToolbar" direction="left" :size="300">
            <el-collapse v-model="activeNames">
              <PublicTransit :showLayer.sync="showLayerPublicTransit" :lock2D.sync="lock2DPublicTransit" name="PublicTransit" ref="PublicTransit" />
              <MotorizedTravel :showLayer.sync="showLayerMotorizedTravel" :lock2D.sync="lock2DMotorizedTravel" name="MotorizedTravel" ref="MotorizedTravel" />
              <CarTravel :showLayer.sync="showLayerCarTravel" :lock2D.sync="lock2DCarTravel" name="CarTravel" ref="CarTravel" />
              <Build3D :showLayer.sync="showLayerBuild3D" :lock2D.sync="lock2DBuild3D" name="Build3D" ref="Build3D" />
              <Network :showLayer.sync="showLayerNetwork" :lock2D.sync="lock2DNetwork" name="Network" ref="Network" />
              <Activity3D :showLayer.sync="showLayerActivity3D" :lock2D.sync="lock2DActivity3D" name="Activity3D" ref="Activity3D" />
              <GeoJSON :showLayer.sync="showLayerGeoJSON" :lock2D.sync="lock2DGeoJSON" name="GeoJSON" ref="GeoJSON" />
              <Parking :showLayer.sync="showLayerParking" :lock2D.sync="lock2DParking" name="Parking" ref="Parking" />
              <TrafficRegionAnalysis :showLayer.sync="showLayerTrafficRegionAnalysis" :lock2D.sync="lock2DTrafficRegionAnalysis" name="TrafficRegionAnalysis" ref="TrafficRegionAnalysis" />
              <div style="height: 100px"></div>
            </el-collapse>
          </Drawer>
          <div class="Drawer_col">
            <div></div>
            <div class="mapBox">
              <NewClock class="NewClock" :time="time" :speed="speed" @update:speed="speedCommand" :minTime="minTime" :maxTime="maxTime" @update:time="handleUpdateTime" @showHelp="handleShowHelp">
                <template slot-scope="{ showFun }">
                  <PageConfig></PageConfig>
                </template>
              </NewClock>
              <div id="mapRoot"></div>
            </div>
          </div>
          <Drawer class="right_toolber" :show.sync="showStopToolbar" direction="right" :size="300">
            <Toolbar ref="Toolbar" />
          </Drawer>
        </div>
      </div>
      <HelpDialog :visible.sync="showHelpDialog" />
    </template>
  </div>
</template>

<script>
import mixins from "./mixins";

import HelpDialog from "./component/HelpDialog/index.vue";
import Toolbar from "./component/Toolbar/index.vue";

import PageConfig from "./component/PageConfig/index.vue";
import configMixins from "./component/PageConfig/configMixins.js";
import { saveUserCfg, getUserCfg, userCfgList, removeUserCfg } from "@/api/index.js";

export default {
  components: {
    HelpDialog,
    Toolbar,
    PageConfig,
  },
  mixins: [mixins, configMixins],
  data() {
    return {
      activeNames: ["PublicTransit", "MotorizedTravel", "CarTravel", "Build3D", "Network", "Activity3D", "GeoJSON", "Parking", "TrafficRegionAnalysis"],
    };
  },
  created() {
    // window.addEventListener("beforeunload", function (event) {
    //   console.log("beforeunload");
    //   event = event || window.event;
    //   // 兼容IE8和Firefox 4之前的版本
    //   if (event) {
    //     event.returnValue = "您确定要离开当前页面吗？请确认是否保存数据！";
    //   }
    //   // Chrome, Safari, Firefox 4+, Opera 12+ , IE 9+
    //   return "您确定要离开当前页面吗？请确认是否保存数据！";
    // });
  },
  methods: {
    inited() {
      if (this.$route.query.configName) {
        getUserCfg({ fileName: this.$route.query.configName }).then((res) => {
          this.initByConfig(res);
        });
      }
    },
    // 切换地图3D控制
    handleChangeMapCameraControls() {
      let enableRotate = this.canChangeMapCameraControls();

      if (enableRotate) {
        this._Map.enableRotate = true;
      } else {
        this._Map.enableRotate = false;
        this._Map.setPitchAndRotation(90, 0);
      }
    },
    // 切换时间默认值
    handleChangeTimeSpeed() {
      let enableRotate = this.canChangeTimeSpeed();
      if (enableRotate) {
        this.speed = this._speed || 10;
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
  .right_toolber {
    background-color: #eef2fd;
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
