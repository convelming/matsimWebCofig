<!-- TreeItem -->
<template>
  <div class="TreeItem GeoJSONItem" v-bind="$attrs">
    <div class="content">
      <el-checkbox v-model="check" :indeterminate="indeterminate" @change="handleChangeCheck" />
      <div class="text">{{ title }}</div>
      <el-icon v-if="!!download" size="20px" @click="downloadFile(download)"><Download /></el-icon>
      <el-icon v-if="loaded" size="20px" @click="handleSetCenterAndZoom"><Aim /></el-icon>
      <el-icon v-if="loaded" size="20px" @click="showDialog = true"><Setting /></el-icon>
      <el-icon v-if="loading" size="20px" class="is-loading"><Loading /></el-icon>
    </div>
  </div>

  <MDialog
    ref="treeRef"
    class="GeoJSONParams"
    title="样式配置"
    :subTitle="`数据下载 / ${title} / 样式配置`"
    :top="80"
    :left="80"
    width="400px"
    v-model:visible="showDialog"
  >
    <el-scrollbar class="flex-scrollbar">
      <div class="GeoJSONParams_body">
        <el-collapse class="collapse" v-model="activeNames" expand-icon-position="left">
          <!-- ******************************* PointSetting ******************************* -->
          <el-collapse-item title="点样式" name="PointSetting" v-if="hasPoint">
            <template #title>
              <el-checkbox v-model="geojsonParams.showPoints" @click.stop></el-checkbox>
              <span>点样式</span>
            </template>

            <el-form
              :model="geojsonParams"
              ref="form"
              label-width="auto"
              :inline="false"
              label-position="left"
            >
              <el-form-item label="透明度" prop="pointOpacity">
                <el-slider v-model="geojsonParams.pointOpacity" :min="0" :max="1" :step="0.1" />
              </el-form-item>
              <el-form-item label="点大小" prop="pointAutoSize">
                <el-input-number v-model="geojsonParams.pointAutoSize" :min="0" :step="0.1" />
              </el-form-item>
              <el-divider content-position="left"></el-divider>
              <el-form-item label="图例">
                <el-switch
                  v-model="showPointVM"
                  :active-value="true"
                  :inactive-value="false"
                  @change=""
                >
                </el-switch>
              </el-form-item>
              <el-form-item label="图例标题">
                <el-input v-model="titlePointVM"></el-input>
              </el-form-item>
              <el-divider content-position="left"></el-divider>
              <el-form-item label="颜色渲染模式" prop="pointColorType">
                <el-radio-group v-model="geojsonParams.pointColorType">
                  <el-radio-button label="color">单一颜色</el-radio-button>
                  <el-radio-button label="colorBar">分区颜色</el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-form-item
                label="颜色"
                prop="pointColor"
                v-if="geojsonParams.pointColorType === 'color'"
              >
                <el-color-picker v-model="geojsonParams.pointColor" />
                <span style="margin-left: 10px">{{ geojsonParams.pointColor }}</span>
              </el-form-item>
              <template v-if="geojsonParams.pointColorType === 'colorBar'">
                <!-- <el-form-item label="Icon" prop="pointIcon"></el-form-item> -->
                <el-form-item label="分区属性" prop="pointValue">
                  <el-select
                    v-model="geojsonParams.pointValue"
                    placeholder="请选择"
                    clearable
                    filterable
                  >
                    <el-option
                      v-for="(item, value) in properties"
                      :key="value"
                      :label="`${item.name}(${PType[item.type]})`"
                      :value="value"
                    />
                  </el-select>
                </el-form-item>
                <template v-if="pointColorBarParams.type == 'Number'">
                  <el-form-item label="自动分区模式">
                    <el-select style="width: 150px" v-model="pointColorBarParams.model" @change="">
                      <el-option label="Equal Count" value="count" />
                      <el-option label="Equal Interval" value="interval" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="自动分区数">
                    <el-input-number
                      v-model="pointColorBarParams.modelClass"
                      :min="1"
                      :step="1"
                      step-strictly
                    />
                  </el-form-item>
                  <el-form-item label="">
                    <div class="color_bar">
                      <el-button type="primary" @click="handleAutoGetColorBar('point')"
                        >自动生成颜色分区</el-button
                      >
                      <el-scrollbar style="width: 100%" height="220px">
                        <div class="color_bar">
                          <div
                            class="color_bar_item"
                            v-for="(row, $index) in geojsonParams.pointColorBar"
                          >
                            <el-checkbox v-model="row.use" />
                            <el-color-picker v-model="row.color" />
                            <el-input-number
                              class="label"
                              v-model="row.min"
                              :controls="false"
                              label="最小值"
                            />
                            <span>-</span>
                            <el-input-number
                              class="label"
                              v-model="row.max"
                              :controls="false"
                              label="最大值"
                            />
                            <el-icon size="20px" @click="handleDeleteColorBar('point', $index)"
                              ><Delete
                            /></el-icon>
                          </div>
                        </div>
                      </el-scrollbar>
                      <el-button
                        type="primary"
                        :icon="Plus"
                        @click="handleAddNumberColorBar('point')"
                      ></el-button>
                    </div>
                  </el-form-item>
                </template>
                <template v-if="pointColorBarParams.type == 'String'">
                  <el-form-item label="">
                    <el-scrollbar style="width: 100%" height="220px">
                      <div class="color_bar">
                        <div
                          class="color_bar_item"
                          v-for="(row, $index) in geojsonParams.pointColorBar"
                        >
                          <el-checkbox v-model="row.use" />
                          <el-color-picker v-model="row.color" />
                          <div class="label">{{ row.label }}</div>
                          <!-- <el-input class="label" v-model="row.label" title="图例名称"></el-input> -->
                        </div>
                      </div>
                    </el-scrollbar>
                  </el-form-item>
                </template>
              </template>
            </el-form>
          </el-collapse-item>
          <!-- ******************************* LineSetting ******************************* -->
          <el-collapse-item title="线样式" name="LineSetting" v-if="hasLine">
            <template #title>
              <el-checkbox v-model="geojsonParams.showLines" @click.stop></el-checkbox>
              <span>线样式</span>
            </template>

            <el-form
              :model="geojsonParams"
              ref="form"
              label-width="auto"
              :inline="false"
              label-position="left"
            >
              <el-form-item label="透明度" prop="lineOpacity">
                <el-slider v-model="geojsonParams.lineOpacity" :min="0" :max="1" :step="0.1" />
              </el-form-item>
              <el-form-item label="线宽" prop="lineAutoWidth">
                <el-input-number v-model="geojsonParams.lineAutoWidth" :min="0" :step="0.1" />
              </el-form-item>
              <el-form-item label="线偏移" prop="lineOffset">
                <el-input-number v-model="geojsonParams.lineOffset" :min="0" :step="0.1" />
              </el-form-item>
              <!-- <el-form-item label="WidthStyle" prop="lineWidthStyle">
                <el-select v-model="geojsonParams.lineWidthStyle">
                  <el-option
                    v-for="(value, label) in LINE_WIDTH_STYLE"
                    :key="value"
                    :label="label"
                    :value="value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="Animation" prop="lineAnimation">
                <el-input-number v-model="geojsonParams.lineAnimation" :min="0" :step="0.1" />
              </el-form-item> -->
              <el-form-item label="显示样式" prop="lineStyle">
                <el-radio-group v-model="geojsonParams.lineStyle">
                  <el-radio-button :label="LINE_STYLE.NONE">不显示</el-radio-button>
                  <el-radio-button :label="LINE_STYLE.SOLID">实线</el-radio-button>
                  <el-radio-button :label="LINE_STYLE.DASHED">虚线</el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-divider content-position="left"></el-divider>
              <el-form-item label="图例">
                <el-switch
                  v-model="showLineVM"
                  :active-value="true"
                  :inactive-value="false"
                  @change=""
                >
                </el-switch>
              </el-form-item>
              <el-form-item label="图例标题">
                <el-input v-model="titleLineVM"></el-input>
              </el-form-item>
              <el-divider content-position="left"></el-divider>
              <el-form-item label="颜色渲染模式" prop="lineColorType">
                <el-radio-group v-model="geojsonParams.lineColorType">
                  <el-radio-button label="color">单一颜色</el-radio-button>
                  <el-radio-button label="colorBar">分区颜色</el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-form-item
                label="颜色"
                prop="lineColor"
                v-if="geojsonParams.lineColorType === 'color'"
              >
                <el-color-picker v-model="geojsonParams.lineColor" />
                <span style="margin-left: 10px">{{ geojsonParams.lineColor }}</span>
              </el-form-item>
              <template v-if="geojsonParams.lineColorType === 'colorBar'">
                <el-form-item label="分区属性" prop="lineValue">
                  <el-select
                    v-model="geojsonParams.lineValue"
                    placeholder="请选择"
                    clearable
                    filterable
                  >
                    <el-option
                      v-for="(item, value) in properties"
                      :key="value"
                      :label="`${item.name}(${PType[item.type]})`"
                      :value="value"
                    />
                  </el-select>
                </el-form-item>
                <template v-if="lineColorBarParams.type == 'Number'">
                  <el-form-item label="自动分区模式">
                    <el-select style="width: 150px" v-model="lineColorBarParams.model" @change="">
                      <el-option label="Equal Count" value="count" />
                      <el-option label="Equal Interval" value="interval" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="自动分区数">
                    <el-input-number
                      v-model="lineColorBarParams.modelClass"
                      :min="1"
                      :step="1"
                      step-strictly
                    />
                  </el-form-item>
                  <el-form-item label="">
                    <div class="color_bar">
                      <el-button type="primary" @click="handleAutoGetColorBar('line')"
                        >自动生成颜色分区</el-button
                      >
                      <el-scrollbar style="width: 100%" height="220px">
                        <div class="color_bar">
                          <div
                            class="color_bar_item"
                            v-for="(row, $index) in geojsonParams.lineColorBar"
                          >
                            <el-checkbox v-model="row.use" />
                            <el-color-picker v-model="row.color" />
                            <el-input-number
                              class="label"
                              v-model="row.min"
                              :controls="false"
                              label="最小值"
                            />
                            <span>-</span>
                            <el-input-number
                              class="label"
                              v-model="row.max"
                              :controls="false"
                              label="最大值"
                            />
                            <el-icon size="20px" @click="handleDeleteColorBar('line', $index)"
                              ><Delete
                            /></el-icon>
                          </div>
                        </div>
                      </el-scrollbar>
                      <el-button
                        type="primary"
                        :icon="Plus"
                        @click="handleAddNumberColorBar('line')"
                      ></el-button>
                    </div>
                  </el-form-item>
                </template>
                <template v-if="lineColorBarParams.type == 'String'">
                  <el-form-item label="">
                    <el-scrollbar style="width: 100%" height="220px">
                      <div class="color_bar">
                        <div
                          class="color_bar_item"
                          v-for="(row, $index) in geojsonParams.lineColorBar"
                        >
                          <el-checkbox v-model="row.use" />
                          <el-color-picker v-model="row.color" />
                          <div class="label">{{ row.label }}</div>
                          <!-- <el-input class="label" v-model="row.label" title="图例名称"></el-input> -->
                        </div>
                      </div>
                    </el-scrollbar>
                  </el-form-item>
                </template>
              </template>
            </el-form>
          </el-collapse-item>
          <!-- ******************************* PolygonSetting ******************************* -->
          <el-collapse-item title="面样式" name="PolygonSetting" v-if="hasPolygon">
            <template #title>
              <el-checkbox v-model="geojsonParams.showPolygons" @click.stop></el-checkbox>
              <span>面样式</span>
            </template>

            <el-form
              :model="geojsonParams"
              ref="form"
              label-width="auto"
              :inline="false"
              label-position="left"
            >
              <el-form-item label="透明度" prop="polygonOpacity">
                <el-slider v-model="geojsonParams.polygonOpacity" :min="0" :max="1" :step="0.1" />
              </el-form-item>
              <el-divider content-position="left"></el-divider>
              <el-form-item label="边框样式" prop="polygonBorderStyle">
                <el-radio-group v-model="geojsonParams.polygonBorderStyle">
                  <el-radio-button :label="LINE_STYLE.NONE">不显示</el-radio-button>
                  <el-radio-button :label="LINE_STYLE.SOLID">实线</el-radio-button>
                  <el-radio-button :label="LINE_STYLE.DASHED">虚线</el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="边框透明度" prop="polygonBorderOpacity">
                <el-slider
                  v-model="geojsonParams.polygonBorderOpacity"
                  :min="0"
                  :max="1"
                  :step="0.1"
                />
              </el-form-item>
              <el-form-item label="边框宽度" prop="polygonBorderAutoWidth">
                <el-slider
                  v-model="geojsonParams.polygonBorderAutoWidth"
                  :min="0"
                  :max="10"
                  :step="0.1"
                />
              </el-form-item>
              <el-form-item label="边框颜色" prop="polygonBorderColor">
                <el-color-picker v-model="geojsonParams.polygonBorderColor" />
                <span style="margin-left: 10px">{{ geojsonParams.polygonBorderColor }}</span>
              </el-form-item>
              <el-divider content-position="left"></el-divider>
              <el-form-item label="图例">
                <el-switch
                  v-model="showPolygonVM"
                  :active-value="true"
                  :inactive-value="false"
                  @change=""
                >
                </el-switch>
              </el-form-item>
              <el-form-item label="图例标题">
                <el-input v-model="titlePolygonVM"></el-input>
              </el-form-item>
              <el-divider content-position="left"></el-divider>
              <!-- <el-form-item label="Value3D" prop="polygonValue3D">
                <el-select
                  v-model="geojsonParams.polygonValue3D"
                  placeholder="请选择"
                  clearable
                  filterable
                >
                  <el-option
                    v-for="(item, value) in properties"
                    :key="value"
                    :label="item.name"
                    :value="value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="Scale3D" prop="polygonScale3D"></el-form-item>
              <el-divider content-position="left"></el-divider> -->
              <el-form-item label="颜色渲染模式" prop="polygonColorType">
                <el-radio-group v-model="geojsonParams.polygonColorType">
                  <el-radio-button label="color">单一颜色</el-radio-button>
                  <el-radio-button label="colorBar">分区颜色</el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-form-item
                label="颜色"
                prop="polygonColor"
                v-if="geojsonParams.polygonColorType === 'color'"
              >
                <el-color-picker v-model="geojsonParams.polygonColor" />
                <span style="margin-left: 10px">{{ geojsonParams.polygonColor }}</span>
              </el-form-item>
              <template v-if="geojsonParams.polygonColorType === 'colorBar'">
                <!-- <el-form-item label="Icon" prop="polygonIcon"></el-form-item> -->
                <el-form-item label="分区属性" prop="polygonValue">
                  <el-select
                    v-model="geojsonParams.polygonValue"
                    placeholder="请选择"
                    clearable
                    filterable
                  >
                    <el-option
                      v-for="(item, value) in properties"
                      :key="value"
                      :label="`${item.name}(${PType[item.type]})`"
                      :value="value"
                    />
                  </el-select>
                </el-form-item>
                <template v-if="polygonColorBarParams.type == 'Number'">
                  <el-form-item label="自动分区模式">
                    <el-select
                      style="width: 150px"
                      v-model="polygonColorBarParams.model"
                      @change=""
                    >
                      <el-option label="Equal Count" value="count" />
                      <el-option label="Equal Interval" value="interval" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="自动分区数">
                    <el-input-number
                      v-model="polygonColorBarParams.modelClass"
                      :min="1"
                      :step="1"
                      step-strictly
                    />
                  </el-form-item>
                  <el-form-item label="">
                    <div class="color_bar">
                      <el-button type="primary" @click="handleAutoGetColorBar('polygon')"
                        >自动生成颜色分区</el-button
                      >
                      <el-scrollbar style="width: 100%" height="220px">
                        <div class="color_bar">
                          <div
                            class="color_bar_item"
                            v-for="(row, $index) in geojsonParams.polygonColorBar"
                          >
                            <el-checkbox v-model="row.use" />
                            <el-color-picker v-model="row.color" />
                            <el-input-number
                              class="label"
                              v-model="row.min"
                              :controls="false"
                              label="最小值"
                            />
                            <span>-</span>
                            <el-input-number
                              class="label"
                              v-model="row.max"
                              :controls="false"
                              label="最大值"
                            />
                            <el-icon size="20px" @click="handleDeleteColorBar('polygon', $index)"
                              ><Delete
                            /></el-icon>
                          </div>
                        </div>
                      </el-scrollbar>
                      <el-button
                        type="primary"
                        :icon="Plus"
                        @click="handleAddNumberColorBar('polygon')"
                      ></el-button>
                    </div>
                  </el-form-item>
                </template>
                <template v-if="polygonColorBarParams.type == 'String'">
                  <el-form-item label="">
                    <el-scrollbar style="width: 100%" height="220px">
                      <div class="color_bar">
                        <div
                          class="color_bar_item"
                          v-for="(row, $index) in geojsonParams.polygonColorBar"
                        >
                          <el-checkbox v-model="row.use" />
                          <el-color-picker v-model="row.color" />
                          <div class="label">{{ row.label }}</div>
                          <!-- <el-input class="label" v-model="row.label" title="图例名称"></el-input> -->
                        </div>
                      </div>
                    </el-scrollbar>
                  </el-form-item>
                </template>
              </template>
            </el-form>
          </el-collapse-item>
        </el-collapse>
      </div>
    </el-scrollbar>
    <div class="GeoJSONParams_footer">
      <el-button @click="handleResetConfig">重置</el-button>
      <el-button @click="handleImportConfig">加载配置</el-button>
      <el-button type="primary" @click="handleExportConfig">下载配置文件</el-button>
    </div>
  </MDialog>

  <GeoJSONVM
    v-model:visible="showPointVM"
    v-model:title="titlePointVM"
    :list="geojsonParams.pointColorBar"
    :type="pointColorBarParams.type"
  />
  <GeoJSONVM
    v-model:visible="showLineVM"
    :title="titleLineVM"
    :list="geojsonParams.lineColorBar"
    :type="lineColorBarParams.type"
  />
  <GeoJSONVM
    v-model:visible="showPolygonVM"
    v-model:title="titlePolygonVM"
    :list="geojsonParams.polygonColorBar"
    :type="polygonColorBarParams.type"
  />
</template>

<script setup name="GeoJSONItem">
import GeoJSONVM from './GeoJSONVM.vue'
import { initCheck, initRange } from '../mixins'
import { Setting, Download, Loading, Delete, Plus, Aim } from '@element-plus/icons-vue'
import {
  GeoJSONLayer,
  getGeoJSONLayerParams,
  parserGeoJSON,
  LINE_STYLE,
  LINE_WIDTH_STYLE,
} from '@/utils/MapLayer/GeoJSONLayer'
import { getColorBarByPropertie } from '@/utils/MapLayer/ColorBar2DUtil'
import {
  injectSync,
  addWatch,
  selectFile,
  fileToString,
  stringToFile,
  downloadFile,
  guid,
} from '@/utils/index'

import { saveAs } from 'file-saver'
import { toRaw } from 'vue'

const NumberColorBarKey = '_self_Number_self_'
const PType = {
  Number: '数值',
  String: '类别',
}
const { proxy } = getCurrentInstance()
const emit = defineEmits(['check-change', 'update-range'])
const props = defineProps({
  id: String,
  title: String,
  type: String,
  children: Object,
  check: Boolean,
  path: String,
  download: String,
  config: String,
})

const { check, indeterminate, getCheck, setCheck, handleChangeCheck } = initCheck(
  { emit },
  props.check,
)
const { range, getRange, handleSetCenterAndZoom } = initRange(
  { emit, check, indeterminate },
  props.check,
)

let _Map = null
const geojsonParams = ref({
  ...getGeoJSONLayerParams(),
  // ******************** 点 ******************** //
  pointColorType: 'color',
  // ******************** 线 ******************** //
  lineColorType: 'color',
  // ******************** 面 ******************** //
  polygonColorType: 'color',
})
const _GeoJSONLayer = new GeoJSONLayer(geojsonParams.value)

const activeNames = ref(['PointSetting', 'LineSetting', 'PolygonSetting'])
const loaded = ref(false)
const loading = ref(false)
const hasPoint = ref(false)
const hasLine = ref(false)
const hasPolygon = ref(false)
const properties = ref([])
const pointColorBarParams = ref({})
const lineColorBarParams = ref({})
const polygonColorBarParams = ref({})
const showPointVM = ref(false)
const titlePointVM = ref('')
const showLineVM = ref(false)
const titleLineVM = ref('')
const showPolygonVM = ref(false)
const titlePolygonVM = ref('')

let pointColorBarMap = {}
let lineColorBarMap = {}
let polygonColorBarMap = {}

const id = guid()
const showDialog = ref(false)
const showGeoJSONParams = inject('showGeoJSONParams')
const watchShowDialog = addWatch(showDialog, (val) => {
  if (val) showGeoJSONParams.value[id] = true
  else showGeoJSONParams.value[id] = false
})

addWatch(
  geojsonParams,
  (val) => {
    _GeoJSONLayer.setParams(val)
  },
  {
    deep: true,
  },
)

const watchCheck = addWatch(check, (val) => {
  if (_Map && val) _Map.addLayer(_GeoJSONLayer)
  else _GeoJSONLayer.removeFromParent()
  if (val && !loaded.value) loadData()
  if (val && loaded.value) handleSetCenterAndZoom()
})

function handleChangePointValue(val, old) {
  try {
    const oldData = properties.value[old]
    if (oldData && oldData.type == 'Number') {
      pointColorBarMap[NumberColorBarKey] = toRaw(geojsonParams.value.pointColorBar)
    } else if (oldData && oldData.type == 'Number') {
      pointColorBarMap[oldData.name] = toRaw(geojsonParams.value.pointColorBar)
    }

    const data = properties.value[val]
    if (data && data.type == 'Number') {
      pointColorBarParams.value = {
        type: 'Number',
        model: 'count', // count interval
        modelClass: 5,
        labelRule: undefined, // null || undefined 使用`${min} ~ ${max}` en 使用字母顺序
        toFixed: 2,
        colorList: ['#FEE0D2', '#B50404'],
      }
      geojsonParams.value.pointColorBar =
        pointColorBarMap[NumberColorBarKey] ||
        getColorBarByPropertie(data, pointColorBarParams.value)
    } else if (data && data.type == 'String') {
      pointColorBarParams.value = {
        type: 'String',
        colorList: [
          '#91cc75',
          '#fac858',
          '#ee6666',
          '#73c0de',
          '#3ba272',
          '#fc8452',
          '#9a60b4',
          '#ea7ccc',
        ],
      }
      geojsonParams.value.pointColorBar =
        pointColorBarMap[data.name] || getColorBarByPropertie(data, pointColorBarParams.value)
    }
  } catch (error) {
    pointColorBarParams.value = {}
  }
}
function handleChangeLineValue(val, old) {
  try {
    const oldData = properties.value[old]
    if (oldData && oldData.type == 'Number') {
      lineColorBarMap[NumberColorBarKey] = toRaw(geojsonParams.value.lineColorBar)
    } else if (oldData && oldData.type == 'Number') {
      lineColorBarMap[oldData.name] = toRaw(geojsonParams.value.lineColorBar)
    }

    const data = properties.value[val]
    if (data && data.type == 'Number') {
      lineColorBarParams.value = {
        type: 'Number',
        model: 'count', // count interval
        modelClass: 5,
        labelRule: undefined, // null || undefined 使用`${min} ~ ${max}` en 使用字母顺序
        toFixed: 2,
        colorList: ['#FEE0D2', '#B50404'],
      }
      geojsonParams.value.lineColorBar =
        lineColorBarMap[NumberColorBarKey] || getColorBarByPropertie(data, lineColorBarParams.value)
    } else if (data && data.type == 'String') {
      lineColorBarParams.value = {
        type: 'String',
        colorList: [
          '#91cc75',
          '#fac858',
          '#ee6666',
          '#73c0de',
          '#3ba272',
          '#fc8452',
          '#9a60b4',
          '#ea7ccc',
        ],
      }
      geojsonParams.value.lineColorBar =
        lineColorBarMap[data.name] || getColorBarByPropertie(data, lineColorBarParams.value)
    }
  } catch (error) {
    lineColorBarParams.value = {}
  }
}
function handleChangePolygonValue(val, old) {
  try {
    const oldData = properties.value[old]
    if (oldData && oldData.type == 'Number') {
      polygonColorBarMap[NumberColorBarKey] = toRaw(geojsonParams.value.polygonColorBar)
    } else if (oldData && oldData.type == 'Number') {
      polygonColorBarMap[oldData.name] = toRaw(geojsonParams.value.polygonColorBar)
    }

    const data = properties.value[val]
    if (data && data.type == 'Number') {
      polygonColorBarParams.value = {
        type: 'Number',
        model: 'count', // count interval
        modelClass: 5,
        labelRule: undefined, // null || undefined 使用`${min} ~ ${max}` en 使用字母顺序
        toFixed: 2,
        colorList: ['#FEE0D2', '#B50404'],
      }
      geojsonParams.value.polygonColorBar =
        polygonColorBarMap[NumberColorBarKey] ||
        getColorBarByPropertie(data, polygonColorBarParams.value)
    } else if (data && data.type == 'String') {
      polygonColorBarParams.value = {
        type: 'String',
        colorList: [
          '#91cc75',
          '#fac858',
          '#ee6666',
          '#73c0de',
          '#3ba272',
          '#fc8452',
          '#9a60b4',
          '#ea7ccc',
        ],
      }
      geojsonParams.value.polygonColorBar =
        polygonColorBarMap[data.name] || getColorBarByPropertie(data, polygonColorBarParams.value)
    }
  } catch (error) {
    polygonColorBarParams.value = {}
  }
}

async function loadData() {
  if (loading.value) return
  loading.value = true

  Promise.all([
    fetch(props.path)
      .then((res) => res.text())
      .then((str) => parserGeoJSON(str, { noGeomList: true }))
      .then((json) => {
        hasPoint.value = json.pointArray.length > 0
        hasLine.value = json.lineArray.length > 0
        hasPolygon.value = json.polygonArray.length > 0
        properties.value = json.propertiesLabels
        _GeoJSONLayer.setGeoJsonData(json)

        range.value = [
          [json.range.maxx, json.range.maxy],
          [json.range.minx, json.range.miny],
        ]
        handleSetCenterAndZoom()
        loaded.value = true
        loading.value = false
      })
      .catch((error) => {
        console.log(error)
        loaded.value = false
        loading.value = false
      }),

    fetch(props.config)
      .then((res) => res.json())
      .then(handleSetConfig)
      .catch((error) => {
        console.log(error)
      }),
  ]).finally(() => {
    addWatch(() => geojsonParams.value.pointValue, handleChangePointValue)
    addWatch(() => geojsonParams.value.lineValue, handleChangeLineValue)
    addWatch(() => geojsonParams.value.polygonValue, handleChangePolygonValue)
  })
}
function handleAutoGetColorBar(key) {
  try {
    switch (key) {
      case 'point':
        {
          const data = properties.value[geojsonParams.value.pointValue]
          geojsonParams.value.pointColorBar = getColorBarByPropertie(
            data,
            pointColorBarParams.value,
          )
        }
        break
      case 'line':
        {
          const data = properties.value[geojsonParams.value.lineValue]
          geojsonParams.value.lineColorBar = getColorBarByPropertie(data, lineColorBarParams.value)
        }
        break
      case 'polygon':
        {
          const data = properties.value[geojsonParams.value.polygonValue]
          geojsonParams.value.polygonColorBar = getColorBarByPropertie(
            data,
            polygonColorBarParams.value,
          )
        }
        break
    }
  } catch (error) {
    console.error(error)
  }
}
function handleDeleteColorBar(key, index) {
  try {
    switch (key) {
      case 'point':
        {
          geojsonParams.value.pointColorBar.splice(index, 1)
        }
        break
      case 'line':
        {
          geojsonParams.value.lineColorBar.splice(index, 1)
        }
        break
      case 'polygon':
        {
          geojsonParams.value.polygonColorBar.splice(index, 1)
        }
        break
    }
  } catch (error) {
    console.error(error)
  }
}
function handleAddNumberColorBar(key) {
  try {
    let item = {
      min: 0,
      max: 0,
      range: [0, 0],
      color: '',
      label: '',
      use: true,
    }
    switch (key) {
      case 'point':
        {
          geojsonParams.value.pointColorBar.push(item)
        }
        break
      case 'line':
        {
          geojsonParams.value.lineColorBar.push(item)
        }
        break
      case 'polygon':
        {
          geojsonParams.value.polygonColorBar.push(item)
        }
        break
    }
  } catch (error) {
    console.error(error)
  }
}

function handleAddStringColorBar(key) {
  try {
    let item = {
      min: mi - 0.5,
      max: mi + 0.5,
      range: [data.min, data.max],
      color: color,
      label: mk == 'null' || !mk ? '未知' : mk,
      use: true,
    }
    switch (key) {
      case 'point':
        {
          geojsonParams.value.pointColorBar.push(item)
        }
        break
      case 'line':
        {
          geojsonParams.value.lineColorBar.push(item)
        }
        break
      case 'polygon':
        {
          geojsonParams.value.polygonColorBar.push(item)
        }
        break
    }
  } catch (error) {
    console.error(error)
  }
}

function handleImportConfig() {
  selectFile()
    .then((file) => fileToString(file))
    .then((configJsonStr) => JSON.parse(configJsonStr))
    .then(handleSetConfig)
}
function handleExportConfig() {
  const pointData = properties.value[geojsonParams.value.pointValue]
  if (pointData && pointData.type == 'Number') {
    pointColorBarMap[NumberColorBarKey] = toRaw(geojsonParams.value.pointColorBar)
  } else if (pointData && pointData.type == 'Number') {
    pointColorBarMap[pointData.name] = toRaw(geojsonParams.value.pointColorBar)
  }
  const lineData = properties.value[geojsonParams.value.lineValue]
  if (lineData && lineData.type == 'Number') {
    lineColorBarMap[NumberColorBarKey] = toRaw(geojsonParams.value.lineColorBar)
  } else if (lineData && lineData.type == 'Number') {
    lineColorBarMap[lineData.name] = toRaw(geojsonParams.value.lineColorBar)
  }
  const polygonData = properties.value[geojsonParams.value.polygonValue]
  if (polygonData && polygonData.type == 'Number') {
    polygonColorBarMap[NumberColorBarKey] = toRaw(geojsonParams.value.polygonColorBar)
  } else if (polygonData && polygonData.type == 'Number') {
    polygonColorBarMap[polygonData.name] = toRaw(geojsonParams.value.polygonColorBar)
  }

  const config = {
    geojsonParams: geojsonParams.value,
    pointColorBarParams: pointColorBarParams.value,
    lineColorBarParams: lineColorBarParams.value,
    polygonColorBarParams: polygonColorBarParams.value,
    pointColorBarMap: pointColorBarMap,
    lineColorBarMap: lineColorBarMap,
    polygonColorBarMap: polygonColorBarMap,
  }
  const blob = new Blob([JSON.stringify(config)], { type: 'application/json' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  // link.download = `${props.title}_${proxy.$moment().format('YYYYMMDDHHmmss')}.config.json`
  const fileName = props.path.split('/').pop().split('.')[0]
  link.download = `${fileName}.config.json`
  link.click()
  URL.revokeObjectURL(link.href)
}

function handleResetConfig() {
  fetch(props.config)
    .then((res) => res.json())
    .then(handleSetConfig)
    .catch((error) => {
      geojsonParams.value = {
        ...getGeoJSONLayerParams(),
        // ******************** 点 ******************** //
        pointColorType: 'color',
        // ******************** 线 ******************** //
        lineColorType: 'color',
        // ******************** 面 ******************** //
        polygonColorType: 'color',
      }
    })
}

function handleSetConfig(configJson) {
  if (configJson.geojsonParams) geojsonParams.value = configJson.geojsonParams
  if (configJson.pointColorBarParams) pointColorBarParams.value = configJson.pointColorBarParams
  if (configJson.lineColorBarParams) lineColorBarParams.value = configJson.lineColorBarParams
  if (configJson.polygonColorBarParams)
    polygonColorBarParams.value = configJson.polygonColorBarParams
  if (configJson.pointColorBarMap) pointColorBarMap = configJson.pointColorBarMap
  if (configJson.lineColorBarMap) lineColorBarMap = configJson.lineColorBarMap
  if (configJson.polygonColorBarMap) polygonColorBarMap = configJson.polygonColorBarMap
}

injectSync('MapRef').then((map) => {
  _Map = map.value
  watchCheck.callback(check.value)
})

onUnmounted(() => {
  watchShowDialog.callback(false)
  _GeoJSONLayer.dispose()
})
defineExpose({
  getCheck,
  setCheck,
  getRange,
})
</script>

<style lang="scss" scoped src="../style.scss" />

<style lang="scss" scoped>
.flex-scrollbar {
  max-height: calc(100vh - 300px);
  min-height: 200px;
}
.GeoJSONItem {
  .content {
    padding-left: 20px;
  }
}
.GeoJSONParams_body {
  position: relative;
  padding: 20px;

  :deep(.el-collapse-item__title) {
    font-size: 16px;
    display: flex;
    gap: 5px;
    align-items: center;
  }
  :deep(.el-collapse-item__content) {
    padding: 0 15px;
  }
}
.GeoJSONParams_footer {
  padding: 10px 20px 20px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.color_bar {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  .color_bar_item {
    display: flex;
    align-items: center;
    gap: 10px;
    .label {
      flex: 1;
      width: 0;
      // 单行显示
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .el-icon {
      cursor: pointer;
      &:hover {
        color: var(--el-color-danger);
      }
    }
  }
}

.GeoJSONVM {
}
</style>
