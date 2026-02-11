<template>
  <div class="index" v-loading="buildLoading || networkloading">
    <div class="grid_root">
      <div class="Drawer_row">
        <div></div>
        <div class="mapBox">
          <div id="mapRoot"></div>
          <div class="box" style="width: 350px">
            <el-form size="small" label-position="left">
              <el-row :gutter="0">
                <el-col :span="12" :offset="0">
                  <el-form-item label="建筑：">
                    <el-switch v-model="showBuild" :active-value="true" :inactive-value="false"></el-switch>
                  </el-form-item>
                </el-col>
                <el-col :span="12" :offset="0">
                  <el-form-item label="地面路网：">
                    <el-switch v-model="showNetwork2D" :active-value="true" :inactive-value="false"></el-switch>
                  </el-form-item>
                </el-col>
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
                <el-col :span="12" :offset="0">
                  <el-form-item label="起点：">
                    <span>{{ startPink && startPink.id }} </span>
                    <el-button v-if="!selectStartPink" plain @click="handleSelectStartPink(true)" size="small">选择</el-button>
                    <el-button v-else plain @click="handleSelectStartPink(false)" size="small">取消</el-button>
                  </el-form-item>
                </el-col>
                <el-col :span="12" :offset="0">
                  <el-form-item label="终点：">
                    <span>{{ endPink && endPink.id }} </span>
                    <el-button v-if="!selectEndPink" plain @click="handleSelectEndPink(true)" size="small">选择</el-button>
                    <el-button v-else plain @click="handleSelectEndPink(false)" size="small">取消</el-button>
                  </el-form-item>
                </el-col>
                <el-col :span="24" :offset="0" v-if="startPink && endPink">
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
                    <el-form-item label="位置：">{{ playDetail.x }}, {{ playDetail.y }}, {{ playDetail.z }}</el-form-item>
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
import NewClock from "@/components/NewClock/index.vue";

import { Network3DLayer } from "./layer/Network3DLayer";
import { UAVLayer } from "./layer/UAVLayer";
import { Build3DLayer } from "./layer/Build3DLayer";
import { NetworkLayer } from "./layer/NetworkLayer";

import test3dNetworkCleaned from "./data/test3dNetworkCleaned.json";
import test3dNetworkPathInMatsim from "./data/test3dNetworkPathInMatsim(2).json";

export default {
  components: {
    NewClock,
  },
  provide() {
    return {
      rootVue: this,
    };
  },
  computed: {
  },
  watch: {
    startPink: {
      handler() {
        if (this.startPink && this.endPink) {
          const key = `${this.startPink.id}>>${this.endPink.id}`;
          const path = test3dNetworkPathInMatsim[key];
          if (path) {
            this._UAVLayer.setPath(path);
            this._UAVLayer.reset();
          }
        }
      },
    },
    endPink: {
      handler() {
        if (this.startPink && this.endPink) {
          const key = `${this.startPink.id}>>${this.endPink.id}`;
          const path = test3dNetworkPathInMatsim[key];
          if (path) {
            this._UAVLayer.setPath(path);
            this._UAVLayer.reset();
          }
        }
      },
    },
    lockSelect: {
      handler(val) {
        this._UAVLayer.lockSelect = val;
      },
    },
    showBuild: {
      handler(val) {
        if (val) {
          this._Map.addLayer(this._Build3DLayer);
        } else {
          this._Map.removeLayer(this._Build3DLayer);
        }
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
    };
  },
  created() {},
  async mounted() {
    this.initMap();

    this.handleUpdateTime(this.time);
  },
  methods: {
    handleShowHelp() {
      console.log("handleShowHelp");
    },
    handleUpdateTime(value) {},
    // 初始化地图
    async initMap() {
      this._Map = new MyMap({
        rootId: "mapRoot",
        center: [12606995.580320276, 2647865.9741280824],
        // center: WGS84ToMercator(113.4848520194447, 23.089866565806066),
        zoom: 14,
        // minPitch: -90,
      });
      this._Map.cameraControls.enableRotate = true;
      // this._MapLayer = new MapLayer({ tileClass: MAP_LAYER_STYLE[MAP_LAYER_STYLE.length - 1], zIndex: -1 });
      this._MapLayer = new MapLayer({ tileClass: MAP_LAYER_STYLE[0], zIndex: -1 });
      this._Map.addLayer(this._MapLayer);

      this._UAVLayer = new UAVLayer({
        lockSelect: this.lockSelect,
        event: {
          playing: (res) => {
            this.playDetail = res.data;
          },
        },
      });
      this._Map.addLayer(this._UAVLayer);

      this._Network3DLayer = new Network3DLayer({
        zIndex: 100,
        usePick: true,
        showLink: this.showNetwork3DLink,
        showNode: this.showNetwork3DNode,
        event: {
          [MAP_EVENT.HANDLE_PICK_LEFT]: (res) => {
            if (this.selectStartPink) {
              this.startPink = res.data;
              this._Network3DLayer.setStartPink(res.data);
              this._Network3DLayer.openPick = false;
              this.selectStartPink = false;
              this.handleSelectEndPink(true);
            } else if (this.selectEndPink) {
              this.endPink = res.data;
              this._Network3DLayer.setEndPink(res.data);
              this._Network3DLayer.openPick = false;
              this.selectEndPink = false;
            }
          },
        },
      });
      this._Network3DLayer.setData(test3dNetworkCleaned);
      this._Map.addLayer(this._Network3DLayer);

      this._Build3DLayer = new Build3DLayer({
        zIndex: 2,
        buildColor: "#838385",
        buildOpacity: 0.5,
        event: {
          [MAP_EVENT.LAYER_LOADING]: ({ data }) => {
            this.buildLoading = data;
          },
        },
      });
      if (this.showBuild) this._Map.addLayer(this._Build3DLayer);

      this._NetworkLayer = new NetworkLayer({
        zIndex: 20,
        lineWidth: 3,
        lineOffset: 4,
        colors: this.getLayerColors(["#65b581", "#a3bf62", "#ffce34", "#ffb93d", "#ff6600", "#ff0000"]),
        showNode: false,
        showVideoIcon: false,
        videoIconWidth: 10,
        event: {
          [MAP_EVENT.LAYER_LOADING]: ({ data }) => {
            this.networkloading = data;
          },
        },
      });
      if (this.showNetwork2D) this._Map.addLayer(this._NetworkLayer);
    },

    getLayerColors(colors) {
      try {
        return {
          0: colors[0],
          0.4: colors[0],
          0.4: colors[1],
          0.6: colors[1],
          0.6: colors[2],
          0.75: colors[2],
          0.75: colors[3],
          0.85: colors[3],
          0.85: colors[4],
          0.95: colors[4],
          0.95: colors[5],
          1: colors[5],
        };
      } catch (error) {
        colors = ["#313695", "#74add1", "#e0f3f8", "#fdae61", "#f46d43", "#a50026"];
        return {
          0: colors[0],
          0.4: colors[0],
          0.4: colors[1],
          0.6: colors[1],
          0.6: colors[2],
          0.75: colors[2],
          0.75: colors[3],
          0.85: colors[3],
          0.85: colors[4],
          0.95: colors[4],
          0.95: colors[5],
          1: colors[5],
        };
      }
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
    handleSelectStartPink(res) {
      this.selectStartPink = res;
      this._Network3DLayer.openPick = res;
    },
    handleSelectEndPink(res) {
      this.selectEndPink = res;
      this._Network3DLayer.openPick = res;
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
