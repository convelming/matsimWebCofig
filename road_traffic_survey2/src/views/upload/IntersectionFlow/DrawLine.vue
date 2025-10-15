<!-- DrawLine -->
<template>
  <MDialog
    class="DrawLine"
    title="绘制检测线"
    :top="80"
    :left="80"
    width="calc(100vw - 100px)"
    hideClose
    :visible="visible"
    @close="handleClose"
  >
    <div style="padding: 20px">
      <div class="DrawLine_body">
        <el-scrollbar style="height: calc(100vh - 270px); width: 70%">
          <div class="draw_map_box">
            <div
              class="img_size"
              :style="{ paddingBottom: `${(drawHeight / drawWidth) * 100}%` }"
            ></div>
            <div class="draw_map" id="draw_map"></div>
          </div>
        </el-scrollbar>
        <el-scrollbar style="height: calc(100vh - 270px); width: 30%">
          <div class="draw_toolbar">
            <div class="row">
              <el-button v-if="!isChangeMap" type="primary" @click="handleStartChangeMap"
                >调整位置</el-button
              >
              <el-button v-else type="primary" @click="handleEndChangeMap">结束调整</el-button>
              <div
                class="open_btn el-icon-arrow-down"
                :class="{ hide: !showChangeMapSetting }"
                @click="showChangeMapSetting = !showChangeMapSetting"
              ></div>
            </div>
            <template v-if="showChangeMapSetting">
              <div class="row">
                <span class="label">显示地图:</span>
                <el-switch v-model="showMapLayer" :active-value="true" :inactive-value="false">
                </el-switch>
              </div>
              <div class="row">
                <span class="label">显示路网:</span>
                <el-switch v-model="showNetworkLayer" :active-value="true" :inactive-value="false">
                </el-switch>
              </div>
              <div class="row">
                <span class="label">地图透明度:</span>
                <el-slider
                  :disabled="!showMapLayer"
                  style="width: 100%; padding: 0 2em 0 0"
                  v-model="mapLayerOpacity"
                  :step="0.01"
                  :min="0"
                  :max="1"
                >
                </el-slider>
              </div>
              <div class="row">
                <span class="label">topLeft:</span>
                <span>{{ mapFrom.topLeft }}</span>
              </div>
              <div class="row">
                <span class="label">topRight:</span>
                <span>{{ mapFrom.topRight }}</span>
              </div>
              <div class="row">
                <span class="label">bottomLeft:</span>
                <span>{{ mapFrom.bottomLeft }}</span>
              </div>
              <div class="row">
                <span class="label">bottomRight:</span>
                <span>{{ mapFrom.bottomRight }}</span>
              </div>
            </template>
            <div class="row">
              <el-button type="primary" @click="handleAddDrawLine">添加画线</el-button>
              <div
                class="open_btn el-icon-arrow-down"
                :class="{ hide: !showChangeDrawLineSetting }"
                @click="showChangeDrawLineSetting = !showChangeDrawLineSetting"
              ></div>
            </div>
            <template v-if="showChangeDrawLineSetting">
              <template v-if="drawLineFrom">
                <div class="row">
                  <span class="label">线名：</span>
                  <el-input
                    v-model="drawLineFrom.name"
                    placeholder=""
                    clearable
                    @change=""
                  ></el-input>
                </div>
                <div class="row">
                  <span class="label">开始点：</span>
                  <span> {{ formatterPoint(drawLineFrom.begin) }}</span>
                </div>
                <div class="row">
                  <span class="label">结束点：</span>
                  <span> {{ formatterPoint(drawLineFrom.end) }}</span>
                </div>
                <div class="row">
                  <span class="label">颜色：</span>
                  <el-color-picker
                    v-model="drawLineFrom.color"
                    :predefine="predefineColors"
                  ></el-color-picker>
                </div>
                <div class="row">
                  <el-button type="primary" @click="handleConfirmDrawLine">确定</el-button>
                  <el-button type="primary" @click="handleCancelLine">取消</el-button>
                </div>
              </template>
              <template v-else>
                <div class="row">
                  <el-table class="small" :data="drawLineList" border stripe height="300px">
                    <el-table-column prop="color" label="颜色" width="60">
                      <template #default="{ row }">
                        <el-color-picker
                          v-model="row.color"
                          :predefine="predefineColors"
                        ></el-color-picker>
                      </template>
                    </el-table-column>
                    <el-table-column prop="name" label="线名"> </el-table-column>
                    <el-table-column prop="begin" label="开始点">
                      <template #default="{ row }">{{ formatterPoint(row.begin) }}</template>
                    </el-table-column>
                    <el-table-column prop="end" label="结束点">
                      <template #default="{ row }">{{ formatterPoint(row.end) }}</template>
                    </el-table-column>
                    <el-table-column label="操作" width="180">
                      <template #default="{ row, $index }">
                        <el-button type="primary" @click="handleEditDrawLine(row, $index)"
                          >编辑</el-button
                        >
                        <el-button type="danger" @click="handleRemoveDrawLine(row, $index)"
                          >删除</el-button
                        >
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </template>
            </template>
          </div>
        </el-scrollbar>
      </div>
      <div class="DrawLine_footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="saving">保存绘制内容</el-button>
      </div>
    </div>
  </MDialog>
</template>

<script setup>
import { MyMap, MAP_EVENT, MAP_LAYER_STYLE, MapLayer } from '@/mymap/index.js'
import { MercatorToWGS84, WGS84ToMercator } from '@/mymap/utils/LngLatUtils'

import { DrawLineLayer } from '@/utils/MapLayer/DrawLineLayer'
import { NetworkLayer } from '@/utils/MapLayer/NetworkLayer'

import * as API from '@/api/index'
import { addWatch, injectSync, JsonParse } from '@/utils/index'

let _Map = null
let _DrawLineLayer = null
const { proxy } = getCurrentInstance()
const emits = defineEmits(['update:visible', 'close', 'submited'])
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  crossroadsId: {
    type: [Number, String],
    default: undefined,
  },
  intersectionId: {
    type: [Number, String],
    default: undefined,
  },
})

const loading = ref(false)
const saving = ref(false)
const predefineColors = [
  '#ff4500',
  '#ff8c00',
  '#ffd700',
  '#90ee90',
  '#00ced1',
  '#1e90ff',
  '#c71585',
]

const drawUrl = ref('')
const drawName = ref('')
const drawWidth = ref(1600)
const drawHeight = ref(900)
const drawLineFrom = ref(null)
const drawLineList = ref([])
const isChangeMap = ref(false)
const mapLayerOpacity = ref(0.5)
const mapFrom = ref({
  topLeft: [0, 0],
  topRight: [0, 0],
  bottomLeft: [0, 0],
  bottomRight: [0, 0],
})
const detail = ref(null)

const showMapLayer = ref(false)
const showNetworkLayer = ref(false)
const showChangeMapSetting = ref(true)
const showChangeDrawLineSetting = ref(true)

const watchProps = addWatch(
  props,
  (val) => {
    if (val.visible) {
      handleEnable()
    } else {
      handleDisable()
    }
  },
  {
    deep: true,
    immediate: true,
  },
)

const watchShowMapLayer = addWatch(showMapLayer, (val) => {
  if (val) {
    _Map.addLayer(_MapLayer)
  } else {
    _Map.removeLayer(_MapLayer)
  }
})

const watchShowNetworkLayer = addWatch(showNetworkLayer, (val) => {
  if (val) {
    _NetworkLayer.setOpacity(1)
  } else {
    _NetworkLayer.setOpacity(0)
  }
})

addWatch(mapLayerOpacity, (val) => {
  _MapLayer.setOpacity(mapLayerOpacity.value)
})

const _MapLayer = new MapLayer({
  tileClass: MAP_LAYER_STYLE[0],
  zIndex: 100,
  opacity: mapLayerOpacity.value,
})
const _NetworkLayer = new NetworkLayer({ zIndex: 200, lineWidth: 5, color: '#409EFF' })
injectSync('_NetworkData').then((res) => {
  _NetworkLayer.setData(res.value)
})

onMounted(() => {
  _Map = new MyMap({
    rootId: 'draw_map',
    minPitch: 90,
    enableRotate: false,
    enableZoom: false,
    enablePan: false,
    event: {
      [MAP_EVENT.UPDATE_CENTER]: handleChangeMapFrom,
      [MAP_EVENT.UPDATE_CAMERA_HEIGHT]: handleChangeMapFrom,
      [MAP_EVENT.UPDATE_CAMERA_ROTATE]: handleChangeMapFrom,
    },
  })
  _Map.addLayer(_MapLayer)
  _Map.addLayer(_NetworkLayer)

  watchShowMapLayer.callback(showMapLayer.value)
  watchShowNetworkLayer.callback(showNetworkLayer.value)
})

onUnmounted(() => {
  handleDisable()
  _Map && _Map.dispose()
  if (_DrawLineLayer) _DrawLineLayer.dispose()
  _MapLayer.dispose()
  _NetworkLayer.dispose()
})

function handleClose() {
  emits('update:visible', false)
  emits('close')
}

// 组件显示事件
async function handleEnable() {
  const id = props.crossroadsId
  if (id) {
    loading.value = true
    const res = await API.crossroadsDetail(id)
    detail.value = res.data.crossroads
    const mapInfo = JsonParse(res.data.crossroads.mapInfo, {
      center: [12614426, 2646623],
      zoom: 19,
      rotation: 0,
    })

    if (res.data.crossroads.type == 1) {
      // 人工录入
      drawUrl.value = ''
      drawName.value = ''
      drawWidth.value = 1600
      drawHeight.value = 900
      mapFrom.value = {
        topLeft: [0, 0],
        topRight: [0, 0],
        bottomLeft: [0, 0],
        bottomRight: [0, 0],
        width: 1600,
        height: 900,
      }
      drawLineFrom.value = null

      showMapLayer.value = true
      showNetworkLayer.value = true
      mapLayerOpacity.value = 1
    } else if (res.data.crossroads.type == 2) {
      // 视频录入
      const image = res.data.frame
      drawUrl.value = image.url
      drawName.value = image.name
      drawWidth.value = image.width
      drawHeight.value = image.height
      mapFrom.value = {
        topLeft: [0, 0],
        topRight: [0, 0],
        bottomLeft: [0, 0],
        bottomRight: [0, 0],
        width: image.width,
        height: image.height,
      }
      drawLineFrom.value = null

      showMapLayer.value = false
      showNetworkLayer.value = false
      mapLayerOpacity.value = 0.5
    }

    _Map.setCenter(mapInfo.center)
    _Map.setZoom(mapInfo.zoom)
    _Map.setPitchAndRotation(undefined, mapInfo.rotation)

    const drawLineListData = JsonParse(res.data.crossroads.lines, [])
    drawLineListData.forEach((line) => {
      line.name = line.lineName || ''
    })
    if (_DrawLineLayer) {
      _DrawLineLayer.dispose()
      _DrawLineLayer = null
    }
    _DrawLineLayer = new DrawLineLayer({
      zIndex: 0,
      url: drawUrl.value,
      width: drawWidth.value,
      height: drawHeight.value,
      drawLineList: drawLineListData,
    })
    drawLineList.value = _DrawLineLayer.drawLineList
    _Map.addLayer(_DrawLineLayer)
    loading.value = false
  }
}
// 组件隐藏事件
function handleDisable() {
  drawUrl.value = ''
  drawName.value = ''
  drawWidth.value = 1600
  drawHeight.value = 900
  mapFrom.value = {
    topLeft: [0, 0],
    topRight: [0, 0],
    bottomLeft: [0, 0],
    bottomRight: [0, 0],
    width: 1600,
    height: 900,
  }
  drawLineFrom.value = null

  showMapLayer.value = true
  showNetworkLayer.value = true
  mapLayerOpacity.value = 1
  if (_DrawLineLayer) {
    _DrawLineLayer.dispose()
    _DrawLineLayer = null
  }
}
// *********************************** 改变地图位置，缩放，旋转角度 *********************************** //
let _handleChangeMapFromTime = null
function handleChangeMapFrom(res) {
  if (_handleChangeMapFromTime) return
  _handleChangeMapFromTime = setTimeout(() => {
    if (_Map) {
      const data = _Map.getWindowRangeAndWebMercator()
      mapFrom.value.topLeft = _MercatorToWGS84(data.topLeft)
      mapFrom.value.topRight = _MercatorToWGS84(data.topRight)
      mapFrom.value.bottomLeft = _MercatorToWGS84(data.bottomLeft)
      mapFrom.value.bottomRight = _MercatorToWGS84(data.bottomRight)
      mapFrom.value.width = data.width
      mapFrom.value.height = data.height
    }
    _handleChangeMapFromTime = null
  }, 200)
}
function _MercatorToWGS84(list) {
  const [x, y] = MercatorToWGS84(list[0] || 0, list[1] || 0)
  return [Number(Number(x).toFixed(8)), Number(Number(y).toFixed(8))]
}

let _showMapLayer = false
let _showNetworkLayer = false
function handleStartChangeMap() {
  isChangeMap.value = true
  _Map.enableRotate = true
  _Map.enableZoom = true
  _Map.enablePan = true

  _showMapLayer = showMapLayer.value
  showMapLayer.value = true
  _showNetworkLayer = showNetworkLayer.value
  showNetworkLayer.value = true
}
function handleEndChangeMap() {
  isChangeMap.value = false
  _Map.enableRotate = false
  _Map.enableZoom = false
  _Map.enablePan = false
  showMapLayer.value = _showMapLayer
  showNetworkLayer.value = _showNetworkLayer
}
// *********************************** 改变地图位置，缩放，旋转角度 *********************************** //

// *********************************** 画线 *********************************** //
function handleAddDrawLine() {
  handleConfirmDrawLine()
  if (_DrawLineLayer) drawLineFrom.value = _DrawLineLayer.addLine()
}
function handleEditDrawLine(row, index) {
  handleConfirmDrawLine()
  if (_DrawLineLayer) drawLineFrom.value = _DrawLineLayer.editLine(index)
}
function handleConfirmDrawLine() {
  drawLineFrom.value = null
  if (_DrawLineLayer) _DrawLineLayer.confirmLine()
}
function handleCancelLine() {
  drawLineFrom.value = null
  if (_DrawLineLayer) _DrawLineLayer.cancelLine()
}
function handleRemoveDrawLine(row, index) {
  if (_DrawLineLayer) _DrawLineLayer.removeLine(index)
}
function formatterPoint(array) {
  try {
    return [Number(Number(array[0]).toFixed(6)), Number(Number(array[1]).toFixed(6))]
  } catch (error) {
    return error.message
  }
}
// *********************************** 画线 *********************************** //
function handleSubmit() {
  const scale = _Map.rootDoc.clientWidth / drawWidth.value
  const form = {
    cossroadsId: props.crossroadsId, // 十字路id
    mapInfo: JSON.stringify({
      center: _Map.center,
      zoom: _Map.zoom,
      rotation: _Map.rotation,
      width: mapFrom.value.width,
      height: mapFrom.value.height,
    }),
    vertex: [
      // 范围点
      WGS84ToMercator(...mapFrom.value.topLeft),
      WGS84ToMercator(...mapFrom.value.topRight),
      WGS84ToMercator(...mapFrom.value.bottomRight),
      WGS84ToMercator(...mapFrom.value.bottomLeft),
      WGS84ToMercator(...mapFrom.value.topLeft),
    ],
    lines: drawLineList.value.map((v) => {
      const mktBegin = _Map.WindowXYToWebMercator(v.begin[0] * scale, v.begin[1] * scale)
      const mktEnd = _Map.WindowXYToWebMercator(v.end[0] * scale, v.end[1] * scale)
      const item = {
        lineName: v.name, // 线名
        imageName: drawName.value, // 图片名
        beginx: parseInt(v.begin[0]), // 开始x坐标（图片相对位置）
        beginy: parseInt(v.begin[1]), // 开始y坐标
        endx: parseInt(v.end[0]), // 结束x坐标
        endy: parseInt(v.end[1]), // 结束y坐标
        width: parseInt(drawWidth.value), // 图片宽
        height: parseInt(drawHeight.value), // 图片高

        mktBeginx: mktBegin[0], // 开始x坐标（图片相对位置）
        mktBeginy: mktBegin[1], // 开始y坐标
        mktEndx: mktEnd[0], // 结束x坐标
        mktEndy: mktEnd[1], // 结束y坐标
      }
      return item
    }),
  }
  // console.log(form)
  // return;
  saving.value = true
  API.crossroadsSaveLine(form)
    .then((res) => {
      emits('submited', {
        crossroadsId: props.crossroadsId,
        intersectionId: props.intersectionId,
      })
      saving.value = false
    })
    .catch((err) => {
      saving.value = false
    })
}
</script>

<style lang="scss" scoped>
.DrawLine {
  .DrawLine_body {
    display: flex;
    gap: 20px;
    .draw_map_box {
      position: relative;
      .img_size {
        display: block;
        width: 100%;
        height: 0;
        opacity: 0;
      }
      .draw_map {
        position: absolute !important;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
    }
    .draw_toolbar {
      font-size: 14px;
      .row {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
      }
      .label {
        white-space: nowrap;
        margin-right: 20px;
      }
      .open_btn {
        margin-left: auto;
        height: 32px;
        line-height: 32px;
        padding: 0 12px;
        cursor: pointer;
        transition: all 0.3s;
        &.hide {
          transform: rotate(90deg);
        }
      }
    }
  }
  .DrawLine_footer {
    padding-top: 10px;
    display: flex;
    justify-content: center;
  }
}
</style>
