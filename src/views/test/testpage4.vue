<template>
  <div class="ComponentName">
    <div class="chart" v-html="src"></div>
    <div class="chart" v-html="src2"></div>
  </div>
</template>

<script>
import * as d3 from "d3";
export default {
  name: "ComponentName",
  props: {},
  components: {},
  computed: {},
  watch: {},
  data() {
    return {
      src: "",
      src2: "",
    };
  },
  created() {},
  mounted() {
    import("./d3ChartData.json").then((res) => {
      console.log(res.default.data);
      // this.src2 = this.getChart2(res.default.data);
    });
    import("./d3ChartData2.json").then((res) => {
      console.log(res.data);
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
      this.maxPassenger = Math.max(...[...Object.values(fromOffsetObj), ...Object.values(toOffsetObj)]);
      console.log(this.list, this.linkObj, this.maxPassenger);
      this.src = this.getChart2();
    });
  },
  methods: {
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
      const height = (nodes.length - 1) * step + marginTop + marginBottom;

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

      const title_box = svg
        .append("g")
        .append("text")
        .attr("font-family", "sans-serif")
        .attr("font-size", step * 0.6)
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", step)
        .text("title");
      const subtitle = `Departrue at 12`;
      title_box
        .append("text")
        .attr("font-family", "sans-serif")
        .attr("font-size", step * 0.4)
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", step * 1.5)
        .attr("dy", "1em")
        .text(subtitle);

      // Add a text label and a dot for each node.
      const label = svg
        .append("g")
        .attr("font-family", "sans-serif")
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
    getChart2(data) {
      const nodes = this.list;
      const links = Object.values(this.linkObj);
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
        nodes.map(({ name }) => name),
        [margin, width - margin]
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
        .attr("transform", (d) => `translate(${X.get(d.name)},${chart1Bottom}) rotate(-90)`)
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

      nodes.forEach(({ name }) => {
        fromOffsetObj2[name] = 0;
        toOffsetObj2[name] = 0;
      });

      const path2 = svg
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
          fromOffsetObj2[d.source] += width / 2;
          toOffsetObj2[d.target] += width / 2;
          const x1 = X.get(d.source) + fromOffsetObj2[d.source];
          const x2 = X.get(d.target) - toOffsetObj2[d.target];
          const r = Math.abs(x2 - x1) / 2;
          fromOffsetObj2[d.source] += width / 2;
          toOffsetObj2[d.target] += width / 2;
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
  },
};
</script>

<style lang="scss" scoped>
.ComponentName {
  overflow: auto;
  height: 100vh;
}
</style>
