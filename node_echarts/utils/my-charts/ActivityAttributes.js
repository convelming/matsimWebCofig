const { $l } = require("../../utils/index");
const node_echarts = require("../../utils/node-echarts");

module.exports.ResidenceTime = function (data) {
  const { after, before } = data;
  const keys = Array.from(new Set([Object.keys(after), Object.keys(before)].flat()));
  const afterList = keys.map((v) => after[v] || 0);
  const beforeList = keys.map((v) => before[v] || 0);

  const option = {
    title: {
      text: $l("停留时间"),
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    legend: {
      left: "center",
      top: 40,
    },
    grid: {
      top: 80,
      left: 20,
      right: 20,
      bottom: 20,
      containLabel: true,
    },
    xAxis: [
      {
        type: "category",
        data: keys,
        axisLabel: { interval: 0, rotate: 30 },
      },
    ],
    yAxis: [
      {
        type: "value",
      },
    ],
    series: [
      {
        name: $l("基础方案"),
        type: "bar",
        barGap: 0,
        emphasis: {
          focus: "series",
        },
        data: afterList,
      },
      {
        name: $l("对比方案"),
        type: "bar",
        emphasis: {
          focus: "series",
        },
        data: beforeList,
      },
    ],
  };
  const buffer = node_echarts({
    option: option,
  });
  return buffer;
};

module.exports.TravelMode = function (data) {
  const { after, before } = data;
  const keys = Array.from(new Set([Object.keys(after), Object.keys(before)].flat()));
  const afterList = keys.map((v) => after[v] || 0);
  const beforeList = keys.map((v) => before[v] || 0);

  const option = {
    title: {
      text: $l("出行方式"),
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    legend: {
      left: "center",
      top: 40,
    },
    grid: {
      top: 100,
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
        name: $l("基础方案"),
        type: "bar",
        barGap: 0,
        emphasis: {
          focus: "series",
        },
        data: afterList,
      },
      {
        name: $l("对比方案"),
        type: "bar",
        emphasis: {
          focus: "series",
        },
        data: beforeList,
      },
    ],
  };
  const buffer = node_echarts({
    option: option,
  });
  return buffer;
};

module.exports.TravelPurpose = function (data) {
  const option = {
    title: {
      text: $l("出行目的"),
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
        name: $l("出行目的"),
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
  const buffer = node_echarts({
    option: option,
  });
  return buffer;
};

module.exports.TravelTime = function (data) {
  const { after, before } = data;
  const keys = Array.from(new Set([Object.keys(after), Object.keys(before)].flat()));
  const afterList = keys.map((v) => after[v] || 0);
  const beforeList = keys.map((v) => before[v] || 0);
  const option = {
    title: {
      text: $l("出行时段"),
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    legend: {
      left: "center",
      top: 40,
    },
    grid: {
      top: 80,
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
        name: $l("基础方案"),
        type: "bar",
        barGap: 0,
        emphasis: {
          focus: "series",
        },
        data: afterList,
      },
      {
        name: $l("对比方案"),
        type: "bar",
        emphasis: {
          focus: "series",
        },
        data: beforeList,
      },
    ],
  };
  const buffer = node_echarts({
    option: option,
  });
  return buffer;
};
