<!-- TreeItem -->
<template>
  <div class="TreeItem TXTItem" v-bind="$attrs">
    <div class="content">
      <el-checkbox
        @click.stop
        v-model="check"
        :indeterminate="indeterminate"
        @change="handleChangeCheck"
      />
      <div class="text">{{ title }}</div>
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
import { ElMessageBox } from 'element-plus'

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

let msg = ''
const watchCheck = addWatch(
  check,
  (val) => {
    if (val && msg) {
      ElMessageBox.confirm(msg, {
        title: props.title,
      }).finally(() => {
        check.value = false
        handleChangeCheck()
      })
    }
  },
  {
    immediate: true,
  },
)
fetch(props.path)
  .then((res) => res.text())
  .then((text) => {
    msg = text
    watchCheck.callback(check.value)
  })

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
.TXTItem {
  .content {
    padding-left: 20px;
  }
}
</style>
