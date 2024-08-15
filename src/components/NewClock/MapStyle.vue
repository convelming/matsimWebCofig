<template>
  <div class="MapStyle">
    <div id="map-switch" @click="open = !open">
      <img class="icon" style="margin-right: 4px" src="@/assets/image/map_icon.png" />
      <span class="text">{{ $l("地图") }}</span>
    </div>
    <div class="map-switch-list" v-show="open">
      <img class="item" :class="{ active: active == i }" v-for="(v, i) in styleList" :src="v.url" :title="v.title" :key="i" @click="handleChangeStyle(i)" />
    </div>
  </div>
</template>

<language>
{
  "地图":{
    "zh-CN": "地图",
    "en-US": "Map"
  },
}
</language>

<script>
import { MAP_LAYER_STYLE } from "@/mymap/index";

export default {
  name: "MapStyle",
  props: {},
  inject: ["rootVue"],
  components: {},
  computed: {
    _MapLayer() {
      return this.rootVue._MapLayer;
    },
  },
  watch: {},
  data() {
    return {
      open: false,
      styleList: [],
      active: 0,
    };
  },
  created() {},
  mounted() {
    this._interval = setInterval(() => {
      if (this._MapLayer) {
        const itemDocList = [];
        const list = Object.values(MAP_LAYER_STYLE);
        for (let i = 0, l = list.length; i < l; i++) {
          const value = list[i];
          if (value === this._MapLayer.tileClass) this.active = i;
          const item = {
            title: value.style_name,
            url: new value(15, 26700, 14218, 200).url,
            c: value,
          };
          itemDocList.push(item);
        }
        this.styleList = itemDocList;
        clearInterval(this._interval);
      }
    }, 500);
  },
  beforeDestroy() {
    clearInterval(this._interval);
  },
  methods: {
    handleChangeStyle(i) {
      this.open = false;
      this.active = i;
      this._MapLayer.setTileClass(this.styleList[i].c);
    },
  },
};
</script>

<style lang="scss" scoped>
.MapStyle {
  cursor: pointer;
  position: relative;
  height: 32px;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;

  #map-switch {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon {
    width: 24px;
    height: 24px;
  }

  .text {
    font-weight: 400;
    font-size: 14px;
    color: #434343;
    line-height: 20px;
  }

  .map-switch-list {
    position: absolute;
    z-index: 3000;
    top: 40px;
    left: 0px;
    // height: 390px;
    // width: 40px;
    overflow: hidden;
    background: #fff;
    transition: width 0.3s;
    border-radius: 5px;
    box-shadow: 0 0px 15px rgba(0, 0, 0, 0.8);
    padding: 10px;

    &.hide {
      /* width: 50px !important; */
      height: 0px !important;
      padding: 0px !important;
    }

    .item {
      box-sizing: border-box;
      cursor: pointer;
      display: block;
      height: 40px;
      width: 40px;
      border-radius: 5px;
      border: 2px solid transparent;
      & + .item {
        margin-top: 10px;
      }
      &.active {
        border-color: #409eff;
      }
    }
  }
}
</style>
