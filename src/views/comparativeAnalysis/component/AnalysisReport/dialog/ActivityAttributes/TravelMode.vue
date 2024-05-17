<template>
  <!-- 出行方式 -->
  <Dialog class="TravelMode" ref="dialog" :title="$l('出行方式')" hideMinimize :visible="true" @close="$emit('close')" left="100" width="640px">
    <div ref="chart" class="chart"></div>
  </Dialog>
</template>

<language>
  {
    "出行方式":{
      "zh-CN": "出行方式",
      "en-US": "TravelMode"
    },
  }
  </language>

<script>
import * as echarts from "echarts";
import { travelMode } from "@/api/crt.js";

export default {
  name: "TravelMode",
  props: {
    form: {
      type: Object,
      default: () => ({}),
    },
    offset: {
      type: Number,
      default: 0,
    },
  },
  inject: ["rootVue"],
  components: {},
  computed: {},
  watch: {},
  data() {
    return {};
  },
  created() {},
  mounted() {
    this.$nextTick(() => {
      this.$refs.dialog.offset(this.offset, this.offset);
    });

    const { database1, datasource1, database2, datasource2 } = this.$route.params;
    travelMode({
      name1: database1 + "/" + datasource1,
      name2: database2 + "/" + datasource2,
    }).then((res) => {
      console.log(res);
      this._chart = echarts.init(this.$refs.chart);
      this._chart.setOption(this.getChartOption(res.data), true);
      this._chart.resize();

      this.loading = false;
    });
  },
  beforeDestroy() {
    if (this._chart) {
      this._chart.dispose();
      this._chart = null;
    }
  },
  methods: {
    getChartOption(data) {
      const { after, before } = data;
      const keys = Array.from(new Set([Object.keys(after), Object.keys(before)].flat()));
      const afterList = keys.map((v) => after[v] || 0);
      const beforeList = keys.map((v) => before[v] || 0);
      return {
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
        },
        legend: {
          data: keys,
        },
        grid: {
          top: 20,
          left: 20,
          right: 20,
          bottom: 20,
          containLabel: true,
        },
        xAxis: [
          {
            type: "category",
            axisTick: { show: false },
            data: keys,
          },
        ],
        yAxis: [
          {
            type: "value",
          },
        ],
        series: [
          {
            name: "Base",
            type: "bar",
            barGap: 0,
            emphasis: {
              focus: "series",
            },
            data: afterList,
          },
          {
            name: "Steppe",
            type: "bar",
            emphasis: {
              focus: "series",
            },
            data: beforeList,
          },
        ],
      };
    },
    toTop() {
      this.$refs.dialog.toTop();
    },
  },
};
</script>

<style lang="scss" scoped>
.TravelMode {
  .chart {
    width: 600px;
    height: 600px;
  }
}
</style>
