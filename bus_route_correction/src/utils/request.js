import axios from "axios";
import { Notification, MessageBox, Message, Loading } from "element-ui";
import { getDataSource } from "@/store/modules/datasource";
import { getToken } from "@/utils/auth";
import { tansParams, blobValidate } from "@/utils/utils";
import cache from "./cache";
// import { saveAs } from "file-saver";

import language from "@/language/index";
import { guid } from "@/utils/utils";

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
  timeout: 1000 * 60 * 100,
});

// request拦截器
service.interceptors.request.use(
  (config) => {
    let headers = config.headers || {};

    // 设置国际化
    if (!config.headers["Content-language"]) {
      headers["Content-Language"] = encodeURIComponent(language.page_language);
    }

    if (!config.isNoBatasource) {
      headers["Datasource"] = encodeURIComponent(getDataSource());
    }

    headers["Uuid"] = guid();

    // 是否需要设置 token
    const isToken = headers.isToken === false;
    if (getToken() && !isToken) {
      config.headers["Authorization"] = "Bearer " + getToken(); // 让每个请求携带自定义token 请根据实际情况自行修改
    }

    config.headers = headers;
    // get请求映射params参数
    if (config.method === "get" && config.params) {
      let url = config.url + "?" + tansParams(config.params);
      url = url.slice(0, -1);
      config.params = {};
      config.url = url;
    }

    // 是否需要防止数据重复提交
    const isRepeatSubmit = headers.repeatSubmit === false;
    if (!isRepeatSubmit && (config.method === "post" || config.method === "put")) {
      const requestObj = {
        url: config.url,
        data: typeof config.data === "object" ? JSON.stringify(config.data) : config.data,
        time: new Date().getTime(),
      };
      const requestSize = Object.keys(JSON.stringify(requestObj)).length; // 请求数据大小
      const limitSize = 5 * 1024 * 1024; // 限制存放数据5M
      if (requestSize >= limitSize) {
        console.warn(`[${config.url}]: ` + "请求数据大小超出允许的5M限制，无法进行防重复提交验证。");
        return config;
      }
      const sessionObj = cache.session.getJSON("sessionObj");
      if (sessionObj === undefined || sessionObj === null || sessionObj === "") {
        cache.session.setJSON("sessionObj", requestObj);
      } else {
        const s_url = sessionObj.url; // 请求地址
        const s_data = sessionObj.data; // 请求数据
        const s_time = sessionObj.time; // 请求时间
        const interval = 1000; // 间隔时间(ms)，小于此时间视为重复提交
        if (s_data === requestObj.data && requestObj.time - s_time < interval && s_url === requestObj.url) {
          const message = "数据正在处理，请勿重复提交";
          console.warn(`[${s_url}]: ` + message);
          return Promise.reject(new Error(message));
        } else {
          cache.session.setJSON("sessionObj", requestObj);
        }
      }
    }
    return config;
  },
  (error) => {
    Promise.reject(error);
  },
);

// 响应拦截器
service.interceptors.response.use(
  (res) => {
    // 未设置状态码则默认成功状态
    const code = res.data.code || 200;
    // 获取错误信息
    const msg = language.internationalize("网络异常" + code) || res.data.msg || language.internationalize("网络异常default");
    // 二进制数据则直接返回
    if (res.request.responseType === "blob" || res.request.responseType === "arraybuffer") {
      return res;
    }
    if (code === 401) {
      if (!isRelogin.show) {
        isRelogin.show = true;
        MessageBox.confirm("登录状态已过期，您可以继续留在该页面，或者重新登录", "系统提示", { confirmButtonText: "重新登录", cancelButtonText: "取消", type: "warning" })
          .then(() => {
            isRelogin.show = false;
            store.dispatch("LogOut").then(() => {
              location.href = `${process.env.VUE_APP_PUBLIC_PATH}user.html#/?redirect=${encodeURIComponent(location.href)}`;
            });
          })
          .catch(() => {
            isRelogin.show = false;
          });
      }
      return Promise.reject({ message: "无效的会话，或者会话已过期，请重新登录。", config: res.config });
    } else if (code === 500) {
      if (!res.config.noMsg) Message.error(msg);
      return Promise.reject({ message: msg, config: res.config });
    } else if (code !== 200) {
      if (!res.config.noMsg) Message.error(msg);
      return Promise.reject({ message: msg, config: res.config });
    } else {
      return res.data;
    }
  },
  (error) => {
    console.log("err" + error);
    let { message } = error;
    if (message == "Network Error") {
      message = language.internationalize("后端接口连接异常");
    } else if (message.includes("timeout")) {
      message = language.internationalize("系统接口请求超时");
    } else if (message.includes("Request failed with status code")) {
      message = language.internationalize("请求失败，状态码") + message.substr(message.length - 3);
    }
    if (!error.config.noMsg) Message.error(message);
    return Promise.reject(error);
  },
);

export default service;
