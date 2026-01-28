<!-- PlotAnalysis 地块承载力分析 -->
<template>
  <div class="PlotAnalysis"></div>
</template>

<script>
export default {
  name: "PlotAnalysis",
  inject: ["rootVue"],
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  components: {},
  computed: {
    _Map() {
      return this.rootVue._Map;
    },
  },
  watch: {
    show: {
      handler(val) {
        this.$nextTick(() => {
          this._interval = setInterval(() => {
            if (!this._Map) return;
            clearInterval(this._interval);
            if (this.show) {
              this.handleEnable();
            } else {
              this.handleDisable();
            }
          }, 500);
        });
      },
      immediate: true,
    },
  },
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {
    // this._PolygonSelectLayer.dispose();
  },
  methods: {
    handleEnable() {},
    handleDisable() {},
  },
};
</script>

<style lang="scss" scoped>
.PlotAnalysis {
}
</style>
