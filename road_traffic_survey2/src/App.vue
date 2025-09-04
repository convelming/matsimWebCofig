<!-- App -->
<template>
  <div class="App">
    <div class="header">
      <div class="title">交通数据采集应用平台</div>
      <RouterLink class="menu_item" activeClass="active" :to="{ name: 'home' }">
        <img class="icon" src="@/assets/images/tab_home_nor@2x.png" alt="" />
        <img class="icon sel" src="@/assets/images/tab_home_sel@2x.png" alt="" />
        <span class="text">首页</span>
      </RouterLink>
      <RouterLink class="menu_item" activeClass="active" :to="{ name: 'upload' }">
        <img class="icon" src="@/assets/images/tab_upload_nor@2x.png" alt="" />
        <img class="icon sel" src="@/assets/images/tab_upload_sel@2x.png" alt="" />
        <span class="text">数据上传</span>
      </RouterLink>
      <RouterLink class="menu_item" activeClass="active" :to="{ name: 'download' }">
        <img class="icon" src="@/assets/images/tab_download_nor@2x.png" alt="" />
        <img class="icon sel" src="@/assets/images/tab_download_sel@2x.png" alt="" />
        <span class="text">数据下载</span>
      </RouterLink>
      <RouterLink class="menu_item" activeClass="active" :to="{ name: 'feedback' }">
        <img class="icon" src="@/assets/images/tab_feedback_nor@2x.png" alt="" />
        <img class="icon sel" src="@/assets/images/tab_feedback_sel@2x.png" alt="" />
        <span class="text">问题反馈</span>
      </RouterLink>
    </div>
    <div class="bottom">
      <div class="left">
        <div class="btn">
          <img class="icon" src="@/assets/images/容器@2x.png" alt="" />
        </div>
        <a
          class="btn"
          href="https://doc.weixin.qq.com/sheet/e3_AdQA8Aa_ADMt1qh97LkSHer6ALqI2?scode=APwA6gfEAA0aeGdABPAdQA8Aa_ADM&tab=BB08J2"
          target="_blank"
        >
          <img class="icon" src="@/assets/images/容器@2x(1).png" alt="" />
        </a>
        <div class="btn">
          <img class="icon" src="@/assets/images/容器@2x(2).png" alt="" />
        </div>
        <div class="btn">
          <img class="icon" src="@/assets/images/容器@2x(3).png" alt="" />
        </div>
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
  const res = { msg: 'http://192.168.60.234:8081/styles/OSM%20Liberty/512/${z}/${x}/${y}.png' }
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
.App {
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
    .menu_item {
      width: 128px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      position: relative;
      color: #666666;
      font-size: 16px;
      text-decoration: none;
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
          display: none;
          &.sel {
            display: block;
          }
        }
      }
      .icon {
        width: 24px;
        height: 24px;
        display: block;
        &.sel {
          display: none;
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
      .btn {
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
