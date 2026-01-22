/**
 * 参数处理
 * @param {*} params  参数
 */
export function tansParams(params) {
  let result = "";
  for (const propName of Object.keys(params)) {
    const value = params[propName];
    var part = encodeURIComponent(propName) + "=";
    if (value !== null && typeof value !== "undefined") {
      if (typeof value === "object") {
        for (const key of Object.keys(value)) {
          if (value[key] !== null && typeof value[key] !== "undefined") {
            let params = propName + "[" + key + "]";
            var subPart = encodeURIComponent(params) + "=";
            result += subPart + encodeURIComponent(value[key]) + "&";
          }
        }
      } else {
        result += part + encodeURIComponent(value) + "&";
      }
    }
  }
  return result;
}

export const formatTime = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  return `${[year, month, day].map(formatNumber).join("/")} ${[hour, minute, second].map(formatNumber).join(":")}`;
};

export const formatHour = (num) => {
  if (Number(num) !== Number(num)) return String(num);
  const hour = Math.floor(num / 3600);
  const minute = Math.floor((num % 3600) / 60);
  const second = Math.floor(num % 60);
  return `${[hour, minute, second].map(formatNumber).join(":")}`;
};

const formatNumber = (n) => {
  n = n.toString();
  return n[1] ? n : `0${n}`;
};

export function getUrlParams(url) {
  var data = {};
  if (!url) {
    return data;
  }
  var urlArr = url.split("?");
  if (urlArr.length < 2) {
    return data;
  }
  var psArr = urlArr[1].split("#")[0].split("&");
  var kvArr;
  for (var i = 0; i < psArr.length; i++) {
    kvArr = psArr[i].split("=");
    data[kvArr[0]] = kvArr[1];
  }
  return data;
}

export function JsonParse(string, defaultValue = null) {
  try {
    return JSON.parse(string) || defaultValue;
  } catch (error) {
    return defaultValue;
  }
}

export function copyText(textValue = "", success = () => {}, error = () => {}) {
  let textarea = null;
  try {
    // 动态创建 textarea 标签
    textarea = document.createElement("textarea");
    // 将该 textarea 设为 readonly 防止 iOS 下自动唤起键盘，同时将 textarea 移出可视区域
    textarea.readOnly = "readonly";
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    // 将要 copy 的值赋给 textarea 标签的 value 属性
    textarea.value = textValue;
    // 将 textarea 插入到 body 中
    document.body.appendChild(textarea);
    // 选中值并复制
    textarea.select();
    const result = document.execCommand("Copy");
    if (result) success("复制成功！");
  } catch (err) {
    error("复制失败！");
  } finally {
    if (textarea) document.body.removeChild(textarea);
  }
}

export function guid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function pxtorem(px) {
  // 750px = 10rem
  return Number(px / 75).toFixed(6);
}

export function selectFile(accept = "*/*") {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.onchange = () => {
      resolve(input.files[0]);
    };
    input.click();
  });
}

function export_csv(list, name) {
  const newList = list.map((res) => res.join(","));
  const data = newList.join(",\n");
  // “\ufeff” BOM头
  var uri = "data:text/csv;charset=utf-8,\ufeff" + encodeURIComponent(data);
  var downloadLink = document.createElement("a");
  downloadLink.href = uri;
  downloadLink.download = name + ".csv" || "temp.csv";
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

export const COLOR_LIST = [
  // ["#65b581", "#84ba72", "#a3bf62", "#c1c453", "#e0c943", "#ffce34", "#ffb93d", "#fea445", "#fe904e", "#fd7b56", "#fd665f"],
  // ["#008000", "#339900", "#66b300", "#99cc00", "#cce600", "#ffff00", "#ffcc00", "#ff9900", "#ff6600", "#ff3300", "#ff0000"],
  ["#65b581", "#a3bf62", "#ffce34", "#ffb93d", "#ff6600", "#ff0000"],
  // ["#008000", "#66b300", "#cce600", "#ffff00", "#ffcc00", "#ff6600", "#ff0000"],
  ["#313695", "#74add1", "#e0f3f8", "#fdae61", "#f46d43", "#a50026"],
  ["rgb(254, 224, 210)", "rgb(252, 187, 161)", "rgb(252, 146, 114)", "rgb(239, 59, 44)", "rgb(203, 24, 29)", "rgb(153, 0, 13)"],
  ["rgb(251, 234, 215)", "rgb(249, 219, 195)", "rgb(247, 212, 175)", "rgb(245, 183, 133)", "rgb(241, 165, 102)", "rgb(237, 135, 52)"],
  ["rgb(251, 234, 215)", "rgb(248, 230, 196)", "rgb(247, 212, 175)", "rgb(245, 199, 133)", "rgb(241, 185, 102)", "rgb(237, 161, 52)"],
  ["rgb(249, 241, 217)", "rgb(248, 230, 196)", "rgb(245, 225, 177)", "rgb(239, 209, 139)", "rgb(235, 197, 108)", "rgb(227, 179, 60)"],
  ["rgb(249, 245, 217)", "rgb(247, 239, 197)", "rgb(245, 233, 177)", "rgb(239, 223, 139)", "rgb(235, 215, 108)", "rgb(227, 201, 60)"],
  ["rgb(240, 248, 213)", "rgb(235, 244, 190)", "rgb(222, 237, 169)", "rgb(215, 227, 124)", "rgb(205, 221, 92)", "rgb(187, 209, 38)"],
  ["rgb(240, 248, 213)", "rgb(225, 241, 191)", "rgb(222, 237, 169)", "rgb(195, 227, 124)", "rgb(181, 221, 92)", "rgb(155, 209, 38)"],
  ["rgb(223, 247, 213)", "rgb(207, 243, 189)", "rgb(193, 239, 169)", "rgb(161, 233, 124)", "rgb(137, 227, 92)", "rgb(96, 217, 38)"],
  ["rgb(215, 245, 223)", "rgb(193, 241, 207)", "rgb(173, 235, 191)", "rgb(131, 225, 161)", "rgb(100, 219, 137)", "rgb(48, 205, 96)"],
  ["rgb(211, 242, 236)", "rgb(188, 234, 227)", "rgb(171, 229, 211)", "rgb(129, 215, 191)", "rgb(106, 209, 179)", "rgb(42, 189, 147)"],
  ["rgb(211, 242, 236)", "rgb(188, 234, 227)", "rgb(163, 227, 223)", "rgb(116, 213, 207)", "rgb(82, 201, 195)", "rgb(24, 183, 175)"],
  ["rgb(207, 243, 245)", "rgb(186, 233, 242)", "rgb(163, 225, 238)", "rgb(112, 217, 227)", "rgb(86, 211, 221)", "rgb(16, 191, 207)"],
  ["rgb(211, 240, 246)", "rgb(186, 233, 242)", "rgb(163, 225, 238)", "rgb(119, 207, 229)", "rgb(97, 199, 224)", "rgb(28, 181, 215)"],
  ["rgb(211, 240, 246)", "rgb(186, 233, 242)", "rgb(163, 225, 238)", "rgb(119, 207, 229)", "rgb(97, 199, 224)", "rgb(30, 169, 207)"],
  ["rgb(209, 227, 243)", "rgb(185, 211, 237)", "rgb(161, 197, 229)", "rgb(108, 165, 215)", "rgb(78, 145, 207)", "rgb(18, 108, 191)"],
];

export function getICONLIST() {
  return [
    "point2.png",
    "anchor-line.svg",
    "barricade-fill.svg",
    "bike-fill.svg",
    "bike-line.svg",
    "bus-2-fill.svg",
    "bus-fill.svg",
    "bus-wifi-line.svg",
    "car-fill.svg",
    "car-washing-line.svg",
    "charging-pile-2-fill.svg",
    "charging-pile-line.svg",
    "china-railway-fill.svg",
    "compass-2-fill.svg",
    "compass-2-line.svg",
    "compass-3-fill.svg",
    "compass-3-line.svg",
    "compass-discover-fill.svg",
    "compass-line.svg",
    "cup-fill.svg",
    "direction-fill.svg",
    "e-bike-2-fill.svg",
    "e-bike-2-line.svg",
    "earth-fill.svg",
    "flight-land-fill.svg",
    "flight-land-line.svg",
    "flight-takeoff-line.svg",
    "footprint-fill.svg",
    "footprint-line.svg",
    "goblet-line.svg",
    "guide-fill.svg",
    "guide-line.svg",
    "hotel-bed-fill.svg",
    "hotel-bed-line.svg",
    "lifebuoy-fill.svg",
    "lifebuoy-line.svg",
    "luggage-cart-line.svg",
    "luggage-deposit-line.svg",
    "map-2-fill.svg",
    "map-2-line.svg",
    "map-fill.svg",
    "map-line.svg",
    "map-pin-2-line.svg",
    "map-pin-3-line.svg",
    "map-pin-5-fill.svg",
    "map-pin-add-fill.svg",
    "map-pin-range-line.svg",
    "map-pin-time-fill.svg",
    "map-pin-user-fill.svg",
    "map-pin-user-line.svg",
    "motorbike-line.svg",
    "navigation-line.svg",
    "oil-line.svg",
    "parking-box-fill.svg",
    "parking-fill.svg",
    "parking-line.svg",
    "passport-fill.svg",
    "passport-line.svg",
    "pin-distance-fill.svg",
    "plane-fill.svg",
    "plane-line.svg",
    "police-car-fill.svg",
    "pushpin-line.svg",
    "restaurant-2-fill.svg",
    "restaurant-2-line.svg",
    "restaurant-fill.svg",
    "riding-fill.svg",
    "riding-line.svg",
    "road-map-fill.svg",
    "road-map-line.svg",
    "roadster-fill.svg",
    "roadster-line.svg",
    "rocket-2-fill.svg",
    "rocket-2-line.svg",
    "rocket-fill.svg",
    "rocket-line.svg",
    "route-fill.svg",
    "run-fill.svg",
    "sailboat-fill.svg",
    "ship-2-fill.svg",
    "ship-2-line.svg",
    "ship-fill.svg",
    "signal-tower-line.svg",
    "space-ship-fill.svg",
    "space-ship-line.svg",
    "steering-line.svg",
    "subway-fill.svg",
    "subway-line.svg",
    "suitcase-2-line.svg",
    "suitcase-3-fill.svg",
    "suitcase-fill.svg",
    "taxi-fill.svg",
    "taxi-wifi-fill.svg",
    "taxi-wifi-line.svg",
    "traffic-light-line.svg",
    "train-wifi-fill.svg",
    "treasure-map-line.svg",
    "truck-fill.svg",
    "truck-line.svg",
    "walk-fill.svg",
    "walk-line.svg",
    "camera.svg",
  ].map((v) => window.VUE_APP_EXTERNAL_FILE_PATH + "/icon_traffic/" + v);
}

//string转file
export function stringToFile(str, filename) {
  let blob = new Blob([str]);
  return new File([blob], filename);
}
//file转string

export function fileToString(file) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      resolve(e.target.result);
    };
    // readAsDataURL
    fileReader.readAsText(file);
    fileReader.onerror = () => {
      reject(new Error("fileToString error"));
    };
  });
}
