<template>
  <el-tabs v-model="activeName">
    <el-tab-pane :label="$l('Chart')" name="Chart">
      <div ref="chart" class="chart-container" v-loading="loading">
        <div class="chart" v-html="src"></div>
      </div>
    </el-tab-pane>
    <el-tab-pane :label="$l('Data')" name="Data">
      <el-table
        class="small"
        :data="tableList"
        border
        stripe
        height="calc(100vh - 400px)"
        v-loading="loading"
        :header-cell-style="headerCellStyle"
        :show-header="false"
      >
        <el-table-column :label="lineInfo.line">
          <el-table-column :label="lineInfo.routeId">
            <el-table-column :label="lineInfo.routeId">
              <el-table-column prop="name" show-overflow-tooltip width="150">
                <template slot-scope="{ row }">
                  <span v-if="row.type == 'name'"></span>
                  <span v-if="row.type == 'id'">from</span>
                  <span v-else>{{ row.name }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="id" show-overflow-tooltip width="150">
                <template slot-scope="{ row }">
                  <span v-if="row.type == 'name'">to</span>
                  <span v-if="row.type == 'id'"></span>
                  <span v-else>{{ row.id }}</span>
                </template>
              </el-table-column>
              <el-table-column
                v-for="(v, i) in list"
                :key="i"
                show-overflow-tooltip
                width="150"
              >
                <template slot-scope="{ row }">
                  <span v-if="row.type == 'name'">{{ v.name }}</span>
                  <span v-if="row.type == 'id'">{{ v.id }}</span>
                  <div v-else :title="`${row.name} - ${v.name}`">
                    {{ getValue(row.name, v.name) }}
                  </div>
                </template>
              </el-table-column>
            </el-table-column>
          </el-table-column>
        </el-table-column>
      </el-table>
    </el-tab-pane>
  </el-tabs>
</template>

<language>
{
  "Chart":{
    "zh-CN": "Chart",
    "en-US": "Chart"
  },
  "Data":{
    "zh-CN": "Data",
    "en-US": "Data"
  },
}
</language>

<script>
import * as d3 from "d3";
import { routeFlows } from "@/api/index";
import { formatHour } from "@/utils/utils";
export default {
  props: {
    routeOptions: {
      type: Array,
      default: () => [],
    },
    lineInfo: {
      type: Object,
      default: () => ({}),
    },
    form: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    tableList() {
      return [{ type: "name" }, { type: "id" }, ...this.list];
    },
  },
  watch: {
    form: {
      handler(val) {
        this.getData();
      },
      immediate: true,
      deep: true,
    },
  },
  data() {
    return {
      activeName: "Chart",
      list: [],
      linkObj: {},
      loading: false,
      src: "",
      maxPassenger: 0,
    };
  },
  mounted() {},
  methods: {
    // table 表头样式
    headerCellStyle({ row, column, rowIndex, columnIndex }) {
      return rowIndex == 3 ? "display:none" : "";
    },
    // 请求数据
    getData() {
      this.loading = true;
      routeFlows(this.form)
        .then((res) => {
          const list = [];
          const linkObj = {};
          const fromOffsetObj = {};
          const toOffsetObj = {};
          for (const v1 of res.data) {
            list.push({
              ...v1.stop,
              enter: v1.enter,
              leave: v1.leave,
            });
            for (const v2 of v1.to.reverse()) {
              if (v2.stop) {
                fromOffsetObj[v1.stop.name] =
                  Number(fromOffsetObj[v1.stop.name] || 0) + v2.passenger;
                toOffsetObj[v2.stop.name] =
                  Number(toOffsetObj[v2.stop.name] || 0) + v2.passenger;
                const key = `${v1.stop.name}-${v2.stop.name}`;
                linkObj[key] = {
                  source: v1.stop.name,
                  target: v2.stop.name,
                  value: v2.passenger,
                };
              }
            }
          }
          this.list = list;
          this.linkObj = linkObj;
          this.maxPassenger = Math.max(
            ...[...Object.values(fromOffsetObj), ...Object.values(toOffsetObj)]
          );
          this.src = this.getChart();
          this.loading = false;
        })
        .catch((err) => {
          this.list = [];
          this.linkObj = {};
          this.src = this.getChart();
          this.loading = false;
        });
    },
    // 获取图表svg
    getChart() {
      const nodes = this.list;
      const links = Object.values(this.linkObj);
      const maxValue = this.maxPassenger <= 0 ? 1 : this.maxPassenger;

      const step = 100;
      const marginTop = step * 2;
      const marginBottom = step * 2;
      const marginLeft = step / 4;
      const marginRight = step / 4;
      const width = (nodes.length - 1) * step + marginRight + marginLeft;
      const height = ((nodes.length - 1) * step) / 2 + marginTop + marginBottom;
      const x = d3.scalePoint(
        nodes.map(({ name }) => name),
        [marginLeft, width - marginRight]
      );
      const X = new Map(nodes.map(({ name }) => [name, x(name)]));
      const svg = d3
        .create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "width:100%;height:auto;background: #fff");

      const defs = svg.append("defs");
      const linerGradient = defs
        .append("linearGradient")
        .attr("id", "linearColor")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");
      linerGradient
        .append("stop")
        .attr("offset", "0%")
        .style("stop-color", "#ff0000");
      linerGradient
        .append("stop")
        .attr("offset", "50%")
        .style("stop-color", "#ffffff");
      linerGradient
        .append("stop")
        .attr("offset", "100%")
        .style("stop-color", "#00ff00");

      const fromOffsetObj = {};
      const toOffsetObj = {};

      nodes.forEach(({ name }) => {
        fromOffsetObj[name] = 0;
        toOffsetObj[name] = 0;
      });
      const path = svg
        .insert("g", "*")
        .attr("fill", "none")
        .attr("stroke-opacity", 1)
        .attr("stroke", "url(#" + linerGradient.attr("id") + ")")
        .selectAll("path")
        .data(links)
        .join("path")
        .attr("stroke-width", (d) => (d.value / maxValue) * step * 0.5)
        .attr("d", (d) => {
          const width = (d.value / maxValue) * step * 0.5;
          fromOffsetObj[d.source] += width / 2;
          toOffsetObj[d.target] += width / 2;
          const x1 = X.get(d.source) + fromOffsetObj[d.source];
          const x2 = X.get(d.target) - toOffsetObj[d.target];
          const r = Math.abs(x2 - x1) / 2;
          fromOffsetObj[d.source] += width / 2;
          toOffsetObj[d.target] += width / 2;
          return `M${x1},${height - marginBottom}A${r},${r} 0,0,${
            x1 < x2 ? 1 : 0
          } ${x2},${height - marginBottom}`;
        });
      const title_box = svg.append("g");
      title_box
        .append("text")
        .attr("font-family", "sans-serif")
        .attr("font-size", step * 0.6)
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", step)
        .text(this.form.routeId);
      if (this.form.single) {
        const times = this.form.departureId.split("_");
        const subtitle = `Departrue at ${times[times.length - 1]}`;
        title_box
          .append("text")
          .attr("font-family", "sans-serif")
          .attr("font-size", step * 0.4)
          .attr("text-anchor", "middle")
          .attr("x", width / 2)
          .attr("y", step * 1.5)
          .attr("dy", "1em")
          .text(subtitle);
      } else {
        const subtitle = `${
          this.routeOptions.length
        } departrue between ${formatHour(
          this.form.startSecond
        )} and ${formatHour(this.form.endSecond)}`;
        title_box
          .append("text")
          .attr("font-family", "sans-serif")
          .attr("font-size", step * 0.4)
          .attr("text-anchor", "middle")
          .attr("x", width / 2)
          .attr("y", step * 1.5)
          .attr("dy", "1em")
          .text(subtitle);
      }

      // Add a text label and a dot for each node.
      const label = svg
        .append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", step * 0.25)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(nodes)
        .join("g")
        .attr(
          "transform",
          (d) =>
            `translate(${X.get(d.name)},${height - marginBottom}) rotate(-90)`
        )
        .call((g) =>
          g
            .append("text")
            .attr("x", -step / 8)
            .attr("dy", "0.35em")
            .attr("fill", "#000")
            .text((d) => d.name)
        )
        .call((g) =>
          g
            .append("circle")
            .attr("r", step / 16)
            .attr("fill", "#000")
        );
      return svg.node().outerHTML;
    },
    // 获取值
    getValue(from, to) {
      const line = this.linkObj[`${from}-${to}`];
      if (line) {
        return line.value || 0;
      } else {
        return "";
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.chart-container {
  width: 100%;
  min-height: 300px;
  height: calc(100vh - 420px);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
}
</style>
