<template>
  <div class="box">
    <div class="top">
      <Luopan class="Luopan"></Luopan>
      <Bug v-show="s_open" :href="bugHref"></Bug>
      <MapStyle v-show="s_open"></MapStyle>
      <Help v-show="s_open" @click.native="$emit('showHelp')"></Help>
      <!-- <Language v-show="s_open"></Language> -->
      <div class="time" :style="{ background: s_open ? '#E5E5E5' : '' }" @click="handleUpdateOpen(!s_open)">
        {{ formatHour(s_time) }}
      </div>
    </div>
    <TimeSlider class="bottom" v-show="s_open" :value="s_time" :min="minTime" :max="maxTime" :speed="s_speed" @input="handleUpdateTime" @update:speed="handleUpdateSpeed"></TimeSlider>
  </div>
</template>
<script>
import { formatHour } from "@/utils/index.js";

import Luopan from "./Luopan.vue";
import Bug from "./Bug.vue";
import MapStyle from "./MapStyle.vue";
import Help from "./Help.vue";
import Language from "./Language.vue";
import TimeSlider from "./TimeSlider.vue";

export default {
  props: {
    open: {
      type: Boolean,
      default: false,
    },
    bugHref: {
      type: String,
      default: "https://doc.weixin.qq.com/sheet/e3_AdQA8Aa_ADMt1qh97LkSHer6ALqI2?scode=APwA6gfEAA0aeGdABPAdQA8Aa_ADM&tab=f2oofj",
    },
    time: {
      type: Number,
      default: 0,
    },
    maxTime: {
      type: Number,
      default: 24 * 60 * 60,
    },
    minTime: {
      type: Number,
      default: 0,
    },
    speed: {
      type: Number,
      default: 0,
    },
  },
  components: {
    Luopan,
    Bug,
    MapStyle,
    Help,
    Language,
    TimeSlider,
  },
  data() {
    return {
      s_open: false,
      s_time: 0,
      s_speed: 0,
    };
  },
  computed: {
    getTime() {
      return this.formatTime(Math.ceil(this.time));
    },
  },
  watch: {
    open: {
      handler(val) {
        this.s_open = val;
      },
      immediate: true,
    },
    time: {
      handler(val) {
        if (val !== this.s_time) {
          this.s_time = val;
        }
      },
      immediate: true,
      deep: true,
    },
    speed: {
      handler(val) {
        if (val !== this.s_speed) {
          this.s_speed = val;
        }
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    formatHour: formatHour,
    handleUpdateTime(val) {
      this.s_time = val;
      this.$emit("update:time", val);
    },
    handleUpdateOpen(val) {
      this.s_open = val;
      this.$emit("update:open", val);
    },
    handleUpdateSpeed(val) {
      this.s_speed = val;
      this.$emit("update:speed", val);
    },
  },
};
</script>
<style>
@font-face {
  font-family: wending;
  src: url("./images/DigitalNumbers-Regular.ttf");
}
</style>
<style lang="scss" scoped>
.box {
  user-select: none;
  padding: 12px;
  background: #ffffff;
  box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.3);
  border-radius: 6px;

  .top {
    display: flex;
    align-items: center;
    gap: 12px;

    .time {
      cursor: pointer;
      border: 1px solid #e5e5e5;
      border-radius: 4px;
      height: 32px;
      line-height: 32px;
      display: flex;
      align-items: center;
      font-family: wending;
      padding: 0 4px;
    }
  }
  .bottom {
    margin-top: 12px;
  }
}
</style>
