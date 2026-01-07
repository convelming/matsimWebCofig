<!-- IntersectionFlow -->
<template>
  <MDialog
    class="IntersectionFlow"
    title="交叉口流量录入"
    subTitle="人工数车/ 交叉口流量录入"
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
        <div class="title1">请输入交叉口名称：</div>
        <div class="search">
          <el-input v-model="intersectionData.name" placeholder="交叉口名称" clearable></el-input>
          <el-button type="primary" @click="handleQuery">搜索</el-button>
          <el-button type="primary" @click="handleAdd">新增</el-button>
        </div>
        <el-table class="mTable" :data="intersectionData.list" stripe height="300px">
          <el-table-column prop="name" label="交叉口名称"> </el-table-column>
          <el-table-column label="操作" align="right" width="90px">
            <template #default="scope">
              <el-button type="text" @click="handleEdit(scope.row)">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>
        <MPagination
          class="pagination"
          layout="total,prev, pager, next"
          :pagerCount="5"
          size="small"
          :total="intersectionData.total"
          v-model:page="intersectionData.pageNum"
          v-model:limit="intersectionData.pageSize"
          @pagination="getIntersectionList"
        />

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
                  <div class="color_picker_item" v-for="(v, i) in stateOptions" :key="i">
                    <div>{{ v }}</div>
                    <el-color-picker v-model="stateColorOptions[i]"></el-color-picker>
                  </div>
                </div>
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
  <AddIntersection v-model:visible="showAddIntersection" @submited="handleSubmitedAdd" />
  <AEIntersectionFlow v-model:visible="showAEIntersectionFlow" :id="eidtIntersectionId" />
</template>

<script setup>
import * as API from '@/api/index'
import { injectSync, addWatch } from '@/utils/index'

import { MAP_EVENT } from '@/mymap/index.js'
import { NetworkLayer } from '@/utils/MapLayer/NetworkLayer'
import { LinkLayer } from '@/utils/MapLayer/LinkLayer'
import { LinkStatsLayer } from '@/utils/MapLayer/LinkStatsLayer'
import { IntersectionListLayer } from '@/utils/MapLayer/IntersectionListLayer'
import { computed } from 'vue'

import AddIntersection from './AddIntersection.vue'
import AEIntersectionFlow from './AEIntersectionFlow.vue'

let _Map = null
const emit = defineEmits(['update:visible', 'close'])
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

const intersectionData = reactive({
  list: [],
  total: 0,
  page: 1,
  pageSize: 10,
  name: '',
  loading: false,
})
const showLayer = ref(true)
const activeNames = ref(['显示设置'])

const showMain = computed(() => {
  return !showAddIntersection.value && !showAEIntersectionFlow.value && props.visible
})

const wayWidth = ref(10)
const stateColorOptions = ref({
  1: '#409eff', // 有数据 蓝色
  0: '#909399', // 无数据 灰色
})
const stateOptions = {
  1: '有数据',
  0: '无数据',
}

const showAddIntersection = ref(false)
const showAEIntersectionFlow = ref(false)
const eidtIntersectionId = ref(null)

const _IntersectionListLayer = new IntersectionListLayer({
  zIndex: 100,
  colors: stateColorOptions.value,
  event: {
    [MAP_EVENT.HANDLE_PICK_LEFT]: (res) => {
      handleEdit(res.data)
    },
  },
})

const _NetworkLayer = inject('_NetworkLayer').value
const watchWayWidth = addWatch(wayWidth, (val) => {
  _NetworkLayer.setValues({ lineWidth: val })
})

const watchVisible = addWatch(
  () => props.visible,
  (val) => {
    if (val) {
      handleQuery()
      watchWayWidth.callback(wayWidth.value)
      watchShowLayer.callback(showLayer.value)
      _Map.addLayer(_NetworkLayer)
    } else {
      _Map.removeLayer(_NetworkLayer)
      _Map.removeLayer(_IntersectionListLayer)
    }
  },
)
const watchShowLayer = addWatch(showLayer, (val) => {
  if (val) {
    _Map.addLayer(_IntersectionListLayer)
  } else {
    _Map.removeLayer(_IntersectionListLayer)
  }
})
const watchStateColorOptions = addWatch(
  stateColorOptions,
  (val) => {
    _IntersectionListLayer.setColors(val)
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
  intersectionData.pageNum = 1
  getIntersectionList()
}
async function getIntersectionList() {
  intersectionData.loading = true
  try {
    const res1 = await API.intersectionList({
      name: intersectionData.name,
      pageSize: intersectionData.pageSize,
      pageNum: intersectionData.pageNum,
    })

    const { data, pageSize, pageNum, total } = res1.data
    intersectionData.list = data
    intersectionData.pageSize = pageSize
    intersectionData.pageNum = pageNum
    intersectionData.total = total
  } catch (error) {
  } finally {
    intersectionData.loading = false
  }
}
async function getIntersectionList2() {
  const res1 = await API.intersectionList({
    pageSize: 999999999,
    pageNum: 1,
  })
  _IntersectionListLayer.setData(res1.data.data)
}
function handleAdd() {
  showAddIntersection.value = true
}
function handleSubmitedAdd(data) {
  showAddIntersection.value = false
  getIntersectionList()
  handleEdit(data)
}
function handleEdit(row) {
  eidtIntersectionId.value = row.id
  showAEIntersectionFlow.value = true
}

onMounted(() => {
  getIntersectionList2()
})
onUnmounted(() => {
  _IntersectionListLayer.dispose()
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
