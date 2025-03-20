<template>
  <div class="RouteSelect">
    <el-button type="primary" size="small" @click="handlePrev" icon="el-icon-arrow-left"></el-button>
    <el-select size="small" :value="s_value" @input="handleInput" :placeholder="placeholder">
      <el-option v-for="item in options" :key="item[valueKey]" :label="item[labelKey]" :value="item[valueKey]" />
    </el-select>
    <el-button type="primary" size="small" @click="handleNext" icon="el-icon-arrow-right"></el-button>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: [String, Number],
      default: "",
    },
    placeholder: {
      type: String,
      default: "请选择",
    },
    options: {
      type: Array,
      default: () => [],
    },
    valueKey: {
      type: String,
      default: "value",
    },
    labelKey: {
      type: String,
      default: "label",
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
      s_value: "",
    };
  },
  methods: {
    handleInput(val) {
      this.s_value = val;
      this.$emit("input", val);
    },
    handlePrev() {
      const index = this.options.findIndex((v) => v[this.valueKey] == this.s_value);
      const item = this.options[index - 1];
      if (item) {
        this.handleInput(item[this.valueKey]);
      }
    },
    handleNext() {
      const index = this.options.findIndex((v) => v[this.valueKey] == this.s_value);
      const item = this.options[index + 1];
      if (item) {
        this.handleInput(item[this.valueKey]);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.RouteSelect {
  display: flex;
  align-items: center;
  width: 100%;
  .el-button {
    padding: 0 15px;
    height: 32px;
    line-height: 32px;
  }
  .el-select {
    width: 100%;
    margin: 0 10px;
  }
}
</style>
