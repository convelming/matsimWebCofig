<template>
  <div class="BMapBox">
    <div id="bmap_container"></div>
    <!-- <Dialog :appendBody="false" title="站点列表" visible :left="(windowWidth * s_width) / 100 + 20" resize="500px" width="300px" hideClose hideMinimize>
      <div id="r-result"></div>
    </Dialog> -->
    <div id="r-result"></div>
  </div>
</template>

<script>
import { MercatorToWGS84, WGS84ToMercator } from "@/mymap/utils/LngLatUtils";
const x_offset = 1320;
const y_offset = 360;
const zoom_offset = 1.09;

export default {
  components: {},
  props: {
    center: {
      type: Array,
    },
    zoom: {
      type: [String, Number],
      default: 15,
    },
    busName: {
      type: String,
      default: "",
    },
  },
  data() {
    return {};
  },
  watch: {
    center: {
      handler() {
        this.setMapCenterAndZoom();
      },
      deep: true,
    },
    zoom: {
      handler() {
        this.setMapCenterAndZoom();
      },
      deep: true,
    },
    busName: {
      handler(val) {
        this.s_busName = val;
        if (this.busline) {
          this.busline.getBusList(this.s_busName);
        }
      },
      immediate: true,
    },
  },
  beforeDestroy() {
    if (this.busline) {
      this.busline.clearResults();
    }
    if (this.map) {
      this.map.destroy();
    }
  },
  created() {
    this.s_busName = this.busName;
  },
  mounted() {
    this.map = new BMapGL.Map("bmap_container"); // 创建Map实例
    this.map.disableDoubleClickZoom();
    this.map.disableDragging();
    let [x, y] = this.center;
    x += x_offset;
    y += y_offset;
    let center = MercatorToWGS84(x, y);
    let zoom = this.zoom + zoom_offset;

    this.map.centerAndZoom(new BMapGL.Point(...center), zoom);
    // this.map.addEventListener("zoomend", (event) => {
    //   this.handleUpdateCenterAndZoom();
    // });
    // this.map.addEventListener("moveend", (event) => {
    //   this.handleUpdateCenterAndZoom();
    // });
    this.busline = new BMapGL.BusLineSearch(this.map, {
      renderOptions: { map: this.map, panel: "r-result", autoViewport: true },
      onGetBusListComplete: (result) => {
        if (result) {
          var fstLine = result.getBusListItem(0); //获取第一个公交列表显示到map上
          this.busline.getBusLine(fstLine);
        }
      },
      onBusLineHtmlSet: (container) => {
        // if (this.centerAndZoomTimeout) clearTimeout(this.centerAndZoomTimeout);
        // this.centerAndZoomTimeout = setTimeout(() => {
        //   let { lng, lat } = this.map.getCenter();
        //   let [x, y] = WGS84ToMercator(lng, lat);
        //   x -= x_offset;
        //   y -= y_offset;
        //   let zoom = this.map.getZoom() - zoom_offset;
        //   this.$emit("centerAndZoom", {
        //     center: [x, y],
        //     zoom: zoom,
        //   });
        //   this.centerAndZoomTimeout = null;
        // }, 1500);
      },
    });
    this.$nextTick(() => {
      this.busline.getBusList(this.s_busName);
    });
  },
  methods: {
    setMapCenterAndZoom() {
      if (this.setMapCenterAndZoomTimeout) {
        clearTimeout(this.setMapCenterAndZoomTimeout);
      }
      this.setMapCenterAndZoomTimeout = setTimeout(() => {
        if (this.map) {
          let [x, y] = this.center;
          x += x_offset;
          y += y_offset;
          let center = MercatorToWGS84(x, y);
          let zoom = this.zoom + zoom_offset;
          this.map.setCenter(new BMapGL.Point(...center), {
            noAnimation: true,
          });
          this.map.setZoom(zoom, {
            noAnimation: true,
          });
          // this.map.flyTo(new BMapGL.Point(...center), zoom);
        }
        this.setMapCenterAndZoomTimeout = null;
      }, 200);
    },
    handleUpdateCenterAndZoom() {
      if (this.centerAndZoomTimeout) {
        clearTimeout(this.centerAndZoomTimeout);
      }
      this.centerAndZoomTimeout = setTimeout(() => {
        if (this.map) {
          let { lng, lat } = this.map.getCenter();
          let [x, y] = WGS84ToMercator(lng, lat);
          x -= x_offset;
          y -= y_offset;
          let zoom = this.map.getZoom() - zoom_offset;
          // this.$emit("centerAndZoom", {
          //   center: [x, y],
          //   zoom: zoom,
          // });
        }
        this.centerAndZoomTimeout = null;
      }, 200);
    },
  },
};
</script>

<style lang="scss" scoped>
.BMapBox {
  position: relative;
  box-sizing: border-box;
  user-select: none;
  overflow: hidden;
  width: 100%;
  height: 100%;
  #bmap_container {
    width: 100%;
    height: 100%;
    z-index: 5;
  }
  // #r-result {
  //   height: 100%;
  //   overflow-y: auto;
  //   overflow-x: hidden;
  // }
  #r-result {
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 99;
    box-sizing: border-box;
    width: 300px;
    height: 500px;
    padding: 20px;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
    overflow-y: auto;
    overflow-x: hidden;
  }
}
</style>
