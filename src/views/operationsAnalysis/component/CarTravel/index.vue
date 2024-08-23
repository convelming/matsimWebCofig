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
          <el-slider :disabled="!s_showLayer" style="padding: 0 calc(2em - 10px)" v-model="modelSize" :step="0.1" :min="0" :max="20"> </el-slider>
        </div>
      </div>
    </div>
  </el-collapse-item>
</template>

<language>
{
  "私家车出行":{
    "zh-CN": "私家车出行",
    "en-US": "Car Trips"
  },
  "视角跟随：":{
    "zh-CN": "视角跟随：",
    "en-US": "View Following："
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
import { CarTravelLayer } from "./layer/CarTravelLayer";
import { CarTravelLayer2 } from "./layer/CarTravelLayer2";
import { CarTravelLayer3 } from "./layer/CarTravelLayer3";

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
        this._CarTravelLayer.lockSelectCar = val;
      },
    },
    maxVehicleNum: {
      handler(val) {
        this._CarTravelLayer.maxCarNum = val;
      },
    },
    modelSize: {
      handler(val) {
        this._CarTravelLayer.setModelSize(val);
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

      _CarTravelLayer: null,

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
    this._CarTravelLayer = new CarTravelLayer({
      zIndex: 10,
      dataSource: this.$store.getters.dataSource,
      lockSelectCar: this.lockSelectVehicle,
      maxCarNum: this.maxVehicleNum,
      modelSize: this.modelSize,
      event: {
        [MAP_EVENT.HANDLE_PICK_LEFT]: ({ data }) => {
          this._CarTravelLayer.setSelectCarIndex(data);
          this.rootVue.handleShowCarTravelDetail({
            uuid: "CarTravelDetail_" + data,
            carDetail: { index: data },
          });
        },
      },
    });
    this._CarTravelLayer2 = new CarTravelLayer2({
      zIndex: 20,
      dataSource: this.$store.getters.dataSource,
      color: "#ff0000",
    });
    this._CarTravelLayer3 = new CarTravelLayer3({
      zIndex: 30,
      dataSource: this.$store.getters.dataSource,
      color: "#ff0000",
    });
  },
  mounted() {
    this._interval = setInterval(() => {
      if (!this._Map) return;
      clearInterval(this._interval);
      this._CarTravelLayer.center = this.rootVue.center;

      if (this.s_showLayer) {
        this.handleEnable();
      }
    }, 1000);
  },
  beforeDestroy() {
    this.handleDisable();
    this._CarTravelLayer.dispose();
  },
  methods: {
    handleChangeShowLayer(value) {
      this.s_showLayer = value;
      this.$emit("update:showLayer", value);
    },
    handleShowLayer() {
      try {
        if (this._Map.zoom < 11 && this.s_showLayer) {
          this._CarTravelLayer3.init();
          this._Map.addLayer(this._CarTravelLayer3);
        } else {
          this._Map.removeLayer(this._CarTravelLayer3);
        }
        if (11 <= this._Map.zoom && this._Map.zoom <= 15.5 && this.s_showLayer) {
          this._CarTravelLayer2.init();
          this._Map.addLayer(this._CarTravelLayer2);
        } else {
          this._Map.removeLayer(this._CarTravelLayer2);
        }
        if (15.5 < this._Map.zoom && this.s_showLayer) {
          this._Map.addLayer(this._CarTravelLayer);
        } else {
          this._Map.removeLayer(this._CarTravelLayer);
        }
      } catch (error) {}
    },
    // 组件初始化事件
    handleEnable() {
      this.handleShowLayer();
      this.rootVue.$on("timeChange", this.handleTimeChange);
      this.rootVue.$on("CarTravel_setSelectedCar", (carDetail) => {
        this._CarTravelLayer.setSelectCarIndex(carDetail.index);
      });
      this._Map_Event_Id = this._Map.addEventListener(MAP_EVENT.UPDATE_ZOOM, this.handleShowLayer.bind(this));
    },
    // 组件卸载事件
    handleDisable() {
      this.handleShowLayer();
      this.rootVue.$off("timeChange", this.handleTimeChange);
      this.rootVue.$off("CarTravel_setSelectedCar");
      this._Map.removeEventListener(MAP_EVENT.UPDATE_ZOOM, this._Map_Event_Id);
    },
    handleTimeChange(time) {
      if (this._CarTravelLayer) this._CarTravelLayer.setTime(time);
      if (this._CarTravelLayer2) this._CarTravelLayer2.setTime(time);
      if (this._CarTravelLayer3) this._CarTravelLayer3.setTime(time);
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
