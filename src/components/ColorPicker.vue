<template>
  <div class="ColorPicker">
    <el-color-picker class="ColorPicker_picker" v-bind="$attrs" size="mini" :value="s_value" @input="handleInput" />
    <el-input class="ColorPicker_input" v-bind="$attrs" type="text" :value="s_value" @input="handleInput" />
  </div>
</template>

<script>
export default {
  name: "ColorPicker",
  props: {
    value: {
      type: String,
      default: 0,
    },
  },
  components: {},
  computed: {},
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
      s_value: "",
    };
  },
  created() {},
  mounted() {},
  methods: {
    handleInput(val) {
      this.$emit("input", val);
      this.$emit("change", {
        value: val,
        colors: this.colorsList[val],
      });
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep {
  .ColorPicker_input {
    .el-input__inner {
      border: 0;
      padding: 0;
      margin: 0;
      text-align: right;
      height: 36px;
      width: 100%;
      font-size: 16px;
      background-color: transparent !important;
    }
  }
}
.ColorPicker {
  background: rgba(0, 0, 0, 0.05);
  padding: 0px 8px;
  border-radius: 6px;
  width: 120px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
}
</style>
