<!-- App -->
<template>
  <div class="MapLayout">
    <div class="header">
      <div class="title">交通数据采集应用平台</div>
      <MButton
        class="menu_item"
        activeClass="active"
        :to="{ name: 'home' }"
        type="router"
        :record="false"
      >
        <TabHome class="icon" />
        <span class="text">首页</span>
      </MButton>
      <MButton
        class="menu_item"
        activeClass="active"
        :to="{ name: 'upload' }"
        type="router"
        :record="false"
      >
        <TabUpload class="icon" />
        <span class="text">数据上传</span>
      </MButton>
      <MButton
        class="menu_item"
        activeClass="active"
        :to="{ name: 'download' }"
        type="router"
        :record="false"
      >
        <TabDownload class="icon" />
        <span class="text">数据下载</span>
      </MButton>
      <MButton
        class="menu_item"
        path="http://192.168.60.231:23105/vue/feedback.html#/"
        type="a"
        :record="false"
      >
        <TabFeedback class="icon" />
        <span class="text">问题反馈</span>
      </MButton>
    </div>
    <div class="bottom">
      <div class="left">
        <div class="btn" @click="ElMessage.warning('功能研发中，敬请期待')">
          <BtnIcon1 class="icon" src="@/assets/images/容器@2x.png" alt="" />
        </div>
        <!-- <a
          class="btn"
          href="https://doc.weixin.qq.com/sheet/e3_AdQA8Aa_ADMt1qh97LkSHer6ALqI2?scode=APwA6gfEAA0aeGdABPAdQA8Aa_ADM&tab=BB08J2"
          target="_blank"
        > -->
        <MButton class="btn" path="http://192.168.60.231:23105/vue/feedback.html#/" type="a">
          <BtnIcon2 class="icon" src="@/assets/images/容器@2x(1).png" alt="" />
        </MButton>
        <div class="btn" @click="ElMessage.warning('功能研发中，敬请期待')">
          <BtnIcon3 class="icon" src="@/assets/images/容器@2x(2).png" alt="" />
        </div>
        <el-dropdown trigger="click" @command="handleShowMapStyle">
          <div class="btn">
            <BtnIcon4 class="icon" src="@/assets/images/容器@2x(3).png" alt="" />
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="(_, index) in MapStyleList" :command="index">
                <span>{{ _.name }}</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <div class="right" id="page" :style="scaleStyle">
        <div id="mapRoot" v-show="showMap"></div>
        <RouterView />
      </div>
    </div>
  </div>
</template>

<script setup>
import { MyMap, MOUSE_BUTTONS, MapLayer, MapTile } from '@/mymap/index.js'
import { ref } from 'vue'
import { useRoute } from 'vue-router'

import MButton from '@/components/MButton.vue'
import TabHome from '@/assets/images/MapLayout/home.svg?component'
import TabUpload from '@/assets/images/MapLayout/upload.svg?component'
import TabDownload from '@/assets/images/MapLayout/download.svg?component'
import TabFeedback from '@/assets/images/MapLayout/feedback.svg?component'

import BtnIcon1 from '@/assets/images/MapLayout/icon1.svg?component'
import BtnIcon2 from '@/assets/images/MapLayout/icon2.svg?component'
import BtnIcon3 from '@/assets/images/MapLayout/icon3.svg?component'
import BtnIcon4 from '@/assets/images/MapLayout/icon4.svg?component'
import { ElMessage } from 'element-plus'

const route = useRoute()

const MapRef = shallowRef(null)
const MapStyleList = {
  none: class extends MapTile {
    static name = '不显示底图'
    static background = 0xffffff
    getUrl() {
      return ``
    }
  },
  OSMOpenMapTiles: class extends MapTile {
    static name = 'OSM 默认样式'
    getUrl() {
      return `http://192.168.60.234:8081/styles/OSM OpenMapTiles/512/${this.zoom}/${this.row}/${this.col}.png`
    }
  },
  OSMLightBlue: class extends MapTile {
    static name = 'OSM 浅色样式'
    getUrl() {
      return `http://192.168.60.231:23334/osm/LightBlue/${this.zoom}/${this.row}/${this.col}.png`
    }
  },
  OSMDRAKBlue: class extends MapTile {
    static name = 'OSM 深色样式'
    getUrl() {
      return `http://192.168.60.231:23334/osm/DRAKBlue/${this.zoom}/${this.row}/${this.col}.png`
    }
  },
}
const MapLayerInt = new MapLayer({ tileClass: MapStyleList.OSMLightBlue, zIndex: -1 })

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

function handleShowMapStyle(value) {
  console.log(value)
  MapLayerInt.setTileClass(MapStyleList[value])
  // ElMessage.warning('功能研发中，敬请期待')
}

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
  _Map.addLayer(MapLayerInt)
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
