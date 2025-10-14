<!-- CopyFlow -->
<template>
  <MDialog
    title="交评关键路段流量复用"
    class="CopyFlow"
    :visible="visible"
    :top="80"
    :left="80"
    width="550px"
    @close="handleClose"
  >
    <div class="cf_bodyer">
      <img src="@/assets/images/close.svg?url" class="close_btn" @click.stop="handleClose" />
      <el-form :model="form" ref="formRef" :rules="rules" label-width="80px" :inline="false">
        <el-form-item label="框选路段" prop="xyarr">
          <el-button
            v-if="selectState == POLYGON_SELECT_STATE_KEY.NOT_STARTED"
            type="primary"
            @click="handlePlayPolygonSelect()"
            >开始圈定</el-button
          >
          <template v-if="selectState != POLYGON_SELECT_STATE_KEY.NOT_STARTED">
            <el-button type="primary" @click="handleReplayPolygonSelect()">重新圈定</el-button>
            <el-button type="primary" @click="handleStopPolygonSelect()">结束圈定</el-button>
          </template>
        </el-form-item>
        <el-form-item label="复用路段" prop="list">
          <div class="tree_box">
            <el-tree
              v-loading="getListLoading"
              ref="tree"
              :data="form.list"
              node-key="id"
              :props="{ children: 'links', label: 'name' }"
              :show-checkbox="false"
            >
              <template #default="{ node, data }">
                <span class="custom-tree-node">
                  <span>{{ data.name }}（{{ data.id }}）</span>
                  <span>
                    <el-button type="text" @click="handleRemoveFyLink(node, data)">
                      删除
                    </el-button>
                  </span>
                </span>
              </template>
            </el-tree>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">提交</el-button>
          <el-button @click="handleClose" :loading="submitLoading">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </MDialog>
</template>

<script setup>
import {
  PolygonSelectLayer,
  POLYGON_SELECT_STATE_KEY,
  POLYGON_SELECT_EVENT,
} from '@/utils/MapLayer/PolygonSelectLayer'
import * as API from '@/api/index'
import { getMapContext, addWatch } from '@/utils/index'
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  copyForm: {
    type: Object,
    default: null,
  },
})
let _Map = null
const emits = defineEmits(['update:visible', 'close'])

const { proxy } = getCurrentInstance()
const getListLoading = ref(false)
const submitLoading = ref(false)
const formRef = ref(null)
const form = ref({
  xyarr: [],
  list: [],
})
const rules = ref({
  date: [{ required: true, message: '调查日期不能为空', trigger: 'blur' }],
  time: [{ required: true, message: '调查时段不能为空', trigger: 'blur' }],
})

const _PolygonSelectLayer = new PolygonSelectLayer({
  zIndex: 200,
  event: {
    [POLYGON_SELECT_EVENT.STATE_CHANGE]: (res) => {
      selectState.value = res.data.state
      if (selectState.value === POLYGON_SELECT_STATE_KEY.ENDED) {
        const path = res.data.path
        path[path.length] = [...path[0]]
        handleStopPolygonSelect()

        form.value.xyarr = path
        handleGetFYList()
      }
    },
  },
})
const selectState = ref(POLYGON_SELECT_STATE_KEY.NOT_STARTED)

const watchVisible = addWatch(
  () => props.visible,
  (val) => {
    if (val) {
      _Map.addLayer(_PolygonSelectLayer)
      form.value = {
        xyarr: [],
        list: [],
      }
      handleStopPolygonSelect(true)
    } else {
      handleStopPolygonSelect(true)
      _PolygonSelectLayer.removeFromParent()
    }
  },
)

function handleClose() {
  form.value = {
    xyarr: [],
    list: [],
  }
  handleStopPolygonSelect(true)
  emits('update:visible', false)
  emits('close')
}
function handleGetFYList() {
  getListLoading.value = true
  API.getOsmLinksByArea({ xyarr: form.value.xyarr })
    .then((res) => {
      form.value.list = res.data
    })
    .finally(() => {
      getListLoading.value = false
    })
}
function handleSubmit() {
  formRef.value.validate((valid) => {
    if (valid) {
      submitLoading.value = true
      const stats = JSON.parse(JSON.stringify(props.copyForm))
      stats.beginTime =
        stats.date + ' ' + (stats.time < 10 ? '0' + stats.time : stats.time) + ':00:00'
      stats.endTime =
        stats.date + ' ' + (stats.time < 9 ? '0' + (stats.time + 1) : stats.time + 1) + ':00:00'
      const linkIds = form.value.list.map((item) => item.links.map((item2) => item2.id)).flat(2)
      statsReinstated({ stats, linkIds })
        .then((res) => {
          proxy.$message.success('复用成功')
          handleStopPolygonSelect(true)
          handleClose()
        })
        .finally(() => {
          submitLoading.value = false
        })
    }
  })
}
function handleRemoveFyLink(node, data) {
  const parent = node.parent
  const children = parent.data.links || parent.data
  const index = children.findIndex((d) => d.id === data.id)
  children.splice(index, 1)
}
// ****************************** 数据筛选 -- 区域框选 -- start
function handlePlayPolygonSelect() {
  if (_PolygonSelectLayer) {
    _PolygonSelectLayer.reset()
    _PolygonSelectLayer.play()
    selectState.value = _PolygonSelectLayer.state
  }
}
function handleReplayPolygonSelect() {
  if (_PolygonSelectLayer) {
    _PolygonSelectLayer.reset()
    _PolygonSelectLayer.play()
    selectState.value = _PolygonSelectLayer.state
  }
}
function handleStopPolygonSelect(reset) {
  if (_PolygonSelectLayer) {
    if (reset === true) {
      form.value.xyarr = []
      _PolygonSelectLayer.reset()
    }
    _PolygonSelectLayer.stop()
    selectState.value = _PolygonSelectLayer.state
  }
}
// ****************************** 数据筛选 -- 区域框选 -- end

getMapContext().then((map) => {
  _Map = map
  watchVisible.callback(props.visible)
})

onUnmounted(() => {
  watchVisible.stop()
  _PolygonSelectLayer.dispose()
})
</script>

<style lang="scss" scoped>
.CopyFlow {
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
  .cf_bodyer {
    padding: 16px;
    .tree_box {
      max-height: calc(100vh - 400px);
      min-height: 100px;
      overflow-y: scroll;
      width: 100%;
    }
  }
}
</style>
