<!-- AEIntersectionFlow -->
<template>
  <MDialog
    class="AEIntersectionFlow"
    title="交叉口流量表"
    subTitle="人工数车/ 交叉口流量录入 / 交叉口流量表"
    :top="80"
    :left="80"
    width="800px"
    hideClose
    :visible="showMain"
    @close="handleClose"
  >
    <div class="aeif_bodyer">
      <img src="@/assets/images/close.svg?url" class="close_btn" @click.stop="handleClose" />
      <el-form ref="form" label-width="auto" inline>
        <el-form-item label="交叉口名称">
          <el-select
            v-model="crossroadsList.intersectionId"
            @change="handleSreachCrossroadsList"
            @clear="handleGetIntersectionList('')"
            :remote-method="handleGetIntersectionList"
            filterable
            remote
            clearable
            placeholder="请输入关键词"
          >
            <el-option
              v-for="item in intersectionList.data"
              :key="item.id + item.name"
              :label="item.name"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div style="margin-bottom: 18px">
        <el-button type="primary" @click="handleGetCrossroadsList">刷新</el-button>
        <el-button
          type="primary"
          :disabled="!crossroadsList.intersectionId"
          @click="handleShowEditIntersection"
          >修改交叉口名称</el-button
        >
        <el-button
          type="primary"
          :disabled="!crossroadsList.intersectionId"
          @click="handleShowInputCrossroads"
          >人工录入</el-button
        >
        <el-button
          type="primary"
          :disabled="!crossroadsList.intersectionId"
          @click="handleShowVideoInputCrossroads"
          >视频识别</el-button
        >
      </div>
      <el-table
        class="mTable"
        :data="crossroadsList.data"
        stripe
        height="calc(100vh - 400px)"
        v-loading="crossroadsList.loading"
      >
        <el-table-column prop="id" label="id" width="50px" />
        <el-table-column prop="name" label="交叉口" min-width="80px" />
        <el-table-column prop="type" label="调查方式" min-width="80px">
          <template #default="{ row }">{{ typeOptions[row.type] }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" min-width="80px">
          <template #default="{ row }">{{ videoStateOptions[row.status] }}</template>
        </el-table-column>
        <el-table-column prop="beginTime,endTime" label="调查日期" width="160px">
          <template #default="{ row }">
            <div>{{ row.beginTime }}</div>
            <div>{{ row.endTime }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="操作" label="操作" width="130px">
          <template #default="{ row }">
            <div class="operate_btn">
              <!-- 状态（0等待划线，1等待运行，2正在运行，3运行成功，4运行失败，5等待录入，6录入成功 -->
              <el-button
                v-if="(row.status == 1 || row.status == 3 || row.status == 4) && row.type == 2"
                type="text"
                @click="handleRunCrossroad(row)"
                >运行</el-button
              >
              <el-button type="text" @click="handleShowCrossroadsDetail(row)">查看</el-button>
              <el-button type="text" @click="handleDeleteCrossroad(row)">移除</el-button>
              <el-button
                type="text"
                @click="
                  handleShowDrawLine({ intersectionId: row.intersectionId, crossroadsId: row.id })
                "
                >检测线绘制</el-button
              >
            </div>
          </template>
        </el-table-column>
      </el-table>
      <MPagination
        class="crossroads_pagination"
        :total="crossroadsList.total"
        v-model:page="crossroadsList.pageNum"
        v-model:limit="crossroadsList.pageSize"
        @pagination="handleGetCrossroadsList"
      />
    </div>
  </MDialog>

  <VideoInputCrossroads
    v-model:visible="showVideoInputCrossroads"
    :intersectionId="eidtIntersectionId"
    @submited="handleSubmitVideoInputCrossroads"
  />
  <DrawLine
    v-model:visible="showDrawLine"
    :crossroadsId="eidtCrossroadsId"
    :intersectionId="eidtIntersectionId"
    @submited="handleSubmitDrawLine"
  />
  <CrossroadsStatsEdit
    v-model:visible="showCrossroadsStatsEdit"
    :crossroadsId="eidtCrossroadsId"
    :intersectionId="eidtIntersectionId"
    @redraw="handleRedraw"
  />
  <CrossroadsDetail
    v-model:visible="showCrossroadsDetail"
    :crossroadsId="eidtCrossroadsId"
    :intersectionId="eidtIntersectionId"
  />
  <InputCrossroads
    v-model:visible="showInputCrossroads"
    :crossroadsId="eidtCrossroadsId"
    :intersectionId="eidtIntersectionId"
    @submited="handleSubmitInputCrossroads"
  />
</template>

<script setup>
import * as API from '@/api/index'
import { injectSync, addWatch } from '@/utils/index'

import VideoInputCrossroads from './VideoInputCrossroads.vue'
import DrawLine from './DrawLine.vue'
import CrossroadsStatsEdit from './CrossroadsStatsEdit.vue'
import CrossroadsDetail from './CrossroadsDetail.vue'
import InputCrossroads from './InputCrossroads.vue'

let _Map = null
const { proxy } = getCurrentInstance()
const emit = defineEmits(['update:visible', 'close'])
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  id: {
    type: Number,
    default: 0,
  },
})

const intersectionList = reactive({
  data: [],
  loading: false,

  name: '',
  pageNum: 1,
  pageSize: 100,
  total: 0,
})
const crossroadsList = reactive({
  data: [],
  loading: false,

  intersectionId: '',
  pageNum: 1,
  pageSize: 10,
  total: 0,
})

const typeOptions = {
  0: '其他',
  1: '人工',
  2: '视频识别',
  3: '互联网路况估算',
  4: '交评核准',
}
const videoTypeOptions = {
  0: '未知',
  1: '俯视航拍',
  1: '侧面路拍',
  1: '正斜角拍摄',
}
const videoStateOptions = {
  0: '等待划线',
  1: '等待运行',
  2: '正在运行',
  3: '运行成功',
  4: '运行失败',
  5: '等待录入',
  6: '录入成功',
}

const showMain = computed(() => {
  return (
    !showInputCrossroads.value &&
    !showVideoInputCrossroads.value &&
    !showDrawLine.value &&
    !showCrossroadsStatsEdit.value &&
    !showCrossroadsDetail.value &&
    props.visible
  )
})

const showInputCrossroads = ref(false)
const showVideoInputCrossroads = ref(false)
const showDrawLine = ref(false)
const showCrossroadsStatsEdit = ref(false)
const showCrossroadsDetail = ref(false)
const eidtIntersectionId = ref(null)
const eidtCrossroadsId = ref(null)

const watchProps = addWatch(
  props,
  (val) => {
    if (val.visible) {
      handleGetIntersectionList('')
      handleSreachCrossroadsList(val.id)
    } else {
    }
  },
  {
    deep: true,
    immediate: true,
  },
)

function handleClose() {
  emit('update:visible', false)
  emit('close')
}

async function handleShowEditIntersection() {
  const form = (await API.intersectionDetail(crossroadsList.intersectionId)).data
  form.name = (
    await proxy.$prompt('请输入交叉口名称', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: form.name,
      inputPlaceholder: '请输入交叉口名称',
      inputPattern: /\S/,
    })
  ).value
  await API.intersectionUpdate(form)
  handleGetIntersectionList(form.name)
  handleGetCrossroadsList()
  proxy.$message.success('修改成功')
}

function handleGetIntersectionList(query) {
  intersectionList.loading = true
  intersectionList.name = query
  API.intersectionList({
    name: intersectionList.name,
    pageSize: intersectionList.pageSize,
    pageNum: intersectionList.pageNum,
  })
    .then((res) => {
      const { data, pageSize, pageNum, total } = res.data
      intersectionList.data = data
      intersectionList.pageSize = pageSize
      intersectionList.pageNum = pageNum
      intersectionList.loading = false
    })
    .catch((err) => {
      intersectionList.loading = false
    })
}

function handleSreachCrossroadsList(id) {
  crossroadsList.intersectionId = id
  crossroadsList.pageNum = 1
  handleGetCrossroadsList()
}

function handleGetCrossroadsList() {
  crossroadsList.loading = true
  const form = {
    intersectionId: crossroadsList.intersectionId,
    pageSize: crossroadsList.pageSize,
    pageNum: crossroadsList.pageNum,
  }
  if (form.intersectionId) {
    API.intersectionDetail(form.intersectionId).then((res) => {
      if (_Map) {
        _Map.setCenter([res.data.x, res.data.y])
        _Map.setZoom(16)
      }
      // selectIntersection = res.data
    })
  } else {
    // selectIntersection = null
  }
  API.crossroadsList(form)
    .then((res) => {
      const { data, pageSize, pageNum, total } = res.data
      crossroadsList.data = data
      crossroadsList.pageSize = pageSize
      crossroadsList.pageNum = pageNum
      crossroadsList.total = total
      crossroadsList.loading = false
    })
    .catch((err) => {
      crossroadsList.loading = false
    })
}

// 移除
function handleDeleteCrossroad(row) {
  const id = row.id
  proxy
    .$confirm('是否确认删除编号为"' + id + '"的记录?', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    .then(function () {
      return crossroadsDelete(id)
    })
    .then(() => {
      handleGetCrossroadsList()
      proxy.$message.success('删除成功')
    })
    .catch((err) => {
      console.log(err)
    })
}

// 查看
function handleShowCrossroadsDetail(row) {
  showCrossroadsDetail.value = true
  eidtIntersectionId.value = row.intersectionId
  eidtCrossroadsId.value = row.id
  // this.$emit('showCrossroadsDetail', row)
}
// 人工录入
function handleShowInputCrossroads(row) {
  showInputCrossroads.value = true
  eidtIntersectionId.value = crossroadsList.intersectionId
}
// 人工录入提交成功
function handleSubmitInputCrossroads(row) {
  showInputCrossroads.value = false
  handleShowDrawLine({ intersectionId: row.intersectionId, crossroadsId: row.id })
}
// 视频识别
function handleShowVideoInputCrossroads(row) {
  showVideoInputCrossroads.value = true
  eidtIntersectionId.value = crossroadsList.intersectionId
}
// 视频识别提交成功
function handleSubmitVideoInputCrossroads(row) {
  showVideoInputCrossroads.value = true
  handleShowDrawLine({
    intersectionId: row.intersectionId,
    crossroadsId: row.id,
  })
}
// 检测线绘制
function handleShowDrawLine(row) {
  showDrawLine.value = true
  eidtIntersectionId.value = row.intersectionId
  eidtCrossroadsId.value = row.crossroadsId
}
// 检测线绘制提交成功
function handleSubmitDrawLine(row) {
  showDrawLine.value = false
  handleShowCrossroadsStatsEdit(row)
}
// 编辑交叉口流量线
function handleShowCrossroadsStatsEdit(row) {
  showDrawLine.value = false
  showCrossroadsStatsEdit.value = true
  eidtIntersectionId.value = row.intersectionId
  eidtCrossroadsId.value = row.crossroadsId
}
// 重新绘制检测线
function handleRedraw(row) {
  showCrossroadsStatsEdit.value = false
  handleShowDrawLine({
    intersectionId: row.intersectionId,
    crossroadsId: row.crossroadsId,
  })
}

injectSync('MapRef').then((map) => {
  _Map = map.value
})
</script>

<style lang="scss" scoped>
.AEIntersectionFlow {
  .aeif_bodyer {
    position: relative;
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

    .crossroads_pagination {
      // position: relative;
      // margin-top: 10px;
      // left: -12px;
      padding: 20px 0 0 0;
    }
    .operate_btn {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      .el-button {
        padding: 0;
        margin-left: 0;
        height: auto;
      }
    }
  }
}
</style>
