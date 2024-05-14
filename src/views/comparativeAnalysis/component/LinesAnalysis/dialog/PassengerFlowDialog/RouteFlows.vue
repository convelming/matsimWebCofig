<template>
  <el-tabs v-model="activeName">
    <el-tab-pane :label="$l('Chart')" name="Chart">
      <div ref="chart" class="chart-container" v-loading="loading">
        <div>
          <el-button type="primary" size="small" @click="showOnMap">{{ $l("showOnMap") }}</el-button>
        </div>
        <div class="chart" v-html="src"></div>
      </div>
    </el-tab-pane>
    <el-tab-pane :label="$l('Data')" name="Data">
      <div style="margin-bottom: 10px">
        <el-button type="primary" size="small" @click="handleExport">导出</el-button>
      </div>
      <el-table class="small" :data="tableList" border stripe height="calc(100vh - 400px)" v-loading="loading" :header-cell-style="headerCellStyle" :show-header="false">
        <el-table-column :label="routeInfo.line">
          <el-table-column :label="routeInfo.routeId">
            <el-table-column :label="routeInfo.routeId">
              <el-table-column prop="name" show-overflow-tooltip width="150">
                <template slot-scope="{ row }">
                  <span v-if="row.type == 'name'"></span>
                  <span v-else-if="row.type == 'id'">from</span>
                  <span v-else>{{ row.name }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="id" show-overflow-tooltip width="150">
                <template slot-scope="{ row }">
                  <span v-if="row.type == 'name'">to</span>
                  <span v-else-if="row.type == 'id'"></span>
                  <span v-else>{{ row.id }}</span>
                </template>
              </el-table-column>
              <el-table-column v-for="(v, i) in list" :key="i" show-overflow-tooltip width="150">
                <template slot-scope="{ row }">
                  <span v-if="row.type == 'name'">{{ v.name }}</span>
                  <span v-else-if="row.type == 'id'">{{ v.id }}</span>
                  <div v-else :title="`${row.name} - ${v.name}`">
                    {{ getValue(row.id, v.id) }}
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
  "showOnMap":{
    "zh-CN": "在地图上显示",
    "en-US": "Display on map"
  },
}
</language>

<script>
import * as d3 from "d3";
import { routeFlows } from "@/api/contrast";
export default {
  props: {
    routeInfo: {
      type: Object,
      default: () => ({}),
    },
    form: {
      type: Object,
      default: () => ({}),
    },
  },
  inject: ["rootVue"],
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
      oldLinkObj: {},
      newLinkObj: {},
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
    getListObj(list) {
      const linkObj = {};
      const fromOffsetObj = {};
      const toOffsetObj = {};
      for (const v1 of list) {
        for (const v2 of v1.to.reverse()) {
          if (v2.stop) {
            fromOffsetObj[v1.stop.id] = Number(fromOffsetObj[v1.stop.id] || 0) + v2.passenger;
            toOffsetObj[v2.stop.id] = Number(toOffsetObj[v2.stop.id] || 0) + v2.passenger;
            const key = `${v1.stop.id}-${v2.stop.id}`;
            linkObj[key] = {
              source: v1.stop.name,
              target: v2.stop.name,
              sourceId: v1.stop.id,
              targetId: v2.stop.id,
              value: v2.passenger,
            };
          }
        }
      }
      return {
        linkObj: linkObj,
        maxPassenger: Math.max(...[...Object.values(fromOffsetObj), ...Object.values(toOffsetObj)]),
      };
    },
    // 请求数据
    getData() {
      this.loading = true;
      routeFlows(this.form)
        .then((res) => {
          console.log(res);
          const { linkObj: oldLinkObj, maxPassenger: oldMaxPassenger } = this.getListObj(res.data.before);
          const { linkObj: newLinkObj, maxPassenger: newMaxPassenger } = this.getListObj(res.data.after);
          this.list = res.data.stops;
          this.oldLinkObj = oldLinkObj;
          this.newLinkObj = newLinkObj;
          this.maxPassenger = Math.max(oldMaxPassenger, newMaxPassenger);
          this.src = this.getChart();
          console.log(this.oldLinkObj, this.newLinkObj);
          this.loading = false;
        })
        .catch((err) => {
          this.list = [];
          this.oldLinkObj = [];
          this.newLinkObj = [];
          this.maxPassenger = 20;
          this.src = this.getChart();
          this.loading = false;
        });
    },
    getChart() {
      const nodes = this.list;
      const maxValue = this.maxPassenger <= 0 ? 1 : this.maxPassenger;

      const step = 100;
      const margin = step / 4;
      const titleHeight = step * 2;
      const labelHeight = step * 2;
      const width = (nodes.length - 1) * step + margin * 2;
      const height = width + titleHeight * 2 + labelHeight;
      const chart1Bottom = width / 2 + titleHeight;
      const chart2Bottom = chart1Bottom + titleHeight;

      const x = d3.scalePoint(
        nodes.map(({ id }) => id),
        [margin, width - margin]
      );
      const X = new Map(nodes.map(({ id }) => [id, x(id)]));
      const svg = d3.create("svg").attr("width", width).attr("height", height).attr("viewBox", [0, 0, width, height]).attr("style", "width:100%;height:auto;background: #fff");

      const defs = svg.append("defs");
      const linerGradient = defs.append("linearGradient").attr("id", "linearColor").attr("x1", "0%").attr("y1", "0%").attr("x2", "100%").attr("y2", "0%");
      linerGradient.append("stop").attr("offset", "0%").style("stop-color", "#ff0000");
      linerGradient.append("stop").attr("offset", "50%").style("stop-color", "#ffffff");
      linerGradient.append("stop").attr("offset", "100%").style("stop-color", "#00ff00");

      const fromOffsetObj = {};
      const toOffsetObj = {};

      nodes.forEach(({ id }) => {
        fromOffsetObj[id] = 0;
        toOffsetObj[id] = 0;
      });

      const title_box = svg
        .append("g")
        .append("text")
        .attr("font-family", "sans-serif")
        .attr("font-size", step * 0.6)
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", step + margin)
        .text("title");
      const subtitle_box = svg
        .append("text")
        .attr("font-family", "sans-serif")
        .attr("font-size", step * 0.4)
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", step * 1.5 + margin)
        .attr("dy", "1em")
        .text(`Departrue at 12`);

      const path = svg
        .insert("g", "*")
        .attr("fill", "none")
        .attr("stroke-opacity", 1)
        .attr("stroke", "url(#" + linerGradient.attr("id") + ")")
        .selectAll("path")
        .data(Object.values(this.oldLinkObj))
        .join("path")
        .attr("stroke-width", (d) => (d.value / maxValue) * step * 0.5)
        .attr("d", (d) => {
          const width = (d.value / maxValue) * step * 0.5;
          fromOffsetObj[d.sourceId] += width / 2;
          toOffsetObj[d.targetId] += width / 2;
          const x1 = X.get(d.sourceId) + fromOffsetObj[d.sourceId];
          const x2 = X.get(d.targetId) - toOffsetObj[d.targetId];
          const r = Math.abs(x2 - x1) / 2;
          fromOffsetObj[d.sourceId] += width / 2;
          toOffsetObj[d.targetId] += width / 2;
          return `M${x1},${chart1Bottom}A${r},${r} 0,0,${x1 < x2 ? 1 : 0} ${x2},${chart1Bottom}`;
        });

      const label = svg
        .append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", step * 0.25)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(nodes)
        .join("g")
        .attr("transform", (d) => `translate(${X.get(d.id)},${chart1Bottom}) rotate(-90)`)
        .call((g) =>
          g
            .append("circle")
            .attr("r", step / 16)
            .attr("fill", "#000")
        )
        .call((g) =>
          g
            .append("text")
            .attr("text-anchor", "middle")
            .attr("x", -labelHeight / 2)
            .attr("dy", "0.35em")
            .attr("fill", "#000")
            .text((d) => d.name)
        )
        .call((g) =>
          g
            .append("circle")
            .attr("cx", -labelHeight)
            .attr("r", step / 16)
            .attr("fill", "#000")
        );

      const fromOffsetObj2 = {};
      const toOffsetObj2 = {};

      nodes.forEach(({ id }) => {
        fromOffsetObj2[id] = 0;
        toOffsetObj2[id] = 0;
      });

      const path2 = svg
        .insert("g", "*")
        .attr("fill", "none")
        .attr("stroke-opacity", 1)
        .attr("stroke", "url(#" + linerGradient.attr("id") + ")")
        .selectAll("path")
        .data(Object.values(this.newLinkObj))
        .join("path")
        .attr("stroke-width", (d) => (d.value / maxValue) * step * 0.5)
        .attr("d", (d) => {
          const width = (d.value / maxValue) * step * 0.5;
          fromOffsetObj2[d.sourceId] += width / 2;
          toOffsetObj2[d.targetId] += width / 2;
          const x1 = X.get(d.sourceId) + fromOffsetObj2[d.sourceId];
          const x2 = X.get(d.targetId) - toOffsetObj2[d.targetId];
          const r = Math.abs(x2 - x1) / 2;
          fromOffsetObj2[d.sourceId] += width / 2;
          toOffsetObj2[d.targetId] += width / 2;
          return `M${x1},${chart2Bottom}A${r},${r} 0,0,${x1 < x2 ? 0 : 1} ${x2},${chart2Bottom}`;
        });

      const title_box2 = svg
        .append("g")
        .append("text")
        .attr("font-family", "sans-serif")
        .attr("font-size", step * 0.6)
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height - step * 0.5 - margin)
        .text("title");
      const subtitle_box2 = svg
        .append("text")
        .attr("font-family", "sans-serif")
        .attr("font-size", step * 0.4)
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height - step * 2 - margin)
        .attr("dy", "1em")
        .text(`Departrue at 12`);

      return svg.node().outerHTML;
    },
    // 获取值
    getValue(from, to) {
      if (from == to) return "";
      const oldLine = this.oldLinkObj[`${from}-${to}`] || { value: 0 };
      const newLine = this.newLinkObj[`${from}-${to}`] || { value: 0 };
      return `old:${oldLine.value} -- new:${newLine.value}`;
    },
    showOnMap() {
      this.rootVue.handleShowRouteFlows({
        uuid: this.routeInfo.routeId,
        routeDetail: this.routeInfo,
      });
      this.$parent.$emit("close");
    },
    handleExport() {
      const rowList = [];
      rowList.push(`"${this.routeInfo.routeId}"`);
      rowList.push(`"${this.routeInfo.lineName}"`);
      rowList.push(`"${this.form.startTime} - ${this.form.endTime}"`);
      rowList.push(`"base: ${this.form.name1}","contrast: ${this.form.name2}"`);
      rowList.push(``);
      rowList.push(`"","to","${this.list.map((v) => v.name).join(`","`)}"`);
      rowList.push(`"from","","${this.list.map((v) => v.id).join(`","`)}"`);
      for (let i = 0, l = this.list.length; i < l; i++) {
        const to = this.list[i];
        const colList = [to.name, to.id];
        for (let j = 0; j < l; j++) {
          const from = this.list[j];
          colList.push(this.getValue(from.id, to.id));
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
.chart-container {
  width: 100%;
  min-height: 300px;
  height: calc(100vh - 420px);
  overflow: auto;
}
</style>
