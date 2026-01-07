<!-- AddNews -->
<template>
  <Teleport to="body">
    <div class="AddNews" v-show="visible">
      <transition name="el-zoom-in-center">
        <div class="AddNews_dialog">
          <div class="AddNews_dialog_header">
            <div class="text">上传新闻</div>
            <el-icon class="close_btn" size="30px" @click="handleClose"><Close /></el-icon>
          </div>
          <el-scrollbar class="AddNews_dialog_bodyer">
            <el-form
              :model="form"
              ref="formRef"
              :rules="rules"
              label-position="top"
              :inline="false"
              size=""
            >
              <el-form-item label="标题：" prop="title">
                <el-input v-model="form.title"></el-input>
              </el-form-item>
              <el-form-item label="内容：" prop="content">
                <div class="QuillEditor">
                  <QuillEditor contentType="html" ref="QuillEditorRef" theme="snow" />
                </div>
              </el-form-item>
              <el-form-item label="封面：" prop="cover">
                <el-upload
                  class="avatar-uploader"
                  :show-file-list="false"
                  v-model:file-list="form.cover"
                  v-bind="uploadConfig2"
                >
                  <el-image
                    v-if="form.cover && form.cover[0]"
                    class="avatar"
                    :src="VITE_APP_BASE_API + form.cover[0].response.data.url"
                    fit="fill"
                    :lazy="true"
                  ></el-image>
                  <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
                </el-upload>
              </el-form-item>
              <el-form-item label="附件上传：" prop="annexs">
                <el-upload
                  class="upload"
                  v-model:file-list="form.annexs"
                  v-bind="uploadConfig"
                  drag
                  multiple
                >
                  <div class="upload__text">
                    <el-icon size="30px" color="#30B690"><Plus /></el-icon>
                    <span>点击上传文件</span>
                  </div>
                  <div class="upload__tip">支持pdf/word/ppt/excl格式，文件大小不超过10Mb</div>
                </el-upload>
              </el-form-item>

              <el-form-item label="时间：" prop="date">
                <el-date-picker
                  v-model="form.date"
                  type="datetime"
                  placeholder="选择日期"
                  value-format="YYYY-MM-DD HH:mm:ss"
                ></el-date-picker>
              </el-form-item>
              <el-form-item label="作者：" prop="author">
                <el-input v-model="form.author"></el-input>
              </el-form-item>
              <!-- <el-form-item>
                  <el-button type="primary" @click="onSubmit">立即创建</el-button>
                  <el-button>取消</el-button>
                </el-form-item> -->
            </el-form>
          </el-scrollbar>
          <div class="AddNews_dialog_footer">
            <el-button type="info" @click="handleClose">取消</el-button>
            <el-button type="primary" @click="onSubmit">提交</el-button>
          </div>
        </div>
      </transition>
    </div>
  </Teleport>
</template>

<script setup>
import { newsAdd } from '@/api/home.js'

import { Close, UploadFilled, Plus } from '@element-plus/icons-vue'
import { watch } from 'vue'

const VITE_APP_BASE_API = import.meta.env.VITE_APP_BASE_API
const { proxy } = getCurrentInstance()
const emit = defineEmits(['close', 'update:visible'])
const props = defineProps({
  visible: Boolean,
})
const submiting = ref(false)
const form = ref({
  title: '',
  author: '',
  date: '',
  content: '',
  cover: [],
  annexs: [],
})
const rules = {
  title: [{ required: true, message: '请输入新闻标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入新闻内容', trigger: 'blur' }],
}
const formRef = ref(null)
const QuillEditorRef = ref(null)
const uploadConfig = reactive({
  action: import.meta.env.VITE_APP_BASE_API + '/newsAnnex',
  data: {
    type: 0,
  },
  accept: '',
  limit: 10,
  headers: {},
  disabled: false,
  autoUpload: true,
  method: 'put',
})
const uploadConfig2 = reactive({
  action: import.meta.env.VITE_APP_BASE_API + '/newsAnnex',
  data: {
    type: 1,
  },
  accept: 'image/*',
  limit: 1,
  headers: {},
  disabled: false,
  autoUpload: true,
  method: 'put',
})

watch(
  () => props.visible,
  (val) => {
    if (val) {
      form.value = {
        title: '',
        author: '',
        date: '',
        content: '',
        cover: [],
        annexs: [],
      }
      QuillEditorRef.value.setHTML('')
      formRef.value.resetFields()
    }
  },
)

function handleClose() {
  emit('update:visible', false)
  emit('close')
}
function onSubmit() {
  submiting.value = true
  form.value.content = QuillEditorRef.value.getHTML()
  formRef.value
    .validate()
    .then(() => {
      const _form = {
        title: form.value.title,
        content: form.value.content,
        annexs: [
          ...form.value.annexs.map((v) => v.response.data),
          ...form.value.cover.map((v) => v.response.data),
        ],
        date: form.value.date,
        author: form.value.author,
      }
      return newsAdd(_form)
    })
    .then(() => {
      proxy.$message.success('添加成功')
      handleClose()
    })
    .finally(() => {
      submiting.value = false
    })
}
</script>

<style lang="scss" scoped>
.AddNews {
  z-index: 1000;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  .AddNews_dialog {
    max-width: 800px;
    width: 80%;
    background-color: #fff;
    &_header {
      display: flex;
      align-items: center;
      height: 60px;
      gap: 10px;
      padding: 0 20px 0 40px;
      background: rgba($color: #6db6a1, $alpha: 0.2);
      .text {
        width: 0;
        flex: 1;
        font-size: 20px;
      }
      .close_btn {
        cursor: pointer;
      }
    }
    &_bodyer {
      height: calc(80vh - 60px - 92px);
      .el-form {
        padding: 40px 80px;
      }
      .QuillEditor {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 300px;
        :deep(.ql-container) {
          height: 0;
          flex: 1;
        }
      }
      .upload {
        width: 100%;
        :deep(.el-upload-dragger) {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #fafafa;
          height: 80px;
          padding: 0;
          &:hover {
            border-color: #30b690;
          }
        }
        .upload__text {
          display: flex;
          align-items: center;
          font-weight: 500;
          font-size: 16px;
          color: #30b690;
          gap: 8px;
          line-height: 24px;
        }
        .upload__tip {
          font-size: 12px;
          color: #999999;
          line-height: 16px;
        }
      }

      .avatar-uploader {
        :deep(.el-upload) {
          border: 1px dashed var(--el-border-color);
          border-radius: 6px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: var(--el-transition-duration-fast);
          &:hover {
            border-color: #30b690;
          }
        }
        .avatar {
          min-width: 100px;
          width: auto;
          height: 100px;
        }
        .el-icon.avatar-uploader-icon {
          font-size: 28px;
          color: #8c939d;
          width: 100px;
          height: 100px;
          text-align: center;
        }
      }
    }
    &_footer {
      height: 92px;
      box-shadow: 0px -2px 4px 0px rgba(0, 0, 0, 0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 24px;
    }
  }
}
</style>
