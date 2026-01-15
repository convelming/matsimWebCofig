<template>
  <div class="Transfers">
    <Dialog :title="$l('Transfers')" visible @close="$emit('close')" left="center" width="900px">
      <div class="Transfers_bodyer">
        <div class="row">
          <el-popover placement="bottom" width="200" trigger="click">
            <el-table ref="stopTable" class="small" :data="stopList" border stripe height="300px">
              <el-table-column type="selection" width="55" align="center" />
              <el-table-column :label="$l('Transit Stop')" show-overflow-tooltip>
                <span slot-scope="{ row }">{{ row.name }} ({{ row.id }})</span>
              </el-table-column>
            </el-table>
            <el-button slot="reference" size="small">{{ $l("Analyzed Stops...") }}</el-button>
          </el-popover>
          <el-button style="margin-left: 10px" size="small" @click="dialog2 = true">{{ $l("Lines...") }}</el-button>
          <el-button size="small" @click="dialog3 = true">{{ $l("Create Agent Group...") }}</el-button>
        </div>
        <!-- <div class="row">
          <el-checkbox v-model="showNum" @change="updateChart">{{ $l("Show Numbers in Chart") }}</el-checkbox>
          <el-checkbox v-model="showPer" @change="updateChart">{{ $l("show Percentages in Table") }}</el-checkbox>
          <span class="text1" style="margin-left: auto; margin-right: 10px">{{ $l("Nultiplicator:") }}</span>
          <el-input-number v-model="s_form.nultiplicator" size="small" :step="0.01" />
        </div> -->
        <div class="row">
          <TimeRangeSlider :value="[s_form.startSecond, s_form.endSecond]" :start.sync="s_form.startSecond" :end.sync="s_form.endSecond" />
        </div>
        <el-tabs v-model="activeName">
          <el-tab-pane :label="$l('Chart')" name="Chart">
            <!-- <div class="chart_legend_box">
          <el-checkbox v-model="showChart1">chart1</el-checkbox>
          <el-checkbox v-model="showChart2">chart2</el-checkbox>
          <el-checkbox v-model="showChart3">chart3</el-checkbox>
        </div> -->
            <div class="chart_list_box" v-loading="loading">
              <div class="chart_box">
                <div class="chart" v-html="chartSrc"></div>
              </div>
              <!-- <div class="chart_box" v-if="showChart1">
            <div class="chart" v-html="src"></div>
            <div class="chart_name">Chart1</div>
          </div> -->
              <!-- <div class="chart_box" v-if="showChart2">
            <div class="chart" v-html="src"></div>
            <div class="chart_name">Chart2</div>
          </div>
          <div class="chart_box" v-if="showChart3">
            <div class="chart" v-html="src"></div>
            <div class="chart_name">Chart3</div>
          </div> -->
            </div>
          </el-tab-pane>
          <el-tab-pane :label="$l('Data')" name="Data">
            <div style="margin-bottom: 10px">
              <el-button type="primary" size="small" @click="handleExport">导出</el-button>
            </div>
            <el-table class="small" :data="tableList" border stripe height="calc(100vh - 400px)" :show-header="false">
              <el-table-column prop="name" min-width="150" />
              <el-table-column v-for="(v, i) in colList" :key="i" min-width="150">
                <template slot-scope="{ row }">
                  {{ row.type === "header" ? v.name : getValue(dataMap, v.id, row.id) }}
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </div>
    </Dialog>

    <Dialog :visible.sync="dialog2" left="20" width="400px">
      <el-form label-position="top" size="small" class="Transfers_dialog2">
        <el-form-item :label="$l('Group Attribute (Incoming)')">
          <el-select v-model="s_form.inconming" @change="getData">
            <el-option v-for="item in group_attribute" :key="item.value" :label="item[$l('label')]" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$l('Group Attribute (Outgoing)')">
          <el-select v-model="s_form.outgoing" @change="getData">
            <el-option v-for="item in group_attribute" :key="item.value" :label="item[$l('label')]" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-table class="small" :data="chartNodeList" border stripe height="300px">
            <el-table-column align="center" width="55">
              <el-checkbox slot-scope="{ row }" v-model="row.show" @change="updateChart"></el-checkbox>
            </el-table-column>
            <el-table-column :label="$l('line')" prop="name" show-overflow-tooltip>
              <span slot-scope="{ row }">{{ row.name }} ({{ row.id }})</span>
            </el-table-column>
            <el-table-column :label="$l('color')" width="70" align="center">
              <el-color-picker slot-scope="{ row }" v-model="row.color" size="small" @change="updateChart" />
            </el-table-column>
          </el-table>
        </el-form-item>
      </el-form>
    </Dialog>

    <el-dialog class="Transfers_dialog3" :title="$l('Create Agent Group from Transferring Passengers')" :visible.sync="dialog3" width="500px" append-to-body>
      <div>
        <el-checkbox v-model="dialog3Form.checkbox">{{ $l("Include Passengers that start theirtriphere") }}</el-checkbox>
        <el-checkbox v-model="dialog3Form.checkbox">{{ $l("Include Passengers that end their trip here") }}</el-checkbox>
        <el-checkbox v-model="dialog3Form.checkbox">{{ $l("Include Passengers that transfer here") }}</el-checkbox>
        <el-radio-group v-model="dialog3Form.radioGroup">
          <el-radio label="1">{{ $l("Passengers of any line") }}</el-radio>
          <el-radio label="2">
            <span>{{ $l("Only Passengers of line") }}&nbsp;&nbsp;&nbsp;&nbsp;</span>
            <el-select v-model="dialog3Form.select" size="small">
              <el-option :label="$l('Start/End')" value="Start/End" />
            </el-select>
          </el-radio>
        </el-radio-group>
        <TimeRangeSlider :value="[dialog3Form.startSecond, dialog3Form.endSecond]" :start.sync="dialog3Form.startSecond" :end.sync="dialog3Form.endSecond" />
      </div>
      <div slot="footer">
        <el-button size="small">{{ $l("Cancel") }}</el-button>
        <el-button type="primary" size="small">{{ $l("Create") }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<language>
{
  "Transfers":{
    "zh-CN": "站点换乘客流",
    "en-US": "Transfers"
  },
  "Transit Stop":{
    "zh-CN": "中转站",
    "en-US": "Transit Stop"
  },
  "Analyzed Stops...":{
    "zh-CN": "分析的站点...",
    "en-US": "Analyzed Stops..."
  },
  "Lines...":{
    "zh-CN": "线路...",
    "en-US": "Lines..."
  },
  "Create Agent Group...":{
    "zh-CN": "创建代理组...",
    "en-US": "Create Agent Group..."
  },
  "Show Numbers in Chart":{
    "zh-CN": "图表中显示数字",
    "en-US": "Show Numbers in Chart"
  },
  "show Percentages in Table":{
    "zh-CN": "在表中显示百分比",
    "en-US": "show Percentages in Table"
  },
  "Nultiplicator:":{
    "zh-CN": "乘法器:",
    "en-US": "Nultiplicator:"
  },
  "Group Attribute (Incoming)":{
    "zh-CN": "组属性（传入）",
    "en-US": "Group Attribute (Incoming)"
  },
  "Group Attribute (Outgoing)":{
    "zh-CN": "组属性（传出））",
    "en-US": "Group Attribute (Outgoing)"
  },
  "color":{
    "zh-CN": "颜色",
    "en-US": "color"
  },
  "Create Agent Group from Transferring Passengers":{
    "zh-CN": "从中转乘客中创建代理组",
    "en-US": "Create Agent Group from Transferring Passengers"
  },
  "Include Passengers that start theirtriphere":{
    "zh-CN": "包括从这里出发的乘客",
    "en-US": "Include Passengers that start their trip here"
  },
  "Include Passengers that end their trip here":{
    "zh-CN": "包括在此处结束行程的乘客",
    "en-US": "Include Passengers that end their trip here"
  },
  "Include Passengers that transfer here":{
    "zh-CN": "包括在此换乘的乘客",
    "en-US": "Include Passengers that transfer here"
  },
  "Passengers of any line":{
    "zh-CN": "任何线路的乘客",
    "en-US": "Passengers of any line"
  },
  "Only Passengers of line":{
    "zh-CN": "只限线路乘客",
    "en-US": "Only Passengers of line"
  },
  "Start/End":{
    "zh-CN": "起点/终点",
    "en-US": "Start/End"
  },
  "Cancel":{
    "zh-CN": "取消",
    "en-US": "Cancel"
  },
  "Create":{
    "zh-CN": "创建",
    "en-US": "Create"
  },
  "Chart":{
    "zh-CN": "图表",
    "en-US": "Chart"
  },
  "Data":{
    "zh-CN": "数据",
    "en-US": "Data"
  },
  // 这个不需要修改
  "label":{
    "zh-CN": "cn_label",
    "en-US": "label"
  },
}
</language>

<script>
import * as d3 from "d3";
import { group_attribute } from "../../enum";
import { transfers } from "@/api/index";
import colors from "@/utils/colors";
export default {
  props: {
    form: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      group_attribute,
      stopList: [],

      showNum: false,
      showPer: false,

      s_form: {
        stopIds: [],
        startSecond: 0,
        endSecond: 24 * 60 * 60,
        nultiplicator: 1.0,
        inconming: 1,
        outgoing: 1,
      },

      loading: false,
      chartSrc: "",
      chartData: {},
      chartNodeList: [],
      tableList: [],
      dataMap: [],
      colList: [],

      dialog1: false,

      dialog2: false,

      dialog3: false,
      dialog3Form: {
        checkbox: false,
        startSecond: 0,
        endSecond: 24 * 60 * 60,
        radioGroup: "1",
        select: "Transit Line Id",
      },

      showChart1: true,
      showChart2: false,
      showChart3: false,

      activeName: "Chart",
    };
  },
  created() {
    this.stopList = this.form.list || [];
    this.s_form = {
      stopIds: this.stopList.map((v) => v.id),
      startSecond: 0,
      endSecond: 24 * 60 * 60,
      nultiplicator: 1.0,
    };
    this.getData();
  },
  mounted() {
    this.$refs.stopTable.toggleAllSelection();
  },
  methods: {
    getData() {
      if (this.loading) return;
      this.loading = true;
      transfers(this.s_form)
        .then(({ data }) => {
          const dataMap = new Map(data.map((v) => [`${v.source.id}-${v.target.id}`, v]));
          const nodeMap = new Map(data.flatMap((d) => [d.source, d.target]).map((v) => [v.id, v]));
          const nodeList = Array.from(nodeMap.values()).map((v, i) => {
            v.color = colors[i];
            v.show = true;
            return v;
          });
          this.chartNodeList = nodeList;
          this.chartData = data;
          this.dataMap = dataMap;
          this.tableList = [{ type: "header" }, ...nodeList];
          this.colList = [...nodeList];
          this.updateChart();
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 获取值
    getValue(dataMap, stopId, departureId) {
      try {
        return dataMap.get(`${stopId}-${departureId}`).value;
      } catch (error) {
        return 0;
      }
    },
    updateChart() {
      const width = 1080;
      const height = width;
      const innerRadius = Math.min(width, height) * 0.5 - 100;
      const outerRadius = innerRadius + 20;

      const nodeList = Array.from(this.chartNodeList.values()).filter((v) => v.show);
      const data = this.chartData;

      const nodeMap = new Map(nodeList.map((v) => [v.id, v]));
      const indexs = nodeList.map((v) => v.id);
      const indexMap = new Map(indexs.map((key, value) => [key, value]));
      const matrix = Array.from(indexMap, () => new Array(indexMap.size).fill(0));
      for (const { source, target, value } of data) {
        if (indexMap.has(source.id) && indexMap.has(target.id)) {
          matrix[indexMap.get(source.id)][indexMap.get(target.id)] += value;
        }
      }
      // 创建 chord （）
      const chord = d3
        .chordDirected()
        .padAngle((Math.PI * 180) / (Math.pow(indexs.length, 1.5) * 180))
        .sortSubgroups(d3.descending)
        .sortChords(d3.descending);
      const chords = chord(matrix);

      const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);

      const ribbon = d3
        // .ribbon()
        .ribbonArrow()
        .radius(innerRadius - 0.5);

      const svg = d3
        .create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-width / 2, -height / 2, width, height])
        .attr("style", "width: 100%; height: auto; font: 10px sans-serif;");

      svg
        .append("path")
        .attr("id", "textId")
        .attr("fill", "none")
        .attr("d", d3.arc()({ outerRadius, startAngle: 0, endAngle: 2 * Math.PI }));

      svg
        .append("g")
        .attr("fill-opacity", 0.75)
        .selectAll()
        .data(chords)
        .join("path")
        .attr("d", ribbon)
        .attr("fill", (d) => {
          const source = nodeMap.get(indexs[d.source.index]);
          return source.color;
        })
        // .style("mix-blend-mode", "multiply")
        .append("title")
        .text((d) => {
          const source = nodeMap.get(indexs[d.source.index]);
          const target = nodeMap.get(indexs[d.target.index]);
          return `${source.name} owes ${target.name} ${d.source.value}`;
        });

      const g = svg.append("g").selectAll().data(chords.groups).join("g");

      g.append("path")
        .attr("d", arc)
        .attr("fill", (d) => {
          const source = nodeMap.get(indexs[d.index]);
          return source.color;
        })
        .attr("stroke", "var(--color-white)");

      g.append("text")
        .attr("fill", "var(--color-black)")
        .attr("text-anchor", "middle")
        .attr("font-size", 30)
        .attr("dy", -3)
        .append("textPath")
        .attr("xlink:href", "#textId")
        .attr("startOffset", (d) => ((d.startAngle + d.endAngle) / 2) * outerRadius)
        .text((d) => {
          const source = nodeMap.get(indexs[d.index]);
          return source.name;
        });

      g.append("title")
        .attr("fill", "var(--color-black)")
        .text((d) => {
          const source = nodeMap.get(indexs[d.index]);
          return `${source.name} \nowes ${d3.sum(matrix[d.index])} \nis owed ${d3.sum(matrix, (row) => row[d.index])}`;
        });
      this.chartSrc = svg.node().outerHTML;
    },
    handleExport() {
      const rowList = [];
      rowList.push(`"${["", this.colList.map((v) => v.name)].join(`","`)}"`);
      for (const v1 of this.colList) {
        const colList = [v1.name];
        for (const v2 of this.colList) {
          colList.push(this.getValue(this.dataMap, v1.id, v2.id));
        }
        rowList.push(`"${colList.join(`","`)}"`);
      }
      const tableText = rowList.join("\n");
      var uri = "data:text/csv;charset=utf-8,\ufeff" + encodeURIComponent(tableText);
      var downloadLink = document.createElement("a");
      downloadLink.href = uri;
      downloadLink.download = `RouteFlows_${new Date().getTime()}.csv`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    },
  },
};
</script>

<style lang="scss" scoped>
.Transfers_bodyer {
  .row {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }
  .text1 {
    font-size: 14px;
    color: var(--color-text-regular);
  }
}
.Transfers_dialog3 {
  .el-checkbox,
  .el-radio {
    display: block;
    height: 35px;
    line-height: 35px;
  }
}
.Transfers_dialog2 {
  .el-select {
    width: 100%;
  }
}
.chart_legend_box {
  display: flex;
  justify-content: center;
}
.chart_list_box {
  width: 100%;
  display: flex;
  justify-content: space-around;
  .chart_box {
    width: 100%;
    min-height: 250px;
    .chart {
      width: 100%;
      max-width: 600px;
      margin: auto;
    }
    .chart_name {
      text-align: center;
    }
  }
}
</style>
