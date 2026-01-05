<!-- Upload -->
<template>
  <MDialog
    class="Upload"
    title="批量上传图片"
    subTitle="拍照图片 / 仅图片 / 批量上传图片"
    :top="80"
    :left="80"
    width="365px"
    hideClose
    :visible="visible"
    @close="handleClose"
  >
    <div class="Upload_body">
      <!-- <img src="@/assets/images/close.svg?url" class="close_btn" @click.stop="handleClose" /> -->

      <el-form :model="form" ref="formRef" :rules="rules" label-width="60px" :inline="false">
        <el-form-item label="名称" prop="projectName">
          <el-input v-model="form.projectName"></el-input>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-input v-model="form.type"></el-input>
        </el-form-item>
        <el-form-item label="文件" prop="file">
          <div class="file_box" v-if="form.file">
            <div class="file_name">{{ form.file.name }}</div>
            <!-- <i class="el-icon-circle-close" @click="form.file = null"></i> -->
            <el-icon @click="form.file = null"><CloseBold /></el-icon>
          </div>
          <el-button v-else type="primary" @click="handleSelectFile">选择文件</el-button>
        </el-form-item>
        <el-form-item>
          <div class="progress_box" v-if="uploadData.uploading">
            <el-progress :percentage="uploadData.progress"></el-progress>
            <i class="el-icon-circle-close" @click="uploadData.controller.abort()"></i>
          </div>
          <template v-else>
            <el-button type="primary" @click="handleSubmit">立即上传</el-button>
            <el-button @click="handleClose">取消</el-button>
          </template>
        </el-form-item>
      </el-form>
    </div>
  </MDialog>
</template>

<script setup>
import * as API from '@/api/index'
import { injectSync, addWatch } from '@/utils/index'
import { CloseBold } from '@element-plus/icons-vue'

let _Map = null
const { proxy } = getCurrentInstance()
const emit = defineEmits(['update:visible', 'close', 'submited'])
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

const uploadData = ref({
  controller: null,
  progress: 0,
  uploading: false,
})
const form = ref({
  name: '',
  type: '',
  file: null,
})
const formRef = ref(null)
const rules = {
  file: [
    {
      trigger: 'blur',
      validator: (rule, value, callback) => {
        if (!form.value.file) {
          callback(new Error('请选择文件'))
        } else {
          callback()
        }
      },
    },
  ],
}

const watchProps = addWatch(
  props,
  (val) => {
    if (val.visible) {
      form.value = { projectName: '', type: '', file: null }
      uploadData.value = {
        controller: null,
        progress: 0,
        uploading: false,
      }
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

let _input = null
function handleSelectFile() {
  if (_input) {
    document.body.removeChild(_input)
    _input = null
  }
  _input = document.createElement('input')
  _input.type = 'file'
  _input.accept = '.zip'
  _input.style = 'position: fixed;left: -100vw;top: -100vh;'
  _input.onchange = () => {
    let file = _input.files[0]
    if (file) {
      form.value.fileName = file.name
      form.value.file = file
    }
    document.body.removeChild(_input)
    _input = null
  }
  document.body.appendChild(_input)
  _input.click()
}

function handleSubmit() {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    if (uploadData.value.controller) uploadData.value.controller.abort()
    uploadData.value.controller = new AbortController()
    let data = new FormData()
    data.append('file', form.value.file)
    data.append('projectName', form.value.projectName)
    data.append('type', form.value.type)
    request({
      url: `/mappicture/uploadzip`,
      method: 'post',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      data: data,
      signal: uploadData.value.controller.signal,
      onUploadProgress: (progressEvent) => {
        uploadData.value.progress = Math.floor(progressEvent.progress * 95)
        uploadData.value.uploading = true
      },
    })
      .then((res) => {
        emit('submited', res)
        proxy.$message.success('上传成功')
      })
      .finally(() => {
        uploadData.value.controller = null
        uploadData.value.uploading = false
        uploadData.value.progress = 0
      })
  })
}
</script>

<style lang="scss" scoped>
.Upload_body {
  position: relative;
  padding: 20px;

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

  .progress_box {
    display: flex;
    align-items: center;
    height: 40px;
    .el-progress {
      width: 100%;
    }
    .el-icon-circle-close {
      cursor: pointer;
      margin-left: 10px;
    }
  }

  .file_box {
    width: 100%;
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 0px 15px;
    border-radius: 5px;
    border: 1px solid #409eff;
    color: #409eff;
    line-height: 28px;
    .file_name {
      width: 0;
      flex-grow: 1;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }
    .el-icon-circle-close {
      cursor: pointer;
      color: #f56c6c;
    }
  }
}
</style>
