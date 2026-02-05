<!-- AreaSreachFromItem -->
<template>
  <div class="AreaSreachFromItem">
    <div class="row">
      <el-checkbox v-if="checkBox" class="text1" v-model="s_check" :indeterminate="false" @change="$emit('update:check', $event)">{{ label }}</el-checkbox>
      <div v-else class="text1">{{ label }}</div>
      <el-input v-if="input" v-model="s_value" placeholder="" size="mini" @change="$emit('input', $event)"></el-input>
      <el-input-number v-else-if="inputNumber" v-model="s_value" size="mini" label="" :min="min" :max="max" :step="step" :controls="false" :disabled="disabled" @change="$emit('input', $event)"> </el-input-number>
      <div v-else>{{ s_value }}</div>
    </div>
    <div class="row" v-if="slider" style="padding: 0 1em">
      <div class="MySlider el-slider">
        <div class="runway">
          <div class="el-slider__marks">
            <div v-if="start != min" class="el-slider__marks-text" style="left: 0%" :title="start">{{ start }}</div>
            <div v-if="end != max" class="el-slider__marks-text" style="left: 100%" :title="end">{{ end }}</div>
          </div>
        </div>
        <el-slider :style="s_style" v-model="s_value" :marks="marks" :min="min" :max="max" :step="step" :disabled="disabled" @input="$emit('input', $event)"></el-slider>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "MySlider",
  props: {
    label: {
      type: String,
      default: "",
    },
    input: {
      type: Boolean,
      default: false,
    },
    inputNumber: {
      type: Boolean,
      default: false,
    },
    checkBox: {
      type: Boolean,
      default: false,
    },
    slider: {
      type: Boolean,
      default: false,
    },
    start: {
      type: Number,
      default: 0,
    },
    end: {
      type: Number,
      default: 100,
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
    disabled: {
      type: Boolean,
      default: false,
    },
    value: {
      type: Number,
      default: 50,
    },
    check: {
      type: Boolean,
      default: false,
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
    check: {
      handler(val) {
        this.s_check = val;
      },
      immediate: true,
    },
  },
  data() {
    return {
      s_value: 0,
      s_check: false,
    };
  },
  created() {},
  mounted() {},
  methods: {},
};
</script>

<style lang="scss" scoped>
.AreaSreachFromItem {
  .row {
    display: flex;
    align-items: center;
    gap: 10px;
    .text1 {
      width: 0;
      flex: 1;
      font-size: 14px;
    }
    .el-input,
    .el-input-number {
      width: 120px;
      ::v-deep input {
        text-align: center;
      }
    }
    .MySlider {
      width: 100%;
    }
  }
}
.MySlider {
  position: relative;
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
