<!-- TreeItem -->
<template>
  <div class="TreeItem IntersectionFlowItem" v-bind="$attrs">
    <div class="content">
      <el-checkbox
        @click.stop
        v-model="check"
        :indeterminate="indeterminate"
        @change="handleChangeCheck"
      />
      <div class="text">{{ title }}</div>

      <el-icon size="20px" @click="showDialog = true"><Setting /></el-icon>
    </div>
  </div>

  <IntersectionFlow v-model:visible="showDialog" v-model:visibleLayer="check" />
</template>

<script setup>
import { initCheck, initRange } from '../mixins'
import { injectSync, addWatch, selectFile, fileToString, stringToFile, guid } from '@/utils/index'
import { Setting, Download, Loading, Delete, Plus, Aim } from '@element-plus/icons-vue'

import IntersectionFlow from '../../../upload/IntersectionFlow/index.vue'

const emit = defineEmits(['check-change'])
const props = defineProps({
  id: String,
  title: String,
  type: String,
  children: Object,
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
  getRange,
})
</script>

<style lang="scss" scoped src="../style.scss" />

<style lang="scss" scoped>
.IntersectionFlowItem {
  .content {
    padding-left: 20px;
  }
}
</style>
