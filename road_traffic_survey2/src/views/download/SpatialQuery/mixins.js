import { addWatch, injectSync } from '@/utils'
import { ref, getCurrentInstance, toRaw, watch } from 'vue'
import mitt from 'mitt'

// 初始化空间查询功能
export const SpatialQueryEvent = mitt()
export const SpatialQueryTypeEnum = {
  RouteInfo: 'SpatialQuery:RouteInfo',
}
export function handleEmitSpatialQuery(props) {
  if (!props.spatialQuery) return
  const keys = props.spatialQuery.split('|')
  // 道路基础信息,道路类型分布
  if (keys.includes('RouteInfo')) {
    console.log('emit SpatialQuery:RouteInfo')
    SpatialQueryEvent.emit('SpatialQuery:RouteInfo', props)
  }
}