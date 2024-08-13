<template>
  <div class="TimeSlider">
    <div class="slider-box">
      <el-slider :disabled="disabled" class="slider" :value="s_value" @input="handleInput" :step="1" :min="min" :max="max" :marks="marks" :format-tooltip="formatHour"> </el-slider>
    </div>
    <div class="speed-box">
      <el-dropdown @command="speedCommand" placement="top-start" trigger="click">
        <div class="speed">
          <img class="icon" src="./images/speed_icon.png" />
          <span>x{{ s_speed }}</span>
        </div>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-for="item in speedList" :command="item" :key="item" :disabled="speed === item">speed x{{ item }} </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { formatHour } from "@/utils/utils";
export default {
  props: {
    value: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: 25 * 60 * 60,
    },
    min: {
      type: Number,
      default: 0,
    },
    step: {
      type: Number,
      default: 60 * 60 * 4,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    speedList: {
      type: Array,
      default: () => [0, 1, 5, 10, 50, 100, 600],
    },
    speed: {
      type: Number,
      default: 0,
    },
  },
  watch: {
    value: {
      handler(val) {
        if (val !== this.s_value) {
          this.s_value = val;
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
  computed: {
    marks() {
      const step = this.step;
      const length = Math.floor((this.max - this.min) / step);
      const marks = {};
      for (let i = this.min; i <= length; i++) {
        const num = i * step;
        marks[num] = this.formatHour(num);
      }
      return marks;
    },
  },
  data() {
    return {
      s_value: 0,
      s_speed: 0,
    };
  },
  mounted() {
    this._timeInterval = setInterval(() => {
      let value = this.s_value + this.s_speed / 60;
      if (value > this.max) {
        value = this.min;
      }
      if (value < this.min) {
        value = this.max;
      }
      this.handleInput(value);
    }, 1000 / 60);
  },
  beforeDestroy() {
    clearInterval(this._timeInterval);
  },
  methods: {
    formatHour(val) {
      return formatHour(val).slice(0, 5);
    },
    handleInput(val) {
      this.s_value = val;
      this.$emit("input", val);
    },
    speedCommand(val) {
      this.s_speed = val;
      this.$emit("update:speed", val);
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep {
  .el-slider__runway {
    margin: 8px 0;
  }
  .el-slider__marks-text {
    font-size: 12px;
    margin-top: 13px;
  }
  .el-slider__button {
    width: 12px;
    height: 12px;
  }
}
.TimeSlider {
  display: flex;
  .slider-box {
    width: 100%;
    .slider {
      box-sizing: border-box;
      width: 100%;
      font-size: 14px;
      color: #606266;
      padding: 0 calc(2em - 10px);
    }
  }
  .speed-box {
    .speed {
      cursor: pointer;
      height: 26px;
      background: rgba(0, 0, 0, 0.05);
      padding: 4px 8px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 10px;
      gap: 8px;
      .icon {
        width: 18px;
        height: 18px;
      }

      .text {
        color: #434343;
        font-size: 16px;
        font-weight: 400;
        line-height: 20px;
      }
    }
  }
}
</style>
