// 升级前版本 "echarts": "^5.5.0",
import * as echarts from "echarts";

if (!window.echartsInstanceList) {
  window.echartsInstanceList = [];
}
if (!window.echartsTheme) {
  window.echartsTheme = "default";
}

const axis3dDack = {
  axisLine: {
    lineStyle: {
      color: "#fff",
    },
  },
  axisLabel: {
    textStyle: {
      color: "#fff",
      borderColor: "#fff",
    },
  },
  axisTick: {
    lineStyle: {
      color: "#fff",
    },
  },
  splitLine: {
    lineStyle: {
      color: "#fff",
    },
  },
  axisPointer: {
    lineStyle: {
      color: "rgba(255, 255, 255, 0.8)",
    },
    label: {
      textStyle: {
        color: "#fff",
        borderColor: "#fff",
      },
    },
  },
};

const axis3d = {
  axisLine: {
    lineStyle: {
      color: "#000",
    },
  },
  axisLabel: {
    textStyle: {
      color: "#000",
      borderColor: "#000",
    },
  },
  axisTick: {
    lineStyle: {
      color: "#000",
    },
  },
  splitLine: {
    lineStyle: {
      color: "#000",
    },
  },
  axisPointer: {
    lineStyle: {
      color: "rgba(0, 0, 0, 0.8)",
    },
    label: {
      textStyle: {
        color: "#000",
        borderColor: "#000",
      },
    },
  },
};

export const init = function (dom, opts) {
  const echart = echarts.init(dom, window.echartsTheme, opts);
  window.echartsInstanceList.push(echart);
  const dispose = echart.dispose;
  echart.dispose = function () {
    window.echartsInstanceList.splice(window.echartsInstanceList.indexOf(this), 1);
    dispose.bind(echart)();
  };
  const setOption = echart.setOption;
  echart.__lastOptions = {};
  echart.setOption = function () {
    const options = arguments[0] || {};
    echart.__lastOptions = options;
    setOption.bind(echart)(...arguments);
    if(options.xAxis3D) echart.setTheme(window.echartsTheme);
  };
  const setTheme = echart.setTheme;
  echart.setTheme = function (theme) {
    const options = echart.getOption() || {};
    if (options.xAxis3D) {
      const themeObj = theme === "dark" ? axis3dDack : axis3d;
      setOption.bind(echart)({
        backgroundColor: "transparent",
        xAxis3D: themeObj,
        yAxis3D: themeObj,
        zAxis3D: themeObj,
      });
    } else {
      setTheme.bind(echart)(theme);
      setOption.bind(echart)(echart.__lastOptions);
    }
  };
  return echart;
};

export const setTheme = function (theme = "default") {
  window.echartsTheme = theme;
  window.echartsInstanceList.forEach((echart) => {
    echart.setTheme(window.echartsTheme);
  });
};
