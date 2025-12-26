<template>
  <div class="Luopan" @mouseup="goTouchend('handlePointers')">
    <div class="pointers" :style="s_style"></div>
  </div>
</template>

<script>
import { MAP_EVENT } from "@/mymap";
export default {
  name: "Luopan",
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
  created() {},
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
.Luopan {
  cursor: pointer;
  width: 32px;
  height: 32px;
  border: 1px solid var(--border-color-base);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  .pointers {
    width: 24px;
    height: 24px;
    background: url("./images/znz_icon.png") no-repeat center center;
  }
}
</style>
