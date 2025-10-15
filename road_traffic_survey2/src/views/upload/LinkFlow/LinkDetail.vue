<!-- LinkDetail -->
<template>
  <MDialog
    class="LinkDetail"
    title="Link流量详情"
    subTitle="人工数车 / 路段流量录入 / Link流量详情"
    :top="80"
    :left="80"
    width="798px"
    hideClose
    :visible="showMain"
    @close="handleClose"
  >
    <img src="@/assets/images/close.svg?url" class="close_btn" @click.stop="handleClose" />
    <div class="search">
      <div class="title1">路段搜索</div>
      <RouteSelect ref="routeSelect" @change="handleMoveToRoute" />
      <el-button type="primary" @click="handleMoveToRoute({ value: selectRouteId })"
        >搜索定位</el-button
      >
    </div>
    <el-scrollbar class="scrollbar">
      <div class="lfd_bodyer">
        <div class="flex_box">
          <div class="detail_box">
            <el-form
              class="form_box"
              ref="infoFormRef"
              :model="infoForm"
              :rules="infoRules"
              label-width="100px"
              :inline="false"
              label-position="left"
            >
              <el-form-item label="SegmentID：" prop="origid">
                <template v-if="!editInfo">{{ info.origid }}</template>
                <template v-else>{{ infoForm.origid }}</template>
              </el-form-item>
              <el-form-item label="LinkID：" prop="id">
                <template v-if="!editInfo">{{ info.id }}</template>
                <template v-else>{{ infoForm.id }}</template>
              </el-form-item>
              <el-form-item label="道路名称：" prop="name">
                <template v-if="!editInfo">{{ info.name }}</template>
                <el-input v-else v-model="infoForm.name"></el-input>
              </el-form-item>
              <el-form-item label="车道数：" prop="lane">
                <template v-if="!editInfo">{{ info.lane }}</template>
                <el-input-number
                  v-else
                  style="width: 100%"
                  v-model="infoForm.lane"
                  :min="0"
                  :step="1"
                  step-strictly
                >
                </el-input-number>
              </el-form-item>
              <el-form-item label="道路类型：" prop="type">
                <template v-if="!editInfo">{{ linkTypeOption[info.type] }}</template>
                <el-select v-else v-model="infoForm.type" style="width: 100%">
                  <el-option
                    v-for="(item, key) in linkTypeOption"
                    :key="key"
                    :label="item"
                    :value="key"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="自由流速度：" prop="freespeed">
                <template v-if="!editInfo">{{ info.freespeed }} 米 / 秒</template>
                <el-input-number v-else style="width: 100%" v-model="infoForm.freespeed" :min="0">
                </el-input-number>
              </el-form-item>
              <el-form-item label="通行能力：" prop="capacity">
                <template v-if="!editInfo">{{ info.capacity }}</template>
                <el-input-number v-else style="width: 100%" v-model="infoForm.capacity" :min="0">
                </el-input-number>
              </el-form-item>
            </el-form>
            <div label-width="0px">
              <template v-if="!editInfo">
                <el-button type="primary" @click="handleEditInfo">编辑道路信息</el-button>
                <el-button type="primary" @click="handleReverse">切换反向道路</el-button>
              </template>
              <template v-if="editInfo">
                <el-button type="success" @click="handleUpdateLink">更新当前link</el-button>
                <el-button type="success" @click="handleUpdateInWay">更新整段segment</el-button>
                <el-button type="warning" @click="handleCloseEditInfo">取消</el-button>
              </template>
            </div>
          </div>
          <div class="chart_box">
            <VChart
              class="chart"
              :option="chartOption"
              autoresize
              :update-options="{ notMerge: true }"
            />
          </div>
        </div>
        <div class="query_box">
          <el-date-picker
            v-model="timeList"
            type="daterange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="yyyy-MM-dd"
            @change="handleQuery"
          />
          <el-select
            v-model="queryParams.type"
            multiple
            collapse-tags
            collapse-tags-tooltip
            clearable
            @change="handleQuery"
          >
            <el-option v-for="(label, key) in typeOptions" :key="key" :label="label" :value="key" />
          </el-select>

          <el-button type="primary" @click="handleAddFlow">新增数据</el-button>
        </div>
        <el-auto-resizer class="table_box">
          <template #default="{ height, width }">
            <el-table
              :data="tableList"
              row-key="id"
              stripe
              :height="height"
              @selection-change="handleSelectionChange"
            >
              <el-table-column type="selection" width="55" align="center" />
              <el-table-column label="编号" align="center" prop="id" />
              <el-table-column label="调查时间" align="center" prop="beginTime" width="120">
                <template #default="{ row }">{{
                  String(row.beginTime || '').substring(0, 10)
                }}</template>
              </el-table-column>
              <!-- <el-table-column label="调查结束时间" align="center" prop="endTime" /> -->
              <el-table-column label="调查方式" align="center" prop="type">
                <template #default="{ row }">{{ typeOptions[row.type] || '' }}</template>
              </el-table-column>
              <el-table-column label="pcu/h" align="center" prop="pcuH" />
              <el-table-column label="小型客车" align="center" prop="scar" />
              <el-table-column label="小型货车" align="center" prop="struck" />
              <el-table-column label="中型客车" align="center" prop="mcar" />
              <el-table-column label="中型货车" align="center" prop="mtruck" />
              <el-table-column label="大型客车" align="center" prop="lcar" />
              <el-table-column label="大型货车" align="center" prop="ltruck" />
              <el-table-column label="视频" align="center">
                <template #default="{ row }">
                  <a :href="`/file/download?url=${row.video}`" class="file_name">
                    {{ row.video }}
                  </a>
                </template>
              </el-table-column>
              <el-table-column
                label="备注"
                align="center"
                prop="remark"
                :show-overflow-tooltip="true"
              />
              <el-table-column
                label="操作"
                fixed="right"
                min-width="150"
                align="center"
                class-name="mini-padding fixed-width"
              >
                <template #default="scope">
                  <el-button type="text" icon="el-icon-edit" @click="handleUpdateFlow(scope.row)"
                    >修改</el-button
                  >
                  <el-button type="text" icon="el-icon-delete" @click="handleDeleteFlow(scope.row)"
                    >删除</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-auto-resizer>
        <div v-if="zsPCUH" class="table_end">
          <span>服务水平：{{ zsPCUH.service }} <el-tag>真实</el-tag></span>
          <span>饱和度：{{ zsPCUH.saturation }} <el-tag>真实</el-tag></span>
        </div>
        <div v-else class="table_end">
          <span>服务水平：{{ info.service }}</span>
          <span>饱和度：{{ info.saturation }}</span>
        </div>
        <MPagination
          layout="total, sizes, prev, pager, next"
          :pagerCount="5"
          :total="tableTotal"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          @pagination="getList"
        />
      </div>
    </el-scrollbar>
  </MDialog>

  <AELinkFlow
    v-model:visible="aeFlowData.visible"
    :flowId="aeFlowData.flowId"
    :linkId="linkId"
    :proId="proId"
    @updateData=""
  />
</template>

<script setup>
import * as API from '@/api/index'
import { injectSync, addWatch } from '@/utils/index'
import RouteSelect from '@/components/RouteSelect.vue'
import { computed } from 'vue'
import { typeOptions } from './index.vue'

import AELinkFlow from './AELinkFlow.vue'

const { proxy } = getCurrentInstance()
const emits = defineEmits(['update:visible', 'close', 'changeLink', 'addOrEditFlow', 'updateData'])
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  linkId: {
    type: Number,
    default: 92619,
  },
  proId: {
    type: Number,
    default: 0,
  },
})

let _Map = null
const info = ref({})
const infoForm = ref({
  id: null,
  origid: null,
  name: null,
  lane: null,
  type: null,
  freespeed: null,
  capacity: null,
})
const editInfo = ref(false)
const linkTypeOption = ref({})
const infoRules = ref({})
const infoFormRef = ref(null)

const selectFlowIds = ref([])
const tableList = ref([])
const tableTotal = ref(0)
const tableLoading = ref(false)
const timeList = computed({
  set: (val) => {
    if (val && val[0] && val[1]) {
      queryParams.startTime = val[0]
      queryParams.endTime = val[1]
    } else {
      queryParams.startTime = null
      queryParams.endTime = null
    }
  },
  get: () => {
    if (queryParams.startTime && queryParams.endTime) {
      return [queryParams.startTime, queryParams.endTime]
    } else {
      return []
    }
  },
})
const zsPCUH = ref(null)

const chartOption = ref({
  tooltip: {
    trigger: 'axis',
  },
  legend: {
    data: ['pcu/h', '小型客车', '小型货车', '中型客车', '中型货车', '大型客车', '大型货车'],
    left: 10,
    right: 0,
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true,
  },
  toolbox: {
    feature: {
      saveAsImage: {},
    },
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: [], //list.map((v) => v.hour.toString()),
  },
  yAxis: [
    {
      type: 'value',
      position: 'left',
      alignTicks: true,
    },
    {
      type: 'value',
      position: 'right',
      alignTicks: true,
    },
  ],
  series: [
    {
      name: 'pcu/h',
      type: 'bar',
      yAxisIndex: 1,
      data: [], //list.map((v) => v.pcu_h),
    },
    {
      name: '小型客车',
      type: 'line',
      smooth: true,
      data: [], //list.map((v) => v.scar),
    },
    {
      name: '小型货车',
      type: 'line',
      smooth: true,
      data: [], //list.map((v) => v.struck),
    },
    {
      name: '中型客车',
      type: 'line',
      smooth: true,
      data: [], //list.map((v) => v.mcar),
    },
    {
      name: '中型货车',
      type: 'line',
      smooth: true,
      data: [], // list.map((v) => v.mtruck),
    },
    {
      name: '大型客车',
      type: 'line',
      smooth: true,
      data: [], //list.map((v) => v.lcar),
    },
    {
      name: '大型货车',
      type: 'line',
      smooth: true,
      data: [], //list.map((v) => v.ltruck),
    },
  ],
})

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  type: ['1'],
  beginTime: null,
  endTime: null,
})

const watchVisible = addWatch(
  props,
  (val) => {
    console.log(val)
    if (val.visible) {
      getAllLinkType()
      getDetail()
      handleQuery()
    }
  },
  {
    deep: true,
    immediate: true,
  },
)

const showMain = computed(() => {
  console.log(!aeFlowData.value.visible && props.visible)

  return !aeFlowData.value.visible && props.visible
})

const aeFlowData = ref({
  visible: false,
  flowId: 0,
})

function getDetail() {
  API.matsimLinkDetail(props.linkId, props.proId).then((res) => {
    res.data.freespeed = Number(res.data.freespeed).toFixed(2)
    info.value = res.data
  })
}

function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
  updateEcharts()
}
function getList() {
  if (!props.linkId) return
  tableLoading.value = true
  const _queryParams = {
    pageNum: queryParams.value.pageNum,
    pageSize: queryParams.value.pageSize,
    beginTime: queryParams.value.beginTime,
    endTime: queryParams.value.endTime,
    type: queryParams.value.type ? queryParams.value.type.join(',') : null,
  }
  API.statsQueryByLinkId(props.linkId, _queryParams).then((response) => {
    tableList.value = response.data.data
    tableTotal.value = response.data.total
    tableLoading.value = false
  })
}

function updateEcharts() {
  API.queryAvgStats({
    ids: selectFlowIds.value,
    linkId: props.linkId,
    type: queryParams.value.type ? queryParams.value.type.join(',') : null,
  }).then((res) => {
    const list = new Array(24).fill().map((v, i) => {
      return (
        res.data.find((v) => v.hour == i) || {
          hour: i,
          pcu_h: 0,
          scar: 0,
          struck: 0,
          mcar: 0,
          mtruck: 0,
          lcar: 0,
          ltruck: 0,
        }
      )
    })
    chartOption.value.xAxis.data = list.map((v) => v.hour.toString())
    chartOption.value.series[0].data = list.map((v) => Number(Number(v.pcu_h).toFixed(2)))
    chartOption.value.series[1].data = list.map((v) => Number(Number(v.scar).toFixed(2)))
    chartOption.value.series[2].data = list.map((v) => Number(Number(v.struck).toFixed(2)))
    chartOption.value.series[3].data = list.map((v) => Number(Number(v.mcar).toFixed(2)))
    chartOption.value.series[4].data = list.map((v) => Number(Number(v.mtruck).toFixed(2)))
    chartOption.value.series[5].data = list.map((v) => Number(Number(v.lcar).toFixed(2)))
    chartOption.value.series[6].data = list.map((v) => Number(Number(v.ltruck).toFixed(2)))
  })
}

function getAllLinkType() {
  API.getAllLinkType().then((res) => {
    let obj = {}
    for (const { code, name } of res.data) {
      obj[code] = name
    }
    linkTypeOption.value = obj
  })
}
function handleSelectionChange(selection) {
  selectFlowIds.value = selection.map((item) => item.id)
  zsPCUH.value = selection[selection.length - 1] || null
  updateEcharts()
}
function handleClose() {
  aeFlowData.value.validate = false
  emits('update:visible', false)
  emits('close')
}
function handleMoveToRoute({ value }) {
  selectRouteId.value = value
  API.getMatsimLink(selectRouteId.value).then((res) => {
    // 计算地图合适的中心点和zoom
    let { zoom, center } = _Map.getFitZoomAndCenter(res.data[0].map((v) => v.fromxy))
    _Map.setCenter(center)
    _Map.setZoom(zoom - 1)

    _LinkLayer.setData(res.data)
  })
}
function handleEditInfo() {
  infoForm.value = {
    id: info.value.id,
    origid: info.value.origid,
    name: info.value.name,
    lane: info.value.lane,
    type: info.value.type,
    freespeed: info.value.freespeed,
    capacity: info.value.capacity,
  }
  editInfo.value = true
  // this.updateEcharts()
}
function handleReverse() {
  API.getReverseLink(props.linkId, props.proId).then((res) => {
    if (res.data) {
      emits('changeLink', res.data)
    } else {
      proxy.$message.warning('切换失败，没有找到反向道路')
    }
  })
}
function handleUpdateLink() {
  infoformRef.value.validate((valid) => {
    if (valid) {
      let from = JSON.parse(JSON.stringify(infoForm.value))
      API.matsimLinkUpdate(from).then((response) => {
        proxy.$message.success('修改成功')
        infoEdit.value = false
        getDetail()
      })
    }
  })
}
function handleUpdateInWay() {
  infoformRef.value.validate((valid) => {
    if (valid) {
      let from = JSON.parse(JSON.stringify(infoForm.value))
      API.matsimLinkUpdateInWay(from).then((response) => {
        // $message.success('修改成功')
        infoEdit.value = false
        getDetail()
      })
    }
  })
}
function handleCloseEditInfo() {
  editInfo.value = false
  updateEcharts()
}
function handleAddFlow() {
  aeFlowData.value.visible = true
  aeFlowData.value.flowId = 0
}
function handleUpdateFlow(row) {
  aeFlowData.value.visible = true
  aeFlowData.value.flowId = row.id
}
function handleDeleteFlow(row) {
  const ids = row.id
  proxy
    .$confirm('是否确认编号为"' + ids + '"的数据项?', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    .then(function () {
      return API.statsDelete(ids)
    })
    .then(() => {
      getList()
      proxy.$message.success('删除成功')
      emits('updateData')
    })
    .catch(() => {})
}

injectSync('MapRef').then((map) => {
  _Map = map.value
})
</script>
<style lang="scss" scoped>
.LinkDetail {
  .close_btn {
    z-index: 100;
    cursor: pointer;
    position: absolute;
    fill: #000;
    right: 16px;
    top: 16px;
    width: 20px;
    height: 20px;
    z-index: 10;
  }
  .search {
    box-sizing: border-box;
    width: 100%;
    display: flex;
    align-items: center;
    padding: 16px 16px 12px 16px;
    gap: 10px;
    .el-select {
      width: 280px;
    }

    .title1 {
      font-weight: 500;
      font-size: 14px;
      color: #2b2b2b;
    }
  }
  .scrollbar {
    height: calc(100vh - 250px);
  }
  .lfd_bodyer {
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 0 16px 16px 16px;
    gap: 10px;
    .flex_box {
      display: flex;
      align-items: stretch;
      gap: 10px;
    }
    .detail_box {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 10px;
      .form_box {
        background: #f5f7fa;
        border-radius: 7px 7px 7px 0px;
        padding: 12px 20px;
        .el-form-item {
          margin-bottom: 6px;
        }
      }
    }
    .chart_box {
      width: 100%;
    }
    .query_box {
      display: flex;
      gap: 10px;
      :deep(.el-select) {
        width: 250px;
      }
      :deep(.el-date-editor) {
        width: 300px;
        flex-grow: 0;
      }
    }
    .table_box {
      flex: 1;
      height: 0;

      min-height: 200px !important;
    }

    .table_end {
      display: flex;
      align-items: center;
      gap: 30px;
    }
  }
}
</style>
