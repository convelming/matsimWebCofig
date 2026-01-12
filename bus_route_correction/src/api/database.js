import request from "@/utils/request";

// 获取全部基准
// GET /pt/main/getAllBase
// 接口ID：154393801
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-154393801
export function getAllBase(params) {
  return request({
    url: `/pt/main/getAllBase`,
    method: "get",
    params: params,
    isNoBatasource: true,
    // noMsg: true,
  });
}


// 获取全部基准
// GET /pt/main/getAllBase
// 接口ID：154393801
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-154393801
export function getDefaultBase(params) {
  return request({
    url: `/pt/main/getDefault`,
    method: "get",
    params: params,
    isNoBatasource: true,
    // noMsg: true,
  });
}

// 获取全部方案
// GET /pt/main/getAllScheme
// 接口ID：154393801
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-154393801
export function getAllScheme(params) {
  return request({
    url: `/pt/main/getAllScheme`,
    method: "get",
    params: params,
    isNoBatasource: true,
    // noMsg: true,
  });
}

// 新建方案
// GET /pt/main/addScheme
// 接口ID：154997586
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-154997586
export function addScheme(params) {
  return request({
    url: `/pt/main/addScheme`,
    method: "get",
    params: params,
    isNoBatasource: true,
  });
}

// 加载方案
// GET /pt/main/loadScheme
// 接口ID：154397429
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-154397429
export function loadScheme(params) {
  return request({
    url: `/pt/main/loadScheme`,
    method: "get",
    params: params,
    isNoBatasource: true,
  });
}

// 新建/保存到方案
// GET /pt/main/saveScheme
// 接口ID：154601366
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-154601366
export function saveScheme(params) {
  return request({
    url: `/pt/main/saveScheme`,
    method: "get",
    params: params,
  });
}

// 运行方案
// POST /pt/main/runMatsim
// 接口ID：154825974
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-154825974
export function runMatsim(data) {
  return request({
    url: `/pt/main/runMatsim`,
    method: "post",
    data: data,
    isNoBatasource: true,
    // noMsg: true,
  });
}

// 上传config.xml
// POST /pt/main/uploadConfig
// 接口ID：155707195
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-155707195
export function uploadConfig(file, key) {
  const data = new FormData();
  data.append("config", file);
  data.append("key", key);
  return request({
    url: `/pt/main/uploadConfig`,
    method: "post",
    data: data,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

// 获取config.xml
// GET /pt/main/getConfig
// 接口ID：161354156
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-161354156
export function getConfig(params) {
  return request({
    url: `/pt/main/getConfig`,
    method: "get",
    params: params,
  });
}

// 删除方案
// DELETE /pt/main/delScheme
// 接口ID：179335509
// 接口地址：https://www.apifox.cn/link/project/3709845/apis/api-179335509
export function delScheme(params) {
  return request({
    url: `/pt/main/delScheme`,
    method: "delete",
    params: params,
  });
}


// 复制方案 
// GET /pt/main/copyScheme
// 接口ID：181422784
// 接口地址：https://www.apifox.cn/link/project/3709845/apis/api-181422784
export function copyScheme(params) {
  return request({
    url: `/pt/main/copyScheme`,
    method: "get",
    params: params,
  });
}


// 修改scale
// GET /pt/main/updateScale
// 接口ID：233423062
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-233423062
export function updateScale(params) {
  return request({
    url: `/pt/main/updateScale`,
    method: "get",
    params: params,
  });
}