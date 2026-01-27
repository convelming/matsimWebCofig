<!-- MySlider -->
<template>
  <div class="MySlider el-slider">
    <div class="runway">
      <div class="el-slider__marks">
        <div class="el-slider__marks-text" style="left: 0%">{{ this.start }}</div>
        <div class="el-slider__marks-text" style="left: 100%">{{ this.end }}</div>
      </div>
    </div>
    <el-slider :style="s_style" v-model="s_value" :marks="marks" :min="this.min" :max="this.max" :step="this.step" @input="$emit('input', $event)"></el-slider>
  </div>
</template>

<script>
export default {
  name: "MySlider",
  props: {
    start: {
      type: Number,
      default: 0,
    },
    end: {
      type: Number,
      default: 100,
    },
    value: {
      type: Number,
      default: 50,
    },
    min: {
      type: Number,
      default: 20,
    },
    max: {
      type: Number,
      default: 80,
    },
    step: {
      type: Number,
      default: 1,
    },
  },
  components: {},
  computed: {
    s_style() {
      const t = this.end - this.start;
      const pl = (this.min - this.start) / t;
      const w = (this.max - this.min) / t;
      return { paddingLeft: pl * 100 + "%", width: w * 100 + "%" };
    },
    marks() {
      return { [this.min]: String(this.min), [this.max]: String(this.max) };
    },
  },
  watch: {
    value: {
      handler(val) {
        this.s_value = val;
      },
      immediate: true,
    },
  },
  data() {
    return {
      s_value: 0,
    };
  },
  created() {},
  mounted() {},
  methods: {},
};
</script>

<style lang="scss" scoped>
.MySlider {
  position: relative;
  margin: 0 15px;
  .runway {
    width: 100%;
    height: 6px;
    background-color: var(--border-color-light);
    border-radius: 3px;
    position: relative;
    vertical-align: middle;
    margin: 16px 0;
  }
  .el-slider {
    position: absolute;
    top: 0;
    left: 0;
  }
  ::v-deep {
    .el-slider__runway {
      background-color: var(--color-primary);
    }
    .el-slider__runway.disabled {
      background-color: var(--color-text-placeholder);
    }
  }
}
</style>
