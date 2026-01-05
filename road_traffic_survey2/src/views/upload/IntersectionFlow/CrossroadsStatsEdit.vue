<!-- CrossroadsStatsEdit -->
<template>
  <MDialog
    class="CrossroadsStatsEdit"
    title="编辑交叉口流量线"
    :top="80"
    :left="80"
    width="calc(100vw - 100px)"
    hideClose
    :visible="visible"
    @close="handleClose"
  >
    <div class="CrossroadsStatsEdit_body" v-loading="loading">
      <img src="@/assets/images/close.svg?url" class="close_btn" @click.stop="handleClose" />
      <div class="btn_box">
        <el-button type="primary" @click="loadData">刷新</el-button>
        <el-button type="primary" @click="emits('redraw', props)">重新绘制检测线</el-button>
      </div>
      <div class="value_box">
        <div class="canvas" id="CrossroadsStatsEdit_canvas"></div>

        <div class="table_box">
          <el-auto-resizer>
            <template #default="{ height, width }">
              <el-table
                class="small"
                :data="tableList1"
                border
                :height="height"
                :row-class-name="tableRowClassName"
                @row-click="handleTableRowClick"
              >
                <el-table-column label="编号" prop="id" />
                <el-table-column label="线名" prop="name" />
                <el-table-column label="初始线" prop="inLink" />
                <el-table-column label="终点线" prop="outLink" />
                <el-table-column label="操作" width="100">
                  <template #default="{ row }">
                    <el-button type="text" @click="handleEdit(row)">修改</el-button>
                    <el-button type="text" @click="handleDelete(row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </template>
          </el-auto-resizer>
        </div>
      </div>
    </div>

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog title="修改交叉口流量" v-model="open" width="500px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" size="mini">
        <el-form-item label="线名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleSave">确 定</el-button>
        <el-button @click="open = false">取 消</el-button>
      </div>
    </el-dialog>
  </MDialog>
</template>

<script setup>
import Konva from 'konva'
import * as THREE from 'three'
// import {
//   crossroadsCorssStatsTable,
//   crossroadsDeleteStats,
//   crossroadsUpdateStats,
//   crossroadsInsertStats,
//   crossroadsInoutlink,
//   crossroadsAnalyzeVideo,
//   crossroadsTrackImage,
//   crossroadsExportCorssStatsTable,
//   crossroadsDetail,
// } from '@/api/index'

import * as API from '@/api/index'
import { JsonParse, addWatch } from '@/utils'

let _Map = null
const { proxy } = getCurrentInstance()
const emit = defineEmits(['update:visible', 'close', 'redraw'])
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
const tableList1 = ref([])
const inLinkList = ref([])
const outLinkList = ref([])
const form = ref({})
const rules = {
  center: [{ required: true, message: '交叉口位置不能为空', trigger: 'blur' }],
}
const open = ref(false)
const drawWidth = ref(1200)
const drawHeight = ref(675)
const detail = ref({})
const selectLineId = ref(-1)
const formRef = ref(null)

const watchProps = addWatch(
  props,
  (val) => {
    if (val.visible) {
      loadData()
    } else {
      // handleDisable()
    }
  },
  {
    deep: true,
    immediate: true,
  },
)

let _stage = null
let _layer = null
let _group = null
let _resizeObserver = null
let _setSizeTimeout = null
let _LineMap = {}

onMounted(() => {
  _stage = new Konva.Stage({
    container: 'CrossroadsStatsEdit_canvas',
    width: drawWidth.value,
    height: drawHeight.value,
    draggable: true,
  })
  _layer = new Konva.Layer()
  _stage.add(_layer)
  _group = new Konva.Group({})
  _layer.add(_group)

  _resizeObserver = new ResizeObserver((entries) => {
    // 节流
    if (_setSizeTimeout) return
    _setSizeTimeout = setTimeout(() => {
      drawWidth.value = entries[0].target.clientWidth
      drawHeight.value = entries[0].target.clientHeight
      _stage.width(drawWidth.value)
      _stage.height(drawHeight.value)
      _setSizeTimeout = null
    }, 1000 / 120)
  })
  _resizeObserver.observe(document.getElementById('CrossroadsStatsEdit_canvas'))
})

onUnmounted(() => {
  if (_resizeObserver) {
    _resizeObserver.disconnect()
    _resizeObserver = null
  }
  if (_stage) {
    _stage.destroy()
  }
})

function loadData() {
  Promise.all([getCrossroadsDetail(), getCrossroadsCorssStatsTable()]).then((res) => {
    setTimeout(() => {
      handleDraw()
    }, 200)
  })
}
function handleClose() {
  emit('update:visible', false)
  emit('close')
}
function getCrossroadsDetail() {
  return API.crossroadsDetail(props.crossroadsId).then((res) => {
    res.data.crossroads.mapInfo = JsonParse(res.data.crossroads.mapInfo, {})
    detail.value = res.data.crossroads
  })
}
function getCrossroadsCorssStatsTable() {
  return API.crossroadsCorssStatsTable(props.crossroadsId).then((res) => {
    tableList1.value = res.data
  })
}
function handleClearDraw() {
  try {
    _group.destroy()
    _group = new Konva.Group({})
    _layer.add(_group)

    _LineMap = {}
  } catch (error) {}
}
function handleDraw() {
  handleClearDraw()
  const { center, width, height, rotation } = detail.value.mapInfo

  const vcenter = new THREE.Vector2().fromArray(center)
  _group.x(drawWidth.value / 2)
  _group.y(drawHeight.value / 2)
  _group.rotation(rotation)
  // 以1080p为基准，画布高度在css中设置
  const scale = 1080 / height
  const scale2 = drawHeight.value / 1080
  _group.scale({ x: scale2, y: scale2 })

  const LINE_WIDTH = 10

  for (const v of tableList1.value) {
    const startPoint = new THREE.Vector2()
      .fromArray(JsonParse(v.startPoint, [0, 0]))
      .sub(vcenter)
      .multiply(new THREE.Vector2(1, -1))
      .multiplyScalar(scale)
      .toArray()
    const startPointControl = new THREE.Vector2()
      .fromArray(v.inLinkInfo.toxy)
      .sub(vcenter)
      .multiply(new THREE.Vector2(1, -1))
      .multiplyScalar(scale)
      .toArray()
    const endPointControl = new THREE.Vector2()
      .fromArray(v.outLinkInfo.fromxy)
      .sub(vcenter)
      .multiply(new THREE.Vector2(1, -1))
      .multiplyScalar(scale)
      .toArray()
    const endPoint = new THREE.Vector2()
      .fromArray(JsonParse(v.endPoint, [0, 0]))
      .sub(vcenter)
      .multiply(new THREE.Vector2(1, -1))
      .multiplyScalar(scale)
      .toArray()
    const line = new Konva.Arrow({
      name: String(v.id),
      points: [startPoint, startPointControl, endPointControl, endPoint].flat(2),
      fill: '#409EFF',
      stroke: '#409EFF',
      strokeWidth: LINE_WIDTH,
      bezier: true,
      // lineCap: "round",
      // lineJoin: "round",
    })
    line.on('click', (e) => {
      handleSelectLine(e.target.name())
    })
    line.on('mouseenter', (e) => {
      _stage.container().style.cursor = 'pointer'
    })
    line.on('mouseleave', (e) => {
      _stage.container().style.cursor = 'default'
    })
    _LineMap[String(v.id)] = line
    _group.add(line)

    // const lineName = new Konva.TextPath({
    //   text: `     ${v.name}`,
    //   fontSize: LINE_WIDTH * 0.8,
    //   fontFamily: "Calibri",
    //   fill: "#fff",
    //   data: `M${startPoint.join(" ")} C ${startPointControl.join(" ")}, ${endPointControl.join(" ")}, ${endPoint.join(" ")}`,
    // });
    // console.log(`M${startPoint.join(" ")} C ${startPointControl.join(" ")}, ${endPointControl.join(" ")}, ${endPoint.join(" ")}`);

    // lineGroup.add(lineName);
    // lineName.moveToTop();

    // _LineMap[String(v.id)] = lineGroup;
    // _group.add(lineGroup);
  }
}
function handleTableRowClick(row, column, event) {
  handleSelectLine(row.id)
}
function handleSelectLine(id) {
  selectLineId.value = id
  for (const line of Object.values(_LineMap)) {
    if (line.name() == id) {
      line.moveToTop()
      line.fill('#FF0000')
      line.stroke('#FF0000')
    } else {
      line.fill('#409EFF')
      line.stroke('#409EFF')
    }
  }
}
function crossroadsAnalyzeVideo() {
  if (!props && !props.crossroadsId) return
  API.crossroadsAnalyzeVideo(props.crossroadsId)
}
function crossroadsTrackImage() {
  if (!props && !props.crossroadsId) return
  API.crossroadsTrackImage(props.crossroadsId)
}
function crossroadsExportCorssStatsTable() {
  if (!props && !props.crossroadsId) return
  API.crossroadsExportCorssStatsTable(props.crossroadsId)
}
function handleDelete(row, index) {
  proxy
    .$confirm(`是否确认删除线名为 ${row.name} 的记录?`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    .then(function () {
      return API.crossroadsDeleteStats(row.id)
    })
    .then(() => {
      const line = _LineMap[row.id]
      if (line) {
        line.destroy()
      }
      getCrossroadsCorssStatsTable()
      proxy.$message.success('删除成功')
    })
    .catch(() => {})
}
function handleEdit(row) {
  form.value = JSON.parse(JSON.stringify(row))
  open.value = true
}
function handleSave() {
  formRef.value.validate((valid) => {
    if (valid) {
      const form = JSON.parse(JSON.stringify(form.value))
      form.count = form.car + form.van + form.bus + form.truck
      if (form.id != undefined) {
        API.crossroadsUpdateStats(form).then((response) => {
          this.$message.success('修改成功')
          open.value = false
          this.getCrossroadsCorssStatsTable()
        })
      } else {
        API.crossroadsInsertStats(form).then((response) => {
          this.$message.success('新增成功')
          open.value = false
          this.getCrossroadsCorssStatsTable()
        })
      }
    }
  })
}
function tableRowClassName({ row, rowIndex }) {
  if (row.id == selectLineId.value) {
    return 'success-row'
  }
  return ''
}
</script>

<style lang="scss">
.CrossroadsStatsEdit {
  .success-row {
    --el-table-tr-bg-color: var(--el-color-success-light-9);
  }
}
</style>

<style lang="scss" scoped>
.CrossroadsStatsEdit {
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
  .CrossroadsStatsEdit_body {
    height: calc(100vh - 230px);
    overflow: hidden;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    .value_box {
      flex: 1;
      height: 0;
      width: 100%;
      display: flex;
      align-items: stretch;
      gap: 20px;

      .canvas {
        border: 1px solid #00000011;
        position: relative;
        width: 65%;
      }
      .table_box {
        width: calc(35% - 20px);
      }
    }
  }
  .CrossroadsStatsEdit_pagination {
    position: relative;
    margin-top: 10px;
    left: -12px;
  }
}
</style>
