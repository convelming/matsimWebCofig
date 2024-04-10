<template>
  <el-slider :disabled="disabled" class="TimeRangeSlider" :value="s_value" @input="handleInput" :step="1" :min="min" :max="max" :marks="marks" :format-tooltip="formatHour"> </el-slider>
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
      default: 24 * 60 * 60,
    },
    min: {
      type: Number,
      default: 0,
    },
    speed: {
      type: Number,
      default: 30 * 60,
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
  computed: {
    marks() {
      const speed = this.speed;
      const length = Math.floor((this.max - this.min) / speed);
      const marks = {};
      for (let i = this.min; i <= length; i++) {
        const num = i * speed;
        marks[num] = this.formatHour(num);
      }
      return marks;
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
        this.$emit("input", val);
        this._timeout = null;
      }, 200);
    },
  },
};
</script>

<style lang="scss" scoped>
.TimeRangeSlider {
  box-sizing: border-box;
  width: 100%;
  font-size: 14px;
  color: #606266;
  padding: 0 calc(2em - 10px);
}
</style>
