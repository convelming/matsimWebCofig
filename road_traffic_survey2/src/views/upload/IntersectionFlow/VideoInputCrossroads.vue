<!-- VideoInputCrossroads -->
<template>
  <MDialog
    class="VideoInputCrossroads"
    title="视频录入交叉口"
    :top="80"
    :left="80"
    width="500px"
    hideClose
    :visible="visible"
    @close="handleClose"
  >
    <div class="vic_bodyer">
      <!-- <img src="@/assets/images/close.svg?url" class="close_btn" @click.stop="handleClose" /> -->

      <el-form :model="form" ref="formRef" :rules="rules" label-width="100px">
        <el-form-item label="调查时间" prop="date">
          <el-date-picker
            v-model="form.date"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd HH:mm:ss"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="调查视频" prop="video">
          <UploadVideo v-model="form.video" />
        </el-form-item>
        <el-form-item label="视频角度" prop="videoType">
          <el-radio-group v-model="form.videoType">
            <el-radio
              v-for="item in videoType"
              :key="item.value"
              :label="item.value"
              :disabled="item.disabled"
            >
              {{ item.label }}</el-radio
            >
          </el-radio-group>
        </el-form-item>
        <el-form-item label="附件" prop="annex">
          <el-upload
            class="upload-demo"
            action="/file/upload"
            multiple
            :file-list="form.annex"
            :on-success="handleUploadAnnex"
          >
            <el-button type="primary">点击上传</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" v-model="form.remark" :autosize="{ minRows: 2 }"> </el-input>
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
import { injectSync, addWatch } from '@/utils/index'
import UploadVideo from '@/components/UploadVideo.vue'

let _Map = null
const { proxy } = getCurrentInstance()
const emit = defineEmits(['update:visible', 'close', 'submited'])
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  intersectionId: {
    type: Number,
    default: 0,
  },
})
const upload = reactive({
  loading: false,
  progress: 0,
  file: null,
})
const saving = ref(false)
const form = ref({})
const formRef = ref(null)
const rules = {
  date: [{ required: true, message: '调查时间不能为空', trigger: 'blur' }],
  video: [{ required: true, message: '调查视频不能为空', trigger: 'blur' }],
}
const videoType = [
  { label: '俯视航拍', value: 1 },
  { label: '侧面路拍', value: 2, disabled: true },
  { label: '正斜角拍摄', value: 3, disabled: true },
]
const intersectionDetail = ref(null)

const watchVisible = addWatch(
  () => props.visible,
  (val) => {
    if (val) {
      handleEnable()
    } else {
      handleDisable()
    }
  },
  {
    deep: true,
    immediate: true,
  },
)

// 组件显示事件
function handleEnable() {
  API.intersectionDetail(props.intersectionId).then((res) => {
    intersectionDetail.value = res.data
    form.value = {
      date: [],
      video: '',
      remark: '',
      videoType: 1,
      annex: [],
    }
  })
}
// 组件隐藏事件
function handleDisable() {}
function handleClose() {
  emit('update:visible', false)
  emit('close')
}
function handleUploadAnnex(response, file, fileList) {
  form.value.annex = fileList
}
function handleSubmit() {
  formRef.value.validate((valid) => {
    if (valid) {
      const form = {
        intersectionId: intersectionDetail.value.id,
        beginTime: form.value.date[0], // 开始时间
        endTime: form.value.date[1], // 结束时间
        type: '2', // 类型
        video: form.value.video, // 视频路径
        videoType: form.value.videoType, // 视频路径
        annex: form.value.annex.map((v) => ({
          name: v.name,
          url: v.response.data,
        })), // 附件
        mapInfo: JSON.stringify({
          center: [intersectionDetail.value.x, intersectionDetail.value.y],
          zoom: 19,
          rotation: 0,
        }),
        remark: form.value.remark, // 备注
      }
      saving.value = true
      API.crossroadsInsert(form)
        .then((res) => {
          emit('submited', res.data)
          saving.value = false
        })
        .catch((err) => {
          saving.value = false
        })
    }
  })
}

injectSync('MapRef').then((map) => {
  _Map = map.value
})
onUnmounted(() => {
  watchVisible.stop()
})
</script>

<style lang="scss" scoped>
.VideoInputCrossroads {
  .vic_bodyer {
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
