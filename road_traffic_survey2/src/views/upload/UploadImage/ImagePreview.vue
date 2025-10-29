<!-- Image -->
<template>
  <Teleport to="body">
    <el-image-viewer
      v-if="visible"
      :url-list="previewSrcList"
      show-progress
      :initial-index="index"
      @close="handleClose"
    >
      <template #toolbar="{ actions, prev, next, reset, activeIndex, setActiveItem }">
        <el-icon @click="prev"><Back /></el-icon>
        <el-icon @click="next"><Right /></el-icon>
        <el-icon @click="actions('zoomOut')"><ZoomOut /></el-icon>
        <el-icon @click="actions('zoomIn')"><ZoomIn /></el-icon>
        <el-icon @click="actions('clockwise')"><RefreshRight /></el-icon>
        <el-icon @click="actions('anticlockwise')"><RefreshLeft /></el-icon>
        <el-icon @click="reset"><Refresh /></el-icon>
        <el-icon @click="handelRemove(activeIndex)"><Delete /></el-icon>
      </template>
    </el-image-viewer>
  </Teleport>
</template>

<script setup>
import * as API from '@/api/index'
import { injectSync, addWatch } from '@/utils/index'

import {
  Back,
  Refresh,
  RefreshLeft,
  RefreshRight,
  Right,
  ZoomIn,
  ZoomOut,
  Delete,
} from '@element-plus/icons-vue'

const emits = defineEmits(['update:visible', 'close', 'delete'])
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  imageList: {
    type: Array,
  },
  urlKey: {
    type: String,
    default: 'url',
  },
  index: {
    type: Number,
    default: 0,
  },
})

const previewSrcList = computed(() => {
  return props.imageList.map((item) => item[props.urlKey])
})

function handleClose() {
  emits('update:visible', false)
  emits('close')
}

function handelRemove(index) {
  emits('delete', props.imageList[index])
}
</script>

<style lang="scss" scoped>
.flex-scrollbar {
  max-height: calc(100vh - 200px);
}
</style>
