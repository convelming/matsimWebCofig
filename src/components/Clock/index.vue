<template>
  <div class="Clock">
    <div class="h" :style="hStyle"></div>
    <div class="m" :style="mStyle"></div>
    <div class="s" :style="sStyle"></div>
    <div class="ampm" id="ampm">{{ ampm }}</div>
  </div>
</template>

<script>
export default {
  props: {
    time: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    hStyle() {
      let h = this.s_time / 60 / 60;
      return `transform: rotate(${(h * 360) / 12}deg)`;
    },
    mStyle() {
      let m = (this.s_time / 60) % 60;
      return `transform: rotate(${(m * 360) / 60}deg)`;
    },
    sStyle() {
      let s = this.s_time % 60;
      return `transform: rotate(${(s * 360) / 60}deg)`;
    },
    ampm() {
      let h = this.s_time / 60 / 60;
      return h >= 12 ? "PM" : "AM";
    },
  },
  watch: {
    time: {
      handler(val) {
        this.s_time = val;
      },
      immediate: true,
    },
  },
  data() {
    return {
      s_time: 0,
    };
  },
};
</script>

<style lang="scss" scoped>
.Clock {
  width: 150px;
  height: 150px;
  background: url("./clock.png") no-repeat;
  overflow: hidden;
  div {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }
  .h {
    background: url("./hour.png") no-repeat center center;
  }
  .m {
    background: url("./minute.png") no-repeat center center;
  }
  .s {
    background: url("./second.png") no-repeat center center;
  }
  .ampm {
    margin: 50% 0 0 55%;
    position: absolute;
    font-size: 12px;
    font-family: sans-serif;
  }
}
</style>
