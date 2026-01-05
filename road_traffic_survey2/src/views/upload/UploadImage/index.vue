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
        <div class="title1">上传图片：</div>
        <el-form label-width="auto" :inline="false">
          <el-form-item label="数据录入" prop="projectName">
            <el-button type="primary" @click="handleShowUpload">上传图片</el-button>
          </el-form-item>
          <el-form-item label="数据查询" prop="type">
            <el-button type="primary" @click="handleShowSreach">查询图片</el-button>
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
                  <div class="color_picker_item">
                    <div>图标颜色</div>
                    <el-color-picker v-model="color"></el-color-picker>
                  </div>
                  <div class="color_picker_item">
                    <div>已选择图标颜色</div>
                    <el-color-picker v-model="hColor"></el-color-picker>
                  </div>
                </div>
              </el-form-item>
              <el-form-item label="图标大小">
                <el-slider :min="1" :max="100" v-model="size"></el-slider>
              </el-form-item>
            </el-form>
          </el-collapse-item>
        </el-collapse>
      </div>
    </el-scrollbar>
  </MDialog>

  <Sreach v-model:visible="showSreach" />
  <Upload v-model:visible="showUpload" />

  <ImagePreview
    v-model:visible="showPreview"
    :imageList="previewImageList"
    url-key="b_url"
    @delete="handleDeleteImage"
  />
</template>

<script setup>
import * as API from '@/api/index'
import { injectSync, addWatch } from '@/utils/index'

import { MAP_EVENT } from '@/mymap/index.js'
import { ImageListLayer } from '@/utils/MapLayer/ImageListLayer'

import Sreach from './Sreach.vue'
import Upload from './Upload.vue'

import ImagePreview from './ImagePreview.vue'

let _Map = null
const emit = defineEmits(['update:visible', 'close'])
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

const showMain = computed(() => {
  return !showUpload.value && !showSreach.value && props.visible
})
const showLayer = ref(true)
const showUpload = ref(false)
const showSreach = ref(false)
const showPreview = ref(false)
const activeNames = ref(['显示设置'])
const color = ref('#ffa500')
const hColor = ref('#67C23A')
const size = ref(20)
let allImageMaker = []
const previewImageList = ref([])

const _ImageListLayer = new ImageListLayer({
  zIndex: 110,
  size: size.value,
  color: color.value,
  hColor: hColor.value,
  event: {
    [MAP_EVENT.HANDLE_PICK_LEFT]: (res) => {
      handleShowPreview(res.data)
    },
  },
})

const watchProps = addWatch(
  props,
  (val) => {
    if (val.visible) {
      handleLoadImageList()
      watchShowLayer.callback(showLayer.value)
    } else {
      _ImageListLayer.removeFromParent()
    }
  },
  {
    deep: true,
  },
)

const watchColor = addWatch(color, (val) => {
  if (_ImageListLayer) {
    _ImageListLayer.setColor(val)
  }
})

const watchHColor = addWatch(hColor, (val) => {
  if (_ImageListLayer) {
    _ImageListLayer.setHColor(val)
  }
})
const watchSize = addWatch(size, (val) => {
  if (_ImageListLayer) {
    _ImageListLayer.setSize(val)
  }
})

const watchShowLayer = addWatch(
  () => showLayer.value && !showSreach.value,
  (val) => {
    if (val) {
      _Map.addLayer(_ImageListLayer)
    } else {
      _Map.removeLayer(_ImageListLayer)
    }
  },
)

function handleShowUpload() {
  showUpload.value = true
  _Map.removeLayer(_ImageListLayer)
}
function handleShowSreach() {
  showSreach.value = true
}

function handleClose() {
  emit('update:visible', false)
  emit('close')
}

function handleLoadImageList() {
  API.mappictureAllMaker().then((res) => {
    allImageMaker = res.data
    _ImageListLayer.setData(allImageMaker)
  })
}
function handleShowPreview(row) {
  showPreview.value = true
  previewImageList.value = [{ ...row, b_url: import.meta.env.VITE_APP_BASE_API + row.url }]
  _ImageListLayer.setHMesh(row)
}
function handleDeleteImage(row) {
  proxy
    .$confirm(`是否确认删除当前图片?`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    .then(function () {
      return API.mappictureDelete(row.id)
    })
    .then(() => {
      handleLoadImageList()
      showPreview.value = false
      proxy.$message.success('删除成功')
    })
    .catch(() => {})
}

injectSync('MapRef').then((map) => {
  _Map = map.value
  watchProps.callback(props)
})
onUnmounted(() => {
  _ImageListLayer.dispose()
})
</script>

<style lang="scss" scoped>
.flex-scrollbar {
  max-height: calc(100vh - 200px);
}
.UploadImage_body {
  position: relative;
  padding: 20px;
  .title1 {
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
