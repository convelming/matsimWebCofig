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

// 出行者就业情况
// GET /pt/crt/travelersEmployed
// 接口ID：175343745
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-175343745
export function travelersEmployed(params) {
  return request({
    url: `/pt/crt/travelersEmployed`,
    method: "get",
    params: params,
  });
}

// 出行者机动车保有量
// GET /pt/crt/travelersCarLicense
// 接口ID：175677881
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-175677881
export function travelersCarLicense(params) {
  return request({
    url: `/pt/crt/travelersCarLicense`,
    method: "get",
    params: params,
  });
}

// 出行者车辆可使用情况
// GET /pt/crt/travelersCarAvailability
// 接口ID：175678342
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-175678342
export function travelersCarAvailability(params) {
  return request({
    url: `/pt/crt/travelersCarAvailability`,
    method: "get",
    params: params,
  });
}

// 出行者年龄
// GET /pt/crt/travelersAge
// 接口ID：175678382
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-175678382
export function travelersAge(params) {
  return request({
    url: `/pt/crt/travelersAge`,
    method: "get",
    params: params,
  });
}

// 出行者性别
// GET /pt/crt/travelersSex
// 接口ID：175678439
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-175678439
export function travelersSex(params) {
  return request({
    url: `/pt/crt/travelersSex`,
    method: "get",
    params: params,
  });
}

// 决策树1（出行效用决策树）
// POST /pt/crt/travelUtilityTree
// 接口ID：176247048
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-176247048
export function travelUtilityTree(data) {
  return request({
    url: `/pt/crt/travelUtilityTree`,
    method: "post",
    data: data,
  });
}

// 决策树2（出行变化决策树）
// POST /pt/crt/travelVariationTree
// 接口ID：176711392
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-176711392
export function travelVariationTree(data) {
  return request({
    url: `/pt/crt/travelVariationTree`,
    method: "post",
    data: data,
  });
}