<template>
  <div class="index" v-loading="loading">
    <template v-if="!loading">
      <div class="grid_root">
        <div class="Drawer_row">
          <Drawer class="left_toolber" show direction="left" :size="300">
            <el-collapse v-model="activeNames">
              <PublicTransit :showLayer.sync="showLayerPublicTransit" :lock2D.sync="lock2DPublicTransit" name="PublicTransit" />
              <MotorizedTravel :showLayer.sync="showLayerMotorizedTravel" :lock2D.sync="lock2DMotorizedTravel" name="MotorizedTravel" />
              <CarTravel :showLayer.sync="showLayerCarTravel" :lock2D.sync="lock2DCarTravel" name="CarTravel" />
              <Build3D :showLayer.sync="showLayerBuild3D" :lock2D.sync="lock2DBuild3D" name="Build3D" />
              <Network :showLayer.sync="showLayerNetwork" :lock2D.sync="lock2DNetwork" name="Network" />
              <Activity3D :showLayer.sync="showLayerActivity3D" :lock2D.sync="lock2DActivity3D" name="Activity3D" />
              <GeoJSON :showLayer.sync="showLayerGeoJSON" :lock2D.sync="lock2DGeoJSON" name="GeoJSON" />
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
          <Drawer class="right_toolber" :show.sync="showStopToolbar" direction="right" :size="300">
            <Toolbar ref="Toolbar" />
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
    "en-US": "clock："
  },
  "速度：":{
    "zh-CN": "速度：",
    "en-US": "speed："
  },
  "时间：":{
    "zh-CN": "时间：",
    "en-US": "time："
  },
  "分/秒":{
    "zh-CN": "分/秒",
    "en-US": "Min/s"
  },
}
</language>

<script>
import mixins from "./mixins";

import HelpDialog from "./component/HelpDialog/index.vue";

import Toolbar from "./component/Toolbar/index.vue";
import PublicTransit from "./component/PublicTransit/index.vue";
import MotorizedTravel from "./component/MotorizedTravel/index.vue";
import Build3D from "./component/Build3D/index.vue";
import Network from "./component/Network/index.vue";
import Activity3D from "./component/Activity3D/index.vue";
import GeoJSON from "./component/GeoJSON/index.vue";
import CarTravel from "./component/CarTravel/index.vue";

import NewClock from "@/components/NewClock/index.vue";

export default {
  components: {
    HelpDialog,
    PublicTransit,
    Toolbar,
    MotorizedTravel,
    Build3D,
    Network,
    Activity3D,
    GeoJSON,
    CarTravel,
    NewClock,
  },
  mixins: [mixins],
  data() {
    return {};
  },
  methods: {
    speedCommand(value) {
      this.speed = value;
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
