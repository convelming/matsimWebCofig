<!-- TreeItem -->
<template>
  <div class="TreeItem PDFItem" v-bind="$attrs">
    <div class="content">
      <el-checkbox
        @click.stop
        v-model="check"
        :indeterminate="indeterminate"
        @change="handleChangeCheck"
      />
      <div class="text">{{ title }}</div>
      <el-icon v-if="!!path" size="20px" @click="downloadFile(path)"><Download /></el-icon>
    </div>
  </div>

  <el-dialog
    :model-value="check"
    @update:model-value="((check = $event), handleChangeCheck())"
    width="80vw"
  >
    <el-auto-resizer style="width: 100%; height: calc(100vh - 300px)">
      <template #default="{ height, width }">
        <iframe v-if="check" style="border: 0" :width="width" :height="height" :src="path">
        </iframe>
      </template>
    </el-auto-resizer>
  </el-dialog>
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
  download: String,
  check: Boolean,
})

const id = guid()
const showDialog = ref(false)
const showGeoJSONParams = inject('showGeoJSONParams')
const watchShowDialog = addWatch(showDialog, (val) => {
  if (val) showGeoJSONParams.value[id] = true
  else showGeoJSONParams.value[id] = false
})

const { check, indeterminate, getCheck, setCheck, handleChangeCheck } = initCheck(
  { emit },
  props.check,
)
const { range, getRange, handleSetCenterAndZoom } = initRange(
  { emit, check, indeterminate },
  props.check,
)

onUnmounted(() => {
  watchShowDialog.callback(false)
})
defineExpose({
  getCheck,
  setCheck,
  getRange: () => ({ range: [], check: false }),
})
</script>

<style lang="scss" scoped src="../style.scss" />

<style lang="scss" scoped>
.PDFItem {
  .content {
    padding-left: 20px;
  }
}
</style>
