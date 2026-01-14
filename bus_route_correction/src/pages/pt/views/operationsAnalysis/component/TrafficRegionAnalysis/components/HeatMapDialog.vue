<template>
  <Dialog class="HeatMapDialog" ref="dialog" :title="$l('热力图')" hideMinimize :visible="s_show" @close="close" left="center" :top="20" width="940px">
    <div class="toolbar">
      <el-button type="primary" icon="el-icon-setting" @click="handleOpenConfig" size="mini"></el-button>
      <GeoJSONSetting ref="config" :visible.sync="showConfig" :form="configForm" :layout="configLayout" @confirm="handleConfigConfirm" @close="handleCloseConfig" />
    </div>
    <div ref="chart" class="chart" key="chart"></div>
  </Dialog>
</template>

<language>
{
  "热力图":{
    "zh-CN": "热力图",
    "en-US": "Heat Map"
  },
}
</language>

<script>
import * as echarts from "@/utils/echarts.utils";
import GeoJSONSetting from "../../GeoJSON/component/GeoJSONSetting.vue";

export default {
  name: "HeatMapDialog",
  props: {
    form: {
      type: Object,
      default: () => ({}),
    },
    visible: {
      type: Boolean,
      default: false,
    },
  },
  inject: ["rootVue"],
  components: { GeoJSONSetting },
  computed: {},
  watch: {
    page_language() {
      this.updateChart();
    },
    visible: {
      handler(val) {
        this.s_show = val;
        if (val) this.updateChart();
      },
      immediate: true,
    },
  },
  data() {
    return {
      s_show: true,
      loading: true,
      showConfig: false,
      configForm: {
        colorBar: {
          valueKey: "value__Number",
          valueType: "Number",
          startColor: "#FEE0D2",
          endColor: "#99000D",
          model: "count",
          modelClass: 6,
          labelRule: "EN", // null || undefined 使用`${min} ~ ${max}` en 使用小字母顺序 EN 使用大写字母
          data: [
            { min: 0, max: 0.4, label: "A", color: "rgb(254, 224, 210)", use: true },
            { min: 0.4, max: 0.6, label: "B", color: "rgb(252, 187, 161)", use: true },
            { min: 0.6, max: 0.75, label: "C", color: "rgb(252, 146, 114)", use: true },
            { min: 0.75, max: 0.85, label: "D", color: "rgb(239, 59, 44)", use: true },
            { min: 0.85, max: 0.95, label: "E", color: "rgb(203, 24, 29)", use: true },
            { min: 0.95, max: 1.0, label: "F", color: "rgb(153, 0, 13)", use: true },
          ],
        },
      },
      configLayout: [
        {
          label: "颜色",
          en_label: "color",
          name: "colorBar",
          type: "colorBar",
          options: {
            value__Number: {
              type: "Number",
              name: "value",
              min: 0,
              max: 1,
              values: Array.from({ length: 101 }, (v, k) => k / 100),
            },
          },
          attrs: {
            hideValueKey: true,
          },
        },
      ],
    };
  },
  created() {},
  mounted() {
    this.$nextTick(() => {
      this._chart = echarts.init(this.$refs.chart);
      this.updateChart();
    });
  },
  beforeDestroy() {
    if (this._chart) {
      this._chart.dispose();
      this._chart = null;
    }
  },
  methods: {
    handleOpenConfig() {
      this.s_show = false;
      this.showConfig = true;
    },
    handleCloseConfig() {
      this.s_show = true;
      this.showConfig = false;
    },
    handleConfigConfirm(data) {
      this.configForm = data;
      this.s_show = true;
      this.showConfig = false;
      this.$nextTick(() => {
        this.updateChart();
      });
    },
    // 关闭弹窗
    close() {
      this.$emit("update:visible", false);
      this.$emit("close");
    },
    // 更新图表
    updateChart() {
      if (this._chart) {
        this._chart.setOption(this.getChartOption(), true);
        this._chart.resize();
      }
    },
    // 获取图表配置
    getChartOption() {
      // prettier-ignore
      const hours = new Array(24).fill(0).map((v, i) => i);
      // prettier-ignore
      const ids = Array.from(Object.keys(this.form || {}));
      const data = [];
      const list = Array.from(Object.values(this.form || {}));
      for (let i1 = 0, l1 = list.length; i1 < l1; i1++) {
        const v1 = list[i1];
        for (let i2 = 0, l2 = v1.length; i2 < l2; i2++) {
          const v2 = v1[i2];
          data[data.length] = [i2, i1, v2 || "-"];
        }
      }
      return {
        tooltip: {
          position: "top",
        },
        grid: {
          top: 20,
          left: 20,
          right: 60,
          containLabel: true,
          bottom: 90,
        },
        dataZoom: [
          {
            show: true,
            start: 0,
            end: (20 / ids.length) * 100,
            yAxisIndex: [0],
          },
        ],
        xAxis: {
          type: "category",
          data: hours,
          position: "top",
          splitArea: {
            show: true,
          },
        },
        yAxis: {
          type: "category",
          data: ids,
          inverse: true,
          splitArea: {
            show: true,
          },
        },
        visualMap: {
          type: "piecewise",
          orient: "horizontal",
          left: "center",
          bottom: 5,
          //"rgb(254, 224, 210)", "rgb(252, 187, 161)", "rgb(252, 146, 114)", "rgb(239, 59, 44)", "rgb(203, 24, 29)", "rgb(153, 0, 13)"
          // pieces: [
          //   // { gte: 0, lt: 0.4, label: "0 到 0.4", color: "rgb(254, 224, 210)" },
          //   // { gte: 0.4, lt: 0.6, label: "0.4 到 0.6", color: "rgb(252, 187, 161)" },
          //   // { gte: 0.6, lt: 0.75, label: "0.6 到 0.75", color: "rgb(252, 146, 114)" },
          //   // { gte: 0.75, lt: 0.85, label: "0.75 到 0.85", color: "rgb(239, 59, 44)" },
          //   // { gte: 0.85, lt: 0.95, label: "0.85 到 0.95", color: "rgb(153, 0, 13)" },
          //   // { gte: 0.95, lte: 1.0, label: "0.95 到 1.0", color: "rgb(203, 24, 29)" },
          //   { gte: 0, lt: 0.4, label: "A", color: "rgb(254, 224, 210)" },
          //   { gte: 0.4, lt: 0.6, label: "B", color: "rgb(252, 187, 161)" },
          //   { gte: 0.6, lt: 0.75, label: "C", color: "rgb(252, 146, 114)" },
          //   { gte: 0.75, lt: 0.85, label: "D", color: "rgb(239, 59, 44)" },
          //   { gte: 0.85, lt: 0.95, label: "E", color: "rgb(203, 24, 29)" },
          //   { gte: 0.95, lte: 1.0, label: "F", color: "rgb(153, 0, 13)" },
          // ],
          pieces: this.configForm.colorBar.data,
        },
        series: [
          {
            type: "heatmap",
            data: data,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowColor: "rgba(0, 0, 0, 0.5)",
              },
            },
          },
        ],
      };
    },
    // 弹窗置顶
    toTop() {
      this.$refs.dialog.toTop();
    },
    // 弹窗视图改变（包括大小和显隐）
    handleViewChange() {
      if (this._chart) this._chart.resize();
    },
  },
};
</script>

<style lang="scss" scoped>
.HeatMapDialog {
  .chart {
    width: 900px;
    height: 600px;
  }
}
</style>
