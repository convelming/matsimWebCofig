<!-- App -->
<template>
  <div id="mapRoot" v-show="showMap"></div>
  <RouterView />
</template>

<script setup lang="ts">
import autofit from 'autofit.js'
// @ts-ignore
import { MyMap, MOUSE_BUTTONS, MapLayer } from '@/mymap/index.js'
import { ref } from 'vue'
import { useRoute } from 'vue-router'

import { ElMessage } from 'element-plus'

const route = useRoute()

const MapRef = shallowRef<any>(null)
const showMap = ref(true)
provide('MapRef', MapRef)
provide('showMap', showMap)

onMounted(() => {
  autofit.init({
    dw: 1920,
    dh: 1080,
    /* 下拉框修正配置 */
    el: 'body',
    scaleType: 'contain',
    offsetLeft: 0,
    offsetTop: 0,
    autoCenter: true,
    resize: true,
    ignore: [
      {
        dom: '#mapRoot',
      },
    ],
  } as any)

  const _Map = new MyMap({
    rootId: 'mapRoot',
    // 黄浦区中心点和缩放
    center: [12634609, 2659952],
    zoom: 10.74,
    mouseButtons: MOUSE_BUTTONS.RIGHT,
    // 科学城中心点和缩放
    // center:  [12633548, 2651418],
    // zoom: 11.628,
    enableRotate: true,
  })
  const _MapLayer = new MapLayer({ zIndex: -1 })
  _Map.addLayer(_MapLayer)
  MapRef.value = _Map
})

onUnmounted(() => {
  MapRef.value?.dispose()
})
</script>

<style lang="scss" scoped>
#mapRoot {
  width: 100vw;
  height: 100vh;
}
</style>
