import request from '@/utils/request'

// 起降点列表
export function listUam(params) {
  return request({
    url: `/uam/route/infList`,
    method: 'get',
    params: params
  })
}

// 生成3条临时航路
export function genUamRoute(data) {
  return request({
    url: `/uam/route/genRoute`,
    method: 'post',
    data
  })
}

// 新增航线
export function saveRoute(data) {
  return request({
    url: `/uam/route2/saveRoute`,
    method: 'post',
    data
  })
}

// 航线列表
export function getRouteList(params) {
  return request({
    url: `/uam/route2/routeList`,
    method: 'get',
    params
  })
}
