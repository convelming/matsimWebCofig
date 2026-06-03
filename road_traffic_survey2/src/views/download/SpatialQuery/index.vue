<!-- SpatialQuery -->
<template>
  <div class="SpatialQuery">SpatialQuery</div>
</template>

<script setup>
import { SpatialQueryEvent } from './mixins.js'
</script>

<style lang="scss" scoped>
.SpatialQuery {
  position: fixed;
  z-index: 1000;
  top: 80px;
  right: 20px;
}
</style>
