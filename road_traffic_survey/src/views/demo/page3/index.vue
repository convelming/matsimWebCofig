<template>
  <div class="index">
    <div class="grid_root">
      <div class="Drawer_row">
        <div></div>
        <div class="mapBox">
          <div id="mapRoot"></div>

          <div class="box" style="width: 350px">
            <el-form size="small" label-position="left">
              <el-row :gutter="0">
                <!-- <el-col :span="12" :offset="0">
                  <el-form-item label="建筑：">
                    <el-switch v-model="showBuild" :active-value="true" :inactive-value="false"></el-switch>
                  </el-form-item>
                </el-col>
                <el-col :span="12" :offset="0">
                  <el-form-item label="地面路网：">
                    <el-switch v-model="showNetwork2D" :active-value="true" :inactive-value="false"></el-switch>
                  </el-form-item>
                </el-col> -->
                <el-col :span="12" :offset="0">
                  <el-form-item label="空中路网：">
                    <el-switch v-model="showNetwork3DLink" :active-value="true" :inactive-value="false"></el-switch>
                  </el-form-item>
                </el-col>
                <el-col :span="12" :offset="0">
                  <el-form-item label="空中路网节点：">
                    <el-switch v-model="showNetwork3DNode" :active-value="true" :inactive-value="false"></el-switch>
                  </el-form-item>
                </el-col>
                <el-col :span="24" :offset="0">
                  <el-form-item label="轨迹：">
                    <el-select v-model="selectPath" clearable @change="handleChangePath">
                      <el-option v-for="(item, index) in paths" :key="index" :label="index" :value="index" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="24" :offset="0" v-if="selectPath">
                  <el-form-item label-width="0">
                    <el-button size="small" @click="play">播放</el-button>
                    <el-button size="small" @click="stop">暂停</el-button>
                    <el-button size="small" @click="reset">重置</el-button>
                    <span style="margin-left: 20px">锁定视角：</span><el-switch v-model="lockSelect" :active-value="true" :inactive-value="false"></el-switch>
                  </el-form-item>
                </el-col>
                <template v-if="playDetail">
                  <el-col :span="12" :offset="0">
                    <el-form-item label="时间：">{{ Number(playDetail.time).toFixed(0) }} s</el-form-item>
                  </el-col>
                  <el-col :span="12" :offset="0">
                    <el-form-item label="速度：">{{ Number(playDetail.speed).toFixed(3) }} m/s</el-form-item>
                  </el-col>
                  <el-col :span="24" :offset="0">
                    <el-form-item label="位置：">{{ Number(playDetail.x).toFixed(2) }}, {{ Number(playDetail.y).toFixed(2) }}, {{ Number(playDetail.z).toFixed(2) }}</el-form-item>
                  </el-col>
                </template>
              </el-row>
            </el-form>
          </div>
        </div>
        <div></div>
      </div>
    </div>
  </div>
</template>

<script>
import { MyMap, MapLayer, MAP_LAYER_STYLE, MAP_EVENT } from "@/mymap/index.js";
import { WGS84ToMercator } from "@/mymap/utils/LngLatUtils";
import { TifLayer } from "./layer/TifLayer";
import { Network3DLayer, Network } from "./layer/Network3DLayer";
import { UAVLayer } from "./layer/UAVLayer";

import NewClock from "@/components/NewClock/index.vue";

import JSZip from "jszip";

import * as GeoTIFF from "geotiff";

export default {
  components: {
    NewClock,
  },
  provide() {
    return {
      rootVue: this,
    };
  },
  computed: {},
  watch: {
    lockSelect: {
      handler(val) {
        this._UAVLayer.lockSelect = val;
      },
    },
    showNetwork2D: {
      handler(val) {
        if (val) {
          this._Map.addLayer(this._NetworkLayer);
        } else {
          this._Map.removeLayer(this._NetworkLayer);
        }
      },
    },
    showNetwork3DNode: {
      handler(val) {
        this._Network3DLayer.setShowNode(val);
      },
    },
    showNetwork3DLink: {
      handler(val) {
        this._Network3DLayer.setShowLink(val);
      },
    },
  },
  data() {
    return {
      startPink: null,
      selectStartPink: false,
      endPink: null,
      selectEndPink: false,
      playDetail: null,
      lockSelect: false,
      buildLoading: false,
      networkloading: false,
      showBuild: false,
      showNetwork2D: false,
      showNetwork3DNode: true,
      showNetwork3DLink: true,
      paths: {},
      selectPath: null,
    };
  },
  created() {},
  async mounted() {
    this.initMap();
    this.loadPaths();
    this.getTif();
    this.loadNetwork();
  },
  methods: {
    // 初始化地图
    async initMap() {
      this._Map = new MyMap({
        rootId: "mapRoot",
        center: [12606995.580320276, 2647865.9741280824],
        center: [12707787.79, 2759380.11],
        // center: WGS84ToMercator(113.4848520194447, 23.089866565806066),
        zoom: 11,
        minPitch: -90,
      });
      this._Map.cameraControls.enableRotate = true;
      this._MapLayer = new MapLayer({ tileClass: MAP_LAYER_STYLE[MAP_LAYER_STYLE.length - 1], zIndex: -1 });
      this._Map.addLayer(this._MapLayer);

      this._TifLayer = new TifLayer({ zIndex: 100 });
      this._Map.addLayer(this._TifLayer);

      this._Network3DLayer = new Network3DLayer({
        zIndex: 200,
        usePick: true,
        showLink: this.showNetwork3DLink,
        showNode: this.showNetwork3DNode,
      });
      this._Map.addLayer(this._Network3DLayer);

      this._UAVLayer = new UAVLayer({
        lockSelect: this.lockSelect,
        event: {
          playing: (res) => {
            this.playDetail = res.data;
          },
        },
      });
      this._Map.addLayer(this._UAVLayer);
    },
    async loadNetwork() {
      const response = await fetch(process.env.VUE_APP_BASE_API + "/demo/output_network.zip");
      if (response.ok) {
        const blob = await response.blob();
        const zip = await JSZip.loadAsync(blob);
        const xml = await zip.file("output_network.xml").async("string");
        console.time("new Network");
        const network = Network.fromXml(xml);
        console.timeEnd("new Network");
        this._Network3DLayer.setNetwork(network);
      } else {
        console.error(`HTTP error! status: ${response.status}`, response);
      }
    },
    async loadPaths() {
      const response = await fetch(process.env.VUE_APP_BASE_API + "/demo/leg.json");
      if (response.ok) {
        const xml = await response.text();
        this.paths = JSON.parse(xml);
      } else {
        console.error(`HTTP error! status: ${response.status}`, response);
      }
    },
    async getTif() {
      const tif = await GeoTIFF.fromUrl(process.env.VUE_APP_BASE_API + "/demo/新丰县dem.tif");
      const tifImage = await tif.getImage();
      const tifImageData = await tifImage.readRasters({
        interleave: true,
      });
      const bbox = tifImage.getBoundingBox();
      const [x1, y1] = WGS84ToMercator(bbox[0], bbox[1]);
      const [x2, y2] = WGS84ToMercator(bbox[2], bbox[3]);

      const image = {
        imgWidth: tifImage.getWidth(),
        imgHeight: tifImage.getHeight(),
        tl: [x1, y1],
        br: [x2, y2],
        center: [(x1 + x2) / 2, (y1 + y2) / 2],
        width: Math.abs(x2 - x1),
        height: Math.abs(y2 - y1),
        data: tifImageData,
      };
      this._TifLayer.setTifImage(image);
    },
    handleChangePath() {
      this.reset();
      this._UAVLayer.setPath(this.paths[this.selectPath]);
    },
    play() {
      this._UAVLayer.play();
    },
    stop() {
      this._UAVLayer.stop();
    },
    reset() {
      this._UAVLayer.reset();
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
</style>
