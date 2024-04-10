import request from "@/utils/request";
import util from "@/utils/util"
import * as Message from "@/utils/message"

export function getUserInfo(success = () => {}) {
  let userInfo = util.JsonParse(sessionStorage.getItem("userInfo"))
  if (!userInfo) {
    request({
      url: "/app/user/userinfo/query",
      method: "get",
      success: res => {
        userInfo = res.data;
        sessionStorage.setItem("userInfo", JSON.stringify(userInfo))
        success(userInfo);
      }
    })
  } else {
    success(userInfo)
  }
}

export function login() {
  const fail = res => {
    Message.error('登录失败，请重进进入')
  };
  request({
    url: "/app/user/login",
    data: {
      code: "023m0O100bHp6M1u97200gSvYD3m0O1V",
    },
    success: res2 => {
      config.token = res2.data["token"];
      config.authorization = res2.data["authorization"] ? `Bearer ${res2.data["authorization"]}` : null;
      if (typeof cb == "function") cb(res2);
    },
    fail,
    autoLogin: false,
    isAuthorization: false,
    isToken: false
  })
}