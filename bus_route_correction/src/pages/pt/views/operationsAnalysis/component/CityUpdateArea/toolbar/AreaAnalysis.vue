<!-- AreaAnalysis 片区承载力分析 -->
<template>
  <div class="AreaAnalysis"></div>
</template>

<script>
export default {
  name: "AreaAnalysis",
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
  befforDestroy() {
    // this._PolygonSelectLayer.dispose();
  },
  methods: {
    handleEnable() {},
    handleDisable() {},
  },
};
</script>

<style lang="scss" scoped>
.AreaAnalysis {
}
</style>
