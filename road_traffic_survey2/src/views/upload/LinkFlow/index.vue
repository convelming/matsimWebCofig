<!-- linkFlow -->
<template>
  <MDialog
    class="LinkFlow"
    title="路段流量录入"
    subTitle="人工数车/ 路段流量录入"
    :top="80"
    :left="80"
    width="365px"
    hideClose
    :visible="showMain"
    @close="handleClose"
  >
    <el-scrollbar class="flex-scrollbar">
      <div class="lf_bodyer">
        <img src="@/assets/images/close.svg?url" class="close_btn" @click.stop="handleClose" />
        <div class="title1">请输入路段名称：</div>
        <div class="search">
          <RouteSelect ref="routeSelect" @change="handleMoveToRoute" />
          <el-button type="primary" @click="handleMoveToRoute({ value: selectRouteId })"
            >搜索定位</el-button
          >
        </div>
        <div class="noSelect">
          <img src="@/assets/images/地图@2x.png" alt="" class="icon" />
          <div class="text">请在地图点击路段</div>
        </div>
        <div class="checkbox">
          <el-checkbox v-model="showLayer" @change="">
            <span class="text1">显示图标</span>
            <span class="text2">(已上传数据点位)</span>
          </el-checkbox>
        </div>
        <el-collapse class="collapse" v-model="activeNames">
          <el-collapse-item title="显示设置" name="显示设置">
            <el-form label-position="left" label-width="80px">
              <el-form-item label="图标颜色">
                <div class="color_picker_box">
                  <div class="color_picker_item" v-for="[i, v] in typeOptionsList" :key="i">
                    <div>{{ v }}</div>
                    <el-color-picker v-model="typeColorOptions[i]"></el-color-picker>
                  </div>
                </div>
              </el-form-item>
              <el-form-item label="路段偏移">
                <!-- <el-slider v-model="" :min="" :max="" :step="" vertical="false" @change="">
                </el-slider> -->

                <el-slider :min="0" :max="30" :step="0.2" v-model="twoWayOffset"></el-slider>
              </el-form-item>
              <el-form-item label="路段宽度">
                <el-slider :min="1" :max="30" v-model="wayWidth"></el-slider>
              </el-form-item>
            </el-form>
          </el-collapse-item>
        </el-collapse>
      </div>
    </el-scrollbar>
  </MDialog>

  <LinkDetail
    v-model:visible="showLinkDetail"
    :linkId="linkDetailData.linkId"
    :proId="proId"
    @close="handleCloseLinkDetail"
    @changeLink="handleClickLink"
    @updateData="linkFlowUpdateData"
  />
</template>

<script>
export const typeOptions = {
  0: '其他',
  2: '视频识别',
  1: '人工',
  4: '交评核准',
  3: '互联网路况估算',
}

const typeOptionsList = [0, 2, 1, 4, 3].map((v) => [v, typeOptions[v]])
</script>

<script setup>
import * as API from '@/api/index'
import { injectSync, addWatch } from '@/utils/index'
import RouteSelect from '@/components/RouteSelect.vue'
import LinkDetail from './LinkDetail.vue'

import { MAP_EVENT } from '@/mymap/index.js'
import { NetworkLayer } from '@/utils/MapLayer/NetworkLayer'
import { LinkLayer } from '@/utils/MapLayer/LinkLayer'
import { LinkStatsLayer } from '@/utils/MapLayer/LinkStatsLayer'
import { computed, inject } from 'vue'

const emit = defineEmits(['update:visible', 'close'])
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  proId: {
    type: Number,
    default: 0,
  },
})

const showLayer = ref(false)
const activeNames = ref(['显示设置'])

const typeColorOptions = ref({
  0: '#67C23A', // 其他 绿色
  1: '#f56c6c', // 人工 红色
  2: '#409eff', // 视频识别 蓝色
  3: '#e6a23c', // 互联网路况估算 橙色
  4: '#909399', // 交评核准 灰色
})
const wayWidth = ref(10)
const twoWayOffset = ref(10)
// const showLinkDetail = ref(true)
const selectRouteId = ref(null)

const showLinkDetail = computed(() => {
  return linkDetailData.visible
})

const showMain = computed(() => {
  return !linkDetailData.visible && props.visible
})

const linkDetailData = reactive({
  visible: false,
  linkId: 0,
  porId: null,
})

let _Map = null
const _NetworkLayer = inject('_NetworkLayer').value
const _NetworkLayerEventId = _NetworkLayer.addEventListener(MAP_EVENT.HANDLE_PICK_LEFT, (res1) => {
  linkDetailData.visible = selectRouteId.value == res1.data.id
  linkDetailData.linkId = null
  selectRouteId.value = res1.data.id
  if (selectRouteId.value) {
    API.getMatsimLink(selectRouteId.value).then((res2) => {
      _LinkLayer.setData(res2.data)
    })
  } else {
    _LinkLayer.setData(null)
  }
})
_NetworkLayer.stopEventListener(MAP_EVENT.HANDLE_PICK_LEFT, _NetworkLayerEventId)

const _LinkLayer = new LinkLayer({
  zIndex: 30,
  colors: typeColorOptions.value,
  lineWidth: wayWidth.value,
  twoWayOffset: twoWayOffset.value,
  event: {
    [MAP_EVENT.HANDLE_PICK_LEFT]: (res) => {
      handleClickLink(res.data)
    },
  },
})
const _LinkStatsLayer = new LinkStatsLayer({
  zIndex: 100,
  colors: typeColorOptions.value,
  event: {
    [MAP_EVENT.HANDLE_PICK_LEFT]: (res) => {
      handleMoveToLink({
        value: res.data.linkId,
        item: {
          origid: res.data.wayId,
        },
      })
    },
  },
})

const watchVisible = addWatch(
  () => props.visible,
  (val) => {
    console.log(val)
    if (val) {
      _NetworkLayer.resumeEventListener(MAP_EVENT.HANDLE_PICK_LEFT, _NetworkLayerEventId)
      watchWayWidth.callback(wayWidth.value)

      _Map.addLayer(_LinkLayer)
      _Map.addLayer(_NetworkLayer)
      watchShowLayer.callback(showLayer.value)
    } else {
      _NetworkLayer.stopEventListener(MAP_EVENT.HANDLE_PICK_LEFT, _NetworkLayerEventId)

      _Map.removeLayer(_LinkLayer)
      _Map.removeLayer(_NetworkLayer)
      _Map.removeLayer(_LinkStatsLayer)
    }
  },
)
const watchShowLayer = addWatch(showLayer, (val) => {
  if (val) {
    _Map.addLayer(_LinkStatsLayer)
  } else {
    _Map.removeLayer(_LinkStatsLayer)
  }
})
const watchTwoWayOffset = addWatch(twoWayOffset, (val) => {
  _LinkLayer.setValues({ twoWayOffset: val })
})
const watchWayWidth = addWatch(wayWidth, (val) => {
  _LinkLayer.setValues({ lineWidth: val })
  _NetworkLayer.setValues({ lineWidth: val })
})
const watchTypeColorOptions = addWatch(typeColorOptions, (val) => {
  _LinkLayer.setColors(val)
  _LinkStatsLayer.setColors(val)
})

function handleClose() {
  emit('update:visible', false)
  emit('close')
}
function handleCloseLinkDetail() {
  linkDetailData.visible = false
  linkDetailData.linkId = null
  _LinkLayer.setSelectId(null)
}
function handleMoveToRoute({ value }) {
  selectRouteId.value = value
  API.getMatsimLink(selectRouteId.value).then((res) => {
    // 计算地图合适的中心点和zoom
    let { zoom, center } = _Map.getFitZoomAndCenter(res.data[0].map((v) => v.fromxy))
    console.log(zoom, center, res.data)

    _Map.setCenter(center)
    _Map.setZoom(zoom - 1)

    _LinkLayer.setData(res.data)
  })
}
function handleLoadMaker() {
  API.queryAllMaker({}).then((res) => {
    _LinkStatsLayer.setData(res.data)
  })
}
function handleClickLink(data) {
  linkDetailData.visible = true
  linkDetailData.linkId = data.id

  const { clientWidth, clientHeight } = _Map.rootDoc
  const [x1, y1] = _Map.WindowXYToWebMercator(clientWidth / 3, clientHeight / 2)
  const [x2, y2] = _Map.center

  let center = [
    (data.fromxy[0] + data.toxy[0]) / 2 - (x2 - x1),
    (data.fromxy[1] + data.toxy[1]) / 2,
  ]
  _Map.setCenter(center)
  _LinkLayer.setSelectId(data.id)
}
function handleMoveToLink({ value, item }) {
  selectRouteId.value = item.origid
  linkDetailData.linkId = value
  API.getMatsimLink(selectRouteId.value).then((res) => {
    // 计算地图合适的中心点和zoom
    let { zoom, center } = _Map.getFitZoomAndCenter(res.data[0].map((v) => v.fromxy))
    _Map.setCenter(center)
    _Map.setZoom(zoom)
    _LinkLayer.setData(res.data)

    for (const route of res.data) {
      for (const link of route) {
        if (link.id == value) {
          setTimeout(() => {
            handleClickLink(link)
          }, 500)
          return
        }
      }
    }
  })
}
function linkFlowUpdateData() {
  handleLoadMaker()
  if (selectRouteId.value) {
    getMatsimLink(selectRouteId.value).then((res) => {
      _LinkLayer.setData(res.data, _LinkLayer.selectId)
    })
  }
}

onMounted(() => {
  handleLoadMaker()
})
onUnmounted(() => {
  _LinkLayer.dispose()
  _LinkStatsLayer.dispose()
})

injectSync('MapRef').then((map) => {
  _Map = map.value
  watchVisible.callback(props.visible)
})
</script>

<style lang="scss" scoped>
.flex-scrollbar {
  max-height: calc(100vh - 200px);
}
.LinkFlow {
  .lf_bodyer {
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 16px;
    .close_btn {
      z-index: 100;
      cursor: pointer;
      position: absolute;
      fill: #000;
      right: 16px;
      top: 16px;
      width: 20px;
      height: 20px;
    }
    .title1 {
      font-weight: 700;
      font-size: 16px;
      color: #2c3e50;
      margin-bottom: 16px;
    }
    .search {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
      .el-select {
        width: 0;
        flex: 1;
      }
    }

    .noSelect {
      height: 156px;
      background: #f5f7fa;
      border-radius: 16px 16px 16px 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      .icon {
        width: 136px;
        height: 80px;
        display: block;
      }
      .text {
        font-weight: 700;
        font-size: 16px;
        color: #909399;
      }
    }

    .checkbox {
      margin-top: 12px;
      display: flex;
      align-items: center;
      height: 44px;
      border-top: 1px solid #eeeeee;
      // border-bottom: 1px solid #eeeeee;
      .text1 {
        font-weight: 400;
        font-size: 14px;
        color: #333333;
      }
      .text2 {
        font-weight: 400;
        font-size: 12px;
        color: #707a7e;
      }
    }

    .collapse {
      .color_picker_box {
        display: flex;
        align-items: center;
        gap: 10px 20px;
        flex-wrap: wrap;
        .color_picker_item {
          display: flex;
          align-items: center;
          gap: 5px;
        }
      }
    }
  }
}
</style>
