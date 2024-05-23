<template>
  <!-- 出行效用决策树 -->
  <Dialog class="TravelUtilityTree" ref="dialog" :title="$l('出行效用决策树')" hideMinimize :visible="true" @close="$emit('close')" left="100" width="840px">
    <!-- <div class="toolbar">
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
    </div> -->

    <div class="content" v-loading="loading">
      <div ref="chart" class="chart" key="chart"></div>
    </div>
  </Dialog>
</template>

<language>
{
  "出行效用决策树":{
    "zh-CN": "出行效用决策树",
    "en-US": "Travel Utility Tree"
  },
  "图表":{
    "zh-CN": "图表",
    "en-US": "Chart"
  },
  "描述":{
    "zh-CN": "描述",
    "en-US": "description"
  },
}
</language>

<script>
import * as echarts from "echarts";
import { travelUtilityTree } from "@/api/crt.js";

export default {
  name: "ResidenceTime",
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
    travelUtilityTree({
      name1: database1 + "/" + datasource1,
      name2: database2 + "/" + datasource2,
      tree: JSON.stringify(this.form),
    }).then((res) => {
      // this.description = res.data.description;
      // this._chartData = res.data.data;
      this._chartData = res.data;
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
          text: this.$l("出行效用决策树"),
          left: "center",
        },
        legend: {
          left: "center",
          bottom: 0,
        },
        series: [
          {
            type: "sankey",
            top: 50,
            layout: "none",
            emphasis: {
              focus: "adjacency",
            },
            label: {
              color: "rgba(0,0,0,0.7)",
              fontFamily: "Arial",
              fontSize: 10,
              formatter: (v) => data.idMap[v.name],
            },
            data: data.data,
            links: data.links,
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
.TravelUtilityTree {
  .toolbar {
    display: flex;
    justify-content: center;
    padding-bottom: 10px;
  }
  .content {
    position: relative;
    width: 800px;
    height: calc(100vh - 150px);
    overflow-y: auto;
    overflow-x: hidden;
  }
  .chart {
    position: absolute;
    top: 0;
    left: 0;
    width: 800px;
    height: 1200px;
  }
}
</style>
