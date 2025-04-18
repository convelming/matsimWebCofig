import axios from "axios";
import { Message, MessageBox } from "element-ui";
import { tansParams } from "./index";

// 是否显示重新登录
export let isRelogin = {
  show: false,
};

axios.defaults.headers["Content-Type"] = "application/json;charset=utf-8";
// 创建axios实例
const service = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  baseURL: process.env.VUE_APP_BASE_API,
  // 超时
  timeout: 1000 * 60 * 60,
});

// request拦截器
service.interceptors.request.use(
  (config) => {
    let headers = config.headers || {};

    // 是否需要防止数据重复提交
    // const isRepeatSubmit = headers.repeatSubmit === false;

    // 是否需要设置 token
    const isToken = headers.isToken === false;
    if (localStorage.getItem("token") && !isToken) {
      headers["token"] = localStorage.getItem("token"); // 让每个请求携带自定义token 请根据实际情况自行修改
    }
    if (localStorage.getItem("Authorization") && !isToken) {
      headers["Authorization"] =
        "Bearer " + localStorage.getItem("Authorization"); // 让每个请求携带自定义token 请根据实际情况自行修改
    }

    // 设置国际化
    headers["Content-Language"] = "zh_CN";

    config.headers = headers;
    // get请求映射params参数
    if (config.method === "get" && config.params) {
      let url = config.url + "?" + tansParams(config.params);
      url = url.slice(0, -1);
      config.params = {};
      config.url = url;
    }
    // if (
    //   !isRepeatSubmit &&
    //   (config.method === "post" || config.method === "put")
    // ) {
    //   const requestObj = {
    //     url: config.url,
    //     data:
    //       typeof config.data === "object"
    //         ? JSON.stringify(config.data)
    //         : config.data,
    //     time: new Date().getTime(),
    //   };
    //   const sessionObj = cache.session.getJSON("sessionObj");
    //   if (
    //     sessionObj === undefined ||
    //     sessionObj === null ||
    //     sessionObj === ""
    //   ) {
    //     cache.session.setJSON("sessionObj", requestObj);
    //   } else {
    //     const s_url = sessionObj.url; // 请求地址
    //     const s_data = sessionObj.data; // 请求数据
    //     const s_time = sessionObj.time; // 请求时间
    //     const interval = 1000; // 间隔时间(ms)，小于此时间视为重复提交
    //     if (
    //       s_data === requestObj.data &&
    //       requestObj.time - s_time < interval &&
    //       s_url === requestObj.url
    //     ) {
    //       const message = "数据正在处理，请勿重复提交";
    //       console.warn(`[${s_url}]: ` + message);
    //       return Promise.reject(new Error(message));
    //     } else {
    //       cache.session.setJSON("sessionObj", requestObj);
    //     }
    //   }
    // }
    return config;
  },
  (error) => {
    console.log(error);
    Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (res) => {
    const codeList = {
      401: "认证失败，无法访问系统资源",
      403: "当前操作没有权限",
      404: "系统未知错误，请反馈给管理员",
      default: "系統未知錯誤，請迴響給管理員",
    };
    // 未设置状态码则默认成功状态
    const code = res.data.code || 200;
    // 获取错误信息
    const msg = codeList[code] || res.data.msg || codeList["default"];
    // 二进制数据则直接返回
    if (
      res.request.responseType === "blob" ||
      res.request.responseType === "arraybuffer"
    ) {
      return res;
    }
    if (code === 402) {
      if (!isRelogin.show) {
        isRelogin.show = true;
        MessageBox.alert("登录状态已过期，请重新登录", "系统提示", {
          confirmButtonText: "确定",
          callback: (action) => {
            isRelogin.show = false;
            window.location.href =
              process.env.VUE_APP_BASE_API + `/h5/auth/index`;
          },
        });
      }
      return Promise.reject("无效的会话，或者会话已过期，请重新登录");
    } else if (code === 500) {
      Message.error(msg);
      return Promise.reject(new Error(msg));
    } else if (code !== 200) {
      Message.error(msg);
      return Promise.reject("error");
    } else {
      return res.data;
    }
  },
  (error) => {
    console.log("err" + error);
    let { message } = error;
    if (message == "canceled") {
      // 主动取消请求
      return Promise.reject(error);
    } else if (message == "Network Error") {
      message = "后端接口连接异常";
    } else if (message.includes("timeout")) {
      message = "系统接口请求超时";
    } else if (message.includes("Request failed with status code")) {
      message = "请求失败，状态码" + message.substr(message.length - 3);
    }
    Message.error(message);
    return Promise.reject(error);
  }
);

export default service;
