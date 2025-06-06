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

// 保存到新方案
// POST /pt/transitLine/saveNewScheme
// 接口ID：189536968
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-189536968
export function saveNewScheme(data) {
  return request({
    url: `/pt/transitLine/saveNewScheme`,
    method: "post",
    data: data,
  });
}

export function lineIsRun() {
  return request({
    url: `/pt/transitLine/isRun`,
    method: "get",
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

// 查询公交路线发车时间
// POST /pt/transitLine/getBusPathArray
export function getBusPathArray() {
  return request({
    url: `/pt/transitLine/getBusPathArray`,
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
// 查询地铁路线发车时间
// POST /pt/transitLine/getSubwayPathArray
export function getSubwayPathArray(data) {
  return request({
    url: `/pt/transitLine/getSubwayPathArray`,
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

// 查询私家车路线
// POST /pt/transitLine/getCarPathArray
// 接口ID：187556184
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-187556184
export function getCarPathArray(number) {
  return request({
    url: `/pt/transitLine/getCarPathArray?number=${number}`,
    method: "post",
  });
}

// 私家车瓦片数据
// GET /pt/tiles/car/{base}/{scheme}/{zoom}/{row}/{col}
// 接口ID：193393526
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-193393526
export function getCarTile(base, scheme, zoom, row, col) {
  return request({
    url: `/pt/tiles/car/${base}/${scheme}/${zoom}/${row}/${col}`,
    method: "get",
    responseType: "arraybuffer",
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

// 查询私家车详情
// GET /pt/tiles/carDetail/{base}/{scheme}/{index}
// 接口ID：194922810
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-194922810
export function getCarDetail(base, scheme, index) {
  return request({
    url: `/pt/tiles/carDetail/${base}/${scheme}/${index}`,
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

// 查询全部活动开始位置
// GET /pt/person/getAllActivity
// 接口ID：158593009
// 接口地址：https://www.apifox.cn/link/project/3709845/apis/api-158593009
export function getAllActivity(number) {
  return request({
    url: `/pt/person/getAllActivity?number=${number}`,
    method: "get",
  });
}

// 查询person出行计划
// GET /pt/person/getPlan
// 接口ID：157457699
// 接口地址：https://www.apifox.cn/link/project/3709845/apis/api-157457699
export function getPlan(params) {
  return request({
    url: `/pt/person/getPlan`,
    params: params,
    method: "get",
  });
}

// 查询所有活动类型
// GET /pt/person/getAllActivityType
// 接口ID：182747540
// 接口地址：https://www.apifox.cn/link/project/3709845/apis/api-182747540
export function getAllActivityType(params) {
  return request({
    url: `/pt/person/getAllActivityType`,
    params: params,
    method: "get",
  });
}

// 模糊查询person
// GET /pt/person/getPersonList
// 接口ID：231992304
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-231992304
export function getPersonList(params) {
  return request({
    url: `/pt/person/getPersonList`,
    params: params,
    method: "get",
  });
}

// 获取时间区间
// GET /pt/network/getTimeInterval
// 接口ID：165949873
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-165949873
export function getTimeInterval(params) {
  return request({
    url: `/pt/network/getTimeInterval`,
    params: params,
    method: "get",
  });
}

// 全部修改路线列表
// GET /pt/transitLine/changeLines
// 接口ID：188281232
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-188281232
export function changeLines(params) {
  return request({
    url: `/pt/transitLine/changeLines`,
    params: params,
    method: "get",
  });
}

// 获取默认中心点和zoomlevel
// GET /pt/network/getCenterZoom
// 接口ID：184069048
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-184069048
export function getCenterZoom(params) {
  return request({
    url: `/pt/network/getCenterZoom`,
    params: params,
    method: "get",
  });
}

// 模糊查询站点
// GET /pt/transitLine/getStopByName
// 接口ID：181205374
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-181205374
export function getStopByName(params) {
  return request({
    url: `/pt/transitLine/getStopByName`,
    params: params,
    method: "get",
  });
}

// 模糊查询线路
// GET /pt/transitLine/getRouteByName
// 接口ID：181205401
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-181205401
export function getRouteByName(params) {
  return request({
    url: `/pt/transitLine/getRouteByName`,
    params: params,
    method: "get",
  });
}

// 模糊查询node
// GET /pt/link/getNodeByName
// 接口ID：182087438
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-182087438
export function getNodeByName(params) {
  return request({
    url: `/pt/link/getNodeByName`,
    params: params,
    method: "get",
  });
}

// 模糊查询link
// GET /pt/link/getLinkByName
// 接口ID：182087458
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-182087458
export function getLinkByName(params) {
  return request({
    url: `/pt/link/getLinkByName`,
    params: params,
    method: "get",
  });
}

// 模糊查询建筑
// GET /pt/af/getFacilitiesByName
// 接口ID：182104885
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-182104885
export function getFacilitiesByName(params) {
  return request({
    url: `/pt/af/getFacilitiesByName`,
    params: params,
    method: "get",
  });
}

// 全部停车位置信息
// POST /pt/parking/allParking
// 接口ID：202018855
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-202018855
export function allParking(data) {
  return request({
    url: `/pt/parking/allParking`,
    data: data,
    method: "post",
  });
}

// 范围停车需求3D柱状图
// POST /pt/parking/rangeParking
// 接口ID：201934418
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-201934418
export function rangeParking(data) {
  return request({
    url: `/pt/parking/rangeParking`,
    data: data,
    method: "post",
  });
}

// 上传GoeJson
// POST /pt/parking/uploadGeoJson
// 接口ID：202028362
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-202028362
export function uploadGeoJson(data) {
  let formData = new FormData();
  for (const key in data) {
    formData.append(key, data[key]);
  }
  return request({
    url: `/pt/parking/uploadGeoJson`,
    method: "post",
    headers: {
      "Content-Type": "multipart/form-data",
    },
    data: formData,
  });
}

// 范围查询供需比
// POST /pt/parking/rangeRequireRatio
// 接口ID：202536443
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-202536443
export function rangeRequireRatio(data) {
  return request({
    url: `/pt/parking/rangeRequireRatio`,
    data: data,
    method: "post",
  });
}

// 范围查询供需比
// POST /pt/parking/rangeRequireRatio2
// 接口ID：202536443
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-202536443
export function rangeRequireRatio2(data) {
  return request({
    url: `/pt/parking/rangeRequireRatio2`,
    data: data,
    method: "post",
  });
}

// 查询区域link的出行
// POST /pt/link/getElapseAreaLeg
// 接口ID：226535496
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-226535496
export function getElapseAreaLeg(data) {
  return request({
    url: `/pt/link/getElapseAreaLeg`,
    data: data,
    method: "post",
  });
}

// 获取全区区域内linkid列表 Copy
// POST /pt/trafficRegionAnalysis/getLinkList
// 接口ID：230260757
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-230260757
export function getLinkListTRG(data) {
  return request({
    url: `/pt/trafficRegionAnalysis/getLinkList`,
    data: data,
    method: "post",
  });
}

// 获取link列表周边流量
// POST /pt/trafficRegionAnalysis/getLinkTracks
// 接口ID：230251998
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-230251998
export function getLinkTracksTRG(data) {
  return request({
    url: `/pt/trafficRegionAnalysis/getLinkTracks`,
    data: data,
    method: "post",
  });
}

// 获取link列表热力图
// POST /pt/trafficRegionAnalysis/hotMap
// 接口ID：230251998
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-230251998
export function hotMapTRG(data) {
  return request({
    url: `/pt/trafficRegionAnalysis/hotMap`,
    data: data,
    method: "post",
  });
}

// 起点分布
// POST /pt/trafficRegionAnalysis/originGrids
// 接口ID：230450225
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-230450225
export function getOriginGridsTRG(data) {
  return request({
    url: `/pt/trafficRegionAnalysis/originGrids`,
    data: data,
    method: "post",
  });
}

// 讫点分布
// POST /pt/trafficRegionAnalysis/destinationsGrids
// 接口ID：230484531
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-230484531
export function getDestinationsGridsTRG(data) {
  return request({
    url: `/pt/trafficRegionAnalysis/destinationsGrids`,
    data: data,
    method: "post",
  });
}

// 期望线
// POST /pt/trafficRegionAnalysis/desireLines
// 接口ID：231490550
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-231490550
export function desireLinesTRG(data) {
  return request({
    url: `/pt/trafficRegionAnalysis/desireLines`,
    data: data,
    method: "post",
  });
}

// 多polygon起点分布
// POST /pt/trafficRegionAnalysis/polygonOriginGrids
// 接口ID：230988110
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-230988110
export function polygonOriginGridsTRG(data) {
  return request({
    url: `/pt/trafficRegionAnalysis/polygonOriginGrids`,
    data: data,
    method: "post",
  });
}

// 多polygon讫点分布
// POST /pt/trafficRegionAnalysis/polygonDestinationsGrids
// 接口ID：231167863
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-231167863
export function polygonDestinationsGridsTRG(data) {
  return request({
    url: `/pt/trafficRegionAnalysis/polygonDestinationsGrids`,
    data: data,
    method: "post",
  });
}

// 多polygon期望线
// POST /pt/trafficRegionAnalysis/polygonDesireLines
// 接口ID：231432500
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-231432500
export function polygonDesireLinesTRG(data) {
  return request({
    url: `/pt/trafficRegionAnalysis/polygonDesireLines`,
    data: data,
    method: "post",
  });
}

// 可达性分析
// POST /pt/trafficRegionAnalysis/accessibility
// 接口ID：232103250
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-232103250
export function accessibilityTRG(data) {
  return request({
    url: `/pt/trafficRegionAnalysis/accessibility`,
    data: data,
    method: "post",
  });
}

// 保存配置
// POST /pt/main/saveUserCfg
// 接口ID：267966350
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-267966350
export function saveUserCfg(fileName, file) {
  let formData = new FormData();
  formData.append("fileName", fileName);
  formData.append("file", file);
  return request({
    url: `/pt/main/saveUserCfg`,
    method: "post",
    headers: {
      "Content-Type": "multipart/form-data",
    },
    data: formData,
  });
}

// 配置列表
// GET /pt/main/userCfgList
// 接口ID：267968264
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-267968264
export function userCfgList(params) {
  return request({
    url: `/pt/main/userCfgList`,
    params: params,
    method: "get",
  });
}

// 获取配置
// GET /pt/main/getUserCfg
// 接口ID：267968790
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-267968790
export function getUserCfg(params) {
  return request({
    url: `/pt/main/getUserCfg`,
    params: params,
    method: "get",
    // responseType: "blob",
  });
}

// 删除配置
// DELETE /pt/main/removeUserCfg
export function removeUserCfg(params) {
  return request({
    url: `/pt/main/removeUserCfg`,
    params: params,
    method: "delete",
  });
}

// 保存配置
// POST /pt/main/saveUserCfg2
// 接口ID：267966350
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-267966350
export function saveUserCfg2(fileName, file) {
  let formData = new FormData();
  formData.append("fileName", fileName);
  formData.append("file", file);
  return request({
    url: `/pt/main/saveUserCfg2`,
    method: "post",
    headers: {
      "Content-Type": "multipart/form-data",
    },
    data: formData,
  });
}

// 配置列表
// GET /pt/main/userCfgList2
// 接口ID：267968264
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-267968264
export function userCfgList2(params) {
  return request({
    url: `/pt/main/userCfgList2`,
    params: params,
    method: "get",
  });
}

// 获取配置
// GET /pt/main/getUserCfg2
// 接口ID：267968790
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-267968790
export function getUserCfg2(params) {
  return request({
    url: `/pt/main/getUserCfg2`,
    params: params,
    method: "get",
    // responseType: "blob",
  });
}

// 删除配置
// DELETE /pt/main/removeUserCfg2
export function removeUserCfg2(params) {
  return request({
    url: `/pt/main/removeUserCfg2`,
    params: params,
    method: "delete",
  });
}

// 上传gtfs文件
// POST /pt/transitLine/uploadGTFS
// 接口ID：279161462
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-279161462
export function uploadGTFS(file) {
  let formData = new FormData();
  formData.append("file", file);
  return request({
    url: `/pt/transitLine/uploadGTFS`,
    method: "post",
    headers: {
      "Content-Type": "multipart/form-data",
    },
    data: formData,
    noMsg: true,
  });
}

// 上传schedule文件
// POST /pt/transitLine/uploadSchedule
// 接口ID：279214121
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-279214121
export function uploadSchedule(schedule, vehicle) {
  let formData = new FormData();
  formData.append("schedule", schedule);
  formData.append("vehicle", vehicle);
  return request({
    url: `/pt/transitLine/uploadSchedule`,
    method: "post",
    headers: {
      "Content-Type": "multipart/form-data",
    },
    data: formData,
    noMsg: true,
  });
}

// 获取上传线路列表
// POST /pt/transitLine/getUploadLines
// 接口ID：279431344
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-279431344
export function getUploadLines(data) {
  return request({
    url: `/pt/transitLine/getUploadLines`,
    data: data,
    method: "post",
  });
}
