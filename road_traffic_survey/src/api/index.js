import request from "@/utils/request";

// 查询路段geomjson
// POST /osm/way/getGeomjson
// 接口ID：122090584
// 接口地址：https://app.apifox.com/link/project/3532778/apis/api-122090584
export function getGeomjson(data) {
  return request({
    url: `/osm/way/getGeomjson`,
    method: "post",
    data: data,
  });
}

// 获取way的link
// GET /matsim/link/getMatsimLink/{origid}
// 接口ID：122407216
// 接口地址：https://app.apifox.com/link/project/3532778/apis/api-122407216
export function getMatsimLink(origid) {
  return request({
    url: `/matsim/link/getMatsimLink/${origid}`,
    method: "get",
  });
}

// 根据id查询路段流量
// GET /link/stats/{id}
// 接口ID：123655197
// 接口地址：https://app.apifox.com/link/project/3532778/apis/api-123655197
export function statsDetail(id) {
  return request({
    url: `/link/stats/${id}`,
    method: "get",
  });
}

// 新增路段流量
// POST /link/stats/insert
// 接口ID：122557105
// 接口地址：https://app.apifox.com/link/project/3532778/apis/api-122557105
export function statsInsert(data) {
  return request({
    url: `/link/stats/insert`,
    method: "POST",
    data: data,
  });
}

// 修改路段流量
// POST /link/stats/update
// 接口ID：122591792
// 接口地址：https://app.apifox.com/link/project/3532778/apis/api-122591792
export function statsUpdate(data) {
  return request({
    url: `/link/stats/update`,
    method: "POST",
    data: data,
  });
}

// 查询区域内路段流量
// POST /link/stats/queryByArea
// 接口ID：122596583
// 接口地址：https://app.apifox.com/link/project/3532778/apis/api-122596583
export function statsQueryByArea(data) {
  return request({
    url: `/link/stats/queryByArea`,
    method: "POST",
    data: data,
  });
}

// 查询全部路段流量
// GET /link/stats/queryAllMaker
// 接口ID：122951283
// 接口地址：https://app.apifox.com/link/project/3532778/apis/api-122951283
export function queryAllMaker(params) {
  return request({
    url: `/link/stats/queryAllMaker`,
    method: "get",
    params: params,
  });
}

// 根据linkId查询路段流量
// POST /link/stats/queryByLinkId/{linkId}
// 接口ID：122599440
// 接口地址：https://app.apifox.com/link/project/3532778/apis/api-122599440
export function statsQueryByLinkId(linkId, data) {
  return request({
    url: `/link/stats/queryByLinkId/${linkId}`,
    method: "post",
    data: data,
  });
}

// 删除路段流量
// DELETE /link/stats/delete/{id}
// 接口ID：122600160
// 接口地址：https://app.apifox.com/link/project/3532778/apis/api-122600160
export function statsDelete(linkId) {
  return request({
    url: `/link/stats/delete/${linkId}`,
    method: "delete",
  });
}

// excel导出
// POST /link/stats/export
// 接口ID：123029603
// 接口地址：https://app.apifox.com/link/project/3532778/apis/api-123029603
export function statsExport(data) {
  return request({
    url: `/link/stats/export`,
    method: "post",
    responseType: "blob",
    data: data,
  });
}

// 根据id查询link信息
// GET /matsim/link/{id}
// 接口ID：123621313
// 接口地址：https://app.apifox.com/link/project/3532778/apis/api-123621313
export function matsimLinkDetail(id) {
  return request({
    url: `/matsim/link/${id}`,
    method: "get",
  });
}

// 修改link信息
// POST /matsim/link/update
// 接口ID：130258744
// 接口地址：https://app.apifox.com/link/project/3532778/apis/api-130258744
export function matsimLinkUpdate(data) {
  return request({
    url: `/matsim/link/update`,
    method: "post",
    data: data,
  });
}

// 修改way中所有link信息
// POST /matsim/link/updateInWay
// 接口ID：130266048
// 接口地址：https://app.apifox.com/link/project/3532778/apis/api-130266048
export function matsimLinkUpdateInWay(data) {
  return request({
    url: `/matsim/link/updateInWay`,
    method: "post",
    data: data,
  });
}

// 获取全部道路类型
// GET /matsim/link/getAllHighwayType
// 接口ID：130283394
// 接口地址：https://app.apifox.com/link/project/3532778/apis/api-130283394
export function getAllLinkType() {
  return request({
    url: `/matsim/link/getAllHighwayType`,
    method: "get",
  });
}

// 根据id获取反向link
// GET /matsim/link/getReverseLink/{id}
// 接口ID：130197946
// 接口地址：https://app.apifox.com/link/project/3532778/apis/api-130197946
export function getReverseLink(id) {
  return request({
    url: `/matsim/link/getReverseLink/${id}`,
    method: "get",
  });
}

// 上传文件
// POST /file/upload
// 接口ID：133845621
// 接口地址：https://app.apifox.com/link/project/3532778/apis/api-133845621
export function fileUpload(file) {
  let data = new FormData();
  data.append("file", file);
  return request({
    url: `/file/upload`,
    method: "post",
    headers: {
      "Content-Type": "multipart/form-data",
    },
    data: data,
  });
}

// 根据名称查询路径
// GET /osm/way/getWayByName
// 接口ID：134887939
// 接口地址：https://app.apifox.com/link/project/3532778/apis/api-134887939
export function getWayByName(params) {
  return request({
    url: `/osm/way/getWayByName`,
    method: "get",
    params: params,
  });
}

// 根据LinkId查询Link
// GET /matsim/link/getLinkId
// 接口ID：134887939
// 接口地址：https://app.apifox.com/link/project/3532778/apis/api-134887939
export function getLinkById(params) {
  return request({
    url: `/matsim/link/getLinkId`,
    method: "get",
    params: params,
  });
}

export function queryAvgStats(data) {
  return request({
    url: `/link/stats/queryAvgStats`,
    method: "post",
    data: data,
  });
}

// 新增十字路
// POST /crossroads/insert
// 接口ID：200536254
// 接口地址：https://app.apifox.com/link/project/3532778/apis/api-200536254
export function crossroadsInsert(data) {
  return request({
    url: `/crossroads/insert`,
    method: "post",
    data: data,
  });
}

// 生成并获取视频封面信息
// GET /crossroads/frame/{id}
// 接口ID：201368753
// 接口地址：https://app.apifox.com/link/project/3532778/apis/api-201368753
export function getCrossroadsFrame(id) {
  return request({
    url: `/crossroads/frame/${id}`,
    method: "get",
  });
}

// 保存绘制线
// POST /crossroads/saveline
// 接口ID：201369343
// 接口地址：https://app.apifox.com/link/project/3532778/apis/api-201369343
export function crossroadsSaveLine(data) {
  return request({
    url: `/crossroads/saveline`,
    method: "post",
    data: data,
  });
}

// 十字路列表
// POST /crossroads/list
// 接口ID：211224266
// 接口地址：https://app.apifox.com/link/project/3532778/apis/api-211224266
export function crossroadsList(data) {
  return request({
    url: `/crossroads/list`,
    method: "post",
    data: data,
  });
}

// 删除十字路
// DELETE /crossroads/delete/{crossroadIds}
// 接口ID：213658507
// 接口地址：https://app.apifox.com/link/project/3532778/apis/api-213658507
export function crossroadsDelete(crossroadIds) {
  return request({
    url: `/crossroads/delete/${crossroadIds}`,
    method: "delete",
  });
}

// 十字路流量表
// GET /crossroads/corssStatsTable/{cossroadsId}
// 接口ID：208505619
// 接口地址：https://app.apifox.com/link/project/3532778/apis/api-208505619
export function crossroadsCorssStatsTable(cossroadsId) {
  return request({
    url: `/crossroads/corssStatsTable/${cossroadsId}`,
    method: "get",
  });
}

// 删除十字路流量（删除行）
// DELETE /crossroads/deleteStats/{crossroadStatsId}
// 接口ID：208633858
// 接口地址：https://app.apifox.com/link/project/3532778/apis/api-208633858
export function crossroadsDeleteStats(crossroadStatsId) {
  return request({
    url: `/crossroads/deleteStats/${crossroadStatsId}`,
    method: "delete",
  });
}

// 修改十字路流量（修改行）
// POST /crossroads/updateStats
// 接口ID：208634678
// 接口地址：https://app.apifox.com/link/project/3532778/apis/api-208634678
export function crossroadsUpdateStats(data) {
  return request({
    url: `/crossroads/updateStats`,
    method: "post",
    data: data,
  });
}

// 新增十字路流量（新增行）
// POST /crossroads/insertStats
// 接口ID：208703838
// 接口地址：https://app.apifox.com/link/project/3532778/apis/api-208703838
export function crossroadsInsertStats(data) {
  return request({
    url: `/crossroads/insertStats`,
    method: "post",
    data: data,
  });
}

// 获取全部十字路inoutlink
// GET /crossroads/inoutlink/{cossroadsId}
// 接口ID：208697651
// 接口地址：https://app.apifox.com/link/project/3532778/apis/api-208697651
export function crossroadsInoutlink(cossroadsId) {
  return request({
    url: `/crossroads/inoutlink/${cossroadsId}`,
    method: "get",
  });
}

// 运行视频识别
// GET /crossroads/runVehicleCounts/{cossroadsId}
// 接口ID：211369264
// 接口地址：https://app.apifox.com/link/project/3532778/apis/api-211369264
export function crossroadsRunVehicleCounts(cossroadsId) {
  return request({
    url: `/crossroads/runVehicleCounts/${cossroadsId}`,
    method: "get",
  });
}

// 下载分析视频
// GET /crossroads/analyzeVideo/{cossroadsId}
// 接口ID：211437143
// 接口地址：https://app.apifox.com/link/project/3532778/apis/api-211437143
export function crossroadsAnalyzeVideo(cossroadsId) {
  // return request({
  //   url: `/crossroads/analyzeVideo/${cossroadsId}`,
  //   method: "get",
  // });
  return window.open(`/crossroads/analyzeVideo/${cossroadsId}`, "_blank");
}

// 下载运行轨迹图
// GET /crossroads/trackImage/{cossroadsId}
// 接口ID：212329364
// 接口地址：https://app.apifox.com/link/project/3532778/apis/api-212329364
export function crossroadsTrackImage(cossroadsId) {
  // return request({
  //   url: `/crossroads/trackImage/${cossroadsId}`,
  //   method: "get",
  // });
  return window.open(`/crossroads/trackImage/${cossroadsId}`, "_blank");
}

// 导出十字路流量表
// GET /crossroads/exportCorssStatsTable/{cossroadsId}
// 接口ID：212596033
// 接口地址：https://app.apifox.com/link/project/3532778/apis/api-212596033
export function crossroadsExportCorssStatsTable(cossroadsId) {
  // return request({
  //   url: `/crossroads/exportCorssStatsTable/${cossroadsId}`,
  //   method: "get",
  // });
  return window.open(`/crossroads/exportCorssStatsTable/${cossroadsId}`, "_blank");
}

// 十字路详情信息
// GET /crossroads/detail/{cossroadsId}
// 接口ID：213591843
// 接口地址：https://app.apifox.com/link/project/3532778/apis/api-213591843
export function crossroadsDetail(cossroadsId) {
  return request({
    url: `/crossroads/detail/${cossroadsId}`,
    method: "get",
  });
}

// 中心点列表
// POST /intersection/list
// 接口ID：217356716
// 接口地址：https://app.apifox.com/link/project/3532778/apis/api-217356716
export function intersectionList(data) {
  return request({
    url: `/intersection/list`,
    method: "post",
    data: data,
  });
}

// 中心点详情
// GET /intersection/detail/{id}
// 接口ID：217361539
// 接口地址：https://app.apifox.com/link/project/3532778/apis/api-217361539
export function intersectionDetail(id) {
  return request({
    url: `/intersection/detail/${id}`,
    method: "get",
  });
}

// 新增中心点
// POST /intersection/insert
// 接口ID：217362058
// 接口地址：https://app.apifox.com/link/project/3532778/apis/api-217362058
export function intersectionInsert(data) {
  return request({
    url: `/intersection/insert`,
    method: "post",
    data: data,
  });
}

// 删除中心点
// DELETE /intersection/delete/{id}
// 接口ID：217365127
// 接口地址：https://app.apifox.com/link/project/3532778/apis/api-217365127
export function intersectionDelete(id) {
  return request({
    url: `/intersection/delete/${id}`,
    method: "delete",
  });
}

// 修改中心点
// POST /intersection/update
// 接口ID：217365711
// 接口地址：https://app.apifox.com/link/project/3532778/apis/api-217365711
export function intersectionUpdate(data) {
  return request({
    url: `/intersection/update`,
    method: "post",
    data: data,
  });
}

export function crossroadsUpdate(data) {
  return request({
    url: `/crossroads/update`,
    method: "post",
    data: data,
  });
}

// 查询全部maker
// POST /mappicture/allMaker
// 接口ID：247199023
// 接口地址：https://app.apifox.com/link/project/3532778/apis/api-247199023
export function mappictureAllMaker(data) {
  return request({
    url: `/mappicture/allMaker`,
    method: "post",
    data: data,
  });
}


// 删除
// DELETE /mappicture/delete/{ids}
// 接口ID：247201714
// 接口地址：https://app.apifox.com/link/project/3532778/apis/api-247201714
export function mappictureDelete(ids) {
  return request({
    url: `/mappicture/delete/${ids}`,
    method: "delete",
  });
}

// 图片树状列表
// POST /mappicture/treeList
// 接口ID：247659413
// 接口地址：https://app.apifox.com/link/project/3532778/apis/api-247659413
export function mappictureTreeList(data) {
  return request({
    url: `/mappicture/treeList`,
    method: "post",
    data: data,
  });
}


// 根据地址删除
// POST /mappicture/deleteByPath
// 接口ID：247659593
// 接口地址：https://app.apifox.com/link/project/3532778/apis/api-247659593
export function mappictureDeleteByPath(data) {
  return request({
    url: `/mappicture/deleteByPath`,
    method: "post",
    data: data,
  });
}


