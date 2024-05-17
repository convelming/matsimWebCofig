<template>
  <!-- 出行目的 -->
  <Dialog class="TravelPurpose" ref="dialog" :title="$l('出行目的')" hideMinimize :visible="true" @close="$emit('close')" left="100" width="640px">
    <div ref="chart" class="chart"></div>
  </Dialog>
</template>

<language>
{
  "出行目的":{
    "zh-CN": "出行目的",
    "en-US": "Travel Purpose"
  },
  "基础方案":{
    "zh-CN": "基础方案",
    "en-US": "base"
  },
  "对比方案":{
    "zh-CN": "对比方案",
    "en-US": "contrast"
  },
}
</language>

<script>
import * as echarts from "echarts";
import { travelPurpose } from "@/api/crt.js";

export default {
  name: "TravelPurpose",
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
    travelPurpose({
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
      return {
        title: {
          text: this.$l("出行目的"),
          left: "center",
        },
        tooltip: {
          trigger: "item",
        },
        legend: {
          left: "center",
          bottom: 0,
        },
        series: [
          {
            name: this.$l("出行目的"),
            type: "pie",
            radius: "50%",
            label: {
              formatter: "{b}: {c}\n({d}%)",
            },
            data: Object.entries(data).map(([key, value]) => {
              return {
                name: key,
                value,
              };
            }),
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)",
              },
            },
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
.TravelPurpose {
  .chart {
    width: 600px;
    height: 600px;
  }
}
</style>
