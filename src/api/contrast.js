import request from "@/utils/request";

// 全部修改路线列表
// GET /pt/contrast/changeLines
// 接口ID：171448112
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-171448112
export function changeLines(params) {
  return request({
    url: `/pt/contrast/changeLines`,
    method: "get",
    params: params,
  });
}

// 全部修改前后路线信息
// GET /pt/contrast/allChangeLinesInfo
// 接口ID：171830315
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-171830315
export function allChangeLinesInfo(params) {
  return request({
    url: `/pt/contrast/allChangeLinesInfo`,
    method: "get",
    params: params,
  });
}

// 线路修改前后信息
// GET /pt/contrast/routeChangeInfo
// 接口ID：171643345
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-171643345
export function routeChangeInfo(params) {
  return request({
    url: `/pt/contrast/routeChangeInfo`,
    method: "get",
    params: params,
  });
}

// 站点修改前后信息
// GET /pt/contrast/stopChangeInfo
// 接口ID：171683249
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-171683249
export function stopChangeInfo(params) {
  return request({
    url: `/pt/contrast/stopChangeInfo`,
    method: "get",
    params: params,
  });
}

// 发车时间修改前后信息
// GET /pt/contrast/departureChangeInfo
// 接口ID：171676850
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-171676850
export function departureChangeInfo(params) {
  return request({
    url: `/pt/contrast/departureChangeInfo`,
    method: "get",
    params: params,
  });
}

// 修改前后xml信息
// GET /pt/contrast/changeInfoXml
// 接口ID：171684057
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-171684057
export function changeInfoXml(params) {
  return request({
    url: `/pt/contrast/changeInfoXml`,
    method: "get",
    params: params,
  });
}

// 受影响路线列表
// GET /pt/contrast/affectedLines
// 接口ID：172155424
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-172155424
export function affectedLines(params) {
  return request({
    url: `/pt/contrast/affectedLines`,
    method: "get",
    params: params,
  });
}

// 全部受影响路线信息
// GET /pt/contrast/allAffectedLinesInfo
// 接口ID：172345206
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-172345206
export function allAffectedLinesInfo(params) {
  return request({
    url: `/pt/contrast/allAffectedLinesInfo`,
    method: "get",
    params: params,
  });
}

// 全部受影响站点信息
// GET /pt/contrast/allAffectedStopInfo
// 接口ID：172545485
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-172545485
export function allAffectedStopInfo(params) {
  return request({
    url: `/pt/contrast/allAffectedStopInfo`,
    method: "get",
    params: params,
  });
}

// 线路修改前后客流量
// GET /pt/contrast/passengerInfo
// 接口ID：172581216
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-172581216
export function passengerInfo(params) {
  return request({
    url: `/pt/contrast/passengerInfo`,
    method: "get",
    params: params,
  });
}

// 线路修改前后routeFlows
// GET /pt/contrast/routeFlows
// 接口ID：172783270
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-172783270
export function routeFlows(params) {
  return request({
    url: `/pt/contrast/routeFlows`,
    method: "get",
    params: params,
  });
}

// 线路修改前后routeTimeDiagram
// GET /pt/contrast/routeTimeDiagram
// 接口ID：173145948
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-173145948
export function routeTimeDiagram(params) {
  return request({
    url: `/pt/contrast/routeTimeDiagram`,
    method: "get",
    params: params,
  });
}

// 线路修改前后基础属性
// GET /pt/contrast/routeAttributes
// 接口ID：173509299
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-173509299
export function routeAttributes(params) {
  return request({
    url: `/pt/contrast/routeAttributes`,
    method: "get",
    params: params,
  });
}

// 报告生成
// POST /pt/crt/genReports
// 接口ID：178633127
// 接口地址：https://www.apifox.cn/link/project/3709845/apis/api-178633127
export function genReports(data) {
  return request({
    url: `/pt/crt/genReports`,
    method: "post",
    data: data,
  });
}