import request from "@/utils/request";

// 路段geomjson查询
// POST /pt/link/getGeomjson
// 接口ID：130911461
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-130911461
export function getGeomjson(data) {
  return request({
    url: `/pt/link/getGeomjson`,
    method: "post",
    data: data,
    noMsg: true,
  });
}

// 查询站点信息
// POST /pt/stopFacilities/getStopFacilities
// 接口ID：131367907
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-131367907
export function getStopFacilities(data) {
  return request({
    url: `/pt/stopFacilities/getStopFacilities`,
    method: "post",
    data: data,
    noMsg: true,
  });
}

// 根据id列表查询link详细信息
// POST /pt/link/getCoordByIds
// 接口ID：131988330
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-131988330
export function getCoordByIds(data) {
  return request({
    url: `/pt/link/getCoordByIds`,
    method: "post",
    data: data,
  });
}

// 计算最短路线
// POST /pt/transitLine/computeRoute
// 接口ID：132008661
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-132008661
export function computeRoute(data) {
  return request({
    url: `/pt/transitLine/computeRoute`,
    method: "post",
    data: data,
  });
}

// 保存线路
// POST /pt/transitLine/save
// 接口ID：132031952
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-132031952
export function saveByLine(data) {
  return request({
    url: `/pt/transitLine/save`,
    method: "post",
    data: data,
  });
}

// 计算路线是否连贯
// POST /pt/transitLine/calcRouteAccessible
// 接口ID：132148176
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-132148176
export function calcRouteAccessible(data) {
  return request({
    url: `/pt/transitLine/calcRouteAccessible`,
    method: "post",
    data: data,
  });
}

// 获取路段下一段路
// GET /pt/transitLine/nextLink
// 接口ID：132014631
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-132014631
export function nextLink(params) {
  return request({
    url: `/pt/transitLine/nextLink`,
    method: "get",
    params: params,
  });
}

// 模糊查询线路
// GET /pt/transitLine/getByLineName
// 接口ID：131981870
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-131981870
export function getByLineName(params) {
  return request({
    url: `/pt/transitLine/getByLineName`,
    method: "get",
    params: params,
  });
}

// 查询路线详情
// GET /pt/transitLine/getByLineId
// 接口ID：131981894
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-131981894
export function getByLineId(params) {
  return request({
    url: `/pt/transitLine/getByLineId`,
    method: "get",
    params: params,
    noMsg: true,
  });
}

// 获取way的link
// GET /pt/link/getLinkByOrigid
export function getMatsimLink(origid) {
  return request({
    url: `/pt/link/getLinkByOrigid`,
    params: {
      origid,
    },
    method: "get",
  });
}

// 查询重叠站点
// POST /pt/stopFacilities/getOverlappingStopFacilities
// 接口ID：142223892
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-142223892
export function getOverlappingStopFacilities(data) {
  return request({
    url: `/pt/stopFacilities/getOverlappingStopFacilities`,
    data: data,
    method: "post",
  });
}

// 查询站点路线
// POST /pt/transitLine/getRouteByFacilities
// 接口ID：142241270
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-142241270
export function getRouteByFacilities(data) {
  return request({
    url: `/pt/transitLine/getRouteByFacilities`,
    data: data,
    method: "post",
  });
}

// transit stop load
// POST /pt/stopFacilitiesStat/transitStopLoad
// 接口ID：143958395
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-143958395
export function transitStopLoad(data) {
  return request({
    url: `/pt/stopFacilitiesStat/transitStopLoad`,
    data: data,
    method: "post",
  });
}

// passenger entering / leaving
// POST /pt/stopFacilitiesStat/passengerEnteringAndLeaving
// 接口ID：142438046
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-142438046
export function passengerEnteringAndLeaving(data) {
  return request({
    url: `/pt/stopFacilitiesStat/passengerEnteringAndLeaving`,
    data: data,
    method: "post",
  });
}

// vehicle load
// POST /pt/stopFacilitiesStat/vehicleLoad
// 接口ID：142519355
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-142519355
export function vehicleLoad(data) {
  return request({
    url: `/pt/stopFacilitiesStat/vehicleLoad`,
    data: data,
    method: "post",
  });
}

// aggregated vehicle load
// POST /pt/stopFacilitiesStat/aggregatedVehicleLoad
// 接口ID：142564802
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-142564802
export function aggregatedVehicleLoad(data) {
  return request({
    url: `/pt/stopFacilitiesStat/aggregatedVehicleLoad`,
    data: data,
    method: "post",
  });
}

// route grid
// POST /pt/stopFacilitiesStat/routeGrid
// 接口ID：142820697
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-142820697
export function routeGrid(data) {
  return request({
    url: `/pt/stopFacilitiesStat/routeGrid`,
    data: data,
    method: "post",
  });
}

// route flows
// POST /pt/stopFacilitiesStat/routeFlows
// 接口ID：143098533
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-143098533
export function routeFlows(data) {
  return request({
    url: `/pt/stopFacilitiesStat/routeFlows`,
    data: data,
    method: "post",
  });
}

// route-time diagram
// POST /pt/stopFacilitiesStat/routeTimeDiagram
// 接口ID：143342778
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-143342778
export function routeTimeDiagram(data) {
  return request({
    url: `/pt/stopFacilitiesStat/routeTimeDiagram`,
    data: data,
    method: "post",
  });
}

// passengers at stop
// POST /pt/stopFacilitiesStat/passengersAtStop
// 接口ID：144010641
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-144010641
export function passengersAtStop(data) {
  return request({
    url: `/pt/stopFacilitiesStat/passengersAtStop`,
    data: data,
    method: "post",
  });
}

// transfers
// POST /pt/stopFacilitiesStat/transfers
// 接口ID：145504149
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-145504149
export function transfers(data) {
  return request({
    url: `/pt/stopFacilitiesStat/transfers`,
    data: data,
    method: "post",
  });
}

// 查询公交路线发车时间
// POST /pt/transitLine/getBusPath
// 接口ID：145639379
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-145639379
export function getBusPath(data) {
  return request({
    url: `/pt/transitLine/getBusPath`,
    data: data,
    method: "post",
  });
}

// 查询地铁路线发车时间
// POST /pt/transitLine/getSubwayPath
export function getSubwayPath(data) {
  return request({
    url: `/pt/transitLine/getSubwayPath`,
    data: data,
    method: "post",
  });
}

// 查询私家车路线时间
// POST /pt/transitLine/getCarPath
export function getCarPath(data) {
  return request({
    url: `/pt/transitLine/getCarPath`,
    data: data,
    method: "post",
  });
}

export function getTwoWayByRouteId(params) {
  return request({
    url: `/pt/transitLine/getTwoWayByRouteId`,
    params: params,
    method: "get",
  });
}

// 查询车辆班次详细信息
// GET /pt/stopFacilitiesStat/queryVehicle
// 接口ID：151184188
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-151184188
export function queryVehicle(params) {
  return request({
    url: `/pt/stopFacilitiesStat/queryVehicle`,
    params: params,
    method: "get",
  });
}

// 查询私家车详情
// GET /pt/transitLine/getCarInfo
// 接口ID：157773389
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-157773389
export function getCarInfo(params) {
  return request({
    url: `/pt/transitLine/getCarInfo`,
    params: params,
    method: "get",
  });
}

// 删除线路
// DELETE /pt/transitLine/delete
// 接口ID：154661151
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-154661151
export function deleteTransitLine(params) {
  return request({
    url: `/pt/transitLine/delete`,
    params: params,
    method: "delete",
  });
}

// 获取瓦片内全部建筑
// GET /pt/af/getTileFacilities
// 接口ID：159073663
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-159073663
export function getTileFacilities(params) {
  return request({
    url: `/pt/af/getTileFacilities`,
    params: params,
    method: "get",
    noMsg: true,
  });
}

// 获取建筑详情
// GET /pt/af/getFacilitiesById
// 接口ID：159281087
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-159281087
export function getFacilitiesById(params) {
  return request({
    url: `/pt/af/getFacilitiesById`,
    params: params,
    method: "get",
  });
}

// 按照瓦片地图返回路网
// GET /pt/network/getTileNetwork
// 接口ID：165438635
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-165438635
export function getTileNetwork(params) {
  return request({
    url: `/pt/network/getTileNetwork`,
    params: params,
    method: "get",
  });
}

// 根据id查询link详情
// GET /pt/link/getLinkById
// 接口ID：166838450
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-166838450
export function getLinkById(params) {
  return request({
    url: `/pt/link/getLinkById`,
    params: params,
    method: "get",
  });
}

// 根据id查询node详情
// GET /pt/link/getNodeById
// 接口ID：166870242
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-166870242
export function getNodeById(params) {
  return request({
    url: `/pt/link/getNodeById`,
    params: params,
    method: "get",
  });
}

// Intersection Flows
// POST /pt/network/intersectionFlows
// 接口ID：158726359
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-158726359
export function intersectionFlows(data) {
  return request({
    url: `/pt/network/intersectionFlows`,
    data: data,
    method: "post",
  });
}

// Link Volumes
// GET /pt/network/getLinkVolumes
// 接口ID：165781499
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-165781499
export function getLinkVolumes(params) {
  return request({
    url: `/pt/network/getLinkVolumes`,
    params: params,
    method: "get",
  });
}

// 查询经过link的出行
// GET /pt/link/getElapseLinkLeg
// 接口ID：160854322
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-160854322
export function getElapseLinkLeg(params) {
  return request({
    url: `/pt/link/getElapseLinkLeg`,
    params: params,
    method: "get",
  });
}

// 查询从建筑离开的轨迹
// GET /pt/af/getStartInFacilities
// 接口ID：161624636
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-161624636
export function getStartInFacilities(params) {
  return request({
    url: `/pt/af/getStartInFacilities`,
    params: params,
    method: "get",
  });
}

// 查询到达建筑的轨迹
// GET /pt/af/getEndInFacilities
// 接口ID：161821641
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-161821641
export function getEndInFacilities(params) {
  return request({
    url: `/pt/af/getEndInFacilities`,
    params: params,
    method: "get",
  });
}