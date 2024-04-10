<template>
  <el-collapse-item class="MotorizedTravel" :name="name">
    <div class="el-collapse-item__title" slot="title">
      <el-checkbox :value="s_showLayer" @change="handleChangeShowLayer">{{ $l("机动化出行") }}</el-checkbox>
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
          <el-checkbox :disabled="!s_showLayer" v-model="showBus3DLayer" @change="handleShowBus3DLayer">{{ $l("公交车") }}</el-checkbox>
          <el-checkbox :disabled="!s_showLayer" v-model="showCar3DLayer" @change="handleShowCar3DLayer">{{ $l("私家车") }}</el-checkbox>
        </div>
      </div>
      <div class="form_item">
        <div class="form_label">{{ $l("车辆大小：") }}</div>
        <div class="form_value">
          <el-slider :disabled="!s_showLayer" style="padding: 0 calc(2em - 10px)" v-model="modelSize" :step="1" :min="1" :max="30"> </el-slider>
        </div>
      </div>
      <div class="form_item">
        <div class="form_label">{{ $l("最大显示数量：") }}</div>
        <div class="form_value">
          <el-input-number style="width: 100%" :disabled="!s_showLayer" size="small" v-model="maxVehicleNum" :min="0" :step="1" step-strictly> </el-input-number>
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
    "en-US": "机动化出行"
  },
  "视角跟随：":{
    "zh-CN": "视角跟随：",
    "en-US": "视角跟随："
  },
  "显示图层：":{
    "zh-CN": "显示图层：",
    "en-US": "显示图层："
  },
  "公交车":{
    "zh-CN": "公交车",
    "en-US": "公交车"
  },
  "私家车":{
    "zh-CN": "私家车",
    "en-US": "私家车"
  },
  "车辆大小：":{
    "zh-CN": "车辆大小：",
    "en-US": "车辆大小："
  },
  "最大显示数量：":{
    "zh-CN": "最大显示数量：",
    "en-US": "最大显示数量："
  },
}
</language>

<script>
import { MAP_EVENT } from "@/mymap/index.js";
import { BusMotionLayer } from "./layer/BusMotionLayer";
import { CarMotionLayer } from "./layer/CarMotionLayer";
import { getBusPath, getCarPath } from "@/api/index";

export default {
  props: ["name", "showLayer"],
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
        this._CarMotionLayer.lockSelectCar = val;
      },
    },
    maxVehicleNum: {
      handler(val) {
        this._BusMotionLayer.maxBusNum = val;
        this._CarMotionLayer.maxCarNum = val;
      },
    },
    modelSize: {
      handler(val) {
        this._BusMotionLayer.setModelSize(val);
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
      showCar3DLayer: true,
      maxVehicleNum: 2000,

      _BusMotionLayer: null,
      _CarMotionLayer: null,

      modelSize: 5,

      time: 0,
      speed: 2.5,
      minTime: 0,
      maxTime: 3600 * 28,
      speedMarks: {},
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
          console.log(data);
          this._BusMotionLayer.selectBusId = data.uuid;
          this.rootVue.handleShowBusDetail({
            uuid: data.uuid,
            busDetail: data,
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
          this._CarMotionLayer.selectCarId = data.uuid;
          this.rootVue.handleShowCarDetail({
            uuid: data.uuid,
            carDetail: data,
          });
        },
      },
    });
    getBusPath().then((res) => {
      this._BusData = res.data;
      if (this.s_showLayer) {
        this._BusMotionLayer.setData(this._BusData);
        this._BusData = null;
      }
    });
    getCarPath().then((res) => {
      this._CarData = res.data;
      if (this.s_showLayer) {
        this._CarMotionLayer.setData(this._CarData);
        this._CarData = null;
      }
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
    this._CarMotionLayer.dispose();
  },
  methods: {
    handleChangeShowLayer(value) {
      this.s_showLayer = value;
      this.$emit("update:showLayer", value);
    },
    handleShowBus3DLayer(val) {
      try {
        if (val) {
          if (this._BusData) {
            this._BusMotionLayer.setData(this._BusData);
            this._BusData = null;
          }
          this.rootVue.$on("setSelectedBus", (busDetail) => {
            this._BusMotionLayer.selectBusId = busDetail.uuid;
          });
          this._Map.addLayer(this._BusMotionLayer);
        } else {
          this.rootVue.$off("setSelectedBus");
          this._Map.removeLayer(this._BusMotionLayer);
        }
      } catch (error) {}
    },
    handleShowCar3DLayer(val) {
      try {
        if (val) {
          if (this._CarData) {
            this._CarMotionLayer.setData(this._CarData);
            this._CarData = null;
          }
          this.rootVue.$on("setSelectedCar", (carDetail) => {
            this._CarMotionLayer.selectCarId = carDetail.uuid;
          });
          this._Map.addLayer(this._CarMotionLayer);
        } else {
          this.rootVue.$off("setSelectedCar");
          this._Map.removeLayer(this._CarMotionLayer);
        }
      } catch (error) {}
    },
    // 组件初始化事件
    handleEnable() {
      this.handleShowBus3DLayer(this.showBus3DLayer);
      this.handleShowCar3DLayer(this.showCar3DLayer);
      this.rootVue.$on("timeChange", this.handleTimeChange);
    },
    // 组件卸载事件
    handleDisable() {
      this.handleShowBus3DLayer(false);
      this.handleShowCar3DLayer(false);
      this.rootVue.$off("timeChange", this.handleTimeChange);
    },
    handleTimeChange(time) {
      if (this._BusMotionLayer) this._BusMotionLayer.setTime(time);
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
.MotorizedTravel {
  .el-collapse-item__title {
    padding-left: 10px;
  }
  .form {
    box-sizing: border-box;
    width: 100%;
    padding: 10px 10px 0px 20px;
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
  .icon_button {
    cursor: pointer;
    flex-shrink: 0;
    margin-left: 10px;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #e6e6e6;
    border-radius: 4px;
    &.active {
      background-color: rgba($color: #409eff, $alpha: 1);
      color: #ffffff;
    }
  }
}
</style>
