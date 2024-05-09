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
