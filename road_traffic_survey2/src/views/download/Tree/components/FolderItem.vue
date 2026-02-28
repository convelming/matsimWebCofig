<!-- FolderItem -->
<template>
  <div class="TreeItem FolderItem" v-bind="$attrs">
    <div class="content" v-if="!hideTitle" @click="s_open = !s_open">
      <icon_tri_nor class="icon_left" :class="{ active: s_open }" />
      <el-checkbox
        @click.stop
        v-model="checkAll"
        :indeterminate="indeterminate"
        @change="handleCheckAllChange"
      />
      <div class="text">{{ title }}</div>
      <el-icon v-if="range.length > 0" size="20px" @click.stop="handleSetCenterAndZoom"
        ><Aim
      /></el-icon>
    </div>
    <el-collapse-transition>
      <div class="children" :class="{ hideTitle }" v-show="s_open">
        <template v-for="item in children">
          <component
            :is="componentMap[item.type] || DefaultItem"
            ref="itemRef"
            v-bind="item"
            @check-change="handleChangeCheck"
            @update-range="handleUpdateRange"
          />
        </template>
      </div>
    </el-collapse-transition>
  </div>
</template>

<script setup name="FolderItem">
import { Aim } from '@element-plus/icons-vue'
import icon_tri_nor from '@/assets/images/icon_tri_nor.svg'

import DefaultItem from './DefaultItem.vue'
import FolderItem from './FolderItem.vue'
import FileItem from './FileItem.vue'
import GeoJSONItem from './GeoJSONItem.vue'
import LinkFlowItem from './LinkFlowItem.vue'
import IntersectionFlowItem from './IntersectionFlowItem.vue'
import UploadImageItem from './UploadImageItem.vue'
import PDFItem from './PDFItem.vue'
import TXTItem from './TXTItem.vue'

import { initCheck, initRange } from '../mixins'
import { TreeItemEnum } from '../index.js'

const componentMap = {
  [TreeItemEnum.folder]: FolderItem,
  [TreeItemEnum.file]: FileItem,
  [TreeItemEnum.geojson]: GeoJSONItem,
  [TreeItemEnum.upload_image]: UploadImageItem,
  [TreeItemEnum.upload_link_flow]: LinkFlowItem,
  [TreeItemEnum.upload_intersection_flow]: IntersectionFlowItem,
  [TreeItemEnum.pdf]: PDFItem,
  [TreeItemEnum.txt]: TXTItem,
}

const props = defineProps({
  id: String,
  hideTitle: Boolean,
  title: String,
  type: String,
  children: Object,
  check: Boolean,
  open: Boolean,
})

const emit = defineEmits(['check-change', 'update-range'])

const s_open = ref(props.open)

const checkAll = ref(false)
const indeterminate = ref(false)

const { range, getRange, handleSetCenterAndZoom } = initRange(
  { emit, check: checkAll, indeterminate },
  props.check,
)

const itemRef = ref(null)
function getCheck() {
  const values =
    itemRef.value?.map((v) => {
      return v.getCheck()
    }) || []

  let hasChecked = false
  let hasUnchecked = false
  let hasIndeterminate = false

  for (const v of values) {
    if (v.check) hasChecked = true
    if (!v.check) hasUnchecked = true
    if (v.indeterminate) hasIndeterminate = true

    if (hasChecked && hasUnchecked) break // 提前退出优化
  }

  const check = {
    check: hasChecked,
    indeterminate: hasIndeterminate || (hasChecked && hasUnchecked),
  }
  checkAll.value = check.check
  indeterminate.value = check.indeterminate
  return check
}
function setCheck(check) {
  checkAll.value = check
  indeterminate.value = false
  itemRef.value?.forEach((v) => v.setCheck(check))
}
function handleChangeCheck(data) {
  emit('check-change', getCheck())
}
function handleCheckAllChange() {
  setCheck(checkAll.value)
  emit('check-change', getCheck())
}

function handleUpdateRange() {
  const values = itemRef.value?.map((v) => v.getRange()) || []
  range.value = values
    .filter((v) => v.range.length > 0 && v.check)
    .map((v) => v.range)
    .flat(1)
  if (range.value.length > 0) handleSetCenterAndZoom()
  emit('update-range')
}

defineExpose({
  getCheck,
  setCheck,
  getRange,
})
</script>

<style lang="scss" scoped src="../style.scss" />

<style lang="scss" scoped>
.FolderItem {
  .children {
    padding-left: 10px;
    &.hideTitle {
      padding-left: 0;
    }
  }

  .content {
    .el-icon {
      cursor: pointer;
      &:hover {
        color: var(--el-color-success);
      }
    }
  }
}
</style>
