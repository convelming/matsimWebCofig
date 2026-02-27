<!-- App -->
<template>
  <div class="MapLayout">
    <div class="header">
      <div class="title">交通数据采集应用平台</div>
      <MButton class="menu_item" activeClass="active" :to="{ name: 'home' }" type="router" :record="false">
        <TabHome class="icon" />
        <span class="text">首页</span>
      </MButton>
      <MButton class="menu_item" activeClass="active" :to="{ name: 'upload' }" type="router" :record="false">
        <TabUpload class="icon" />
        <span class="text">数据上传</span>
      </MButton>
      <MButton class="menu_item" activeClass="active" :to="{ name: 'download' }" type="router" :record="false">
        <TabDownload class="icon" />
        <span class="text">数据下载</span>
      </MButton>
      <MButton class="menu_item" path="http://192.168.60.231:23105/vue/feedback.html#/" type="a" :record="false">
        <TabFeedback class="icon" />
        <span class="text">问题反馈</span>
      </MButton>
    </div>
    <div class="bottom">
      <div class="left">
        <MButton class="btn" @click="ElMessage.warning('功能研发中，敬请期待')">
          <BtnIcon1 class="icon" src="@/assets/images/容器@2x.png" alt="" />
        </MButton>
        <!-- <a
          class="btn"
          href="https://doc.weixin.qq.com/sheet/e3_AdQA8Aa_ADMt1qh97LkSHer6ALqI2?scode=APwA6gfEAA0aeGdABPAdQA8Aa_ADM&tab=BB08J2"
          target="_blank"
        > -->
        <MButton class="btn" path="http://192.168.60.231:23105/vue/feedback.html#/" type="a">
          <BtnIcon2 class="icon" src="@/assets/images/容器@2x(1).png" alt="" />
        </MButton>
        <MButton class="btn" @click="ElMessage.warning('功能研发中，敬请期待')">
          <BtnIcon3 class="icon" src="@/assets/images/容器@2x(2).png" alt="" />
        </MButton>
        <MButton class="btn" @click="ElMessage.warning('功能研发中，敬请期待')">
          <BtnIcon4 class="icon" src="@/assets/images/容器@2x(3).png" alt="" />
        </MButton>
      </div>
      <div class="right" id="page" :style="scaleStyle">
        <div id="mapRoot" v-show="showMap"></div>
        <RouterView />
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  MyMap,
  MAP_EVENT,
  MAP_ZOOM_RANGE,
  MAP_LAYER_STYLE,
  DEFAULT_MAP_LAYER_STYLE,
  MOUSE_BUTTONS,
  MapLayer,
  MapStyleFactory,
} from '@/mymap/index.js'
import { ref } from 'vue'
import { useRoute } from 'vue-router'

import MButton from '@/components/MButton.vue'
import TabHome from '@/assets/images/MapLayout/home.svg'
import TabUpload from '@/assets/images/MapLayout/upload.svg'
import TabDownload from '@/assets/images/MapLayout/download.svg'
import TabFeedback from '@/assets/images/MapLayout/feedback.svg'

import BtnIcon1 from '@/assets/images/MapLayout/icon1.svg'
import BtnIcon2 from '@/assets/images/MapLayout/icon2.svg'
import BtnIcon3 from '@/assets/images/MapLayout/icon3.svg'
import BtnIcon4 from '@/assets/images/MapLayout/icon4.svg'
import { ElMessage } from 'element-plus'

const route = useRoute()

const MapRef = shallowRef(null)
const showMap = ref(true)
const scaleStyle = ref(1)
provide('MapRef', MapRef)
provide('showMap', showMap)

const ro = new ResizeObserver(function (entries) {
  const doc = entries[0].target
  const scaleY = doc.clientHeight / (1080 - 60)
  const scaleX = doc.clientWidth / (1920 - 67)
  scaleStyle.value = `--scale: ${Math.min(scaleX, scaleY)};--scaleY: ${scaleY};--scaleX: ${scaleX};--fs-scale:1;`
})

onMounted(() => {
  const _Map = new MyMap({
    rootId: 'mapRoot',
    // 黄浦区中心点和缩放
    center: [12634609, 2659952],
    zoom: 10.74,
    mouseButtons: MOUSE_BUTTONS.RIGHT,
    // 科学城中心点和缩放
    // center:  [12633548, 2651418],
    // zoom: 11.628,
  })
  // https://t0.dynamic.tiles.ditu.live.com/comp/ch/1321222210103?mkt=zh-CN,en-US&ur=cn&it=G,L&jp=0&og=1&sv=9.27&n=t&o=webp,95&cstl=s23&st=bld|v:0
  // _Map.enableRotate = true;
  // getConfigKey('sys.maptile.serve').then((res) => {
  //   const getUrl = eval(`(z,x,y) => \`${res.msg}\``)
  //   const tileClass = MapStyleFactory({
  //     style_name: 'Arcgis',
  //     background: '#CCE7F9',
  //     getUrl: function () {
  //       return getUrl(this.zoom, this.row, this.col)
  //     },
  //   })
  //   const _MapLayer = new MapLayer({ tileClass: tileClass, zIndex: -1 })
  //   _Map.addLayer(_MapLayer)
  // })
  // const res = { msg: 'http://192.168.60.234:8081/styles/OSM%20Liberty/512/${z}/${x}/${y}.png' }
  const res = { msg: 'http://192.168.60.231:23334/osm/LightBlue/${z}/${x}/${y}.png' }
  const getUrl = eval(`(z,x,y) => \`${res.msg}\``)
  const tileClass = MapStyleFactory({
    style_name: 'Arcgis',
    background: '#CCE7F9',
    getUrl: function () {
      return getUrl(this.zoom, this.row, this.col)
    },
  })
  const _MapLayer = new MapLayer({ tileClass: tileClass, zIndex: -1 })
  _Map.addLayer(_MapLayer)

  MapRef.value = _Map

  ro.observe(document.getElementById('page'))
})

onUnmounted(() => {
  MapRef.value.dispose()
  ro.disconnect()
})
</script>

<style lang="scss" scoped>
.MapLayout {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  .header {
    position: relative;
    z-index: 20;
    width: 100%;
    height: 60px;

    background: #ffffff;
    box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.1);
    border: 1px solid #eeeeee;
    display: flex;
    .title {
      line-height: 60px;
      padding: 0 23px;
      color: #0c4031;
      font-weight: 700;
      font-size: 24px;
      margin-right: 100px;
    }
    .menu_list {
    }
    :deep(.menu_item) {
      cursor: pointer;
      width: 128px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      position: relative;
      color: #666666;
      font-size: 16px;
      &.active {
        color: #30b690;
        &::before {
          position: absolute;
          content: '';
          width: 44px;
          height: 3px;
          background: #41b997;
          left: 50%;
          bottom: 0;
          transform: translateX(-50%);
        }
        .icon {
          .fill {
            fill: #41b997;
          }
        }
      }
      .icon {
        width: 24px;
        height: 24px;
        display: block;
        .fill {
          fill: #7e8c88;
        }
      }
    }
  }
  .bottom {
    position: relative;
    z-index: 10;
    display: flex;
    height: 0;
    flex: 1;
    .left {
      box-sizing: border-box;
      position: relative;
      z-index: 20;
      width: 60px;
      height: 100%;

      background: #ffffff;
      box-shadow: 0px 4px 5px 0px rgba(171, 51, 79, 0.1);

      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: center;
      padding: 30px 0;
      gap: 20px;
      :deep(.btn) {
        cursor: pointer;
        width: 24px;
        height: 24px;
        display: block;
        .icon {
          width: 24px;
          height: 24px;
          display: block;
        }
      }
    }
    .right {
      position: relative;
      z-index: 10;
      flex: 1;
      width: 0;
      height: 100%;
      background-color: #ddd;
      overflow: hidden;
      #mapRoot {
        width: 100%;
        height: 100%;
      }
    }
  }
}
</style>
