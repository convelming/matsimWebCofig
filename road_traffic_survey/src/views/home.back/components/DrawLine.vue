<template>
  <Dialog class="FrameCrossroads_DrawLine" title="绘制检测线" :top="40" :left="100" width="calc(100vw - 200px)" hideMinimize :visible="visible" @close="handleClose">
    <div class="FrameCrossroads_DrawLine_body">
      <!-- <div class="image_list">
        <img class="image_item selected" :src="this.drawUrl" />
      </div> -->
      <el-row :gutter="20">
        <el-col :span="24" :lg="16" :xl="13">
          <div class="draw_map_box">
            <div class="img_size" :style="{ paddingBottom: `${(drawHeight / drawWidth) * 100}%` }"></div>
            <div class="draw_map" id="draw_map"></div>
          </div>
        </el-col>
        <el-col :span="24" :lg="8" :xl="11">
          <div class="draw_toolbar">
            <div class="row">
              <el-button v-if="!isChangeMap" type="primary" size="small" @click="handleStartChangeMap">调整位置</el-button>
              <el-button v-else type="primary" size="small" @click="handleEndChangeMap">结束调整</el-button>
              <div class="open_btn el-icon-arrow-down" :class="{ hide: !showChangeMapSetting }" @click="showChangeMapSetting = !showChangeMapSetting"></div>
            </div>
            <template v-if="showChangeMapSetting">
              <div class="row">
                <span class="label">显示地图:</span>
                <el-switch v-model="showMapLayer" :active-value="true" :inactive-value="false"> </el-switch>
              </div>
              <div class="row">
                <span class="label">显示路网:</span>
                <el-switch v-model="showNetworkLayer" :active-value="true" :inactive-value="false"> </el-switch>
              </div>
              <div class="row">
                <span class="label">地图透明度:</span>
                <el-slider :disabled="!showMapLayer" style="width: 100%; padding: 0 2em 0 0" v-model="mapLayerOpacity" :step="0.01" :min="0" :max="1"> </el-slider>
              </div>
              <div class="row">
                <span class="label">topLeft:</span>
                <span>{{ mapFrom.topLeft }}</span>
              </div>
              <div class="row">
                <span class="label">topRight:</span>
                <span>{{ mapFrom.topRight }}</span>
              </div>
              <div class="row">
                <span class="label">bottomLeft:</span>
                <span>{{ mapFrom.bottomLeft }}</span>
              </div>
              <div class="row">
                <span class="label">bottomRight:</span>
                <span>{{ mapFrom.bottomRight }}</span>
              </div>
            </template>
            <div class="row">
              <el-button type="primary" size="small" @click="handleAddDrawLine">添加画线</el-button>
              <div class="open_btn el-icon-arrow-down" :class="{ hide: !showChangeDrawLineSetting }" @click="showChangeDrawLineSetting = !showChangeDrawLineSetting"></div>
            </div>
            <template v-if="showChangeDrawLineSetting">
              <template v-if="drawLineFrom">
                <div class="row">
                  <span class="label">线名：</span>
                  <el-input v-model="drawLineFrom.name" placeholder="" size="mini" clearable @change=""></el-input>
                </div>
                <div class="row">
                  <span class="label">开始点：</span>
                  <span> {{ formatterPoint(drawLineFrom.begin) }}</span>
                </div>
                <div class="row">
                  <span class="label">结束点：</span>
                  <span> {{ formatterPoint(drawLineFrom.end) }}</span>
                </div>
                <div class="row">
                  <span class="label">颜色：</span>
                  <el-color-picker v-model="drawLineFrom.color" :predefine="predefineColors" size="mini"></el-color-picker>
                </div>
                <div class="row">
                  <el-button type="primary" size="small" @click="handleConfirmDrawLine">确定</el-button>
                  <el-button type="primary" size="small" @click="handleCancelLine">取消</el-button>
                </div>
              </template>
              <template v-else>
                <div class="row">
                  <el-table class="small" :data="drawLineList" border stripe height="300px">
                    <el-table-column prop="color" label="颜色" width="50">
                      <template slot-scope="{ row }">
                        <el-color-picker v-model="row.color" :predefine="predefineColors" size="mini"></el-color-picker>
                      </template>
                    </el-table-column>
                    <el-table-column prop="name" label="线名"> </el-table-column>
                    <el-table-column prop="begin" label="开始点">
                      <template slot-scope="{ row }">{{ formatterPoint(row.begin) }}</template>
                    </el-table-column>
                    <el-table-column prop="end" label="结束点">
                      <template slot-scope="{ row }">{{ formatterPoint(row.end) }}</template>
                    </el-table-column>
                    <el-table-column label="操作" width="150">
                      <template slot-scope="{ row, $index }">
                        <el-button type="primary" size="mini" @click="handleEditDrawLine(row, $index)">编辑</el-button>
                        <el-button type="danger" size="mini" @click="handleRemoveDrawLine(row, $index)">删除</el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </template>
            </template>
          </div>
        </el-col>
      </el-row>
    </div>
    <div class="FrameCrossroads_DrawLine_footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="saving">保存绘制内容</el-button>
    </div>
  </Dialog>
</template>

<script>
import { MyMap, MAP_EVENT, MAP_LAYER_STYLE, MapLayer } from "@/mymap/index.js";
import { MercatorToWGS84, WGS84ToMercator } from "@/mymap/utils/LngLatUtils";

import { DrawLineLayer } from "../layer/DrawLineLayer";
import { NetworkLayer } from "../layer/NetworkLayer";

import { getCrossroadsFrame, crossroadsSaveLine, crossroadsDetail } from "@/api/index";
import { JsonParse } from "@/utils/index";

export default {
  name: "FrameCrossroads_DrawLine",
  inject: ["rootVue"],
  props: {
    visible: {
      type: Boolean,
    },
    params: {
      type: Object,
      default: () => ({}),
    },
  },
  components: {},
  computed: {},
  watch: {
    visible: {
      handler(val) {
        if (val) {
          this.handleEnable();
        } else {
          this.handleDisable();
        }
      },
      immediate: true,
      deep: true,
    },
    showMapLayer: {
      handler(val) {
        if (this._Map) {
          if (val) {
            this._Map.addLayer(this._MapLayer);
          } else {
            this._Map.removeLayer(this._MapLayer);
          }
        }
      },
    },
    showNetworkLayer: {
      handler(val) {
        if (this._Map) {
          if (val) {
            this._Map.addLayer(this._NetworkLayer);
          } else {
            this._Map.removeLayer(this._NetworkLayer);
          }
        }
      },
    },
    mapLayerOpacity: {
      handler(val) {
        if (this._MapLayer) {
          this._MapLayer.setOpacity(val);
        }
      },
    },
  },
  data() {
    return {
      loading: false,
      saving: false,
      inited: false,
      predefineColors: ["#ff4500", "#ff8c00", "#ffd700", "#90ee90", "#00ced1", "#1e90ff", "#c71585"],

      drawUrl: "",
      drawWidth: 1600,
      drawHeight: 900,
      drawLineFrom: null,
      drawLineList: [],

      isChangeMap: false,
      showMapLayer: false,
      mapLayerOpacity: 0.5,
      mapFrom: {
        topLeft: [0, 0],
        topRight: [0, 0],
        bottomLeft: [0, 0],
        bottomRight: [0, 0],
      },

      showNetworkLayer: false,

      showChangeMapSetting: true,
      showChangeDrawLineSetting: true,
    };
  },
  created() {},
  mounted() {
    this.initMap();
    this.handleLoadNetwork();
    this.rootVue.$on("loadNetwork", this.handleLoadNetwork);
  },
  beforeDestroy() {
    this.handleDisable();
    this._Map && this._Map.dispose();
    this.rootVue.$off("loadNetwork", this.handleLoadNetwork);
  },
  methods: {
    handleLoadNetwork() {
      if (this.rootVue._NetworkData && this._NetworkLayer) {
        this._NetworkLayer.setData(this.rootVue._NetworkData);
      }
    },
    // 组件显示事件
    async handleEnable() {
      if (!this.inited) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        if (this.visible) this.handleEnable();
        return;
      }

      const id = this.params.id;
      if (id) {
        crossroadsDetail(id).then((res) => {
          console.log(res);
        });
        this.loading = true;
        const res = await crossroadsDetail(id);
        this.detail = res.data.crossroads;
        const mapInfo = JsonParse(res.data.crossroads.mapInfo, {
          center: [12614426, 2646623],
          zoom: 19,
          rotation: 0,
        });

        if (res.data.crossroads.type == 1) {
          // 人工录入
          this.drawUrl = "";
          this.drawName = "";
          this.drawWidth = 1600;
          this.drawHeight = 900;
          this.mapFrom = {
            topLeft: [0, 0],
            topRight: [0, 0],
            bottomLeft: [0, 0],
            bottomRight: [0, 0],
            width: 1600,
            height: 900,
          };
          this.drawLineFrom = null;

          this.showMapLayer = true;
          this.showNetworkLayer = true;
          this.mapLayerOpacity = 1;
        } else if (res.data.crossroads.type == 2) {
          // 视频录入
          const image = res.data.frame;
          this.drawUrl = image.url;
          this.drawName = image.name;
          this.drawWidth = image.width;
          this.drawHeight = image.height;
          this.mapFrom = {
            topLeft: [0, 0],
            topRight: [0, 0],
            bottomLeft: [0, 0],
            bottomRight: [0, 0],
            width: image.width,
            height: image.height,
          };
          this.drawLineFrom = null;

          this.showMapLayer = false;
          this.showNetworkLayer = false;
          this.mapLayerOpacity = 0.5;
        }

        this._Map.setCenter(mapInfo.center);
        this._Map.setZoom(mapInfo.zoom);
        this._Map.setPitchAndRotation(undefined, mapInfo.rotation);

        const drawLineListData = JsonParse(res.data.crossroads.lines, []);
        drawLineListData.forEach((line) => {
          line.name = line.lineName || "";
        });

        this._DrawLineLayer = new DrawLineLayer({
          zIndex: 0,
          url: this.drawUrl,
          width: this.drawWidth,
          height: this.drawHeight,
          drawLineList: drawLineListData,
        });
        this.drawLineList = this._DrawLineLayer.drawLineList;
        this._Map.addLayer(this._DrawLineLayer);
        this.loading = false;
      }
    },
    // 组件隐藏事件
    handleDisable() {
      this.drawUrl = "";
      this.drawName = "";
      this.drawWidth = 1600;
      this.drawHeight = 900;
      this.mapFrom = {
        topLeft: [0, 0],
        topRight: [0, 0],
        bottomLeft: [0, 0],
        bottomRight: [0, 0],
        width: 1600,
        height: 900,
      };
      this.drawLineFrom = null;

      this.showMapLayer = true;
      this.showNetworkLayer = true;
      this.mapLayerOpacity = 1;
      if (this._DrawLineLayer) {
        this._DrawLineLayer.dispose();
        this._DrawLineLayer = null;
      }
    },
    initMap() {
      this._Map = new MyMap({
        rootId: "draw_map",
        minPitch: 90,
        enableRotate: false,
        enableZoom: false,
        enablePan: false,
        event: {
          [MAP_EVENT.UPDATE_CENTER]: this.handleChangeMapFrom,
          [MAP_EVENT.UPDATE_CAMERA_HEIGHT]: this.handleChangeMapFrom,
          [MAP_EVENT.UPDATE_CAMERA_ROTATE]: this.handleChangeMapFrom,
        },
      });
      this._MapLayer = new MapLayer({ tileClass: MAP_LAYER_STYLE[0], zIndex: 20, opacity: this.mapLayerOpacity });
      if (this.showMapLayer) this._Map.addLayer(this._MapLayer);

      this._NetworkLayer = new NetworkLayer({ zIndex: 100, lineWidth: 5, color: "#409EFF" });
      if (this.showNetworkLayer) this._Map.addLayer(this._NetworkLayer);

      this.inited = true;
    },
    // *********************************** 改变地图位置，缩放，旋转角度 *********************************** //
    handleChangeMapFrom(res) {
      if (this._handleChangeMapFromTime) return;
      this._handleChangeMapFromTime = setTimeout(() => {
        if (this._Map) {
          const data = this._Map.getWindowRangeAndWebMercator();
          this.mapFrom.topLeft = this.MercatorToWGS84(data.topLeft);
          this.mapFrom.topRight = this.MercatorToWGS84(data.topRight);
          this.mapFrom.bottomLeft = this.MercatorToWGS84(data.bottomLeft);
          this.mapFrom.bottomRight = this.MercatorToWGS84(data.bottomRight);
          this.mapFrom.width = data.width;
          this.mapFrom.height = data.height;
        }
        this._handleChangeMapFromTime = null;
      }, 200);
    },
    MercatorToWGS84(list) {
      const [x, y] = MercatorToWGS84(list[0] || 0, list[1] || 0);
      return [Number(Number(x).toFixed(8)), Number(Number(y).toFixed(8))];
    },
    handleStartChangeMap() {
      this.isChangeMap = true;
      this._Map.enableRotate = true;
      this._Map.enableZoom = true;
      this._Map.enablePan = true;

      this._showMapLayer = this.showMapLayer;
      this.showMapLayer = true;
      this._showNetworkLayer = this.showNetworkLayer;
      this.showNetworkLayer = true;
    },
    handleEndChangeMap() {
      this.isChangeMap = false;
      this._Map.enableRotate = false;
      this._Map.enableZoom = false;
      this._Map.enablePan = false;
      this.showMapLayer = this._showMapLayer;
      this.showNetworkLayer = this._showNetworkLayer;
    },
    // *********************************** 改变地图位置，缩放，旋转角度 *********************************** //

    // *********************************** 画线 *********************************** //
    handleAddDrawLine() {
      this.handleConfirmDrawLine();
      if (this._DrawLineLayer) this.drawLineFrom = this._DrawLineLayer.addLine();
    },
    handleEditDrawLine(row, index) {
      this.handleConfirmDrawLine();
      this.drawLineFrom = this._DrawLineLayer.editLine(index);
    },
    handleConfirmDrawLine() {
      this.drawLineFrom = null;
      if (this._DrawLineLayer) this._DrawLineLayer.confirmLine();
    },
    handleCancelLine() {
      this.drawLineFrom = null;
      if (this._DrawLineLayer) this._DrawLineLayer.cancelLine();
    },
    handleRemoveDrawLine(row, index) {
      if (this._DrawLineLayer) this._DrawLineLayer.removeLine(index);
    },
    formatterPoint(array) {
      try {
        return [Number(Number(array[0]).toFixed(6)), Number(Number(array[1]).toFixed(6))];
      } catch (error) {
        return error.message;
      }
    },
    // *********************************** 画线 *********************************** //
    handleClose() {
      this.$emit("update:visible", false);
      this.$emit("close");
    },
    handleSubmit() {
      const scale = this._Map.rootDoc.clientWidth / this.drawWidth;
      const form = {
        cossroadsId: this.params.id, // 十字路id
        mapInfo: JSON.stringify({
          center: this._Map.center,
          zoom: this._Map.zoom,
          rotation: this._Map.rotation,
          width: this.mapFrom.width,
          height: this.mapFrom.height,
        }),
        vertex: [
          // 范围点
          WGS84ToMercator(...this.mapFrom.topLeft),
          WGS84ToMercator(...this.mapFrom.topRight),
          WGS84ToMercator(...this.mapFrom.bottomRight),
          WGS84ToMercator(...this.mapFrom.bottomLeft),
          WGS84ToMercator(...this.mapFrom.topLeft),
        ],
        lines: this.drawLineList.map((v) => {
          const mktBegin = this._Map.WindowXYToWebMercator(v.begin[0] * scale, v.begin[1] * scale);
          const mktEnd = this._Map.WindowXYToWebMercator(v.end[0] * scale, v.end[1] * scale);
          const item = {
            lineName: v.name, // 线名
            imageName: this.drawName, // 图片名
            beginx: parseInt(v.begin[0]), // 开始x坐标（图片相对位置）
            beginy: parseInt(v.begin[1]), // 开始y坐标
            endx: parseInt(v.end[0]), // 结束x坐标
            endy: parseInt(v.end[1]), // 结束y坐标
            width: parseInt(this.drawWidth), // 图片宽
            height: parseInt(this.drawHeight), // 图片高

            mktBeginx: mktBegin[0], // 开始x坐标（图片相对位置）
            mktBeginy: mktBegin[1], // 开始y坐标
            mktEndx: mktEnd[0], // 结束x坐标
            mktEndy: mktEnd[1], // 结束y坐标
          };
          return item;
        }),
      };
      console.log(form);
      // return;
      this.saving = true;
      crossroadsSaveLine(form)
        .then((res) => {
          this.$emit("submited", res);
          this.saving = false;
        })
        .catch((err) => {
          this.saving = false;
        });
    },
  },
};
</script>

<style lang="scss">
.FrameCrossroads_DrawLine {
  .FrameCrossroads_DrawLine_body {
    height: calc(100vh - 230px);
    overflow-y: auto;
    overflow-x: hidden;
  }
  .FrameCrossroads_DrawLine_footer {
    padding-top: 10px;
    display: flex;
    justify-content: center;
  }
  .image_list {
    position: relative;
    top: 1px;
    line-height: 0;
    margin-bottom: 20px;
    .image_item {
      height: 50px;
      border: 2px solid transparent;
      border-radius: 5px;
      margin-right: 10px;
      cursor: pointer;
      &.selected {
        border: 2px solid #1989fa;
      }
    }
  }
  .draw_map_box {
    position: relative;
    margin-bottom: 20px;
    .img_size {
      display: block;
      width: 100%;
      height: 0;
      opacity: 0;
    }
    .draw_map {
      position: absolute !important;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  }
  .draw_toolbar {
    font-size: 14px;
    .row {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
    }
    .label {
      white-space: nowrap;
      margin-right: 20px;
    }
    .open_btn {
      margin-left: auto;
      height: 32px;
      line-height: 32px;
      padding: 0 12px;
      cursor: pointer;
      transition: all 0.3s;
      &.hide {
        transform: rotate(90deg);
      }
    }
  }
}
</style>
