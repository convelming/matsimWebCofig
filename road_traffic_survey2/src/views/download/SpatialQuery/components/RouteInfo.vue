<!-- RouteInfo -->
<template>
  <MDialog
    ref="RouteInfo_bialog"
    class="RouteInfo_bialog"
    title="路网信息查询"
    :subTitle="`数据源：${routeInfoParams?.title || '未选择'}`"
    :y="80"
    :x="20"
    placement="top-right"
    width="350px"
    :visible="s_visible"
    @close="handleClose"
  >
    <el-scrollbar class="flex-scrollbar">
      <SelectArea v-if="!areaPath?.length" @select="handleSelectArea" />
      <div v-else-if="!routeInfoParams" class="RouteInfo_content">
        <el-empty description="请选择要统计的路网"></el-empty>
        <div class="btn2" @click="handleSelectArea(null)">重新圈选</div>
      </div>
      <el-empty v-else-if="loading" description="数据统计中，请稍等"></el-empty>
      <div v-else class="RouteInfo_content">
        <div class="box1">
          <div class="title">所在行政区划</div>
          <div class="value">
            <template v-for="(item, index) in routeInfo?.['所在行政区']">
              <el-tag
                :type="['default', 'success', 'warning', 'danger', 'info'][index % 5]"
                effect="dark"
                >{{ item }}</el-tag
              >
            </template>
          </div>
        </div>
        <div class="box2">
          <div class="title">道路基础信息</div>
          <div class="value">
            <div class="item1">
              <div class="text1">道路里程</div>
              <div class="text2">{{ routeInfo?.['道路里程'] }}km</div>
            </div>
            <div class="item2">
              <div class="text1">道路密度</div>
              <div class="text2">{{ routeInfo?.['道路密度'] }}km/km²</div>
            </div>
            <div class="item3">
              <div class="text1">道路数量</div>
              <div class="text2">{{ routeInfo?.['道路数量'] }}条</div>
            </div>
          </div>
        </div>
        <div class="box3">
          <div class="title">数据类型分析</div>
          <div class="value">
            <div class="item1">
              <VChart
                class="chart"
                :option="chartOption1"
                autoresize
                :update-options="{ notMerge: true }"
              />
            </div>
            <div class="item2">
              <VChart
                class="chart"
                :option="chartOption2"
                autoresize
                :update-options="{ notMerge: true }"
              />
            </div>
          </div>
        </div>
        <div class="btn2" @click="handleSelectArea(null)">重新圈选</div>
      </div>
    </el-scrollbar>
  </MDialog>
</template>

<script setup>
import { addWatch, injectSync } from '@/utils'
import { roadInfo } from '@/api/download.js'
import SelectArea from './SelectArea.vue'
import { SpatialQueryEvent, SpatialQueryTypeEnum } from '../mixins.js'

import { PathLayer } from '@/utils/MapLayer/SelectLayer'

import proj4 from 'proj4'

proj4.defs(
  'EPSG:4526',
  '+proj=tmerc +lat_0=0 +lon_0=114 +k=1 +x_0=38500000 +y_0=0 +ellps=GRS80 +units=m +no_defs',
)
proj4.defs('urn:ogc:def:crs:OGC:1.3:CRS84', proj4.defs('EPSG:4326'))

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['update:visible', 'close'])

let _Map = null
const _PathLayer = new PathLayer({
  zIndex: 1000,
})
const s_visible = ref(props.visible)
const routeInfoParams = ref(null)
const areaPath = ref(null)
const routeInfo = ref(null)
const loading = ref(false)

const chartOption1 = computed(() => {
  const data = routeInfo.value?.['数据类型分布'] || []
  return {
    tooltip: {
      trigger: 'axis',
    },
    grid: {
      top: 40,
      left: 0,
      right: 10,
      bottom: 0,
      containLabel: true,
    },
    toolbox: {
      feature: {
        saveAsImage: {},
      },
    },
    xAxis: {
      type: 'category',
      data: data.map((v) => v.name),
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        type: 'bar',
        data: data.map((v) => v.num),
        color: '#67c23a',
      },
    ],
  }
})

const chartOption2 = computed(() => {
  const data = routeInfo.value?.['数据类型分布'] || []
  return {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)',
      appendToBody: true,
    },
    legend: {
      right: 0,
      top: 0,
      bottom: 0,
      type: 'scroll',
      orient: 'vertical', // Vertical layout (default is 'horizontal')
      data: data.map((v) => v.name),
      textStyle: {
        fontSize: 10,
      },
      formatter(name) {
        let item = data.find((d) => d.name === name)
        return `${name}-${item.r}%`
      },
    },
    series: [
      {
        name: '数据类型分布',
        type: 'pie',
        radius: '50%',
        center: ['25%', '50%'],
        data: data.map((v) => ({
          name: v.name,
          value: v.num,
        })),
        label: {
          show: false,
        },
      },
    ],
  }
})

injectSync('MapRef').then((map) => {
  _Map = map.value
})

watch(
  () => props.visible,
  (val) => {
    s_visible.value = val
    console.log('RouteInfo_bialog', val)
    if (val) {
      _Map?.addLayer(_PathLayer)
    } else {
      _PathLayer.removeFromParent()
    }
  },
  {
    immediate: true,
  },
)

function handleClose() {
  s_visible.value = false
  emit('update:visible', false)
  emit('close')
}
function handleSelectArea(path) {
  console.log('handleSelectArea', path)
  _PathLayer.setPath(path)
  areaPath.value = path
  handleGetRouteInfo()
}
function handleSelectRouteInfoParams(props) {
  routeInfoParams.value = props
  handleGetRouteInfo()
}
SpatialQueryEvent.on(SpatialQueryTypeEnum.RouteInfo, handleSelectRouteInfoParams)

function handleGetRouteInfo() {
  routeInfo.value = null
  if (!routeInfoParams.value) return
  if (!areaPath.value?.length) return
  loading.value = true
  roadInfo({
    url: routeInfoParams.value.path,
    xyarr: areaPath.value,
  })
    .then((res) => {
      console.log(res)
      routeInfo.value = res.data
    })
    .finally(() => {
      loading.value = false
    })
}
onUnmounted(() => {
  SpatialQueryEvent.off(SpatialQueryTypeEnum.RouteInfo, handleSelectRouteInfoParams)
  _PathLayer.dispose()
})
</script>

<style lang="scss" scoped>
.flex-scrollbar {
  max-height: calc(100vh - 200px);
}
.RouteInfo_content {
  padding: 20px 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  .box1 {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 10px;
    border-radius: 5px;
    background-color: var(--el-color-primary-light-8);
    // box-shadow: var(--el-box-shadow-light);
    .title {
      display: flex;
      align-items: center;
      font-size: 16px;
      color: #333;
      font-weight: bold;
      gap: 10px;
      &::before {
        display: inline-block;
        width: 4px;
        height: 20px;
        border-radius: 2px;
        background-color: var(--el-color-primary);
        content: '';
      }
    }
    .value {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
  }
  .box2 {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 10px;
    border-radius: 5px;
    background-color: var(--el-color-success-light-8);
    // box-shadow: var(--el-box-shadow-light);
    // color: #41b48d;
    // background-color: #ffeee4;
    // color: #6696fc;
    // background-color: #eff6ff;
    // color: #009764;
    // background-color: #edfdf7;

    .title {
      display: flex;
      align-items: center;
      font-size: 16px;
      color: #333;
      font-weight: bold;
      gap: 10px;
      &::before {
        display: inline-block;
        width: 4px;
        height: 20px;
        border-radius: 2px;
        background-color: var(--el-color-success);
        content: '';
      }
    }
    .value {
      display: grid;
      gap: 10px;
      grid-template-areas:
        'item1 item2'
        'item3 item3';
      grid-template-columns: repeat(2, 1fr);
      .item1 {
        grid-area: item1;
        padding: 10px;
        border-radius: 5px;
        background-color: var(--el-color-warning-light-9);
        box-shadow: var(--el-box-shadow-light);
        .text1 {
          color: #333;
          font-size: 12px;
          font-weight: 500;
        }
        .text2 {
          color: var(--el-color-warning);
          font-size: 16px;
          font-weight: 500;
        }
      }
      .item2 {
        grid-area: item2;
        padding: 10px;
        border-radius: 5px;
        background-color: var(--el-color-primary-light-9);
        box-shadow: var(--el-box-shadow-light);
        .text1 {
          color: #333;
          font-size: 12px;
          font-weight: 500;
        }
        .text2 {
          color: var(--el-color-primary);
          font-size: 16px;
          font-weight: 500;
        }
      }
      .item3 {
        grid-area: item3;
        padding: 10px;
        border-radius: 5px;
        background-color: var(--el-color-danger-light-9);
        box-shadow: var(--el-box-shadow-light);
        .text1 {
          color: #333;
          font-size: 12px;
          font-weight: 500;
        }
        .text2 {
          color: var(--el-color-danger);
          font-size: 16px;
          font-weight: 500;
        }
      }
    }
  }

  .box3 {
    display: flex;
    flex-direction: column;
    gap: 10px;
    // padding: 10px;
    border-radius: 5px;

    .title {
      padding: 0 10px;
      display: flex;
      align-items: center;
      font-size: 16px;
      color: #333;
      font-weight: bold;
      gap: 10px;
      &::before {
        display: inline-block;
        width: 4px;
        height: 20px;
        border-radius: 2px;
        background-color: var(--el-color-info);
        content: '';
      }
    }

    .value {
      display: flex;
      flex-direction: column;
      gap: 10px;
      .item1,
      .item2 {
        box-sizing: border-box;
        background-color: var(--el-color-info-light-9);
        border-radius: 5px;
        padding: 10px;
        width: 100%;
        height: 200px;
        .chart {
          width: 100%;
          height: 100%;
        }
      }
    }
  }

  .btn2 {
    position: relative;
    cursor: pointer;
    height: 40px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #448371;

    font-size: 14px;
    color: #fff;
  }
}
</style>
