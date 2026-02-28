<!-- TreeItem -->
<template>
  <div class="TreeItem FileItem" v-bind="$attrs">
    <div class="content">
      <!-- <el-checkbox
        @click.stop
        v-model="check"
        :indeterminate="indeterminate"
        @change="handleChangeCheck"
      /> -->
      <div class="text">{{ title }}</div>
      <el-icon size="20px" @click="downloadFile(path)"><Download /></el-icon>
    </div>
  </div>
</template>

<script setup>
import { initCheck, initRange } from '../mixins'
import {
  injectSync,
  addWatch,
  selectFile,
  fileToString,
  stringToFile,
  downloadFile,
  guid,
} from '@/utils/index'
import { Setting, Download, Loading, Delete, Plus, Aim } from '@element-plus/icons-vue'

const emit = defineEmits(['check-change'])
const props = defineProps({
  id: String,
  title: String,
  type: String,
  children: Object,
  path: String,
  check: Boolean,
})

const { check, indeterminate, getCheck, setCheck, handleChangeCheck } = initCheck(
  { emit },
  props.check,
)
const { range, getRange, handleSetCenterAndZoom } = initRange(
  { emit, check, indeterminate },
  props.check,
)

defineExpose({
  getCheck,
  setCheck,
  getRange: () => ({ range: [], check: false }),
})
</script>

<style lang="scss" scoped src="../style.scss" />

<style lang="scss" scoped>
.FileItem {
  .content {
    padding-left: 20px;
  }
}
</style>
