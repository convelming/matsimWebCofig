<!-- FolderItem -->
<template>
  <div class="TreeItem FolderItem">
    <div class="content" v-if="!hideTitle" @click="s_open = !s_open">
      <icon_tri_nor class="icon_left" :class="{ active: s_open }" />
      <el-checkbox
        @click.stop
        v-model="checkAll"
        :indeterminate="indeterminate"
        @change="handleCheckAllChange"
      />
      <div class="text">{{ title }}</div>
    </div>
    <el-collapse-transition>
      <div class="children" :class="{ hideTitle }" v-show="s_open">
        <template v-for="item in children">
          <component
            :is="componentMap[item.type] || 'DefaultItem'"
            ref="itemRef"
            v-bind="item"
            @check-change="handleChangeCheck"
          />
        </template>
      </div>
    </el-collapse-transition>
  </div>
</template>

<script setup name="FolderItem">
import icon_tri_nor from '@/assets/images/icon_tri_nor.svg'
import FolderItem from './FolderItem.vue'
import FileItem from './FileItem.vue'
import GeoJSONItem from './GeoJSONItem.vue'

const componentMap = {
  folder: FolderItem,
  file: FileItem,
  geojson: GeoJSONItem,
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

const emit = defineEmits(['check-change'])

const s_open = ref(props.open)

const checkAll = ref(false)
const indeterminate = ref(false)

const itemRef = ref(null)
function getCheck() {
  const values = itemRef.value?.map((v) => v.getCheck()) || []

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

defineExpose({
  getCheck,
  setCheck,
})
</script>

<style lang="scss" scoped src="./style.scss" />

<style lang="scss" scoped>
.FolderItem {
  .children {
    padding-left: 10px;
    &.hideTitle {
      padding-left: 0;
    }
  }
}
</style>
