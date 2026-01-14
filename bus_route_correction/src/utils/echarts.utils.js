// 升级前版本 "echarts": "^5.5.0",
import * as echarts from "echarts";

let echartsInstanceList = [];
if (!window.echartsInstanceList) {
  echartsInstanceList = window.echartsInstanceList = [];
}
let theme = "default";

export const init = function (dom, opts) {
  const echart = echarts.init(dom, theme, opts);
  window.echartsInstanceList.push(echart);
  const dispose = echart.dispose;
  echart.dispose = function () {
    window.echartsInstanceList.splice(window.echartsInstanceList.indexOf(this), 1);
    dispose.bind(echart)();
  };
  return echart;
};

export const setTheme = function (_theme = "default") {
  theme = _theme;
  window.echartsInstanceList.forEach((echart) => {
    echart.setTheme(theme);
  });
};
