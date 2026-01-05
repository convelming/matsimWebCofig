<!-- TreeItem -->
<template>
  <div class="TreeItem GeoJSONItem">
    <div class="content">
      <el-checkbox v-model="check" :indeterminate="indeterminate" @change="handleChangeCheck" />
      <div class="text">{{ title }}</div>
      <el-icon v-if="!!download" size="20px" @click="handleDownload"><Download /></el-icon>
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
          <el-collapse-item title="PointSetting" name="PointSetting" v-if="!hasPoint">
            <template #title>
              <el-checkbox v-model="geojsonParams.showPoints" @click.stop></el-checkbox>
              <span>PointSetting</span>
            </template>

            <el-form
              :model="geojsonParams"
              ref="form"
              label-width="auto"
              :inline="false"
              label-position="left"
            >
              <el-form-item label="Opacity" prop="pointOpacity">
                <el-slider v-model="geojsonParams.pointOpacity" :min="0" :max="1" :step="0.1" />
              </el-form-item>
              <el-form-item label="Size" prop="pointAutoSize">
                <el-input-number v-model="geojsonParams.pointAutoSize" :min="0" :step="0.1" />
              </el-form-item>
              <el-divider content-position="left"></el-divider>
              <el-form-item label="ColorType" prop="pointColorType">
                <el-radio-group v-model="geojsonParams.pointColorType">
                  <el-radio-button label="color">单一颜色</el-radio-button>
                  <el-radio-button label="colorBar">分区颜色</el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-form-item
                label="Color"
                prop="pointColor"
                v-if="geojsonParams.pointColorType === 'color'"
              >
                <el-color-picker v-model="geojsonParams.pointColor" />
                <span style="margin-left: 10px">{{ geojsonParams.pointColor }}</span>
              </el-form-item>
              <template v-if="geojsonParams.pointColorType === 'colorBar'">
                <!-- <el-form-item label="Icon" prop="pointIcon"></el-form-item> -->
                <el-form-item label="Value" prop="pointValue">
                  <el-select
                    v-model="geojsonParams.pointValue"
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
                <template v-if="pointColorBarParams.type == 'Number'">
                  <el-form-item label="分区模式">
                    <el-select
                      style="width: 150px"
                      v-model="pointColorBarParams.model"
                      @change=""
                    >
                      <el-option label="Equal Count" value="count" />
                      <el-option label="Equal Interval" value="interval" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="分区数">
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
                        >自动生成</el-button
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
                          <el-input class="label" v-model="row.label"></el-input>
                        </div>
                      </div>
                    </el-scrollbar>
                  </el-form-item>
                </template>
              </template>
            </el-form>
          </el-collapse-item>
          <!-- ******************************* LineSetting ******************************* -->
          <el-collapse-item title="LineSetting" name="LineSetting" v-if="!hasLine">
            <template #title>
              <el-checkbox v-model="geojsonParams.showLines" @click.stop></el-checkbox>
              <span>LineSetting</span>
            </template>

            <el-form
              :model="geojsonParams"
              ref="form"
              label-width="auto"
              :inline="false"
              label-position="left"
            >
              <el-form-item label="Opacity" prop="lineOpacity">
                <el-slider v-model="geojsonParams.lineOpacity" :min="0" :max="1" :step="0.1" />
              </el-form-item>
              <el-form-item label="Color" prop="lineColor">
                <el-color-picker v-model="geojsonParams.lineColor" />
                <span style="margin-left: 10px">{{ geojsonParams.lineColor }}</span>
              </el-form-item>
              <el-form-item label="Width" prop="lineAutoWidth">
                <el-input-number v-model="geojsonParams.lineAutoWidth" :min="0" :step="0.1" />
              </el-form-item>
              <el-form-item label="Offset" prop="lineOffset">
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
              <el-form-item label="Style" prop="lineStyle">
                <el-radio-group v-model="geojsonParams.lineWidthStyle">
                  <el-radio-button :label="LINE_STYLE.NONE">不显示</el-radio-button>
                  <el-radio-button :label="LINE_STYLE.SOLID">实线</el-radio-button>
                  <el-radio-button :label="LINE_STYLE.DASHED">虚线</el-radio-button>
                </el-radio-group>
              </el-form-item>
              
              <el-divider content-position="left"></el-divider>
              <el-form-item label="ColorType" prop="lineColorType">
                <el-radio-group v-model="geojsonParams.lineColorType">
                  <el-radio-button label="color">单一颜色</el-radio-button>
                  <el-radio-button label="colorBar">分区颜色</el-radio-button>
                </el-radio-group>
              </el-form-item> 
              <el-form-item
                label="Color"
                prop="lineColor"
                v-if="geojsonParams.lineColorType === 'color'"
              >
                <el-color-picker v-model="geojsonParams.lineColor" />
                <span style="margin-left: 10px">{{ geojsonParams.lineColor }}</span>
              </el-form-item>
              <template v-if="geojsonParams.lineColorType === 'colorBar'">
                <el-form-item label="Value" prop="lineValue">
                  <el-select
                    v-model="geojsonParams.lineValue"
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
                <template v-if="lineColorBarParams.type == 'Number'">
                  <el-form-item label="分区模式">
                    <el-select
                      style="width: 150px"
                      v-model="lineColorBarParams.model"
                      @change=""
                    >
                      <el-option label="Equal Count" value="count" />
                      <el-option label="Equal Interval" value="interval" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="分区数">
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
                        >自动生成</el-button
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
                          <el-input class="label" v-model="row.label"></el-input>
                        </div>
                      </div>
                    </el-scrollbar>
                  </el-form-item>
                </template>
              </template>
            </el-form>
          </el-collapse-item>
          <!-- ******************************* PolygonSetting ******************************* -->
          <el-collapse-item title="PolygonSetting" name="PolygonSetting" v-if="hasPolygon">
            <template #title>
              <el-checkbox v-model="geojsonParams.showPolygons" @click.stop></el-checkbox>
              <span>PolygonSetting</span>
            </template>

            <el-form
              :model="geojsonParams"
              ref="form"
              label-width="auto"
              :inline="false"
              label-position="left"
            >
              <el-form-item label="Opacity" prop="polygonOpacity">
                <el-slider v-model="geojsonParams.polygonOpacity" :min="0" :max="1" :step="0.1" />
              </el-form-item>
              <el-divider content-position="left"></el-divider>
              <el-form-item label="BorderStyle" prop="polygonBorderStyle">
                <el-radio-group v-model="geojsonParams.polygonBorderStyle">
                  <el-radio-button :label="LINE_STYLE.NONE">不显示</el-radio-button>
                  <el-radio-button :label="LINE_STYLE.SOLID">实线</el-radio-button>
                  <el-radio-button :label="LINE_STYLE.DASHED">虚线</el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="BorderOpacity" prop="polygonBorderOpacity">
                <el-slider
                  v-model="geojsonParams.polygonBorderOpacity"
                  :min="0"
                  :max="1"
                  :step="0.1"
                />
              </el-form-item>
              <el-form-item label="BorderWidth" prop="polygonBorderAutoWidth">
                <el-slider
                  v-model="geojsonParams.polygonBorderAutoWidth"
                  :min="0"
                  :max="10"
                  :step="0.1"
                />
              </el-form-item>
              <el-form-item label="BorderColor" prop="polygonBorderColor">
                <el-color-picker v-model="geojsonParams.polygonBorderColor" />
                <span style="margin-left: 10px">{{ geojsonParams.polygonBorderColor }}</span>
              </el-form-item>
              <el-divider content-position="left"></el-divider>
              <el-form-item label="Value3D" prop="polygonValue3D">
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
              <el-divider content-position="left"></el-divider>
              <el-form-item label="ColorType" prop="polygonColorType">
                <el-radio-group v-model="geojsonParams.polygonColorType">
                  <el-radio-button label="color">单一颜色</el-radio-button>
                  <el-radio-button label="colorBar">分区颜色</el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-form-item
                label="Color"
                prop="polygonColor"
                v-if="geojsonParams.polygonColorType === 'color'"
              >
                <el-color-picker v-model="geojsonParams.polygonColor" />
                <span style="margin-left: 10px">{{ geojsonParams.polygonColor }}</span>
              </el-form-item>
              <template v-if="geojsonParams.polygonColorType === 'colorBar'">
                <!-- <el-form-item label="Icon" prop="polygonIcon"></el-form-item> -->
                <el-form-item label="Value" prop="polygonValue">
                  <el-select
                    v-model="geojsonParams.polygonValue"
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
                <template v-if="polygonColorBarParams.type == 'Number'">
                  <el-form-item label="分区模式">
                    <el-select
                      style="width: 150px"
                      v-model="polygonColorBarParams.model"
                      @change=""
                    >
                      <el-option label="Equal Count" value="count" />
                      <el-option label="Equal Interval" value="interval" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="分区数">
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
                        >自动生成</el-button
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
                          <el-input class="label" v-model="row.label"></el-input>
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
  </MDialog>
</template>

<script setup>
import { initCheck } from './mixins'
import { Setting, Download, Loading, Delete, Plus } from '@element-plus/icons-vue'
import {
  GeoJSONLayer,
  getGeoJSONLayerParams,
  parserGeoJSON,
  LINE_STYLE,
  LINE_WIDTH_STYLE,
} from '@/utils/MapLayer/GeoJSONLayer'
import { getColorBarByPropertie } from '@/utils/MapLayer/ColorBar2DUtil'
import { injectSync, addWatch } from '@/utils/index'
import { getCurrentInstance, inject, onUnmounted, reactive, ref } from 'vue'

const emit = defineEmits(['check-change'])
const props = defineProps({
  id: String,
  title: String,
  type: String,
  children: Object,
  check: Boolean,
  path: String,
  download: String,
})

const { check, indeterminate, getCheck, setCheck, handleChangeCheck } = initCheck({ emit })

let _Map = null
const geojsonParams = reactive({
  ...getGeoJSONLayerParams(),
  // ******************** 点 ******************** //
  pointColorType: 'color',
  // ******************** 线 ******************** //
  lineColorType: 'color',
  // ******************** 面 ******************** //
  polygonColorType: 'color',
})
const _GeoJSONLayer = new GeoJSONLayer(geojsonParams)

const activeNames = ref(['PointSetting', 'PolygonSetting'])
const loaded = ref(false)
const loading = ref(false)
const showGeoJSONParams = inject('showGeoJSONParams')
const showDialog = ref(false)
const hasPoint = ref(false)
const hasLine = ref(false)
const hasPolygon = ref(false)
const properties = ref([])
const pointColorBarParams = ref({})
const lineColorBarParams = ref({})
const polygonColorBarParams = ref({})

const watchShowDialog = addWatch(showDialog, (val) => {
  if (val) showGeoJSONParams.value++
  else showGeoJSONParams.value--
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
addWatch(
  () => geojsonParams.pointValue,
  () => {
    try {
      const data = properties.value[geojsonParams.pointValue]
      if (data.type == 'Number') {
        pointColorBarParams.value = {
          type: 'Number',
          model: 'count', // count interval
          modelClass: 5,
          labelRule: undefined, // null || undefined 使用`${min} ~ ${max}` en 使用字母顺序
          toFixed: 2,
          colorList: ['#FEE0D2', '#B50404'],
        }
      } else if (data.type == 'String') {
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
      }
      geojsonParams.pointColorBar = getColorBarByPropertie(data, pointColorBarParams.value)
    } catch (error) {
      pointColorBarParams.value = {}
    }
  },
)
addWatch(
  () => geojsonParams.polygonValue,
  () => {
    try {
      const data = properties.value[geojsonParams.polygonValue]
      if (data.type == 'Number') {
        polygonColorBarParams.value = {
          type: 'Number',
          model: 'count', // count interval
          modelClass: 5,
          labelRule: undefined, // null || undefined 使用`${min} ~ ${max}` en 使用字母顺序
          toFixed: 2,
          colorList: ['#FEE0D2', '#B50404'],
        }
      } else if (data.type == 'String') {
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
      }
      handleAutoGetColorBar('polygon')
    } catch (error) {
      polygonColorBarParams.value = {}
    }
  },
)

const watchCheck = addWatch(check, (val) => {
  if (_Map && val) _Map.addLayer(_GeoJSONLayer)
  else _GeoJSONLayer.removeFromParent()
  if (val && !loaded.value) loadData()
})

function handleDownload() {
  const url = props.download
  const el = document.createElement('a')
  // 获取文件后缀
  const ext = url.split('.').pop()
  el.style = 'position: absolute; left: -9999px;'
  el.href = url
  el.download = props.title + '.' + ext

  document.body.appendChild(el)
  el.click()
  document.body.removeChild(el)
}

async function loadData() {
  if (loading.value) return
  loading.value = true
  try {
    const res = await fetch(props.path)
    const data = await res.text()
    const json = await parserGeoJSON(data)
    hasPoint.value = json.pointArray.length > 0
    hasLine.value = json.lineArray.length > 0
    hasPolygon.value = json.polygonArray.length > 0
    properties.value = json.propertiesLabels
    console.log(json)

    _GeoJSONLayer.setGeoJsonData(json)
    loaded.value = true
    loading.value = false
  } catch (error) {
    console.log(error)
    loaded.value = false
    loading.value = false
  }
}
function handleAutoGetColorBar(key) {
  try {
    switch (key) {
      case 'point':
        {
          const data = properties.value[geojsonParams.pointValue]
          geojsonParams.pointColorBar = getColorBarByPropertie(data, pointColorBarParams.value)
        }
        break
      case 'line':
        {
          const data = properties.value[geojsonParams.lineValue]
          geojsonParams.lineColorBar = getColorBarByPropertie(data, lineColorBarParams.value)
        }
        break
      case 'polygon':
        {
          const data = properties.value[geojsonParams.polygonValue]
          geojsonParams.polygonColorBar = getColorBarByPropertie(data, polygonColorBarParams.value)
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
          geojsonParams.pointColorBar.splice(index, 1)
        }
        break
      case 'line':
        {
          geojsonParams.lineColorBar.splice(index, 1)
        }
        break
      case 'polygon':
        {
          geojsonParams.polygonColorBar.splice(index, 1)
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
          geojsonParams.pointColorBar.push(item)
        }
        break
      case 'line':
        {
          geojsonParams.lineColorBar.push(item)
        }
        break
      case 'polygon':
        {
          geojsonParams.polygonColorBar.push(item)
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
          geojsonParams.pointColorBar.push(item)
        }
        break
      case 'line':
        {
          geojsonParams.lineColorBar.push(item)
        }
        break
      case 'polygon':
        {
          geojsonParams.polygonColorBar.push(item)
        }
        break
    }
  } catch (error) {
    console.error(error)
  }
}

injectSync('MapRef').then((map) => {
  _Map = map.value
  watchCheck.callback(check.value)
})

onUnmounted(() => {
  watchShowDialog.callback(!showDialog.value)
  _GeoJSONLayer.dispose()
})
defineExpose({
  getCheck,
  setCheck,
})
</script>

<style lang="scss" scoped src="./style.scss" />

<style lang="scss" scoped>
.flex-scrollbar {
  max-height: calc(100vh - 200px);
  min-height: 200px;
}
.GeoJSONItem {
  .content {
    padding-left: 20px;
    .el-icon :hover {
      color: var(--el-color-success);
    }
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
  :deep(.el-collapse-item__content){
    padding: 0 15px;
  }
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
</style>
