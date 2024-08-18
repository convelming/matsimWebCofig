<template>
  <div class="index">
    <div class="grid_root">
      <div class="Drawer_row">
        <div></div>
        <div class="mapBox">
          <div id="mapRoot">
            <NewClock class="NewClock" :time="time" :speed.sync="speed" :minTime="minTime" :maxTime="maxTime"
              @update:time="handleUpdateTime" @showHelp="handleShowHelp"></NewClock>
          </div>
        </div>
        <Drawer show direction="right" :size="300">
          <el-collapse v-model="activeName" accordion>
            <GeoJSONDetail name="GeoJSONDetail" id="1" />
          </el-collapse>
        </Drawer>
      </div>
    </div>
  </div>
</template>


<script>
import { MyMap, } from "@/mymap/index.js";
import NewClock from "@/components/NewClock/index.vue";
import GeoJSONDetail from "../operationsAnalysis/component/GeoJSON/toolbar/geoJSONDetail.vue";

export default {
  components: {
    NewClock,
    GeoJSONDetail
  },
  provide() {
    return {
      rootVue: this,
    };
  },
  data() {
    return {
      time: 3600 * 8,
      speed: 6,
      minTime: 0,
      maxTime: 3600 * 24.5,
      range: [],
      GeoJSONList: [],
      activeName: "GeoJSONDetail"
    };
  },
  created() {
  },
  async mounted() {
    this.initMap();
  },
  methods: {
    async readReadableStream(stream) {
      const reader = stream.getReader();
      const list = [];
      let { done, value } = await reader.read();
      do {
        let numberOfFloats = value.byteLength / 4;
        let dataView = new DataView(value.buffer);
        for (let i = 0; i < numberOfFloats; i++) {
          list.push(dataView.getFloat32(i * 4, false));
        }
        ({ done, value } = await reader.read());
      } while (!done);
      return new Float32Array(list);
    },
    handleShowHelp() {
      console.log("handleShowHelp");
    },
    handleUpdateTime(value) {
      this.time = value;
    },
    // 初始化地图
    async initMap() {
      this._Map = new MyMap({
        rootId: "mapRoot",
        center: [12628397, 2655338.7],
        minPitch: -90,
      });
      this._Map.cameraControls.enableRotate = true;
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

  .map_box {
    position: relative;
    z-index: 20;
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

.NewClock {
  position: absolute;
  right: 20px;
  top: 20px;
  z-index: 1000;
}
</style>
