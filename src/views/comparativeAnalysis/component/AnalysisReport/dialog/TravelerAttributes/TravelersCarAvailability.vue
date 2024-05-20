<template>
  <!-- 出行者车辆可使用情况 -->
  <Dialog class="TravelersCarAvailability" ref="dialog" :title="$l('出行者车辆可使用情况')" hideMinimize :visible="true" @close="$emit('close')" left="100" width="640px">
    <div class="toolbar">
      <el-radio-group v-model="type" size="mini" @change="handleViewChange">
        <el-radio-button label="Chart">{{ $l("图表") }}</el-radio-button>
        <el-radio-button label="Detail">{{ $l("描述") }}</el-radio-button>
      </el-radio-group>
    </div>
    <div class="content" v-loading="loading">
      <transition name="el-zoom-in-center">
        <div v-show="type == 'Chart'" ref="chart" class="chart" key="chart"></div>
      </transition>
      <transition name="el-zoom-in-center">
        <div v-show="type == 'Detail'" class="detail" key="detail">{{ description }}</div>
      </transition>
    </div>
  </Dialog>
</template>

<language>
{
  "出行者车辆可使用情况":{
    "zh-CN": "出行者车辆可使用情况",
    "en-US": "Travelers Car Availability"
  },
  "图表":{
    "zh-CN": "图表",
    "en-US": "Chart"
  },
  "描述":{
    "zh-CN": "描述",
    "en-US": "description"
  },
  "总是可以使用":{
    "zh-CN": "总是可以使用",
    "en-US": "always"
  },
  "没有或者不可使用":{
    "zh-CN": "没有或者不可使用",
    "en-US": "never"
  },
  "偶尔可以使用":{
    "zh-CN": "偶尔可以使用",
    "en-US": "sometimes"
  },
}
</language>

<script>
import * as echarts from "echarts";
import { travelersCarAvailability } from "@/api/crt.js";

export default {
  name: "TravelersCarAvailability",
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
  watch: {
    page_language() {
      this.updateChart();
    },
  },
  data() {
    return {
      loading: true,
      type: "Chart",
      description: "",
    };
  },
  created() {
    const { database1, datasource1, database2, datasource2 } = this.$route.params;
    travelersCarAvailability({
      name1: database1 + "/" + datasource1,
      name2: database2 + "/" + datasource2,
    }).then((res) => {
      this.description = res.data.description;
      this._chartData = res.data.data;
      this.updateChart();
      this.loading = false;
    });
  },
  mounted() {
    this.$nextTick(() => {
      this.$refs.dialog.offset(this.offset, this.offset);
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
    updateChart() {
      if (this._chart && this._chartData) {
        this._chart.setOption(this.getChartOption(this._chartData), true);
        this._chart.resize();
      }
    },
    getChartOption(data) {
      return {
        title: {
          text: this.$l("出行者车辆可使用情况"),
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
            name: this.$l("出行者车辆可使用情况"),
            type: "pie",
            radius: "50%",
            label: {
              formatter: "{b}: {c}\n({d}%)",
            },
            data: [
              { value: data.always, name: this.$l("总是可以使用") },
              { value: data.never, name: this.$l("没有或者不可使用") },
              { value: data.sometimes, name: this.$l("偶尔可以使用") },
            ],
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
    handleViewChange() {
      if (this._chart) this._chart.resize();
    },
  },
};
</script>

<style lang="scss" scoped>
.TravelersCarAvailability {
  .toolbar {
    display: flex;
    justify-content: center;
    padding-bottom: 10px;
  }
  .content {
    position: relative;
    width: 600px;
    height: 600px;
  }
  .detail,
  .chart {
    position: absolute;
    top: 0;
    left: 0;
    width: 600px;
    height: 600px;
    overflow-y: auto;
  }
}
</style>
