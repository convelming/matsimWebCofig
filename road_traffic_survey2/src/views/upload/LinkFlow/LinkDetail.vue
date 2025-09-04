<!-- LinkDetail -->
<template>
  <MDialog
    mClass="LinkDetail"
    title="Link流量详情"
    subTitle="人工数车 / 路段流量录入 / Link流量详情"
    :top="80"
    :left="80"
    width="798px"
    hideClose
    :visible="visible"
    @close="handleClose"
  >
    <el-scrollbar class="scrollbar">
      <div class="lfd_bodyer">
        <img src="@/assets/images/close.svg" class="close_btn" @click.stop="handleClose" />
        <div class="search">
          <div class="title1">路段搜索</div>
          <RouteSelect ref="routeSelect" @change="handleMoveToRoute" />
          <el-button type="primary" @click="handleMoveToRoute({ value: selectRouteId })"
            >搜索定位</el-button
          >
        </div>
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
            v-model="value1"
            type="daterange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
          />
          <el-select
            v-model="queryParams.type"
            multiple
            collapse-tags
            collapse-tags-tooltip
            placeholder=""
            clearable
          >
            <el-option v-for="(label, key) in typeOptions" :key="key" :label="label" :value="key" />
          </el-select>

          <el-button type="primary" @click="handleMoveToRoute({ value: selectRouteId })"
            >搜索定位</el-button
          >
        </div>
      </div>
    </el-scrollbar>
  </MDialog>
</template>

<script setup>
import * as API from '@/api/index'
import { getMapContext, addWatch } from '@/utils/index'
import RouteSelect from '@/components/RouteSelect.vue'

const { proxy } = getCurrentInstance()
const emits = defineEmits(['update:visible', 'close', 'changeLink'])
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
const typeOptions = ref({
  0: '其他',
  1: '人工',
  2: '视频识别',
  3: '互联网路况估算',
  4: '交评核准',
})

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
  () => props.visible,
  (val) => {
    console.log(val)
    if (val) {
      getAllLinkType()
      getDetail()
      updateEcharts()
    } else {
    }
  },
  {
    immediate: true,
  },
)

function getDetail() {
  API.matsimLinkDetail(props.linkId, props.proId).then((res) => {
    res.data.freespeed = Number(res.data.freespeed).toFixed(2)
    info.value = res.data
  })
}
function getList() {
  if (!props.linkId) return
  loading = true
  const _queryParams = {
    pageNum: queryParams.value.pageNum,
    pageSize: queryParams.value.pageSize,
    beginTime: queryParams.value.beginTime,
    endTime: queryParams.value.endTime,
    type: queryParams.value.type ? queryParams.value.type.join(',') : null,
  }
  statsQueryByLinkId(this.linkId, _queryParams).then((response) => {
    this.dataList = response.data.data
    this.total = response.data.total
    this.loading = false
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
    chartOption.value.series[0].data = list.map((v) => v.pcu_h)
    chartOption.value.series[1].data = list.map((v) => v.scar)
    chartOption.value.series[2].data = list.map((v) => v.struck)
    chartOption.value.series[3].data = list.map((v) => v.mcar)
    chartOption.value.series[4].data = list.map((v) => v.mtruck)
    chartOption.value.series[5].data = list.map((v) => v.lcar)
    chartOption.value.series[6].data = list.map((v) => v.ltruck)
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

function handleClose() {
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
  infoFormRef.validate((valid) => {
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
  infoFormRef.validate((valid) => {
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

getMapContext().then((map) => {
  _Map = map
})
</script>

<style lang="scss" scoped>
.scrollbar {
  max-height: calc(100vh - 200px);
}
.LinkDetail {
  .lfd_bodyer {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 16px;
    .close_btn {
      cursor: pointer;
      position: absolute;
      fill: #000;
      right: 16px;
      top: 16px;
      width: 20px;
      height: 20px;
    }
    .title1 {
      font-weight: 500;
      font-size: 14px;
      color: #2b2b2b;
    }
    .search {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
      .el-select {
        width: 280px;
      }
    }
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
}
</style>
