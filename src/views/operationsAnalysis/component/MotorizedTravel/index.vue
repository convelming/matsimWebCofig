<template>
  <el-collapse-item class="my_collapse_item" :name="name" :class="{ active: s_showLayer }">
    <div class="el-collapse-item__title" slot="title" :title="$l('机动化出行')">
      <el-checkbox class="checkbox" :value="s_showLayer" @change="handleChangeShowLayer">
        <img class="item_icon" v-show="s_showLayer" src="@/assets/image/MotorizedTravel_icon_a.png" />
        <img class="item_icon" v-show="!s_showLayer" src="@/assets/image/MotorizedTravel_icon.png" />
        <span class="item_title">{{ $l("机动化出行") }}</span>
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
          <!-- <el-checkbox :disabled="!s_showLayer" v-model="showBus3DLayer" @change="
            handleShowBus3DLayer($event);
          handleShowSubway3DLayer($event);
          ">{{ $l("公交车") }}</el-checkbox> -->
          <!-- <el-checkbox :disabled="!s_showLayer" v-model="showSubway3DLayer" @change="handleShowSubway3DLayer">地铁</el-checkbox> -->
          <!-- <el-checkbox :disabled="!s_showLayer" v-model="showCar3DLayer" @change="handleShowCar3DLayer">{{ $l("私家车")
            }}</el-checkbox> -->
          <div
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
          </div>
        </div>
      </div>
      <div class="form_item">
        <div class="form_label">{{ $l("车辆大小：") }}</div>
        <div class="form_value">
          <el-slider :disabled="!s_showLayer" style="padding: 0 calc(2em - 10px)" v-model="modelSize" :step="1" :min="1" :max="20"> </el-slider>
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
  "机动化出行":{
    "zh-CN": "机动化出行",
    "en-US": "Motorized travel"
  },
  "视角跟随：":{
    "zh-CN": "视角跟随：",
    "en-US": "Perspective Following："
  },
  "显示图层：":{
    "zh-CN": "显示图层：",
    "en-US": "Show Layers："
  },
  "公交车":{
    "zh-CN": "公交车",
    "en-US": "town bus"
  },
  "私家车":{
    "zh-CN": "私家车",
    "en-US": "private car"
  },
  "车辆大小：":{
    "zh-CN": "车辆大小：",
    "en-US": "Vehicle size："
  },
  "最大显示数量：":{
    "zh-CN": "最大显示数量：",
    "en-US": "Maximum Display Quantity："
  },
}
</language>

<script>
import { MAP_EVENT } from "@/mymap/index.js";
import { BusMotionLayer } from "./layer/BusMotionLayer";
import { SubwayMotionLayer } from "./layer/SubwayMotionLayer";
import { CarMotionLayer } from "./layer/CarMotionLayer";
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
        this._CarMotionLayer.lockSelectCar = val;
      },
    },
    maxVehicleNum: {
      handler(val) {
        this._BusMotionLayer.maxBusNum = val;
        this._SubwayMotionLayer.maxSubwayNum = val;
        this._CarMotionLayer.maxCarNum = val;
      },
    },
    modelSize: {
      handler(val) {
        this._BusMotionLayer.setModelSize(val);
        this._SubwayMotionLayer.setModelSize(val);
        this._CarMotionLayer.setModelSize(val);
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
      s_showLayer: false,

      lockSelectVehicle: true,
      showBus3DLayer: true,
      showSubway3DLayer: true,
      showCar3DLayer: true,
      maxVehicleNum: 20000,

      _BusMotionLayer: null,
      _SubwayMotionLayer: null,
      _CarMotionLayer: null,

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
      zIndex: 10,
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
      zIndex: 10,
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
    this._CarMotionLayer = new CarMotionLayer({
      zIndex: 10,
      lockSelectCar: this.lockSelectVehicle,
      maxCarNum: this.maxVehicleNum,
      modelSize: this.modelSize,
      event: {
        [MAP_EVENT.HANDLE_PICK_LEFT]: ({ data }) => {
          this._CarMotionLayer.setSelectCarId(data);
          this.rootVue.handleShowCarDetail({
            uuid: data.join(","),
            carDetail: { id: data[1], vehicleId: data[0] },
          });
        },
      },
    });
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
    this._CarMotionLayer.dispose();
  },
  methods: {
    getData() {
      if (this.loading) return;
      this.loading = true;
      let list = [];
      if (!this._BusDataLoaded) list.push(this.getBusPath());
      if (!this._SubwayDataLoaded) list.push(this.getSubwayPath());
      if (!this._CarDataLoaded) list.push(this.getCarPath());
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
    async getCarPath() {
      try {
        const res = await getCarPathArray(10000);
        this._CarMotionLayer.setData(res.data);
        this._CarDataLoaded = true;
      } catch (error) {}
    },
    handleChangeShowLayer(value) {
      this.s_showLayer = value;
      this.$emit("update:showLayer", value);
    },
    handleShowBus3DLayer(val) {
      try {
        if (val) {
          this.rootVue.$on("MotorizedTravel_setSelectedBus", (busDetail) => {
            this._BusMotionLayer.setSelectBusId(busDetail.id);
          });
          this._Map.addLayer(this._BusMotionLayer);
        } else {
          this.rootVue.$off("MotorizedTravel_setSelectedBus");
          this._Map.removeLayer(this._BusMotionLayer);
        }
      } catch (error) {}
    },
    handleShowSubway3DLayer(val) {
      try {
        if (val) {
          this.rootVue.$on("MotorizedTravel_setSelectedSubway", (subwayDetail) => {
            this._SubwayMotionLayer.setSelectSubwayId(subwayDetail.id);
          });
          this._Map.addLayer(this._SubwayMotionLayer);
        } else {
          this.rootVue.$off("MotorizedTravel_setSelectedSubway");
          this._Map.removeLayer(this._SubwayMotionLayer);
        }
      } catch (error) {}
    },
    handleShowCar3DLayer(val) {
      try {
        if (val) {
          this.rootVue.$on("MotorizedTravel_setSelectedCar", (carDetail) => {
            this._CarMotionLayer.setSelectCarId(carDetail.id);
          });
          this._Map.addLayer(this._CarMotionLayer);
        } else {
          this.rootVue.$off("MotorizedTravel_setSelectedCar");
          this._Map.removeLayer(this._CarMotionLayer);
        }
      } catch (error) {}
    },
    // 组件初始化事件
    handleEnable() {
      this.getData();
      this.handleShowBus3DLayer(this.showBus3DLayer);
      this.handleShowSubway3DLayer(this.showBus3DLayer);
      // this.handleShowSubway3DLayer(this.showSubway3DLayer);
      this.handleShowCar3DLayer(this.showCar3DLayer);
      this.rootVue.$on("timeChange", this.handleTimeChange);
    },
    // 组件卸载事件
    handleDisable() {
      this.handleShowBus3DLayer(false);
      this.handleShowSubway3DLayer(false);
      this.handleShowCar3DLayer(false);
      this.rootVue.$off("timeChange", this.handleTimeChange);
    },
    handleTimeChange(time) {
      if (this._BusMotionLayer) this._BusMotionLayer.setTime(time);
      if (this._SubwayMotionLayer) this._SubwayMotionLayer.setTime(time);
      if (this._CarMotionLayer) this._CarMotionLayer.setTime(time);
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
