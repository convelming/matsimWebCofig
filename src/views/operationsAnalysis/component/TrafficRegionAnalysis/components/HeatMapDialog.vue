<template>
  <Dialog class="HeatMapDialog" ref="dialog" :title="$l('热力图')" hideMinimize :visible="s_show" @close="close" left="center" :top="20" width="940px">
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
import * as echarts from "echarts";

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
  components: {},
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
      console.log(this.form);

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
          data[data.length] = [i1, i2, v2 || "-"];
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
          min: 0,
          max: 1,
          calculable: true,
          orient: "horizontal",
          left: "center",
          bottom: 5,
        },
        series: [
          {
            name: "Punch Card",
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
