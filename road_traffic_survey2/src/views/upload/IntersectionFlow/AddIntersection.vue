<!-- AddIntersection -->
<template>
  <MDialog
    class="AddIntersection"
    title="新增交叉口"
    subTitle="人工数车/ 交叉口流量录入 / 新增交叉口"
    :top="80"
    :left="80"
    width="365px"
    hideClose
    :visible="visible"
    @close="handleClose"
  >
    <div class="ai_bodyer">
      <img src="@/assets/images/close.svg?url" class="close_btn" @click.stop="handleClose" />

      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" :inline="false">
        <el-form-item label="交叉口位置" prop="center">
          {{ MercatorToWGS84(form.center[0], form.center[1]) }}
        </el-form-item>
        <el-form-item label="调整位置">
          <el-switch
            v-model="selectState"
            :active-value="POINT_SELECT_STATE_KEY.ENABLE"
            :inactive-value="POINT_SELECT_STATE_KEY.DISABLE"
            @change="handleChangeSelectState"
          />
        </el-form-item>
        <el-form-item label="交叉口名称" prop="name">
          <el-input type="textarea" v-model="form.name" :autosize="{ minRows: 2 }"> </el-input>
        </el-form-item>
        <el-form-item>
          <el-button @click="handleClose">取消</el-button>
          <el-button :loading="saving" type="primary" @click="handleSubmit">下一步</el-button>
        </el-form-item>
      </el-form>
    </div>
  </MDialog>
</template>

<script setup>
import * as API from '@/api/index'
import { MercatorToWGS84 } from '@/mymap/utils/LngLatUtils'
import { injectSync, addWatch } from '@/utils/index'
import {
  PointSelectLayer,
  POINT_SELECT_STATE_KEY,
  POINT_SELECT_EVENT,
} from '@/utils/MapLayer/PointSelectLayer'
import { onUnmounted } from 'vue'

let _Map = null
const emits = defineEmits(['update:visible', 'close', 'submited'])
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
const saving = ref(false)
const formRef = ref(null)
const form = reactive({
  center: [0, 0],
  name: '',
})
const rules = reactive({
  center: [{ required: true, message: '请选择交叉口位置', trigger: 'blur' }],
  name: [{ required: true, message: '请输入交叉口名称', trigger: 'blur' }],
})
const selectState = ref(POINT_SELECT_STATE_KEY.ENABLE)
const _PointSelectLayer = new PointSelectLayer({
  zIndex: 120,
  color: '#ff0000',
  state: selectState.value,
  event: {
    [POINT_SELECT_EVENT.STATE_CHANGE]: (res) => {
      selectState.value = res.data.state
    },
    [POINT_SELECT_EVENT.POINT_CHANGE]: (res) => {
      if (res.data.point[0] && res.data.point[1]) {
        form.center = res.data.point
      } else {
        form.center = null
      }
    },
  },
})

const watchVisible = addWatch(
  () => props.visible,
  (val) => {
    if (val) {
      form.center = [0, 0]
      form.name = ''
      _Map.addLayer(_PointSelectLayer)
    } else {
      _Map.removeLayer(_PointSelectLayer)
    }
  },
)

function handleChangeSelectState(value) {
  _PointSelectLayer.state = value
}

function handleSubmit() {
  formRef.value.validate((valid) => {
    if (valid) {
      const form = {
        x: form.center[0], // 开始时间
        y: form.center[1], // 结束时间
        name: form.name, // 备注
      }
      saving.value = true
      intersectionInsert(form)
        .then((res) => {
          emits('submited', res.data)
          saving.value = false
        })
        .catch((err) => {
          saving.value = false
        })
    }
  })
}

function handleClose() {
  emits('update:visible', false)
  emits('close')
}

injectSync('MapRef').then((map) => {
  _Map = map.value
  watchVisible.callback(props.visible)
})
onUnmounted(() => {
  watchVisible.stop()
  _PointSelectLayer.dispose()
})
</script>

<style lang="scss" scoped>
.AddIntersection {
  .ai_bodyer {
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
  }
}
</style>
