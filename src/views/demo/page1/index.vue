<template>
  <div class="index">
    <div class="grid_root">
      <div class="Drawer_row">
        <div></div>
        <div class="mapBox">
          <Dialog class="TravelAttribute" ref="dialog" hideMinimize hideClose visible left="20" width="400px">
            <el-form label-width="120px" :inline="false" size="normal">
              <el-form-item label="车道文件">
                <input type="file" name="" id="" @change="handleChange1" />
              </el-form-item>
              <el-form-item label="车辆行驶文件">
                <input type="file" name="" id="" @change="handleChange2" />
              </el-form-item>
              <el-form-item label="视角跟随">
                <el-switch v-model="lockSelectVehicle"> </el-switch>
              </el-form-item>
              <el-form-item label="车辆大小">
                <el-slider style="padding: 0 calc(2em - 10px)" v-model="modelSize" :step="0.1" :min="0" :max="20"> </el-slider>
              </el-form-item>
            </el-form>
          </Dialog>
          <div id="mapRoot">
            <NewClock class="NewClock" :time="time" :speed.sync="speed" :minTime="minTime" :maxTime="maxTime" @update:time="handleUpdateTime" @showHelp="handleShowHelp"></NewClock>
          </div>
        </div>
        <!-- <Drawer show direction="right" :size="300">
        </Drawer> -->
        <div></div>
      </div>
    </div>
  </div>
</template>

<script>
import { guid } from "@/utils/utils";
import { MyMap, MapLayer, MAP_LAYER_STYLE } from "@/mymap/index.js";
import NewClock from "@/components/NewClock/index.vue";
import { LineLayer } from "./layer/LineLayer";
import { CarLayer } from "./layer/CarLayer";

export default {
  components: {
    NewClock,
  },
  provide() {
    return {
      rootVue: this,
    };
  },
  computed: {
    GeoJSONIdList() {
      return this.GeoJSONList.map((item) => item.id);
    },
  },

  watch: {
    lockSelectVehicle: {
      handler(val) {
        this._CarLayer.lockSelectCar = val;
      },
    },
    modelSize: {
      handler(val) {
        this._CarLayer.setModelSize(val);
      },
    },
  },
  data() {
    return {
      time: 10,
      speed: 0,
      minTime: 0,
      maxTime: 3600 * 1,
      range: [],
      GeoJSONList: [],
      activeName: ["name", "GeoJSONDetail"],

      lockSelectVehicle: true,
      modelSize: 10,
    };
  },
  created() {},
  async mounted() {
    this.initMap();
  },
  methods: {
    handleShowHelp() {
      console.log("handleShowHelp");
    },
    handleUpdateTime(value) {
      this.time = value;
      this._CarLayer.setTime(value);
    },
    // 初始化地图
    async initMap() {
      this._Map = new MyMap({
        rootId: "mapRoot",
        center: [12623039.8, 2647415.72],
        zoom: 16,
        minPitch: -90,
      });
      this._Map.cameraControls.enableRotate = true;
      this._MapLayer = new MapLayer({ tileClass: MAP_LAYER_STYLE[0], zIndex: -1 });
      this._Map.addLayer(this._MapLayer);

      this._LineLayer = new LineLayer({});
      this._Map.addLayer(this._LineLayer);

      this._CarLayer = new CarLayer({
        lockSelectCar: this.lockSelectVehicle,
        modelSize: this.modelSize,
      });
      this._Map.addLayer(this._CarLayer);
    },
    // 车道文件
    handleChange1(event) {
      if (!event.target.files[0]) return;
      let reader = new FileReader();

      reader.readAsText(event.target.files[0]);
      reader.onload = () => {
        const json = JSON.parse(reader.result);
        this._LineLayer.setData(json);
      };
    },
    // 车辆行驶文件
    handleChange2(event) {
      if (!event.target.files[0]) return;
      let reader = new FileReader();
      reader.readAsArrayBuffer(event.target.files[0]);
      reader.onload = () => {
        const array = new Int8Array(reader.result);
        console.log(array);

        this._CarLayer.setData(array);
      };
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
