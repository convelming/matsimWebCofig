<!-- index -->
<template>
  <div class="index">
    <el-input v-model="infoForm.name"></el-input>
  </div>
</template>

<script setup>
const infoForm = ref({
  name: '',
})
</script>

<style lang="scss" scoped>
.index {
  position: absolute;
  z-index: 100;
  top: 0;
  left: 0;
}
</style>
