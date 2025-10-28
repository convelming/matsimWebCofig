<!-- ImageList -->
<template>
  <MDialog
    class="Sreach"
    title="图片列表"
    :subTitle="data?.path"
    :top="80"
    :left="80"
    width="500px"
    :visible="visible"
    @close="handleClose"
  >
    <div class="ImageList_body">
      <el-checkbox
        style="margin-top: 10px"
        v-model="selectAllImage"
        :indeterminate="false"
        @change="handleSelectAllImageList"
        >全选</el-checkbox
      >
      <div class="image_list">
        <div class="flex_box">
          <div class="image_box upload" @click="uploadOneImage">
            <el-icon><Plus /></el-icon>
          </div>
          <div class="image_box" v-for="(item, index) in imageList" :key="index">
            <el-image :src="item.b_url" fit="fill" :lazy="true" />
            <div class="btn_list">
              <el-checkbox
                v-model="item.check"
                :indeterminate="false"
                @change="handleImageListCheckChange"
              ></el-checkbox>
              <el-icon><Aim @click.stop="handleSetCenter(item)" /></el-icon>
              <el-icon color="#ff0000"><Delete @click.stop="handleDeleteImage(item)" /></el-icon>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MDialog>
  <Image :visible="visible" :previewSrcList="previewSrcList" />
</template>

<script setup>
import * as API from '@/api/index'
import { injectSync, addWatch } from '@/utils/index'

import { MAP_EVENT } from '@/mymap/index.js'
import { ImageListLayer } from '@/utils/MapLayer/ImageListLayer'

import { Delete, Aim, Plus } from '@element-plus/icons-vue'
import { computed } from 'vue'

import Image from './Image.vue'

const BASE_API = import.meta.env.VITE_APP_BASE_API
let _Map = null
const { proxy } = getCurrentInstance()
const emits = defineEmits(['update:visible', 'close', 'submited'])
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object,
    default: null,
  },
})

const selectAllImage = ref(false)
const color = ref('#ffa500')
const hColor = ref('#67C23A')

const _ImageListLayer = new ImageListLayer({
  zIndex: 110,
  color: color.value,
  hColor: hColor.value,
  event: {
    [MAP_EVENT.HANDLE_PICK_LEFT]: (res) => {
      handleShowImageDialog(res.data)
    },
  },
})

const imageList = ref([])

const watchProps = addWatch(
  props,
  (val) => {
    if (val.visible) {
      try {
        imageList.value = props.data.pictures.map((item) => ({
          ...item,
          b_url: BASE_API + item.url,
          check: true,
        }))
      } catch (error) {
        imageList.value = []
      }
      _Map.addLayer(_ImageListLayer)
    } else {
      _Map.removeLayer(_ImageListLayer)
    }
  },
  {
    deep: true,
  },
)

const previewSrcList = computed(() => {
  return imageList.value.filter((item) => item.check).map((item) => item.b_url)
})

function uploadOneImage() {}

function handleSelectAllImageList() {}
function handleSetCenter() {}
function handleDeleteImage() {}
function handleImageListCheckChange() {}

function handleClose() {
  emits('update:visible', false)
  emits('close')
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
.ImageList_body {
  padding: 20px;
  .image_list {
    height: calc(100vh - 300px);
    margin-top: 10px;
    overflow-x: hidden;
    overflow-y: auto;
    .flex_box {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      .image_box {
        position: relative;
        width: 140px;
        height: 140px;

        &.upload {
          border: 1px dashed #409eff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
          color: #409eff;
          cursor: pointer;
        }
        .el-image {
          width: 100%;
          height: 100%;
        }
        .btn_list {
          cursor: pointer;
          background-color: #ffffff99;
          position: absolute;
          top: 0;
          right: 0;
          padding: 10px;
          font-size: 16px;
          border-radius: 0 0 0 5px;
          display: flex;
          align-items: center;
          gap: 5px;
          --el-checkbox-height: 14px;
        }
      }
    }
  }
}
</style>
