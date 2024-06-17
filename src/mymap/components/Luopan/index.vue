<template>
  <!-- <div class="amap-luopan">
    <div class="amap-luopan">
      <div class="amap-compass" @mousedown="goTouchstart('handlePointers')" @mouseup="goTouchend('handlePointers')" :style="s_style">
        <div class="amap-pointers"></div>
      </div>
      <div class="amap-pitchUp" @mousedown="goTouchstart('handlePitchUp')" @mouseup="goTouchend('handlePitchUp')"></div>
      <div class="amap-pitchDown" @mousedown="goTouchstart('handlePitchDown')" @mouseup="goTouchend('handlePitchDown')"></div>
      <div class="amap-rotateLeft" @mousedown="goTouchstart('handleRotateLeft')" @mouseup="goTouchend('handleRotateLeft')"></div>
      <div class="amap-rotateRight" @mousedown="goTouchstart('handleRotateRight')" @mouseup="goTouchend('handleRotateRight')"></div>
    </div>
  </div> -->
  <div class="amap-pointers" @mouseup="goTouchend('handlePointers')"
    :style="s_style"></div>
</template>

<script>
import { MAP_EVENT } from "@/mymap";
export default {
  name: "AmapLuopan",
  props: {},
  inject: ["rootVue"],
  components: {},
  computed: {
    _Map() {
      return this.rootVue._Map;
    },
    s_style() {
      return `transform: rotateX(${90 - this.pitch}deg) rotateZ(${this.rotation}deg)`;
    },
  },
  watch: {},
  data() {
    return {
      pitch: 90,
      rotation: 0,
    };
  },
  created() { },
  mounted() {
    this._interval = setInterval(() => {
      if (!this._Map) return;
      clearInterval(this._interval);
      this.handleEnable();
    }, 1000);
  },
  beforeDestroy() {
    this.handleDisable();
  },
  methods: {
    goTouchstart(type) {
      console.log(type);
      let _this = this;
      clearTimeout(_this._timeOutEvent);
      _this._timeOutEvent = setTimeout(function () {
        _this._timeOutEvent = 0;
        //  处理长按事件...
        _this._longCheckInterval = setInterval(function () {
          _this[type](1);
        }, 50);
      }, 500);
    },
    goTouchend(type) {
      console.log(type);
      let _this = this;
      clearTimeout(_this._timeOutEvent);
      if (_this._timeOutEvent !== 0) {
        //  处理单击事件
        _this[type](5);
      }
      if (_this._longCheckInterval !== 0) {
        clearInterval(_this._longCheckInterval);
        _this._longCheckInterval = 0;
      }
    },
    // 组件初始化事件
    handleEnable() {
      this._MapEvnetId1 = this._Map.addEventListener(MAP_EVENT.UPDATE_CAMERA_ROTATE, this.handleMapUpdateCameraRotate);
      this.pitch = this._Map.pitch;
      this.rotation = this._Map.rotation;
    },
    // 组件卸载事件
    handleDisable() {
      this._Map.removeEventListener(MAP_EVENT.UPDATE_CAMERA_ROTATE, this._MapEvnetId1);
    },
    handleMapUpdateCameraRotate({ data }) {
      console.log(data);
      this.pitch = data.newPitch;
      this.rotation = data.newRotation;
    },
    handlePointers() {
      this._Map.setPitchAndRotation(90, 0);
    },
    handlePitchUp(step) {
      const pitch = this._Map.pitch - step;
      const rotation = this._Map.rotation;
      this._Map.setPitchAndRotation(pitch, rotation);
    },
    handlePitchDown(step) {
      const pitch = this._Map.pitch + step;
      const rotation = this._Map.rotation;
      this._Map.setPitchAndRotation(pitch, rotation);
    },
    handleRotateLeft(step) {
      const pitch = this._Map.pitch;
      const rotation = this._Map.rotation - step;
      this._Map.setPitchAndRotation(pitch, rotation);
    },
    handleRotateRight(step) {
      const pitch = this._Map.pitch;
      const rotation = this._Map.rotation + step;
      this._Map.setPitchAndRotation(pitch, rotation);
    },
  },
};
</script>

<style lang="scss" scoped>
.amap-pointers {
  position: absolute;
  width: 24px;
  height: 24px;
  top: 4px;
  left: 4px;
  border: none;
  z-index: 1;
  background: url("./znz_icon.png")  no-repeat center center;
} 

.amap-luopan {
  width: 92px;
  height: 92px;
  background: url("./ctb.png") -22px -30px no-repeat;
  background-size: 348px 270px;
  user-select: none;

  .amap-compass {
    top: 46px;
    left: 50%;
    position: absolute;
    margin: -24px;
    width: 48px;
    height: 48px;
    z-index: 10;
    background: url("./ctb.png") -231px -26px no-repeat;
    background-size: 348px 270px;

    &.amap-compass-black {
      background: url("./ctb.png") no-repeat -231px -79px;
      background-size: 348px 270px;
    }

    .amap-pointers {
      position: absolute;
      width: 30px;
      height: 48px;
      top: 0;
      left: 9px;
      border: none;
      z-index: 1;
      background: url("./ctb.png") -281px -26px no-repeat;
      background-size: 348px 270px;
    }
  }

  .amap-pitchDown,
  .amap-pitchUp {
    width: 30px;
    height: 25.5px;
    position: absolute;
    top: 3.5px;
    margin-left: -15px;
    left: 50%;
    z-index: 20;
    background: url("./ctb.png") -302.5px -49px no-repeat;
    background-size: 348px 270px;
  }

  .amap-pitchDown:hover,
  .amap-pitchUp:hover {
    background: url("./ctb.png") no-repeat -302.5px -23.5px;
    background-size: 348px 270px;
  }

  .amap-pitchDown {
    top: 66px;
    transform: rotate(180deg);
    -ms-transform: rotate(180deg);
    -webkit-transform: rotate(180deg);
    -o-transform: rotate(180deg);
    -moz-transform: rotate(180deg);
  }

  .amap-rotateLeft,
  .amap-rotateRight {
    width: 21px;
    height: 52px;
    top: 19px;
    position: absolute;
    z-index: 20;
    background: url("./ctb.png") -301.5px -77px no-repeat;
    background-size: 348px 270px;
  }

  .amap-rotateLeft:hover,
  .amap-rotateRight:hover {
    background: url("./ctb.png") no-repeat -278.5px -76.5px;
    background-size: 348px 270px;
  }

  .amap-rotateLeft {
    left: 5px;
  }

  .amap-rotateRight {
    right: 5px;
    transform: rotateY(180deg);
    -ms-transform: rotateY(180deg);
    -webkit-transform: rotateY(180deg);
    -o-transform: rotateY(180deg);
    -moz-transform: rotateY(180deg);
  }
}
</style>
