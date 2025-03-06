<template>
  <el-collapse-item class="my_collapse_item" :name="name" :class="{ active: s_showLayer }">
    <div class="el-collapse-item__title" slot="title" :title="$l('公共交通出行')">
      <el-checkbox class="checkbox" :value="s_showLayer" @change="handleChangeShowLayer">
        <img class="item_icon" v-show="s_showLayer" src="@/assets/image/MotorizedTravel_icon_a.png" />
        <img class="item_icon" v-show="!s_showLayer" src="@/assets/image/MotorizedTravel_icon.png" />
        <span class="item_title">{{ $l("公共交通出行") }}</span>
        <span v-if="loading" class="el-icon-loading" style="margin-left: 10px"></span>
      </el-checkbox>
    </div>
    <div class="form">
      <div class="form_item">
        <div class="form_label">{{ $l("视角跟随：") }}</div>
        <div class="form_value">
          <el-switch :disabled="!s_showLayer" v-model="lockSelectVehicle"> </el-switch>
        </div>
      </div>
      <div class="form_item">
        <div class="form_label">{{ $l("显示图层：") }}</div>
        <div class="form_value">
          <el-switch :disabled="!s_showLayer" v-model="showBus3DLayer" @change="handleShowBus3DLayer($event), handleShowSubway3DLayer($event)"> </el-switch>
          <!-- <div
            class="layer"
            @click="
              () => {
                if (s_showLayer) {
                  showBus3DLayer = !showBus3DLayer;
                  handleShowBus3DLayer(showBus3DLayer);
                  handleShowSubway3DLayer(showBus3DLayer);
                }
              }
            "
          >
            <template v-if="showBus3DLayer">
              <div class="text">{{ $l("公交车") }}</div>
              <img class="icon" src="@/assets/image/eye-fill.png" />
            </template>
            <template v-else>
              <div class="text2">{{ $l("公交车") }}</div>
              <img class="icon" src="@/assets/image/eye-close-line.png" />
            </template>
          </div>
          <div
            class="layer"
            @click="
              () => {
                if (s_showLayer) {
                  showCar3DLayer = !showCar3DLayer;
                  handleShowCar3DLayer(showCar3DLayer);
                }
              }
            "
          >
            <template v-if="showCar3DLayer">
              <div class="text">{{ $l("私家车") }}</div>
              <img class="icon" src="@/assets/image/eye-fill.png" />
            </template>
            <template v-else>
              <div class="text2">{{ $l("私家车") }}</div>
              <img class="icon" src="@/assets/image/eye-close-line.png" />
            </template>
          </div> -->
        </div>
      </div>
      <div class="form_item">
        <div class="form_label">{{ $l("车辆大小：") }}</div>
        <div class="form_value">
          <el-slider :disabled="!s_showLayer" style="padding: 0 calc(2em - 10px)" v-model="modelSize" :step="0.1" :min="0" :max="20"> </el-slider>
          <!--            <el-input-number class="my_input_number_1" style="width: 100%" :disabled="!s_showLayer" size="small"-->
          <!--            v-model="modelSize" :min="1" :max="30" :step="1" step-strictly> </el-input-number>-->
        </div>
      </div>
      <div class="form_item">
        <div class="form_label">{{ $l("最大显示数量：") }}</div>
        <div class="form_value">
          <el-input-number class="my_input_number_1" style="width: 100%" :disabled="!s_showLayer" size="medium" v-model="maxVehicleNum" :min="0" :step="100" step-strictly> </el-input-number>
        </div>
      </div>
      <!-- <div class="form_item">
        <div class="form_label">{{ $l("时间：") }}</div>
        <div class="form_value">
          <TimeSlider
            :disabled="!s_showLayer"
            v-model="time"
            :speed="60 * 60 * 4"
            :min="minTime"
            :max="maxTime"
          ></TimeSlider>
        </div>
      </div>
      <div class="form_item">
        <div class="form_label">{{ $l("速度：") }}</div>
        <div class="form_value">
          <el-slider
            :disabled="!s_showLayer"
            style="padding: 0 calc(2em - 10px)"
            v-model="speed"
            :step="0.1"
            :min="0"
            :max="30"
            :marks="speedMarks"
            :format-tooltip="formatSpeed"
          >
          </el-slider>
        </div>
      </div> -->
    </div>
  </el-collapse-item>
</template>

<language>
{
  "公共交通出行":{
    "zh-CN": "公共交通车辆",
    "en-US": "PT Vehicles"
  },
  "视角跟随：":{
    "zh-CN": "视角跟随：",
    "en-US": "View Following："
  },
  "显示图层：":{
    "zh-CN": "显示图层：",
    "en-US": "Show Layers："
  },
  "公交车":{
    "zh-CN": "公交车",
    "en-US": "Public Transit"
  },
  "私家车":{
    "zh-CN": "私家车",
    "en-US": "Private Car"
  },
  "车辆大小：":{
    "zh-CN": "车辆大小：",
    "en-US": "Vehicle Size："
  },
  "最大显示数量：":{
    "zh-CN": "最大显示数量：",
    "en-US": "Maximum Display："
  },
}
</language>

<script>
import { MAP_EVENT } from "@/mymap/index.js";
import { BusMotionLayer } from "./layer/BusMotionLayer";
import { SubwayMotionLayer } from "./layer/SubwayMotionLayer";
// import { CarMotionLayer } from "./layer/CarMotionLayer";
import { getBusPath, getBusPathArray, getCarPath, getCarPathArray, getSubwayPath, getSubwayPathArray } from "@/api/index";

export default {
  props: ["name", "showLayer", "lock2D"],
  inject: ["rootVue"],
  computed: {
    _Map() {
      return this.rootVue._Map;
    },
  },
  watch: {
    showLayer: {
      handler(val) {
        this.s_showLayer = val;
        if (val) {
          this.handleEnable();
        } else {
          this.handleDisable();
        }
      },
    },
    lockSelectVehicle: {
      handler(val) {
        this._BusMotionLayer.lockSelectBus = val;
        this._SubwayMotionLayer.lockSelectSubway = val;
        // this._CarMotionLayer.lockSelectCar = val;
      },
    },
    maxVehicleNum: {
      handler(val) {
        this._BusMotionLayer.maxBusNum = val;
        this._SubwayMotionLayer.maxSubwayNum = val;
        // this._CarMotionLayer.maxCarNum = val;
      },
    },
    modelSize: {
      handler(val) {
        this._BusMotionLayer.setModelSize(val);
        this._SubwayMotionLayer.setModelSize(val);
        // this._CarMotionLayer.setModelSize(val);
      },
    },
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
      configKey: "motorizedTravelConfig",
      s_showLayer: false,

      lockSelectVehicle: true,
      showBus3DLayer: true,
      showSubway3DLayer: true,
      // showCar3DLayer: false,
      maxVehicleNum: 20000,

      _BusMotionLayer: null,
      _SubwayMotionLayer: null,
      // _CarMotionLayer: null,

      modelSize: 3,

      time: 0,
      speed: 1.0,
      minTime: 0,
      maxTime: 3600 * 24,
      speedMarks: {},

      loading: false,
    };
  },
  created() {
    this.s_showLayer = this.showLayer;
    this._BusMotionLayer = new BusMotionLayer({
      zIndex: 0,
      lockSelectBus: this.lockSelectVehicle,
      maxBusNum: this.maxVehicleNum,
      modelSize: this.modelSize,
      event: {
        [MAP_EVENT.HANDLE_PICK_LEFT]: ({ data }) => {
          this._BusMotionLayer.setSelectBusId(data);
          this.rootVue.handleShowBusDetail({
            uuid: data,
            busDetail: { id: data },
          });
        },
      },
    });
    this._SubwayMotionLayer = new SubwayMotionLayer({
      zIndex: 0,
      lockSelectSubway: this.lockSelectVehicle,
      maxSubwayNum: this.maxVehicleNum,
      modelSize: this.modelSize,
      event: {
        [MAP_EVENT.HANDLE_PICK_LEFT]: ({ data }) => {
          this._SubwayMotionLayer.setSelectSubwayId(data);
          this.rootVue.handleShowSubwayDetail({
            uuid: data,
            subwayDetail: { id: data },
          });
        },
      },
    });
    // this._CarMotionLayer = new CarMotionLayer({
    //   zIndex: 10,
    //   lockSelectCar: this.lockSelectVehicle,
    //   maxCarNum: this.maxVehicleNum,
    //   modelSize: this.modelSize,
    //   event: {
    //     [MAP_EVENT.HANDLE_PICK_LEFT]: ({ data }) => {
    //       this._CarMotionLayer.setSelectCarId(data);
    //       this.rootVue.handleShowCarDetail({
    //         uuid: data.join(","),
    //         carDetail: { id: data[1], vehicleId: data[0] },
    //       });
    //     },
    //   },
    // });
  },
  mounted() {
    this._interval = setInterval(() => {
      if (!this._Map) return;
      clearInterval(this._interval);
      if (this.s_showLayer) {
        this.handleEnable();
      }
    }, 1000);
  },
  beforeDestroy() {
    this.handleDisable();
    this._BusMotionLayer.dispose();
    this._SubwayMotionLayer.dispose();
    // this._CarMotionLayer.dispose();
  },
  methods: {
    initByConfig(config) {
      config = config || this.rootVue.defaultConfig.motorizedTravelConfig;
      this.s_showLayer = config.showLayer;
      this.$emit("update:showLayer", config.showLayer);
      this.$emit("update:lock2D", config.lock2D);

      this.lockSelectVehicle = config.lockSelectVehicle;
      this.showBus3DLayer = config.showBus3DLayer;
      this.showSubway3DLayer = config.showSubway3DLayer;
      this.maxVehicleNum = config.maxVehicleNum;
      this.modelSize = config.modelSize;
    },
    exportConfig() {
      return {
        showLayer: this.s_showLayer,
        lock2D: this.lock2D,
        maxVehicleNum: this.maxVehicleNum,
        modelSize: this.modelSize,
        showBus3DLayer: this.showBus3DLayer,
        showSubway3DLayer: this.showSubway3DLayer,
        // showCar3DLayer: this.showCar3DLayer,
        lockSelectVehicle: this.lockSelectVehicle,
      };
    },
    getData() {
      if (this.loading) return;
      this.loading = true;
      let list = [];
      if (!this._BusDataLoaded && this.showBus3DLayer) list.push(this.getBusPath());
      if (!this._SubwayDataLoaded && this.showSubway3DLayer) list.push(this.getSubwayPath());
      // if (!this._CarDataLoaded && this.showCar3DLayer) list.push(this.getCarPath());
      Promise.all(list).finally(() => {
        this.loading = false;
      });
    },
    async getBusPath() {
      try {
        const res = await getBusPathArray();
        this._BusMotionLayer.setData(res.data);
        this._BusDataLoaded = true;
      } catch (error) {}
    },
    async getSubwayPath() {
      try {
        const res = await getSubwayPathArray();
        this._SubwayMotionLayer.setData(res.data);
        this._SubwayDataLoaded = true;
      } catch (error) {}
    },
    // async getCarPath() {
    //   try {
    //     const res = await getCarPathArray(10000);
    //     this._CarMotionLayer.setData(res.data);
    //     this._CarDataLoaded = true;
    //   } catch (error) {}
    // },
    handleChangeShowLayer(value) {
      this.s_showLayer = value;
      this.$emit("update:showLayer", value);
    },
    handleShowBus3DLayer(val) {
      try {
        if (val) {
          this.rootVue.$on("MotorizedTravel_setSelectedBus", ({ data, select }) => {
            if (select) {
              this._BusMotionLayer.setSelectBusId(data.id);
            } else if (this._BusMotionLayer.selectBusId === data.id) {
              this._BusMotionLayer.setSelectBusId(null);
            }
          });
          this._Map.addLayer(this._BusMotionLayer);
        } else {
          this.rootVue.$off("MotorizedTravel_setSelectedBus");
          this._Map.removeLayer(this._BusMotionLayer);
        }
      } catch (error) {
        console.log(error);
      }
    },
    handleShowSubway3DLayer(val) {
      try {
        if (val) {
          this.rootVue.$on("MotorizedTravel_setSelectedSubway", ({ data, select }) => {
            if (select) {
              this._SubwayMotionLayer.setSelectSubwayId(data.id);
            } else if (this._SubwayMotionLayer.selectSubwayId === data.id) {
              this._SubwayMotionLayer.setSelectSubwayId(null);
            }
          });
          this._Map.addLayer(this._SubwayMotionLayer);
        } else {
          this.rootVue.$off("MotorizedTravel_setSelectedSubway");
          this._Map.removeLayer(this._SubwayMotionLayer);
        }
      } catch (error) {
        console.log(error);
      }
    },
    // handleShowCar3DLayer(val) {
    //   try {
    //     if (val) {
    //       this.rootVue.$on("MotorizedTravel_setSelectedCar", (carDetail) => {
    //         this._CarMotionLayer.setSelectCarId(carDetail.id);
    //       });
    //       this._Map.addLayer(this._CarMotionLayer);
    //     } else {
    //       this.rootVue.$off("MotorizedTravel_setSelectedCar");
    //       this._Map.removeLayer(this._CarMotionLayer);
    //     }
    //   } catch (error) {}
    // },
    // 组件初始化事件
    handleEnable() {
      this.getData();
      this.handleShowBus3DLayer(this.showBus3DLayer);
      this.handleShowSubway3DLayer(this.showBus3DLayer);
      // this.handleShowSubway3DLayer(this.showSubway3DLayer);
      // this.handleShowCar3DLayer(this.showCar3DLayer);
      this.rootVue.$on("timeChange", this.handleTimeChange);
    },
    // 组件卸载事件
    handleDisable() {
      this.handleShowBus3DLayer(false);
      this.handleShowSubway3DLayer(false);
      // this.handleShowCar3DLayer(false);
      this.rootVue.$off("timeChange", this.handleTimeChange);
    },
    handleTimeChange(time) {
      if (this._BusMotionLayer) this._BusMotionLayer.setTime(time);
      if (this._SubwayMotionLayer) this._SubwayMotionLayer.setTime(time);
      // if (this._CarMotionLayer) this._CarMotionLayer.setTime(time);
    },
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
  },
};
</script>

<style lang="scss" scoped>
::v-deep {
  .el-slider__marks-text {
    white-space: nowrap;
  }
}

.my_collapse_item {
  .layer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    .text2 {
      color: rgba(0, 0, 0, 0.3);
    }

    .icon {
      width: 20px;
      height: 20px;
    }
  }
}

.flex-align-center {
  display: flex;
  align-items: center;
}
</style>
