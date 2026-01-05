<!-- TreeItem -->
<template>
  <div class="TreeItem DefaultItem">
    <div class="content">
      <div class="text">{{ title }}</div>
    </div>
  </div>
</template>

<script setup>

const emit = defineEmits(['check-change'])
const props = defineProps({
  id: String,
  title: String,
  type: String,
  children: Object,
  check: Boolean,
})
function getCheck() {
  return { check: true, indeterminate: false }
}
function setCheck() {}

defineExpose({
  getCheck,
  setCheck,
})
</script>

<style lang="scss" scoped src="./style.scss" />

<style lang="scss" scoped>
.DefaultItem {
  .content {
    padding-left: 20px;
  }
}
</style>
