const { $l } = require("../../utils/index");
const node_echarts = require("../../utils/node-echarts");

module.exports.TravelersAge = function (data) {
  const option = {
    title: {
      text: $l("出行者年龄"),
      left: "center",
    },
    legend: {
      left: "center",
      bottom: 0,
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
        data: data.map((v) => v.name),
      },
    ],
    yAxis: [
      {
        type: "value",
      },
    ],
    series: [
      {
        data: data.map((v) => v.value),
        type: "bar",
      },
    ],
  };
  const buffer = node_echarts({
    option: option,
  });
  return buffer;
};

module.exports.TravelersCarAvailability = function (data) {
  const option = {
    title: {
      text: $l("出行者车辆可使用情况"),
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
        name: $l("出行者车辆可使用情况"),
        type: "pie",
        radius: "50%",
        label: {
          formatter: "{b}\n{c}({d}%)",
        },
        data: [
          { value: data.always, name: $l("总是可以使用") },
          { value: data.never, name: $l("没有或者不可使用") },
          { value: data.sometimes, name: $l("偶尔可以使用") },
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
  const buffer = node_echarts({
    option: option,
  });
  return buffer;
};

module.exports.TravelersCarLicense = function (data) {
  const option = {
    title: {
      text: $l("出行者机动车保有量"),
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
        name: $l("出行者机动车保有量"),
        type: "pie",
        radius: "50%",
        label: {
          formatter: "{b}: {c}\n({d}%)",
        },
        data: [
          { value: data.yes, name: $l("有机动车") },
          { value: data.no, name: $l("无机动车") },
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
  const buffer = node_echarts({
    option: option,
  });
  return buffer;
};

module.exports.TravelersEmployed = function (data) {
  const option = {
    title: {
      text: $l("出行者就业情况"),
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
        name: $l("出行者就业情况"),
        type: "pie",
        radius: "50%",
        label: {
          formatter: "{b}\n{c}\n{d}%",
        },
        data: [
          { value: data.yes, name: $l("在职") },
          { value: data.no, name: $l("离职") },
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
  const buffer = node_echarts({
    option: option,
  });
  return buffer;
};

module.exports.TravelersSex = function (data) {
  const option = {
    title: {
      text: $l("出行者性别"),
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
        name: $l("出行者性别"),
        type: "pie",
        radius: "50%",
        label: {
          formatter: "{b}: {c}\n({d}%)",
        },
        data: [
          { value: data.m, name: $l("男性") },
          { value: data.f, name: $l("女性") },
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
  const buffer = node_echarts({
    option: option,
  });
  return buffer;
};
