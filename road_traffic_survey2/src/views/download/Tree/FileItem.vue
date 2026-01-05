<!-- TreeItem -->
<template>
  <div class="TreeItem FileItem">
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
import { initCheck } from './mixins'

const emit = defineEmits(['check-change'])
const props = defineProps({
  id: String,
  title: String,
  type: String,
  children: Object,
  check: Boolean,
})

const { check, indeterminate, getCheck, setCheck, handleChangeCheck } =
  initCheck(getCurrentInstance())

defineExpose({
  getCheck,
  setCheck,
})
</script>

<style lang="scss" scoped src="./style.scss" />

<style lang="scss" scoped>
.FileItem {
  .content {
    padding-left: 20px;
  }
}
</style>
