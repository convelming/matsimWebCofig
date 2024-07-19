<template>
  <el-collapse-item class="my_collapse_item" :name="name" :class="{ active: s_showLayer }">
    <div class="el-collapse-item__title" slot="title" :title="$l('机动化出行')">
      <el-checkbox class="checkbox" :value="s_showLayer" @change="handleChangeShowLayer">
        <img class="item_icon" v-show="s_showLayer" src="@/assets/image/MotorizedTravel_icon_a.png" />
        <img class="item_icon" v-show="!s_showLayer" src="@/assets/image/MotorizedTravel_icon.png" />
        <span class="item_title">{{ $l("私家车出行") }}</span>
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
        <div class="form_label">{{ $l("车辆大小：") }}</div>
        <div class="form_value">
          <el-slider :disabled="!s_showLayer" style="padding: 0 calc(2em - 10px)" v-model="modelSize" :step="1" :min="1" :max="20"> </el-slider>
        </div>
      </div>
    </div>
  </el-collapse-item>
</template>

<language>
{
  "私家车出行":{
    "zh-CN": "私家车出行",
    "en-US": "Private travel"
  },
  "视角跟随：":{
    "zh-CN": "视角跟随：",
    "en-US": "Perspective Following："
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
import { CarTileLayer } from "./layer/CarTileLayer";

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
        this._CarTileLayer.lockSelectCar = val;
      },
    },
    maxVehicleNum: {
      handler(val) {
        this._CarTileLayer.maxCarNum = val;
      },
    },
    modelSize: {
      handler(val) {
        this._CarTileLayer.setModelSize(val);
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

      _CarTileLayer: null,

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
    this._CarTileLayer = new CarTileLayer({
      zIndex: 10,
      dataSource: this.$store.getters.dataSource,
      lockSelectCar: this.lockSelectVehicle,
      maxCarNum: this.maxVehicleNum,
      modelSize: this.modelSize,
      event: {
        [MAP_EVENT.HANDLE_PICK_LEFT]: ({ data }) => {
          this._CarTileLayer.setSelectCarIndex(data);
          this.rootVue.handleShowCarTileDetail({
            uuid: "CarTileDetail_" + data,
            carDetail: { index: data },
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
    this._CarTileLayer.dispose();
  },
  methods: {
    handleChangeShowLayer(value) {
      this.s_showLayer = value;
      this.$emit("update:showLayer", value);
    },
    handleShowCar3DLayer(val) {
      try {
        if (val) {
          this.rootVue.$on("CarTravel_setSelectedCar", (carDetail) => {
            this._CarTileLayer.setSelectCarIndex(carDetail.index);
          });
          this._Map.addLayer(this._CarTileLayer);
        } else {
          this.rootVue.$off("CarTravel_setSelectedCar");
          this._Map.removeLayer(this._CarTileLayer);
        }
      } catch (error) {}
    },
    // 组件初始化事件
    handleEnable() {
      this.handleShowCar3DLayer(this.showCar3DLayer);
      this.rootVue.$on("timeChange", this.handleTimeChange);
    },
    // 组件卸载事件
    handleDisable() {
      this.handleShowCar3DLayer(false);
      this.rootVue.$off("timeChange", this.handleTimeChange);
    },
    handleTimeChange(time) {
      if (this._CarTileLayer) this._CarTileLayer.setTime(time);
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
