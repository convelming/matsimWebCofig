<!-- AddDialog -->
<template>
  <MDialog
    class="CTPAddDialog"
    title="新建项目"
    :y="80"
    :x="80"
    width="500px"
    hideMinimize
    :visible="visible"
    @close="handleClose"
  >
    <el-scrollbar class="flex-scrollbar">
      <div class="ctp_add_bodyer">
        <!-- <img src="@/assets/images/close.svg?url" class="close_btn" @click.stop="handleClose" /> -->

        <el-form :model="form" ref="formRef" :rules="rules" label-width="100px" :inline="false">
          <el-form-item label="项目名：" prop="name">
            <el-input v-model="form.name" placeholder="" clearable @change=""></el-input>
          </el-form-item>
          <el-form-item label="创建人：" prop="creator">
            <el-input v-model="form.creator" placeholder="" clearable @change=""></el-input>
          </el-form-item>
          <el-form-item label="项目时间：" prop="projectTime">
            <el-date-picker
              v-model="form.projectTime"
              type="month"
              placeholder="选择日期时间"
              value-format="yyyy-MM"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item label="项目范围：" :prop="{ 1: 'xyarr', 2: 'file' }[form.xyarrType]">
            <el-radio-group v-model="form.xyarrType">
              <el-radio-button :label="1">地图框选</el-radio-button>
              <el-radio-button :label="2">上传shp</el-radio-button>
            </el-radio-group>
            <template v-if="form.xyarrType == 1">
              <div style="margin-top: 10px">
                <el-button
                  v-if="selectState == POLYGON_SELECT_STATE_KEY.NOT_STARTED"
                  type="primary"
                  @click="handlePlayPolygonSelect()"
                  >开始圈定</el-button
                >
                <template v-if="selectState != POLYGON_SELECT_STATE_KEY.NOT_STARTED">
                  <el-button type="primary" @click="handleReplayPolygonSelect()"
                    >重新圈定</el-button
                  >
                  <el-button type="primary" @click="handleStopPolygonSelect()">结束圈定</el-button>
                </template>
              </div>
              <div v-if="form.xyarr" style="margin-top: 10px">{{ form.xyarr }}</div>
            </template>
            <template v-if="form.xyarrType == 2">
              <div style="margin-top: 10px">
                <el-button type="primary" @click="handleSelectFile">上传shp</el-button>
              </div>
              <div v-if="form.file" style="margin-top: 10px">{{ form.file.name }}</div>
            </template>
          </el-form-item>
          <el-form-item label="注：">该范围仅供参考，可框选大概位置。</el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSubmit">立即创建</el-button>
            <el-button @click="handleClose">取消</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-scrollbar>
  </MDialog>
</template>

<script setup>
import {
  PolygonSelectLayer,
  POLYGON_SELECT_STATE_KEY,
  POLYGON_SELECT_EVENT,
} from '@/utils/MapLayer/PolygonSelectLayer'
import {
  projectList,
  projectInsert,
  projectDelete,
  projectAddSample,
  projectQuerySample,
} from '@/api/index'
import { injectSync, addWatch, selectFile } from '@/utils/index'
import { ElMessage } from 'element-plus'

let _Map = null
const emit = defineEmits(['update:visible', 'close', 'success'])
const { proxy } = getCurrentInstance()
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  proId: {
    type: Number,
    default: 0,
  },
})

const formRef = ref(null)
const form = ref({
  name: '',
  creator: '',
  projectTime: '',
  file: null,
  xyarr: null,
  xyarrType: 1,
})
const rules = {
  name: [{ required: true, message: '项目名不能为空', trigger: 'blur' }],
  creator: [{ required: true, message: '创建人不能为空', trigger: 'blur' }],
  projectTime: [{ required: true, message: '项目时间不能为空', trigger: 'blur' }],
  xyarr: [{ required: true, message: '项目范围不能为空', trigger: 'blur' }],
  file: [{ required: true, message: '项目范围不能为空', trigger: 'blur' }],
}
const selectState = ref(POLYGON_SELECT_STATE_KEY.NOT_STARTED)
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
      }
    },
  },
})

const watchVisible = addWatch(
  () => props.visible,
  (val) => {
    if (val) {
      _Map.addLayer(_PolygonSelectLayer)
    } else {
      handleStopPolygonSelect(true)
      _Map.removeLayer(_PolygonSelectLayer)
    }
  },
)

function handleClose() {
  form.value = {
    name: '',
    creator: '',
    projectTime: '',
    file: null,
    xyarr: null,
    xyarrType: 1,
  }
  emit('update:visible', false)
  emit('close')
}

function handleSubmit() {
  formRef.value?.validate((valid) => {
    if (valid) {
      const _form = {
        name: form.value.name,
        creator: form.value.creator,
        projectTime: form.value.projectTime,
        xyarrType: 1,
      }
      if (form.value.xyarrType == 1) _form.xyarr = JSON.stringify(form.value.xyarr)
      if (form.value.xyarrType == 2) _form.file = form.value.file
      projectInsert(_form).then((response) => {
        proxy.$message.success('新建项目成功')
        emit('success', response.data.id)
      })
    }
  })
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
    if (reset) _PolygonSelectLayer.reset()
    _PolygonSelectLayer.stop()
    selectState.value = _PolygonSelectLayer.state
  }
}
// ****************************** 数据筛选 -- 区域框选 -- end
function handleSelectFile() {
  selectFile('.shp').then((file) => (form.value.file = file))
}

injectSync('MapRef').then((map) => {
  _Map = map.value
  watchVisible.callback(props.visible)
})

onUnmounted(() => {
  watchVisible.stop()
  _PolygonSelectLayer.dispose()
})
</script>

<style lang="scss" scoped>
.CTPAddDialog {
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
  .flex-scrollbar {
    max-height: calc(100vh - 200px);
  }
  .ctp_add_bodyer {
    padding: 16px;
  }
}
</style>
