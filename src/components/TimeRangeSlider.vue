<template>
  <div class="TimeRangeSlider">
    <div class="slider_box">
      <el-slider :disabled="disabled" :value="s_value" @input="handleInput" range :step="1" :min="min" :max="max" :format-tooltip="formatHour"> </el-slider>
    </div>
    <div class="marks">
      <div class="item">{{ formatHour(min) }}</div>
      <div class="item">{{ formatHour(s_value[0] || 0) }} - {{ formatHour(s_value[1] || 0) }}</div>
      <div class="item">{{ formatHour(max) }}</div>
    </div>
  </div>
</template>

<script>
import { formatHour } from "@/utils/utils";
export default {
  props: {
    value: {
      type: Array,
      default: () => [],
    },
    max: {
      type: Number,
      default: 24 * 60 * 60,
    },
    min: {
      type: Number,
      default: 0,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    value: {
      handler(val) {
        if (JSON.stringify(val) !== JSON.stringify(this.s_value)) {
          this.s_value = val;
        }
      },
      immediate: true,
      deep: true,
    },
  },
  data() {
    return {
      s_value: [0, 24 * 60 * 60],
    };
  },
  methods: {
    formatHour(val) {
      return formatHour(val).slice(0, 5);
    },
    handleInput(val) {
      this.s_value = val;
      if (this._timeout) clearTimeout(this._timeout);
      this._timeout = setTimeout(() => {
        this.$emit("input", this.s_value);
        this.$emit("update:start", this.s_value[0]);
        this.$emit("update:end", this.s_value[1]);
        this.$emit("change", this.s_value);
        this._timeout = null;
      }, 200);
    },
  },
};
</script>

<style lang="scss" scoped>
.TimeRangeSlider {
  width: 100%;
  font-size: 14px;
  color: #606266;
  .slider_box {
    padding: 0 calc(2em - 10px);
    .el-slider {
      width: 100%;
    }
  }
  .marks {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .item {
      position: relative;
      &::before {
        display: block;
        content: "";
        position: absolute;
        top: -8px;
        left: 50%;
        transform: translate(0, -50%);
        width: 2px;
        height: 10px;
        background-color: #ccc;
      }
    }
  }
}
</style>
