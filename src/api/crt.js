import request from "@/utils/request";

// 出行目的
// GET /pt/crt/travelPurpose
// 接口ID：174921175
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-174921175
export function travelPurpose(params) {
  return request({
    url: `/pt/crt/travelPurpose`,
    method: "get",
    params: params,
  });
}

// 出行时段
// GET /pt/crt/travelTime
// 接口ID：174929686
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-174929686
export function travelTime(params) {
  return request({
    url: `/pt/crt/travelTime`,
    method: "get",
    params: params,
  });
}

// 停留时间
// GET /pt/crt/residenceTime
// 接口ID：174978317
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-174978317
export function residenceTime(params) {
  return request({
    url: `/pt/crt/residenceTime`,
    method: "get",
    params: params,
  });
}

// 出行方式
// GET /pt/crt/travelMode
// 接口ID：174978955
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-174978955
export function travelMode(params) {
  return request({
    url: `/pt/crt/travelMode`,
    method: "get",
    params: params,
  });
}

// 出行属性
// GET /pt/crt/travelAttribute
// 接口ID：175194211
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-175194211
export function travelAttribute(params) {
  return request({
    url: `/pt/crt/travelAttribute`,
    method: "get",
    params: params,
  });
}
