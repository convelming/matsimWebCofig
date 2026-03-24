<template>
  <MDialog
    class="IntersectionFlow"
    title="交评道路运行现状出图"
    subTitle="开始出图"
    :top="80"
    :left="80"
    width="365px"
    hideClose
    :visible="showMain"
    @close="handleClose"
  >
    <el-scrollbar class="flex-scrollbar">
      <div class="if_bodyer">
        <img src="@/assets/images/close.svg?url" class="close_btn" @click.stop="handleClose" />
        <div class="title1">请输入项目名称：</div>
        <div class="search">
          <el-input v-model="ctporjectData.name" placeholder="请输入项目名称" clearable></el-input>
          <el-button type="primary" @click="handleQuery">搜索</el-button>
          <el-button type="primary" @click="handleAdd">新增</el-button>
        </div>
        <!-- <div class="search">
          <el-input v-model="ctporjectData.name" placeholder="请输入创建人" clearable></el-input>
        </div> -->
        <el-table class="mTable" :data="ctporjectData.list" stripe height="300px">
          <el-table-column prop="name" label="项目名"> </el-table-column>
          <el-table-column prop="creator" label="创建人"> </el-table-column>
          <!-- <el-table-column prop="projectTime" label="项目时间"> </el-table-column> -->
          <el-table-column label="操作" align="center" width="120px">
            <template #default="scope">
              <el-button type="text" @click="handleEdit(scope.row)">载入</el-button>
              <el-button style="color: red" type="text" @click="handleEdit(scope.row)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
        <MPagination
          class="pagination"
          layout="total,prev, pager, next"
          :pagerCount="5"
          size="small"
          :total="ctporjectData.total"
          v-model:page="ctporjectData.pageNum"
          v-model:limit="ctporjectData.pageSize"
          @pagination="getCTProjectList"
        />

        <div class="checkbox">
          <el-checkbox v-model="showLayer" @change="emit('upload:visibleLayer', $event)">
            <span class="text1">显示已做项目范围</span>
          </el-checkbox>
        </div>
        <el-collapse class="collapse" v-model="activeNames">
          <el-collapse-item title="显示设置" name="显示设置">
            <el-form label-position="left" label-width="80px">
              <el-form-item label="颜色">
                <div class="color_picker_box">
                  <div class="color_picker_item">
                    <el-color-picker v-model="apColor"></el-color-picker>
                  </div>
                </div>
              </el-form-item>
            </el-form>
          </el-collapse-item>
        </el-collapse>
      </div>
    </el-scrollbar>
  </MDialog>

  <CTPAddDialog v-model:visible="showAdd" @success="handleSubmitedAdd" />
  <CTPModeDialog
    v-model:visible="showMode"
    @inputMode="handleInputMode"
    @drawingMode="handleDrawingMode"
  />
  <!-- <CTPDrawingModelDialog
    v-model:visible="showDrawingModel"
    :proId="drawingModelId"
    @close="handleDrawingModelDialogClose"
  /> -->
  <LinkDetail
    v-model:visible="showLinkDetail"
    :linkId="linkDetailData.linkId"
    :proId="linkDetailData.proId"
    @close="handleCloseLinkDetail"
    @changeLink="handleClickLink"
    @updateData="linkFlowUpdateData"
  />
</template>

<script setup>
import * as API from '@/api/index'
import { injectSync, addWatch, deepClone } from '@/utils/index'

import { MAP_EVENT } from '@/mymap/index.js'
import {
  GeoJSONLayer,
  getGeoJSONLayerParams,
  parserGeoJSON,
  LINE_STYLE,
  LINE_WIDTH_STYLE,
} from '@/utils/MapLayer/GeoJSONLayer'
import { computed } from 'vue'

import CTPAddDialog from './AddDialog.vue'
import CTPModeDialog from './ModeDialog.vue'
import CTPDrawingModelDialog from './DrawingModelDialog.vue'
import LinkDetail from '../LinkFlow/LinkDetail.vue'

let _Map = null
const emit = defineEmits(['update:visible', 'update:visibleLayer', 'close'])
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  visibleLayer: {
    type: Boolean,
    default: false,
  },
})

const ctporjectData = reactive({
  list: [],
  total: 0,
  page: 1,
  pageSize: 10,
  name: '',
  creator: '',
  loading: false,
})

let loaded = false
const showLayer = ref(props.visibleLayer)
const activeNames = ref(['显示设置'])

const showMain = computed(() => {
  return (
    !showAdd.value && !showMode.value && !showEdit.value && !showDrawingModel.value && props.visible
  )
})

const apColor = ref('#ffa500')

const showAdd = ref(false)
const showMode = ref(false)
const modeId = ref(false)
const showEdit = ref(false)
const eidtIntersectionId = ref(null)
const showDrawingModel = ref(false)
const drawingModelId = ref(false)

const showLinkDetail = ref(false)
const linkDetailData = ref({
  linkId: null,
  proId: null,
})

const _AllProjectLayer = new GeoJSONLayer({
  zIndex: 100,

  polygonColor: apColor.value,
  polygonOpacity: 0.5,
  polygonBorderOpacity: 0.8,
  polygonBorderWidth: 10,
  polygonBorderColor: apColor.value,
})

const watchProps = addWatch(
  props,
  (val) => {
    if (val.visibleLayer) showLayer.value = true
    if (val.visible || val.visibleLayer) {
      handleQuery()
      watchShowLayer.callback(showLayer.value)
    } else {
      _Map.removeLayer(_AllProjectLayer)
    }
  },
  {
    deep: true,
  },
)
const watchShowLayer = addWatch(showLayer, (val) => {
  if (val) {
    API.jsonAllProject()
      .then((res) => parserGeoJSON(res.data))
      .then((res) => {
        _AllProjectLayer.setGeoJsonData(res)
        _Map.addLayer(_AllProjectLayer)
      })
  } else {
    _Map.removeLayer(_AllProjectLayer)
  }
})
const watchApColor = addWatch(
  apColor,
  (val) => {
    _AllProjectLayer.setPolygonColor(val)
    _AllProjectLayer.setPolygonBorderColor(val)
  },
  {
    deep: true,
  },
)

function handleClose() {
  emit('update:visible', false)
  emit('close')
}
function handleQuery() {
  ctporjectData.pageNum = 1
  getCTProjectList()
}
async function getCTProjectList() {
  ctporjectData.loading = true
  try {
    const res1 = await API.projectList({
      creator: ctporjectData.creator,
      name: ctporjectData.name,
      pageSize: ctporjectData.pageSize,
      pageNum: ctporjectData.pageNum,
    })

    const { data, pageSize, pageNum, total } = res1.data
    ctporjectData.list = data
    ctporjectData.pageSize = pageSize
    ctporjectData.pageNum = pageNum
    ctporjectData.total = total
  } catch (error) {
  } finally {
    ctporjectData.loading = false
  }
}
function handleAdd() {
  showAdd.value = true
}
function handleSubmitedAdd(data) {
  showAdd.value = false
  getCTProjectList()
}
function handleInputMode(row) {
  console.log(row);
}
function handleDrawingMode(row) {
  console.log(row);
}
function handleDrawingModelDialogClose(row) {
  console.log(row);
}

onUnmounted(() => {
  _AllProjectLayer.dispose()
})

injectSync('MapRef').then((map) => {
  _Map = map.value
  watchProps.callback(props)
})
</script>

<style lang="scss" scoped>
.flex-scrollbar {
  max-height: calc(100vh - 200px);
}
.IntersectionFlow {
  .if_bodyer {
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
      margin-bottom: 16px;
    }
    .search {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
      .el-input {
        width: 0;
        flex: 1;
      }
      .el-button {
        margin-left: 0;
      }
    }
    .pagination {
      margin-top: 12px;
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
