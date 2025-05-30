const { $l } = require("../../utils/index");
const node_echarts = require("../../utils/node-echarts");

module.exports.TravelAttribute = function (data, labels = ["travelTime", "waitingTime", "transfer", "amount", "distance"]) {
  const { after, before, max = {} } = data;
  const keySet = new Set(labels);
  const indicator = [],
    afterList = [],
    beforeList = [];
  if (keySet.has("travelTime")) {
    indicator.push({ name: $l("在途时间"), max: max.travelTime });
    afterList.push(after.travelTime);
    beforeList.push(before.travelTime);
  }
  if (keySet.has("waitingTime")) {
    indicator.push({ name: $l("候车时间"), max: max.waitingTime });
    afterList.push(after.waitingTime);
    beforeList.push(before.waitingTime);
  }
  if (keySet.has("transfer")) {
    indicator.push({ name: $l("换乘次数"), max: max.transfer });
    afterList.push(after.transfer);
    beforeList.push(before.transfer);
  }
  if (keySet.has("amount")) {
    indicator.push({ name: $l("费用"), max: max.amount });
    afterList.push(after.amount);
    beforeList.push(before.amount);
  }
  if (keySet.has("distance")) {
    indicator.push({ name: $l("出行距离"), max: max.distance });
    afterList.push(after.distance);
    beforeList.push(before.distance);
  }
  const option = {
    title: {
      text: $l("出行属性"),
      left: "center",
    },
    legend: {
      left: "center",
      bottom: 0,
    },
    radar: {
      // shape: 'circle',
      indicator: indicator,
    },
    series: [
      {
        name: $l("出行属性"),
        type: "radar",
        data: [
          {
            value: afterList,
            name: $l("基础方案"),
          },
          {
            value: beforeList,
            name: $l("对比方案"),
          },
        ],
      },
    ],
  };
  const buffer = node_echarts({
    option: option,
  });
  return buffer;
};
