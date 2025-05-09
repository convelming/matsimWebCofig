<template>
  <div class="index">
    <div class="grid_root">
      <div class="Drawer_row">
        <div></div>
        <div class="mapBox">
          <div id="mapRoot"></div>
          <div class="box">
            <!-- <div class="title">控制面板</div> -->
            <div class="card">
              <el-form size="small" label-position="left">
                <el-row :gutter="0">
                  <el-col :span="12" :offset="0">
                    <el-form-item label="layer1：">
                      <el-switch v-model="showLayer1" :active-value="true" :inactive-value="false"></el-switch>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12" :offset="0">
                    <el-form-item label="layer2：">
                      <el-switch v-model="showLayer2" :active-value="true" :inactive-value="false"></el-switch>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </div>
          </div>
        </div>
        <div></div>
      </div>
    </div>
  </div>
</template>

<script>
import { MyMap, MapLayer, MAP_LAYER_STYLE, MAP_EVENT } from "@/mymap/index.js";
import { MapLayer as MapLayer2, MapTile } from "./layer/MapLayer.js";
import { TileLayer } from "./layer/TileLayer2.js";

import { OSMTileUtils as OSMTileUtils1 } from "@/mymap/utils/OSMTileUtils.js";
import { OSMTileUtils as OSMTileUtils2 } from "./layer/OSMTileUtils.js";

export default {
  components: {},
  provide() {
    return {
      rootVue: this,
    };
  },
  computed: {},
  watch: {
    showLayer1: {
      handler(val) {
        if (val) {
          this._Map.addLayer(this._TileLayer);
        } else {
          this._Map.removeLayer(this._TileLayer);
        }
      },
    },
    showLayer2: {
      handler(val) {
        if (val) {
          this._Map.addLayer(this._MapLayer2);
        } else {
          this._Map.removeLayer(this._MapLayer2);
        }
      },
    },
  },
  data() {
    return {
      showLayer1: true,
      showLayer2: true,
    };
  },
  created() {},
  async mounted() {
    this.initMap();
  },
  methods: {
    // 初始化地图
    async initMap() {
      this._Map = new MyMap({
        rootId: "mapRoot",
        // center: [12707787.79, 2759380.11],
        center: [12707787.79, 4759380.11],
        // center: [12716943.337189136, 2761023.0570991505],
        zoom: 5,
        minPitch: -90,
        mapZoomHeight: 600,
      });
      console.log(this._Map);
      this._Map.cameraControls.enableRotate = true;

      // this._TileLayer = new TileLayer({ zIndex: 0, noTif: true });
      // this._Map.addLayer(this._TileLayer);

      this._MapLayer = new MapLayer({ tileClass: MAP_LAYER_STYLE[MAP_LAYER_STYLE.length - 1], zIndex: -1, opacity: 1 });
      this._Map.addLayer(this._MapLayer);
      this._MapLayer2 = new MapLayer2({ tileClass: MapTile, zIndex: 10000, opacity: 0.5 });
      this._Map.addLayer(this._MapLayer2);

      // const l1 = OSMTileUtils1.getTileList(10, [12707787.79, 2759380.11], 100000);
      // const l2 = OSMTileUtils2.getTileList(10, [12707787.79, 2759380.11], 100000);
      // console.log(l1, l2);
      // 10/839/446
      // {
      //   const l1 = OSMTileUtils1.rowToX(839, 10);
      //   const l2 = OSMTileUtils2.rowToX(839, 10);
      //   console.log(l1, l2);
      // }
      // {
      //   const l1 = OSMTileUtils1.colToY(446, 10);
      //   const l2 = OSMTileUtils2.colToY(446, 10);
      //   console.log(l1, l2);
      // }

      // function WGS84ToMercator(lng, lat) {
      //   let x = (lng * 20037508.342789) / 180;
      //   let y = Math.log(Math.tan(((90 + lat) * Math.PI) / 360)) / (Math.PI / 180);
      //   y = (y * 20037508.34789) / 180;
      //   // if(y > 20037508.34789) y = 20037508.34789;
      //   // if(y < -20037508.34789) y = -20037508.34789;
      //   console.log([x, y]);
      //   console.log(proj4("EPSG:4326", "EPSG:3857", [lng, lat]));
      //   return [x, y];
      // }
      // function MercatorToWGS84(x, y) {
      //   let lng = (x / 20037508.34) * 180;
      //   let lat = (y / 20037508.34) * 180;
      //   lat = (180 / Math.PI) * (2 * Math.atan(Math.exp((lat * Math.PI) / 180)) - Math.PI / 2);
      //   console.log([lng, lat]);
      //   console.log(proj4("EPSG:3857", "EPSG:4326", [x, y]));
      //   return [lng, lat];
      // }
      // let [x, y] = WGS84ToMercator(180, 89);
      // let [lng, lat] = MercatorToWGS84(x, y);
      // 238107693.32558042
      // 25819498.520116013
      // 30240971.96608437
      // 20037508
    },
  },
};
</script>

<style lang="scss" scoped>
.index {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;

  .grid_root {
    width: 100vw;
    height: 100vh;
  }

  .mapBox {
    position: relative;
    z-index: 20;

    #mapRoot {
      width: 100%;
      height: 100%;
    }
  }
}
.box {
  width: 400px;
  position: absolute;
  right: 20px;
  top: 20px;
  z-index: 1500;
  background-color: #ffffffaa;
  user-select: none;
  padding: 12px;
  background: #ffffff;
  box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  .el-form-item {
    margin-bottom: 8px;
    // color: orange;
  }
}

.NewClock {
  position: absolute;
  right: 20px;
  top: 20px;
  z-index: 1000;
}
</style>
