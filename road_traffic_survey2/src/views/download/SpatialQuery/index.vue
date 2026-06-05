<!-- SpatialQuery -->
<template>
  <div class="RouteInfo_btn" v-if="!showRouteInfo" @click="showRouteInfo = true">
    <el-icon><Aim /></el-icon>
  </div>

  <RouteInfo v-model:visible="showRouteInfo" />
</template>

<script setup>
import { Setting, Download, Loading, Delete, Plus, Aim } from '@element-plus/icons-vue'
import RouteInfo from './components/RouteInfo.vue'

const showRouteInfo = ref(false)
</script>

<style lang="scss" scoped>
.RouteInfo_btn {
  position: fixed;
  z-index: 1000;
  top: 80px;
  right: 20px;
  cursor: pointer;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #065f46;
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 25px;
}
</style>
