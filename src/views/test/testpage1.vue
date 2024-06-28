<template>
  <div id="map" class="map">
    <NewClock id="NewClock" class="NewClock" />
    <img :src="src" class="img" alt="" style="width: 200px" />
  </div>
</template>

<script>
import { Map, MapLayer } from "@/mymap/index.js";
import { htmlToImage } from "@/mymap/utils/index";
import NewClock from "@/components/NewClock/index.vue";
export default {
  components: {
    NewClock,
  },
  provide() {
    return {
      rootVue: this,
    };
  },
  data() {
    return {
      src: "",
    };
  },
  async mounted() {
    this.initMap();
    const html = `
      <div class="img" style="width: 200px">
        <h1>悯农</h1>
        <p>锄禾日当午，汗滴禾下土</p>
        <p>锄禾日当午，汗滴禾下土</p>
        <p>锄禾日当午，汗滴禾下土</p>
        <p>锄禾日当午，汗滴禾下土</p>
        <p>锄禾日当午，汗滴禾下土</p>
        <p>锄禾日当午，汗滴禾下土</p>
        <p>锄禾日当午，汗滴禾下土</p>
        <p>锄禾日当午，汗滴禾下土</p>
        <p>锄禾日当午，汗滴禾下土</p>
        <p>锄禾日当午，汗滴禾下土</p>
        <p>谁知盘中餐，粒粒皆辛苦</p>
      </div>
    `;
    console.log(html);
    // const image = await htmlToImage(html);
    // this.src = image.url;
  },
  methods: {
    // 初始化地图
    initMap() {
      this._Map = new Map({
        rootId: "map",
      });
      this._Map.cameraControls.enableRotate = true;
      this._Map.addLayer(new MapLayer({ zIndex: 0 }));
    },
  },
};
</script>

<style lang="scss" scoped>
.img {
  position: absolute;
  left: 20px;
  top: 20px;
  z-index: 1000;
}
.map {
  width: 100vw;
  height: 100vh;
}
.NewClock {
  position: absolute;
  right: 20px;
  top: 20px;
  z-index: 1000;
}
</style>
