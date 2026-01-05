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
        <el-form
          :model="geojsonParams"
          ref="form"
          label-width="auto"
          :inline="false"
          label-position="left"
        >
          <el-collapse class="collapse" v-model="activeNames" expand-icon-position="left">
            <!-- ******************************* PointSetting ******************************* -->
            <el-collapse-item title="PointSetting" name="PointSetting">
              <template #title>
                <el-checkbox v-model="geojsonParams.showPoints" @click.stop></el-checkbox>
                <span>PointSetting</span>
              </template>
              <el-form-item label="Opacity" prop="pointOpacity">
                <el-slider v-model="geojsonParams.pointOpacity" :min="0" :max="1" :step="0.1" />
              </el-form-item>
              <el-form-item label="Color" prop="pointColor">
                <el-color-picker v-model="geojsonParams.pointColor" />
                <span style="margin-left: 10px">{{ geojsonParams.pointColor }}</span>
              </el-form-item>
              <el-form-item label="Size" prop="pointAutoSize">
                <el-input-number v-model="geojsonParams.pointAutoSize" :min="0" :step="0.1" />
              </el-form-item>
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
              <el-form-item label="ColorBar" prop="pointColorBar"> </el-form-item>
              <GeoJSONColorBar
                style="padding-left: 20px"
                v-model="geojsonParams.pointColorBar"
                :data="properties[geojsonParams.pointValue]"
              />
            </el-collapse-item>
            <!-- ******************************* LineSetting ******************************* -->
            <el-collapse-item title="LineSetting" name="LineSetting">
              <template #title>
                <el-checkbox v-model="geojsonParams.showLines" @click.stop></el-checkbox>
                <span>LineSetting</span>
              </template>
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
                <el-select v-model="geojsonParams.lineWidthStyle">
                  <el-option
                    v-for="(value, label) in LINE_STYLE"
                    :key="value"
                    :label="label"
                    :value="value"
                  />
                </el-select>
              </el-form-item>
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
              <el-form-item label="ColorBar" prop="lineColorBar">
                <GeoJSONColorBar
                  v-model="geojsonParams.lineColorBar"
                  :data="properties[geojsonParams.lineValue]"
                />
              </el-form-item>
            </el-collapse-item>
            <!-- ******************************* PolygonSetting ******************************* -->
            <el-collapse-item title="PolygonSetting" name="PolygonSetting">
              <template #title>
                <el-checkbox v-model="geojsonParams.showPolygons" @click.stop></el-checkbox>
                <span>PolygonSetting</span>
              </template>
              <el-form-item label="Color" prop="polygonColor">
                <el-color-picker v-model="geojsonParams.polygonColor" />
                <span style="margin-left: 10px">{{ geojsonParams.polygonColor }}</span>
              </el-form-item>
              <el-form-item label="Opacity" prop="polygonOpacity">
                <el-slider v-model="geojsonParams.polygonOpacity" :min="0" :max="1" :step="0.1" />
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
              <el-form-item label="BorderStyle" prop="polygonBorderStyle">
                <el-select v-model="geojsonParams.polygonBorderStyle">
                  <el-option
                    v-for="(value, label) in LINE_STYLE"
                    :key="value"
                    :label="label"
                    :value="value"
                  />
                </el-select>
              </el-form-item>
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
              <el-form-item label="ColorBar" prop="polygonColorBar"> </el-form-item>
              <GeoJSONColorBar
                style="padding-bottom: 20px"
                v-model="geojsonParams.polygonColorBar"
                :data="properties[geojsonParams.polygonValue]"
              />
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
            </el-collapse-item>
          </el-collapse>
        </el-form>
      </div>
    </el-scrollbar>
  </MDialog>
</template>

<script setup>
import { initCheck } from './mixins'
import { Setting, Download, Loading } from '@element-plus/icons-vue'
import GeoJSONColorBar from './GeoJSONColorBar.vue'
import {
  GeoJSONLayer,
  getGeoJSONLayerParams,
  parserGeoJSON,
  LINE_STYLE,
  LINE_WIDTH_STYLE,
} from '@/utils/MapLayer/GeoJSONLayer'
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
const geojsonParams = reactive(getGeoJSONLayerParams())
const _GeoJSONLayer = new GeoJSONLayer(geojsonParams)

const activeNames = ref(['PolygonSetting'])
const loaded = ref(false)
const loading = ref(false)
const showGeoJSONParams = inject('showGeoJSONParams')
const showDialog = ref(false)
const hasPoint = ref(false)
const hasLine = ref(false)
const hasPolygon = ref(false)
const properties = ref([])

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

const watchCheck = addWatch(check, (val) => {
  console.log('watchCheck')

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
    _GeoJSONLayer.setGeoJsonData(json)
    loaded.value = true
    loading.value = false
  } catch (error) {
    console.log(error)
    loaded.value = false
    loading.value = false
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
    display: flex;
    gap: 5px;
    align-items: center;
  }
}
</style>
