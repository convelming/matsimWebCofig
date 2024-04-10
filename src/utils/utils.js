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

export function selectFile() {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = resolve;
    input.click();
  });
}
