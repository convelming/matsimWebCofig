<!-- CrossroadsDetail -->
<template>
  <MDialog
    class="CrossroadsDetail"
    :title="{ 1: '人工录入交叉口', 2: '视频录入交叉口' }[detail.type]"
    :top="80"
    :left="80"
    width="calc(100vw - 100px)"
    hideClose
    :visible="visible"
    @close="handleClose"
  >
    <el-scrollbar style="height: calc(100vh - 130px)">
      <div class="CrossroadsDetail_body" v-loading="loading">
        <img src="@/assets/images/close.svg?url" class="close_btn" @click.stop="handleClose" />
        <h3 style="margin-top: 0">交叉口流量表</h3>
        <el-form label-width="auto" inline>
          <el-form-item label="调查时间" prop="date">
            <el-date-picker
              :disabled="!changeCrossroadsData"
              v-model="crossroadsData"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="yyyy-MM-dd HH:mm:ss"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button
              v-if="!changeCrossroadsData"
              type="primary"
              @click="changeCrossroadsData = true"
              >修改调查时间</el-button
            >
            <template v-if="changeCrossroadsData">
              <el-button :loading="saving" type="primary" @click="handleSubmit">保存</el-button>
              <el-button :loading="saving" type="primary" @click="handleQx">取消</el-button>
            </template>
          </el-form-item>
        </el-form>
        <div style="margin-bottom: 18px" v-if="detail.type == 2">
          <el-button type="primary" @click="handleDownload(detail.video)">下载原视频</el-button>
          <el-button type="primary" @click="crossroadsExportCorssStatsTable"
            >导出交叉口流量表</el-button
          >
          <el-button type="primary" @click="crossroadsAnalyzeVideo">导出识别视频</el-button>
          <el-button type="primary" @click="crossroadsTrackImage">导出轨迹图片</el-button>
        </div>
        <div style="margin-bottom: 18px" v-else-if="detail.type == 1">
          <el-button type="primary" @click="crossroadsExportCorssStatsTable"
            >导出交叉口流量表</el-button
          >
        </div>
        <el-table class="small" :data="tableList1" border stripe max-height="300px">
          <el-table-column label="编号" prop="id" />
          <el-table-column label="线名" prop="name" />
          <el-table-column label="初始线" prop="inLink" />
          <el-table-column label="终点线" prop="outLink" />
          <el-table-column label="PCU/H" prop="pcuH" />
          <el-table-column label="小型客车" prop="car" />
          <el-table-column label="小型货车" prop="van" />
          <el-table-column label="大型客车" prop="bus" />
          <el-table-column label="大型货车" prop="truck" />
          <el-table-column label="合计" prop="count" />
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button type="text" @click="handleEdit(row)">修改</el-button>
              <el-button type="text" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <h3>附件</h3>
        <div style="margin-bottom: 18px">
          <el-button type="primary" @click="addAnnex" :loading="uploading || saving"
            >上传附件</el-button
          >
        </div>
        <el-table
          class="small"
          style="margin-bottom: 18px"
          :data="detail.annex"
          border
          stripe
          max-height="300px"
        >
          <el-table-column label="附件名称" prop="name"></el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="{ row, $index }">
              <el-button type="text" @click="handleDownload(row.url)">下载</el-button>
              <el-button type="text" @click="deleteAnnex($index)" :loading="saving">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <h3>交叉口流向图</h3>
        <div style="margin-bottom: 18px">
          <el-button type="primary" @click="handleChartToDataUrl">导出</el-button>
        </div>
        <div class="canvas" id="CrossroadsDetail_canvas" :style="{ height: drawHeight }"></div>
      </div>
    </el-scrollbar>
  </MDialog>

  <!-- 添加或修改参数配置对话框 -->
  <el-dialog title="修改交叉口流量" v-model="open" width="500px" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="线名" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="初始线" prop="inLink" v-if="!form.id">
        <el-select v-model="form.inLink">
          <el-option v-for="(item, index) in inLinkList" :key="index" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item label="终点线" prop="outLink" v-if="!form.id">
        <el-select v-model="form.outLink">
          <el-option
            v-for="(item, index) in outLinkList"
            :key="index"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="PCU/H" prop="pcuH">
        <el-input-number v-model="form.pcuH" :step="0.01" />
      </el-form-item>
      <el-form-item label="小型客车" prop="car">
        <el-input-number v-model="form.car" :step="0.01" />
      </el-form-item>
      <el-form-item label="小型货车" prop="van">
        <el-input-number v-model="form.van" :step="0.01" />
      </el-form-item>
      <el-form-item label="大型客车" prop="bus">
        <el-input-number v-model="form.bus" :step="0.01" />
      </el-form-item>
      <el-form-item label="大型货车" prop="truck">
        <el-input-number v-model="form.truck" :step="0.01" />
      </el-form-item>
      <el-form-item label="合计" prop="count">
        {{ form.car + form.van + form.bus + form.truck }}
        <!-- <el-input-number v-model="pcuH" :step="0.01" /> -->
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="handleSave">确 定</el-button>
        <el-button @click="open = false">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import Konva from 'konva'
import * as API from '@/api/index'
import { JsonParse, addWatch, injectSync } from '@/utils'
import * as THREE from 'three'
import * as echarts from 'echarts'
import request from '@/utils/request'

const ColorList = [
  '#5470c6',
  '#91cc75',
  '#fac858',
  '#ee6666',
  '#73c0de',
  '#3ba272',
  '#fc8452',
  '#9a60b4',
  '#ea7ccc',
]

const { proxy } = getCurrentInstance()
const emits = defineEmits(['update:visible', 'close'])
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
const changeCrossroadsData = ref(false)
const crossroadsData = ref([])
const saving = ref(false)
const rules = {
  center: [{ required: true, message: '交叉口位置不能为空', trigger: 'blur' }],
}
const open = ref(false)

const drawWidth = ref(1200)
const drawHeight = ref(675)
const detail = ref({ annex: [] })
const uploading = ref(false)
const selectLineId = ref(-1)
const formRef = ref(null)

const watchProps = addWatch(
  props,
  (val) => {
    if (val.visible) {
      Promise.all([getCrossroadsDetail(), getCrossroadsCorssStatsTable()]).then((res) => {
        handleDraw()
      })
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
let _LineTextMap = {}
let _LineNameMap = {}
let _inTextMap = {}
let _outTextMap = {}

onMounted(() => {
  _stage = new Konva.Stage({
    container: 'CrossroadsDetail_canvas',
    draggable: true,
  })
  _layer = new Konva.Layer({
    width: 2048,
    height: 2048,
  })
  _stage.add(_layer)
  _group = new Konva.Group({})
  _layer.add(_group)

  _stage.on('wheel', (e) => {
    const scale = _group.scale().x + (e.evt.wheelDelta > 0 ? 0.2 : -0.2)
    _group.scale({ x: scale, y: scale })
    e.evt.preventDefault()
  })

  _resizeObserver = new ResizeObserver((entries) => {
    // 节流
    if (_setSizeTimeout) return
    _setSizeTimeout = setTimeout(() => {
      handleChartResize()
      _setSizeTimeout = null
    }, 1000 / 120)
  })
  _resizeObserver.observe(document.getElementById('CrossroadsDetail_canvas'))
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

function handleDownload(url) {
  const a = document.createElement('a')
  a.download = url.split('/').pop()
  a.href = import.meta.env.VITE_APP_BASE_API + '/file/download?url=' + url
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
function handleChartResize() {
  if (detail.value.mapInfo) {
    const { width, height, rotation } = detail.value.mapInfo
    drawWidth.value = document.getElementById('CrossroadsDetail_canvas').clientWidth
    drawHeight.value = (drawWidth.value * height) / width
    _stage.width(drawWidth.value)
    _stage.height(drawHeight.value)
    if (_group) {
      _group.x(drawWidth.value / 2)
      _group.y(drawHeight.value / 2)
      _group.rotation(rotation)
      const scale = (drawWidth.value / width) * 0.75
      _group.scale({ x: scale, y: scale })
    }
  }
}
function getChart(center, data) {
  const _group = new Konva.Group({})
  const vcenter = new THREE.Vector2().fromArray(center)
  const TEXT_SIZE = 3
  const LINE_WIDTH = 3
  const inTree = {}
  const outTree = {}
  const _LineTextMap = {}
  const _LineMap = {}
  const _LineNameMap = {}
  const _inTextMap = {}
  const _outTextMap = {}

  let maxValue = Number.MIN_SAFE_INTEGER
  let minValue = Number.MAX_SAFE_INTEGER
  let inIndex = 0

  for (const index in data) {
    const v = data[index]
    const item = {
      id: v.id,
      value: Number(v.pcuH),
      name: v.name,

      inLink: v.inLink,
      outLink: v.outLink,

      sort: 0,
    }

    const startPoint = new THREE.Vector2()
      .fromArray(JsonParse(v.startPoint, [0, 0]))
      .sub(vcenter)
      .multiply(new THREE.Vector2(1, -1))
    const startPointControl = new THREE.Vector2()
      .fromArray(v.inLinkInfo.toxy)
      .sub(vcenter)
      .multiply(new THREE.Vector2(1, -1))
    const endPointControl = new THREE.Vector2()
      .fromArray(v.outLinkInfo.fromxy)
      .sub(vcenter)
      .multiply(new THREE.Vector2(1, -1))
    const endPoint = new THREE.Vector2()
      .fromArray(JsonParse(v.endPoint, [0, 0]))
      .sub(vcenter)
      .multiply(new THREE.Vector2(1, -1))

    item.startPoint = startPoint
    item.startPointControl = startPointControl
    // .sub(startPoint)
    // .setLength(LINE_WIDTH * 10)
    // .add(startPoint);
    item.endPointControl = endPointControl
    // .sub(endPoint)
    // .setLength(LINE_WIDTH * 10)
    // .add(endPoint);
    item.endPoint = endPoint

    if (item.value > maxValue) maxValue = item.value
    if (item.value < minValue) minValue = item.value

    const vec1 = item.startPointControl.clone().sub(item.startPoint).negate()
    const vec2 = item.endPoint.clone().sub(item.startPoint)
    const vec3 = item.endPointControl.clone().sub(item.endPoint)
    const angle1 = vec1.angle()
    const angle2 = vec2.angle()
    const angle3 = vec3.angle()
    item.sort = angle2 > angle1 ? angle2 - angle1 : 2 * Math.PI + (angle2 - angle1)
    item.inNormal = new THREE.Vector2(vec1.y, -vec1.x)
    item.outNormal = new THREE.Vector2(vec3.y, -vec3.x)

    let inItem = inTree[item.inLink]
    if (!inItem) {
      inItem = {
        id: item.inLink,
        name: v.inLine,
        color: ColorList[inIndex],
        list: [],
        count: 0,
        max: Number.MIN_SAFE_INTEGER,
        point: item.startPoint.clone(),
        dir: vec1.clone(),
        normal: item.inNormal.clone(),
        angle: angle1,
      }
      inTree[item.inLink] = inItem
      inIndex += 1
    }
    if (item.value > inItem.max) inItem.max = item.value
    inItem.count += item.value
    inItem.list.push(item)

    let outItem = outTree[item.outLink]
    if (!outItem) {
      outItem = {
        id: item.outLink,
        name: v.outLine,
        color: ColorList[inIndex],
        list: [],
        count: 0,
        max: Number.MIN_SAFE_INTEGER,
        point: item.endPoint.clone(),
        dir: vec3.clone(),
        normal: item.outNormal.clone(),
        angle: angle3,
      }
      outTree[item.outLink] = outItem
    }
    if (item.value > outItem.max) outItem.max = item.value
    outItem.count += item.value
    outItem.list.push(item)
  }

  for (const inLine of Object.values(inTree)) {
    // { color, list, max, point, count, angle, normal }
    inLine.list.sort((a, b) => a.sort - b.sort)

    const textOffset = TEXT_SIZE / 2
    let totalOffset = 0
    let maxTextWidth = 0
    for (const [i, v] of inLine.list.entries()) {
      let lineWidth = (1 + ((v.value - minValue) / (maxValue - minValue) || 0)) * LINE_WIDTH
      let inOffset = 0
      if (i == 0) {
        inOffset = totalOffset
        totalOffset += lineWidth / 2 + LINE_WIDTH * 0.2
      } else {
        totalOffset += lineWidth / 2
        inOffset = totalOffset
        totalOffset += lineWidth / 2 + LINE_WIDTH * 0.2
      }

      const lineText = new Konva.Text({
        text: v.value,
        fontSize: TEXT_SIZE,
        fontFamily: 'Calibri',
        fill: 'black',
        rotation: (inLine.angle * 180) / Math.PI,
      })
      _LineTextMap[String(v.id)] = lineText
      _group.add(lineText)
      const textWdith = lineText.width()
      if (textWdith > maxTextWidth) maxTextWidth = textWdith

      const lineTextPoint = v.startPoint.clone()
      lineTextPoint
        .add(inLine.dir.setLength(textOffset + lineText.width()))
        .add(v.inNormal.setLength(textOffset + inOffset - lineText.height()))
      lineText.x(lineTextPoint.x)
      lineText.y(lineTextPoint.y)
      lineText.scale({ x: -1, y: -1 })

      const startPoint = v.startPoint.clone().add(v.inNormal.setLength(inOffset)).toArray()
      const startPointControl = v.startPointControl
        .clone()
        .add(v.inNormal.setLength(inOffset))
        .toArray()
      const endPointControl = v.endPointControl.toArray()
      const endPoint = v.endPoint.toArray()

      const line = new Konva.Arrow({
        name: String(v.id),
        points: [startPoint, startPointControl, endPointControl, endPoint].flat(2),
        fill: inLine.color,
        stroke: inLine.color,
        strokeWidth: lineWidth,
        pointerWidth: lineWidth,
        pointerLength: lineWidth,
        bezier: true,
        // lineCap: "round",
        // lineJoin: "round",
      })
      _LineMap[String(v.id)] = line
      _group.add(line)

      const lineName = new Konva.TextPath({
        text: `     ${v.name}`,
        fontSize: LINE_WIDTH * 0.8,
        fontFamily: 'Calibri',
        fill: '#fff',
        data: `M${startPoint.join(' ')} C ${startPointControl.join(' ')}, ${endPointControl.join(' ')}, ${endPoint.join(' ')}`,
      })

      _LineNameMap[String(v.id)] = lineName
      _group.add(lineName)
      // lineName.moveToTop();

      line.on('click', (e) => {
        const id = e.target.name()
        _LineTextMap[id].moveToTop()
        _LineMap[id].moveToTop()
        _LineNameMap[id].moveToTop()
      })
      line.on('mouseenter', (e) => {
        // _stage.container().style.cursor = "pointer";
      })
      line.on('mouseleave', (e) => {
        // _stage.container().style.cursor = "default";
      })
    }

    const inText = new Konva.Text({
      text: `${inLine.name}：${inLine.count}`,
      fontSize: TEXT_SIZE * 2,
      fontFamily: 'Calibri',
      fill: 'black',
      rotation: (inLine.angle * 180) / Math.PI,
      // stroke: "#ffffff",
      // strokeWidth: 1,
    })
    _inTextMap[String(inLine.id)] = inText
    _group.add(inText)

    const inTextPoint = inLine.point.clone()
    inTextPoint
      .add(inLine.dir.setLength(maxTextWidth + TEXT_SIZE * 2 + inText.width()))
      .add(inLine.normal.setLength((totalOffset - inText.height()) / 2))
    inText.x(inTextPoint.x)
    inText.y(inTextPoint.y)
    inText.scale({ x: -1, y: -1 })
  }

  for (const outLine of Object.values(outTree)) {
    let lineWidth = (1 + ((outLine.max - minValue) / (maxValue - minValue) || 0)) * LINE_WIDTH
    const outTextPoint = outLine.point.clone()
    const outText = new Konva.Text({
      text: `${outLine.name}：${outLine.count}`,
      fontSize: TEXT_SIZE * 2,
      fontFamily: 'Calibri',
      fill: 'black',
      rotation: (outLine.angle * 180) / Math.PI,
      // stroke: "#ffffff",
      // strokeWidth: 1,
    })
    _outTextMap[String(outLine.id)] = outText
    _group.add(outText)

    outTextPoint.sub(outLine.dir.setLength(outText.width() + lineWidth * 2))
    outTextPoint.add(outLine.normal.setLength(outText.height() / 2))
    outText.x(outTextPoint.x)
    outText.y(outTextPoint.y)
  }

  return {
    _group,
    _LineMap,
    _LineTextMap,
    _LineNameMap,
    _inTextMap,
    _outTextMap,
  }
}
function handleDraw() {
  const { center = [0, 0] } = detail.value.mapInfo
  const chart = getChart(center, tableList1.value)

  if (_group) _group.destroy()
  _group = chart._group
  _layer.add(_group)
  handleChartResize()

  _LineMap = chart._LineMap
  _LineTextMap = chart._LineTextMap
  _LineNameMap = chart._LineNameMap

  _inTextMap = chart._inTextMap
  _outTextMap = chart._outTextMap
}
function handleClose() {
  emits('update:visible', false)
  emits('close')
}
function getCrossroadsDetail() {
  return API.crossroadsDetail(props.crossroadsId).then((res) => {
    res.data.crossroads.mapInfo = JsonParse(res.data.crossroads.mapInfo, {})
    res.data.crossroads.annex = JsonParse(res.data.crossroads.annex, [])
    detail.value = res.data.crossroads
    crossroadsData.value = [detail.value.beginTime, detail.value.endTime]
  })
}
function getCrossroadsCorssStatsTable() {
  loading.value = true
  return API.crossroadsCorssStatsTable(props.crossroadsId).then((res) => {
    tableList1.value = res.data
    loading.value = false
  })
}
function crossroadsAnalyzeVideo() {
  if (!props.crossroadsId) return
  API.crossroadsAnalyzeVideo(props.crossroadsId)
}
function crossroadsTrackImage() {
  if (!props.crossroadsId) return
  API.crossroadsTrackImage(props.crossroadsId)
}
function crossroadsExportCorssStatsTable() {
  if (!props.crossroadsId) return
  API.crossroadsExportCorssStatsTable(props.crossroadsId)
}
function handleDelete(row, index) {
  props
    .$confirm(`是否确认删除线名为 ${row.name} 的记录?`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    .then(function () {
      return API.crossroadsDeleteStats(row.id)
    })
    .then(() => {
      props.$message.success('删除成功')
      return getCrossroadsCorssStatsTable()
    })
    .then(() => {
      handleDraw()
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
        API.crossroadsUpdateStats(form)
          .then((response) => {
            props.$message.success('修改成功')
            open.value = false
            return getCrossroadsCorssStatsTable()
          })
          .then(() => {
            handleDraw()
          })
      } else {
        API.crossroadsInsertStats(form)
          .then((response) => {
            props.$message.success('新增成功')
            open.value = false
            return getCrossroadsCorssStatsTable()
          })
          .then(() => {
            handleDraw()
          })
      }
    }
  })
}
function handleChartToDataUrl() {
  handleChartResize()
  const a = document.createElement('a')
  a.download = 'chart.png'
  a.href = _layer.toDataURL()
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

function handleSubmit() {
  const form = JSON.parse(JSON.stringify(detail.value))
  form.mapInfo = JSON.stringify(form.mapInfo)
  form.annex = JSON.stringify(form.annex)
  form.beginTime = crossroadsData.value[0]
  form.endTime = crossroadsData.value[1]
  saving.value = true
  API.crossroadsUpdate(form)
    .then((res) => {
      changeCrossroadsData.value = false
      saving.value = false
      props.$message.success('修改成功')
      Promise.all([getCrossroadsDetail(), getCrossroadsCorssStatsTable()]).then((res) => {
        handleDraw()
      })
    })
    .catch((err) => {
      saving.value = false
    })
}
function addAnnex() {
  let input = document.createElement('input')
  input.type = 'file'
  input.accept = 'video/*'
  input.style = 'position: fixed;left: -100vw;top: -100vh;'
  input.onchange = () => {
    let file = input.files[0]
    if (file) {
      uploading.value = true
      let data = new FormData()
      data.append('file', file)
      request({
        url: `/file/upload`,
        method: 'post',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        data: data,
      })
        .then((res) => {
          detail.value.annex.push({
            name: file.name,
            url: res.data,
          })
          handleSubmit()
        })
        .finally(() => {
          document.body.removeChild(input)
          uploading.value = false
        })
    } else {
      document.body.removeChild(input)
    }
  }
  document.body.appendChild(input)
  input.click()
}
function deleteAnnex(index) {
  detail.value.annex.splice(index, 1)
  handleSubmit()
}
function handleQx() {
  changeCrossroadsData.value = false
  crossroadsData.value = [detail.value.beginTime, detail.value.endTime]
}
</script>

<style lang="scss" scoped>
.CrossroadsDetail {
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

  .title {
    font-size: 14px;
    margin: 10px 0;
  }
  .CrossroadsDetail_body {
    position: relative;
    padding: 20px;
  }
  .CrossroadsDetail_pagination {
    position: relative;
    margin-top: 10px;
    left: -12px;
  }
}
.canvas {
  border: 1px solid #00000011;
  position: relative;
  margin-bottom: 20px;
  width: 100%;
}
</style>
