<!-- UploadImage -->
<template>
  <MDialog
    class="UploadImage"
    title="拍照图片"
    subTitle="拍照图片 / 仅图片"
    :top="80"
    :left="80"
    width="365px"
    hideClose
    :visible="showMain"
    @close="handleClose"
  >
    <el-scrollbar class="flex-scrollbar">
      <div class="UploadImage_body">
        <img src="@/assets/images/close.svg?url" class="close_btn" @click.stop="handleClose" />
        <div class="title1">请选择上传图片：</div>
        <el-form :model="form" ref="formRef" :rules="rules" label-width="auto" :inline="false">
          <el-form-item label="名称" prop="projectName">
            <el-input v-model="form.projectName"></el-input>
          </el-form-item>
          <el-form-item label="类型" prop="type">
            <el-input v-model="form.type"></el-input>
          </el-form-item>
          <el-form-item label="文件" prop="file">
            <div class="file_box" v-if="form.file">
              <div class="file_name">{{ form.file.name }}</div>
              <i class="el-icon-circle-close" @click="form.file = null"></i>
            </div>
            <el-button v-else type="primary" @click="handleSelectFile">选择文件</el-button>
          </el-form-item>
          <el-form-item>
            <div class="progress_box" v-if="updoading">
              <el-progress :percentage="progress"></el-progress>
              <i class="el-icon-circle-close" @click="controller.abort()"></i>
            </div>
            <template v-else>
              <el-button type="primary" @click="handleSubmit">立即上传</el-button>
              <el-button @click="open = false">取消</el-button>
            </template>
          </el-form-item>
        </el-form>
        <div class="checkbox">
          <el-checkbox v-model="showLayer" @change="">
            <span class="text1">显示图标</span>
            <span class="text2">(已上传数据点位)</span>
          </el-checkbox>
        </div>
        <el-collapse class="collapse" v-model="activeNames">
          <el-collapse-item title="显示设置" name="显示设置">
            <el-form label-position="left" label-width="80px">
              <el-form-item label="图标颜色">
                <div class="color_picker_box">
                  <div class="color_picker_item" v-for="[i, v] in stateOptionsList" :key="i">
                    <div>{{ v }}</div>
                    <el-color-picker v-model="stateColorOptions[i]"></el-color-picker>
                  </div>
                </div>
              </el-form-item>
            </el-form>
          </el-collapse-item>
        </el-collapse>
      </div>
    </el-scrollbar>
  </MDialog>
</template>
<script>
export const stateOptions = {
  0: '其他',
  1: '人工',
  2: '视频识别',
  3: '互联网路况估算',
  4: '交评核准',
}

const stateOptionsList = [0, 2, 1, 4, 3].map((v) => [v, stateOptions[v]])
</script>

<script setup>
import * as API from '@/api/index'
import { injectSync, addWatch } from '@/utils/index'

const emits = defineEmits(['update:visible', 'close'])
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

const watchVisible = addWatch(
  props,
  (val) => {
    if (val) {
    } else {
    }
  },
  {
    deep: true,
    immediated: true,
  },
)

const showMain = computed(() => {
  return props.visible
})
const showLayer = ref(false)
const activeNames = ref(['显示设置'])
const stateColorOptions = ref({
  0: '#67C23A', // 其他 绿色
  1: '#f56c6c', // 人工 红色
  2: '#409eff', // 视频识别 蓝色
  3: '#e6a23c', // 互联网路况估算 橙色
  4: '#909399', // 交评核准 灰色
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
        if (!this.form.file) {
          callback(new Error('请选择文件'))
        } else {
          callback()
        }
      },
    },
  ],
}

function handleClose() {
  emits('update:visible', false)
  emits('close')
}
</script>

<style lang="scss" scoped>
.flex-scrollbar {
  max-height: calc(100vh - 200px);
}
.UploadImage_body {
  position: relative;
  padding: 20px;
  .title1{
    margin-bottom: 20px;
  }
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

  .checkbox {
    margin-top: 12px;
    display: flex;
    align-items: center;
    height: 44px;
    border-top: 1px solid #eeeeee;
    // border-bottom: 1px solid #eeeeee;
    .text1 {
      font-weight: 400;
      font-size: 14px;
      color: #333333;
    }
    .text2 {
      font-weight: 400;
      font-size: 12px;
      color: #707a7e;
    }
  }

  .collapse {
    .color_picker_box {
      display: flex;
      align-items: center;
      gap: 10px 20px;
      flex-wrap: wrap;
      .color_picker_item {
        display: flex;
        align-items: center;
        gap: 5px;
      }
    }
  }
}
</style>
