<!-- MButton -->
<template>
  <a v-bind="$attrs" :class="s_class" @click="handleClick">
    <slot v-if="$slots.default"></slot>
    <template v-else>{{ title }}</template>
  </a>

  <el-dialog v-model="showIframe" width="900px" v-if="type == 'iframe'">
    <div style="color: red" v-if="msg">{{ msg }}</div>
    <el-auto-resizer style="width: 100%; height: calc(100vh - 300px)">
      <template #default="{ height, width }">
        <iframe v-if="showIframe" style="border: 0" :width="width" :height="height" :src="path">
        </iframe>
      </template>
    </el-auto-resizer>
  </el-dialog>

  <el-dialog title="PDF加水印" v-model="pdfShow" width="500px" v-if="type == 'pdf'">
    <el-form
      ref="pdfFormRef"
      :model="pdfForm"
      :rules="pdfRules"
      label-width="80px"
      :inline="false"
      v-loading="pdfLoading"
      loading-text="正在处理中..."
    >
      <el-form-item label="水印内容" prop="water">
        <el-input v-model="pdfForm.water"></el-input>
      </el-form-item>
      <el-form-item label="pdf文件" prop="pdf">
        <el-button type="primary" @click="handleSelectPdf">点击选择</el-button>
        <div v-if="pdfForm.pdf">{{ pdfForm.pdf.name }}</div>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSubmitPdf">立即处理</el-button>
        <el-button>取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script setup>
import { pdfWatermark, indexHotLinkClick } from '@/api/home'
import { ElMessage } from 'element-plus'
import { ref, toRaw, useAttrs } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import { selectFile } from '@/utils/index'
import { saveAs } from 'file-saver'

const route = useRoute()
const router = useRouter()
const props = defineProps({
  type: String,
  title: String,
  path: String,
  msg: String,
  record: {
    type: Boolean,
    default: true,
  },
  activeClass: String,
  to: Object,
})
const emits = defineEmits(['btnClick'])

const showIframe = ref(false)
const s_class = computed(() => {
  if (props.type == 'router' && props.activeClass && router.resolve(props.to).name == route.name) {
    return props.activeClass
  }
  return ''
})
function handleClick(e) {
  if (props.record) {
    indexHotLinkClick({
      name: props.title,
      link: JSON.stringify(toRaw(props)),
    })
  }
  switch (props.type) {
    case 'a':
      {
        window.open(props.path, '_blank')
      }
      break
    case 'iframe':
      {
        showIframe.value = true
      }
      break
    case 'router':
      {
        router.push(props.to)
      }
      break
    case 'message':
      {
        ElMessage.warning(props.msg)
      }
      break
    case 'pdf':
      {
        handleShowPdfForm()
      }
      break
    case 'btn':
      {
        emits('btnClick')
      }
      break
    default: {
      ElMessage.warning('功能研发中，敬请期待')
    }
  }
}

const pdfShow = ref(false)
const pdfLoading = ref(false)
const pdfFormRef = ref(null)
const pdfForm = ref({
  water: '',
  pdf: null,
})
const pdfRules = ref({
  water: [{ required: true, message: '请输入水印内容', trigger: 'blur' }],
  pdf: [{ required: true, message: '请选择文件', trigger: 'change' }],
})
function handleShowPdfForm() {
  pdfForm.value = { water: '', pdf: null }
  pdfShow.value = true
}
async function handleSelectPdf() {
  const file = await selectFile()
  pdfForm.value.pdf = file
}
function handleSubmitPdf() {
  const fileName = pdfForm.value.pdf.name
  pdfFormRef.value.validate(async (valid) => {
    if (valid) {
      pdfLoading.value = true
      pdfWatermark(pdfForm.value)
        .then((res) => {
          saveAs(res.data, fileName)
          pdfShow.value = false
          ElMessage.success('操作成功')
        })
        .finally(() => {
          pdfLoading.value = false
        })
    }
  })
}
</script>
