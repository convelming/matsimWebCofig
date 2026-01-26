<!-- MySlider -->
<template>
  <div class="MySlider">
    <div class="runway"></div>
    <el-slider style="width: 50%; margin-left: 20%" v-model="s_value"></el-slider>
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
  computed: {},
  watch: {},
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
  padding: 16px 0;
  .runway {
    width: 100%;
    height: 6px;
    background-color: var(--border-color-light);
    border-radius: 3px;
    position: relative;
    vertical-align: middle;
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
  }
}
</style>
