<template>
  <div class="UploadVideo">
    <div class="progress_box" v-if="uploading">
      <el-progress :percentage="progress"></el-progress>
      <i class="el-icon-circle-close" @click="controller.abort()"></i>
    </div>
    <template v-else>
      <el-button type="primary" @click="handleSelectFile">选择视频</el-button>
      <div class="file_box" v-if="modelValue">
        <a :href="`/file/download?url=${modelValue}`" class="file_name">{{ modelValue }}</a>
        <!-- <i class="el-icon-delete" @click="handleInput('')"></i> -->
        <el-icon class="el-icon-delete" size="18px" @click="handleInput('')">
          <Delete />
        </el-icon>
      </div>
    </template>
  </div>
</template>

<script>
import request from '@/utils/request'
import { Setting, Download, Loading, Delete, Plus, Aim } from '@element-plus/icons-vue'

export default {
  components: {
    Delete,
  },
  props: {
    modelValue: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      controller: null,
      progress: 0,
      uploading: false,
    }
  },
  beforeDestroy() {
    if (this.controller) {
      this.controller.abort()
      this.controller = null
    }
  },
  methods: {
    handleInput(val) {
      this.$emit('update:modelValue', val)
      this.$emit('input', val)
    },
    handleSelectFile() {
      if (this.controller) this.controller.abort()
      this.controller = new AbortController()
      let input = document.createElement('input')
      input.type = 'file'
      input.accept = 'video/*'
      input.style = 'position: fixed;left: -100vw;top: -100vh;'
      input.onchange = () => {
        let file = input.files[0]
        let data = new FormData()
        data.append('file', file)
        request({
          url: `/file/upload`,
          method: 'post',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          data: data,
          signal: this.controller.signal,
          onUploadProgress: (progressEvent) => {
            console.log(progressEvent)
            // this.progress = progressEvent.loaded / progressEvent.total;
            this.progress = Math.floor(progressEvent.progress * 95)
            this.uploading = true
          },
        })
          .then((res) => {
            console.log(res)

            this.handleInput(res.data)
          })
          .finally(() => {
            document.body.removeChild(input)
            this.uploading = false
            this.progress = 0
          })
      }
      document.body.appendChild(input)
      input.click()
    },
  },
}
</script>

<style lang="scss" scoped>
.UploadVideo {
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
    margin-top: 20px;
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 5px 15px;
    border-radius: 5px;
    border: 1px solid #409eff;
    color: #409eff;
    line-height: 30px;
    .file_name {
      width: 100%;
      flex-grow: 1;
    }
    .el-icon-delete {
      cursor: pointer;
      color: #f56c6c;
    }
  }
}
</style>
