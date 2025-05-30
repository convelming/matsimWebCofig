const { $l } = require("../../utils/index");
const node_echarts = require("../../utils/node-echarts");
// const d3 = require("d3");
var d3 = null;
import("d3").then((res) => (d3 = res));
const { JSDOM } = require("jsdom");

const { loadImage, Canvas } = require("canvas");

module.exports.PassengersEnteringLeaving = function ({ data, routeInfo }) {
  function changeName(name) {
    return name
      .split("")
      .map((v, i) => ((i + 1) % 5 == 0 ? v + "\n" : v))
      .join("");
  }

  const option = {
    title: {
      text: routeInfo.routeId,
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    legend: {
      top: 50,
    },
    grid: [
      {
        top: 120,
        bottom: "42.5%",
        left: 50,
        right: 10,
        backgroundColor: "#ccc",
      },
      {
        top: "62.5%",
        bottom: 70,
        left: 50,
        right: 10,
        backgroundColor: "#ccc",
      },
    ],
    axisPointer: {
      link: { xAxisIndex: [0, 1] },
    },
    xAxis: [
      {
        gridIndex: 0,
        type: "category",
        show: false,
        data: data.map((v) => v.stopName),
        axisLabel: {
          show: false,
        },
      },
      {
        type: "category",
        gridIndex: 1,
        data: data.map((v) => v.stopName),
        axisLabel: {
          interval: 0,
          rotate: 90,
          formatter: changeName,
        },
      },
    ],
    yAxis: [
      {
        gridIndex: 0,
        type: "value",
        splitNumber: 2,
      },
      {
        gridIndex: 1,
        type: "value",
        splitNumber: 1,
      },
    ],
    series: [
      {
        name: $l("#entering-base"),
        type: "bar",
        stack: "base",
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: data.map((v) => v.entering[0]),
      },
      {
        name: $l("#entering-contrast"),
        type: "bar",
        stack: "contrast",
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: data.map((v) => v.entering[1]),
      },
      {
        name: $l("#entering-actual"),
        type: "bar",
        stack: "actual",
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: data.map((v) => v.entering[2]),
      },
      {
        name: $l("#leaving-base"),
        type: "bar",
        stack: "base",
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: data.map((v) => v.leaving[0] * -1),
      },
      {
        name: $l("#leaving-contrast"),
        type: "bar",
        stack: "contrast",
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: data.map((v) => v.leaving[1] * -1),
      },
      {
        name: $l("#leaving-actual"),
        type: "bar",
        stack: "actual",
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: data.map((v) => v.leaving[2] * -1),
      },
      {
        name: $l("#passengers-base"),
        type: "bar",
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: data.map((v) => v.passengers[0]),
      },
      {
        name: $l("#passengers-contrast"),
        type: "bar",
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: data.map((v) => v.passengers[1]),
      },
      {
        name: $l("#passengers-actual"),
        type: "bar",
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: data.map((v) => v.passengers[2]),
      },
    ],
  };
  const buffer = node_echarts({
    width: 1200,
    height: 1200,
    option: option,
  });
  return buffer;
};

module.exports.RouteFlows = async function (data) {
  function getListObj(list) {
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
  }

  const { linkObj: oldLinkObj, maxPassenger: oldMaxPassenger } = getListObj(data.before);
  const { linkObj: newLinkObj, maxPassenger: newMaxPassenger } = getListObj(data.after);

  const maxPassenger = Math.max(oldMaxPassenger, newMaxPassenger);

  const nodes = data.stops;
  const maxValue = maxPassenger <= 0 ? 1 : maxPassenger;

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
  const dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);
  const svg = d3.select(dom.window.document.body).append("svg").attr("xmlns", "http://www.w3.org/2000/svg").attr("width", width).attr("height", height).attr("viewBox", [0, 0, width, height]).attr("style", "width:100%;height:auto;background: #fff");

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
    .text(data.routeInfo.routeId);
  const subtitle_box = svg
    .append("text")
    .attr("font-family", "sans-serif")
    .attr("font-size", step * 0.4)
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", step * 1.5 + margin)
    .attr("dy", "1em")
    .text("base");

  const path = svg
    .insert("g", "*")
    .attr("fill", "none")
    .attr("stroke-opacity", 1)
    .attr("stroke", "url(#" + linerGradient.attr("id") + ")")
    .selectAll("path")
    .data(Object.values(oldLinkObj))
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
    .data(Object.values(newLinkObj))
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
    .text(data.routeInfo.routeId);
  const subtitle_box2 = svg
    .append("text")
    .attr("font-family", "sans-serif")
    .attr("font-size", step * 0.4)
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height - step * 2 - margin)
    .attr("dy", "1em")
    .text("contrast");
  const canvas = new Canvas(width, height);
  const context = canvas.getContext("2d");
  const image = await loadImage(Buffer.from(svg.node().outerHTML));
  context.drawImage(image, 0, 0);
  return canvas.toBuffer("image/png");
  return svg.node().outerHTML;
  const option = {};
  const buffer = node_echarts({
    option: option,
  });
  return buffer;
};

module.exports.RouteTimeDiagram = function (data) {
  function changeData(data, type) {
    try {
      const stopMap = new Map(data[0].data.map((v, i) => [v.stopId, { stopId: v.stopId, stopName: v.stopName, index: i + 1, type: type, arrScheduled: [], arrSimulated: [], depScheduled: [], depSimulated: [] }]));
      const rowList = data[0].data.map((v) => ({
        stopId: v.stopId,
        stopName: v.stopName,
      }));
      const colList = data.map((v) => ({
        departureId: v.departureId,
        time: v.time,
      }));
      const dataMap = {};
      for (const v1 of data) {
        for (const v2 of v1.data) {
          const key = `${v2.stopId}-${v1.departureId}`;
          dataMap[key] = {
            arrScheduled: v2.arrScheduled,
            arrSimulated: v2.arrSimulated,
            depScheduled: v2.depScheduled,
            depSimulated: v2.depSimulated,
          };

          const stop = stopMap.get(v2.stopId);
          stop.arrScheduled.push(v2.arrScheduled);
          stop.arrSimulated.push(v2.arrSimulated);
          stop.depScheduled.push(v2.depScheduled);
          stop.depSimulated.push(v2.depSimulated);
        }
      }
      return {
        tableList: Array.from(stopMap.values()),
        rowList: rowList,
        colList: colList,
        dataMap: dataMap,
      };
    } catch (error) {
      console.log(error);
      return {
        tableList: [],
        rowList: [],
        colList: [],
        dataMap: {},
      };
    }
  }
  function getValue(dataMap, stopId, departureId, name) {
    try {
      return dataMap[`${stopId}-${departureId}`][name];
    } catch (error) {
      return "";
    }
  }
  function formatHour(num) {
    if (Number(num) !== Number(num)) return String(num);
    const hour = Math.floor(num / 3600);
    const minute = Math.floor((num % 3600) / 60);
    const second = Math.floor(num % 60);
    return `${[hour, minute, second].map(formatNumber).join(":")}`;
  }

  const oldLine = changeData(data.before, "base");
  const newLine = changeData(data.after, "contrast");

  let max = 0;
  let min = 24 * 60 * 60;
  const oldSeries = oldLine.colList
    .map((v1, i1) => {
      let arrScheduled = [];
      let arrSimulated = [];
      let depScheduled = [];
      let depSimulated = [];
      oldLine.rowList.forEach((v2) => {
        arrScheduled.push(getValue(oldLine.dataMap, v2.stopId, v1.departureId, "arrScheduled"));
        arrSimulated.push(getValue(oldLine.dataMap, v2.stopId, v1.departureId, "arrSimulated"));
        depScheduled.push(getValue(oldLine.dataMap, v2.stopId, v1.departureId, "depScheduled"));
        depSimulated.push(getValue(oldLine.dataMap, v2.stopId, v1.departureId, "depSimulated"));
      });

      max = Math.max(max, ...arrScheduled, ...arrSimulated, ...depScheduled, ...depSimulated);
      min = Math.min(min, ...arrScheduled, ...arrSimulated, ...depScheduled, ...depSimulated);

      return [
        {
          name: "base-arrScheduled" + i1,
          type: "line",
          yAxisIndex: 0,
          showSymbol: false,
          data: arrScheduled,
        },
        {
          name: "base-arrSimulated" + i1,
          type: "line",
          yAxisIndex: 0,
          showSymbol: false,
          data: arrSimulated,
        },
        {
          name: "base-depScheduled" + i1,
          type: "line",
          yAxisIndex: 0,
          showSymbol: false,
          data: depScheduled,
        },
        {
          name: "base-depSimulated" + i1,
          type: "line",
          yAxisIndex: 0,
          showSymbol: false,
          data: depSimulated,
        },
      ];
    })
    .flat();
  const newSeries = newLine.colList
    .map((v1, i1) => {
      let arrScheduled = [];
      let arrSimulated = [];
      let depScheduled = [];
      let depSimulated = [];
      newLine.rowList.forEach((v2) => {
        arrScheduled.push(getValue(newLine.dataMap, v2.stopId, v1.departureId, "arrScheduled"));
        arrSimulated.push(getValue(newLine.dataMap, v2.stopId, v1.departureId, "arrSimulated"));
        depScheduled.push(getValue(newLine.dataMap, v2.stopId, v1.departureId, "depScheduled"));
        depSimulated.push(getValue(newLine.dataMap, v2.stopId, v1.departureId, "depSimulated"));
      });

      max = Math.max(max, ...arrScheduled, ...arrSimulated, ...depScheduled, ...depSimulated);
      min = Math.min(min, ...arrScheduled, ...arrSimulated, ...depScheduled, ...depSimulated);

      return [
        {
          name: "contrast-arrScheduled" + i1,
          type: "line",
          yAxisIndex: 1,
          showSymbol: false,
          data: arrScheduled,
        },
        {
          name: "contrast-arrSimulated" + i1,
          type: "line",
          yAxisIndex: 1,
          showSymbol: false,
          data: arrSimulated,
        },
        {
          name: "contrast-depScheduled" + i1,
          type: "line",
          yAxisIndex: 1,
          showSymbol: false,
          data: depScheduled,
        },
        {
          name: "contrast-depSimulated" + i1,
          type: "line",
          yAxisIndex: 1,
          showSymbol: false,
          data: depSimulated,
        },
      ];
    })
    .flat();
  const maxYAxisNum = Math.max(oldLine.rowList.length, newLine.rowList.length);
  const option = {
    title: {
      text: `Route-Time Diagram, route=${data.routeInfo.routeId}`,
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      valueFormatter: formatHour,
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: 20,
      containLabel: true,
    },
    // toolbox: {
    //   feature: {
    //     saveAsImage: {},
    //   },
    // },
    // dataZoom: [
    //   {
    //     start: 0,
    //     end: 100,
    //     yAxisIndex: [0, 1],
    //   },
    //   // {
    //   //   start: 0,
    //   //   end: 100,
    //   //   xAxisIndex: 0,
    //   // },
    // ],
    xAxis: {
      type: "value",
      min: (Math.floor(min / 3600) - 1) * 3600,
      max: (Math.floor(max / 3600) + 1) * 3600,
      interval: 3600,
      axisLabel: {
        formatter: function (value, index) {
          return Math.floor(value / 3600) + "h";
        },
      },
    },
    yAxis: [
      {
        type: "category",
        data: new Array(maxYAxisNum).fill(0).map((v, i) => (oldLine.rowList[i] ? oldLine.rowList[i].stopName : "")),
        axisLable: {
          interval: 0,
        },
      },
      {
        type: "category",
        data: new Array(maxYAxisNum).fill(0).map((v, i) => (newLine.rowList[i] ? newLine.rowList[i].stopName : "")),
        axisLable: {
          interval: 0,
        },
      },
    ],
    series: [...oldSeries, ...newSeries],
  };

  const buffer = node_echarts({
    width: 1200,
    height: 1200,
    option: option,
  });
  return buffer;
};
