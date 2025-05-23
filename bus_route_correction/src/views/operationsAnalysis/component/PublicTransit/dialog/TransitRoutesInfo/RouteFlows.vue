<template>
  <el-tabs v-model="activeName">
    <el-tab-pane :label="$l('Chart')" name="Chart">
      <div>
        <el-checkbox v-model="showOnMap" size="small">{{ $l("showOnMap") }}</el-checkbox>
      </div>
      <div ref="chart" class="chart-container" v-loading="loading">
        <div class="chart" v-html="src"></div>
      </div>
    </el-tab-pane>
    <el-tab-pane :label="$l('Data')" name="Data">
      <div style="margin-bottom: 10px">
        <el-button type="primary" size="small" @click="handleExport">导出</el-button>
      </div>
      <el-table class="small" :data="tableList" border stripe height="calc(100vh - 400px)" v-loading="loading" :header-cell-style="headerCellStyle" :show-header="false">
        <el-table-column :label="lineInfo.line">
          <el-table-column :label="lineInfo.routeId">
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
                <div v-else :title="`${v.name} - ${row.name}`">
                  {{ getValue(v.id, row.id) }}
                </div>
              </template>
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
    "zh-CN": "图表",
    "en-US": "Chart"
  },
  "Data":{
    "zh-CN": "数据",
    "en-US": "Data"
  },
  "showOnMap":{
    "zh-CN": "在地图上显示",
    "en-US": "Display on map"
  },
}
</language>

<script>
import { RouteFlowsLayer } from "../../layer/RouteFlowsLayer";
import { guid } from "@/utils/utils";
import * as d3 from "d3";
import { routeFlows, getTwoWayByRouteId } from "@/api/index";
import { formatHour } from "@/utils/utils";
import * as Bean from "@/utils/Bean";
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
  inject: ["rootVue"],
  computed: {
    tableList() {
      return [{ type: "name" }, { type: "id" }, ...this.list];
    },
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
            if (this.showOnMap) {
              this._Map.addLayer(this._RouteFlowsLayer);
            } else {
              this._Map.removeLayer(this._RouteFlowsLayer);
            }
          }, 1000);
        });
      },
      immediate: true,
    },
    form: {
      handler(val) {
        this.getData();
      },
      deep: true,
    },

    showOnMap: {
      handler(val) {
        if (val) {
          this._Map.addLayer(this._RouteFlowsLayer);
        } else {
          this._Map.removeLayer(this._RouteFlowsLayer);
        }
      },
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

      showOnMap: false,
    };
  },
  created() {
    this._RouteFlowsLayer = new RouteFlowsLayer({ zIndex: 10, color: "#ffd700", maxTube: 100 });
    this.getData();
  },
  beforeDestroy() {
    this._Map.removeLayer(this._RouteFlowsLayer);
    this._RouteFlowsLayer.dispose();
  },
  methods: {
    handleChangeMapCenterAndZoom() {
      try {
        const list = this.routeDetail.stops.map((v) => v.coord.toList());
        this._Map.setFitZoomAndCenterByPoints(list);
      } catch (error) {
        console.log(error);
      }
    },
    // table 表头样式
    headerCellStyle({ row, column, rowIndex, columnIndex }) {
      return rowIndex == 3 ? "display:none" : "";
    },
    // 请求数据
    getData() {
      let _requestId = guid();
      this._requestId = _requestId;
      this.loading = true;
      routeFlows(this.form)
        .then((res) => {
          if (this._requestId != _requestId) return;
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
                fromOffsetObj[v1.stop.name] = Number(fromOffsetObj[v1.stop.name] || 0) + v2.passenger;
                toOffsetObj[v2.stop.name] = Number(toOffsetObj[v2.stop.name] || 0) + v2.passenger;
                const key = `${v1.stop.id}-${v2.stop.id}`;
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
          this.maxPassenger = Math.max(...[...Object.values(fromOffsetObj), ...Object.values(toOffsetObj)]);
          this.src = this.getChart();

          this.stopMap = new Map(
            res.data.map((v, i) => {
              const stop = JSON.parse(JSON.stringify(v.stop));
              stop.index = i;
              return [stop.name, stop];
            })
          );
          this._RouteFlowsLayer.setData(this.stopMap, this.linkObj, this.maxPassenger);
          console.log(this._RouteFlowsLayer);

          this.loading = false;
        })
        .catch((err) => {
          console.log(err);

          if (this._requestId != _requestId) return;
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
      const svg = d3.create("svg").attr("width", width).attr("height", height).attr("viewBox", [0, 0, width, height]).attr("style", "width:100%;height:auto;background: #fff");

      const defs = svg.append("defs");
      const linerGradient = defs.append("linearGradient").attr("id", "linearColor").attr("x1", "0%").attr("y1", "0%").attr("x2", "100%").attr("y2", "0%");
      linerGradient.append("stop").attr("offset", "0%").style("stop-color", "#ff0000");
      linerGradient.append("stop").attr("offset", "50%").style("stop-color", "#ffffff");
      linerGradient.append("stop").attr("offset", "100%").style("stop-color", "#00ff00");

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
          return `M${x1},${height - marginBottom}A${r},${r} 0,0,${x1 < x2 ? 1 : 0} ${x2},${height - marginBottom}`;
        });
      const lable_box = svg.append("g");

      lable_box
        .attr("transform", (d) => `translate(${width / 30},${(width / 30) * 5})`)
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", (width / 30) * 2)
        .attr("height", (width / 30) * 1)
        .attr("fill", "#ff0000");
      lable_box
        .append("text")
        .attr("font-size", width / 50)
        .attr("fill", "#fff")
        .attr("text-anchor", "middle")
        .attr("x", width / 30)
        .attr("y", (width / 30) * 0.7)
        .text("上车");

      const lable_box2 = svg.append("g");
      lable_box2
        .attr("transform", (d) => `translate(${(width / 30) * 3.5},${(width / 30) * 5})`)
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", (width / 30) * 2)
        .attr("height", (width / 30) * 1)
        .attr("fill", "#00ff00");
      lable_box2
        .append("text")
        .attr("font-size", width / 50)
        .attr("fill", "#fff")
        .attr("text-anchor", "middle")
        .attr("x", width / 30)
        .attr("y", (width / 30) * 0.7)
        .text("下车");

      const title_box = svg.append("g");
      title_box
        .append("text")
        .attr("font-size", width / 30)
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", (width / 30) * 2)
        .text(this.form.routeId);
      if (this.form.single) {
        const times = this.form.departureId.split("_");
        const subtitle = `Departrue at ${times[times.length - 1]}`;
        title_box
          .append("text")
          .attr("font-family", "sans-serif")
          .attr("font-size", width / 40)
          .attr("text-anchor", "middle")
          .attr("x", width / 2)
          .attr("y", (width / 30) * 3)
          .attr("dy", "1em")
          .text(subtitle);
      } else {
        const subtitle = `${this.routeOptions.length} departrue between ${formatHour(this.form.startSecond)} and ${formatHour(this.form.endSecond)}`;
        title_box
          .append("text")
          .attr("font-family", "sans-serif")
          .attr("font-size", width / 40)
          .attr("text-anchor", "middle")
          .attr("x", width / 2)
          .attr("y", (width / 30) * 3)
          .attr("dy", "1em")
          .text(subtitle);
      }

      // Add a text label and a dot for each node.
      const label = svg
        .append("g")

        .attr("font-size", step * 0.25)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(nodes)
        .join("g")
        .attr("transform", (d) => `translate(${X.get(d.name)},${height - marginBottom}) rotate(-90)`)
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
    handleExport() {
      const rowList = [];
      rowList.push(`"${this.lineInfo.line}"`);
      rowList.push(`"","from","${this.list.map((v) => v.name).join(`","`)}"`);
      rowList.push(`"to","","${this.list.map((v) => v.id).join(`","`)}"`);
      for (const v1 of this.list) {
        const colList = [v1.name, v1.id, ...this.list.map((v2) => this.getValue(v2.id, v1.id))];
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
