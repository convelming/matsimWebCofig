<template>
  <div class="root">
    <div id="mapRoot">
      <div class="MapLayerMenu">
        <div class="MapLayer_menu" :class="{ hide: !showStyleMenu }" :style="`width: ${styleList.length * 50 + 30}px`">
          <div class="open_hide_btn" @click="showStyleMenu = !showStyleMenu"></div>
          <img class="item" :class="{ active: styleActive == i }" v-for="(v, i) in styleList" :src="v.url" :title="v.style_name" :key="i" @click="handleChangeStyle(i)" />
        </div>
      </div>
    </div>
    <Dialog :visible="showSetting" hideMinimize hideClose width="400px">
      <div class="setting_box">
        <el-collapse style="user-select: none" v-model="activeNames">
          <el-collapse-item title="定位" name="1">
            <el-form class="setting_form" label-position="left" label-width="100px" :inline="false" size="small">
              <el-form-item label="路段搜索">
                <RouteSelect style="width: 100%" v-model="ruleForm.routeId" size="small" @change="handleMoveToRoute" />
              </el-form-item>
              <el-form-item label="LinkId搜索">
                <LinkSelect style="width: 100%" v-model="ruleForm.linkId" size="small" @change="handleMoveToLink" />
              </el-form-item>
              <el-form-item label="中心坐标">
                <CenterInput style="width: 100%" v-model="ruleForm.center" size="small" @change="handleMoveToCenter" />
              </el-form-item>
              <el-form-item>
                <div slot="label">
                  <span>zoom level&nbsp;</span>
                  <el-tooltip placement="top">
                    <div slot="content">
                      <div>当zoom level大于{{ SHOW_LINK_ZOOM }}时，显示路网视图</div>
                    </div>
                    <i class="el-icon-question"></i>
                  </el-tooltip>
                </div>
                <el-slider :min="MAP_ZOOM_RANGE.MIN" :max="MAP_ZOOM_RANGE.MAX" v-model="ruleForm.zoom" @change="handleChangeZoomLavel" :step="0.01" :marks="{ [ruleForm.zoom]: String(ruleForm.zoom) }"></el-slider>
              </el-form-item>
            </el-form>
          </el-collapse-item>
          <el-collapse-item name="2">
            <el-checkbox slot="title" v-model="showLinkStatsLayer" label="路段流量"></el-checkbox>
            <el-form class="setting_form" label-position="left" label-width="100px" :inline="false" size="small">
              <el-form-item label="数据录入">
                <el-button type="primary" size="mini" @click="linkFlow.visible = true">开始录入</el-button>
              </el-form-item>
              <el-form-item label="数据查询">
                <el-button type="primary" size="mini" @click="linkFlowQuery.visible = true">开始查询</el-button>
              </el-form-item>
              <el-collapse style="user-select: none" v-model="activeNames1">
                <el-collapse-item title="显示设置" name="1">
                  <el-form-item label="图标颜色">
                    <div style="display: flex; align-items: center; gap: 10px 20px; flex-wrap: wrap">
                      <div style="display: flex; align-items: center; gap: 5px" v-for="(v, i) in typeOptions" :key="i">
                        <div>{{ v }}</div>
                        <el-color-picker v-model="typeColorOptions[i]"></el-color-picker>
                      </div>
                    </div>
                  </el-form-item>
                  <el-form-item label="路段偏移">
                    <el-slider :min="0" :max="30" :step="0.2" v-model="ruleForm.twoWayOffset" @change="handleChangeTwoWayOffset"></el-slider>
                  </el-form-item>
                  <el-form-item label="路段宽度">
                    <el-slider :min="1" :max="30" v-model="ruleForm.wayWidth" @change="handleChangeWayWidth"></el-slider>
                  </el-form-item>
                </el-collapse-item>
              </el-collapse>
            </el-form>
          </el-collapse-item>
          <el-collapse-item name="3">
            <el-checkbox slot="title" v-model="showIntersectionListLayer" label="交叉口"></el-checkbox>
            <el-form class="setting_form" label-position="left" label-width="100px" :inline="false" size="small">
              <el-form-item label="数据录入">
                <el-button type="primary" @click="crossroadsInstall.visible = true">开始录入</el-button>
              </el-form-item>
              <el-form-item label="数据调查">
                <el-button type="primary" @click="crossroadsList.visible = true">开始查询</el-button>
              </el-form-item>
              <el-collapse style="user-select: none" v-model="activeNames2">
                <el-collapse-item title="显示设置" name="1">
                  <el-form-item label="图标颜色">
                    <div style="display: flex; align-items: center; gap: 10px 20px; flex-wrap: wrap">
                      <div style="display: flex; align-items: center; gap: 5px" v-for="(v, i) in intersectionStateOptions" :key="i">
                        <div>{{ v }}</div>
                        <el-color-picker v-model="intersectionStateColorOptions[i]"></el-color-picker>
                      </div>
                    </div>
                  </el-form-item>
                </el-collapse-item>
              </el-collapse>
            </el-form>
          </el-collapse-item>
          <el-collapse-item name="4">
            <el-checkbox slot="title" v-model="showImageListLayer" label="图片上传"></el-checkbox>

            <el-form class="setting_form" label-position="left" label-width="100px" :inline="false" size="small">
              <el-form-item label="数据录入">
                <UploadImageZip />
              </el-form-item>
              <el-form-item label="数据调查">
                <el-button type="primary" size="small" @click="imageListDialog.visible = true">开始查询</el-button>
              </el-form-item>
              <el-collapse style="user-select: none" v-model="activeNames3">
                <el-collapse-item title="显示设置" name="1">
                  <el-form-item label="图标颜色">
                    <div style="display: flex; align-items: center; gap: 10px 20px; flex-wrap: wrap">
                      <div style="display: flex; align-items: center; gap: 5px">
                        <div>图标颜色</div>
                        <el-color-picker v-model="imageListColor"></el-color-picker>
                      </div>
                      <div style="display: flex; align-items: center; gap: 5px">
                        <div>选中颜色</div>
                        <el-color-picker v-model="imageListHColor"></el-color-picker>
                      </div>
                    </div>
                  </el-form-item>
                </el-collapse-item>
              </el-collapse>
            </el-form>
          </el-collapse-item>
        </el-collapse>
      </div>
    </Dialog>
    <!-- line流量详情 -->
    <LinkFlow :visible.sync="linkFlow.visible" :linkId="linkFlow.linkId" @changeLink="handleChangeLink" @updateData="linkFlowUpdateData" @close="linkFlowClose" />
    <!-- line流量查询 -->
    <LinkFlowQuery
      :visible.sync="linkFlowQuery.visible"
      @clickSelect="
        linkFlowQuery.visible = false;
        linkFlow.visible = true;
      "
      @FrameSelect="
        linkFlowQuery.visible = false;
        linkPolygonSelect.visible = true;
      "
    />
    <!-- 区域流量详情 -->
    <LinkPolygonSelect :visible.sync="linkPolygonSelect.visible" :xyarr="linkPolygonSelect.xyarr" :selectState="linkPolygonSelect.state" />
    <!-- 视频录入交叉口信息 -->
    <AddIntersection :visible.sync="addIntersection.visible" :params="addIntersection.params" @submited="handleSubmitAddIntersection" @close="handleStopPointSelect" />
    <!-- 交叉口列表 -->
    <CrossroadsList
      :visible="showCrossroadsList"
      :params.sync="crossroadsList.params"
      @update:visible="crossroadsList.visible = $event"
      @showCrossroadsDetail="handleShowCrossroadsDetail"
      @showCrossroadsStatsEdit="handleShowCrossroadsStatsEdit"
      @showDrawLine="handleShowDrawLine"
      @showManuallyEnteringCrossroads="handleShowManuallyEnteringCrossroads"
      @showVideoInputCrossroads="handleShowVideoInputCrossroads"
    />
    <!-- 视频录入交叉口信息 -->
    <VideoInputCrossroads :visible.sync="videoInputCrossroads.visible" :params="videoInputCrossroads.params" @submited="handleSubmitVideoInputCrossroads" />
    <!-- 人工录入交叉口信息 -->
    <ManuallyEnteringCrossroads :visible.sync="manuallyEnteringCrossroads.visible" :params="manuallyEnteringCrossroads.params" @submited="handleSubmitManuallyEnteringCrossroads" />
    <!-- 交叉口绘制检测线 -->
    <DrawLine :visible.sync="drawLine.visible" :params="drawLine.params" @submited="handleDrawLineSuccess" />
    <!-- 交叉口信息录入 -->
    <CrossroadsInstall :visible.sync="crossroadsInstall.visible" :state="crossroadsInstall.state" @add="handlePlayPointSelect" @stop="handleStopPointSelect" @search="handleSubmitAddIntersection" />
    <!-- 交叉口详情 -->
    <CrossroadsDetail :visible.sync="crossroadsDetail.visible" :params="crossroadsDetail.params" />
    <!-- 编辑交叉口流量线 -->
    <CrossroadsStatsEdit :visible.sync="crossroadsStatsEdit.visible" :params="crossroadsStatsEdit.params" @redraw="handleRedraw" />
    <HelpDialog />

    <ImageListDialog :visible.sync="imageListDialog.visible" @close="handleSetHMash(null)" />
    <Dialog class="ImageDialog" title="查看图片" :top="50" :left="100" width="600px" hideMinimize :visible.sync="imageDialog.visible" @close="handleSetHMash(null)">
      <el-image v-if="imageDialog.data" :src="imageDialog.data.url" :preview-src-list="[imageDialog.data.url]" style="width: 560px; height: auto"></el-image>
      <div style="display: flex; justify-content: center">
        <el-button type="danger" @click="handleDeleteImage(imageDialog.data)">删除图片</el-button>
        <el-button
          type="primary"
          @click="
            imageDialog.visible = false;
            handleSetHMash(null);
          "
          >关闭</el-button
        >
      </div>
    </Dialog>
  </div>
</template>

<script>
import { MyMap, MAP_EVENT, MAP_ZOOM_RANGE, MAP_LAYER_STYLE, DEFAULT_MAP_LAYER_STYLE, MapLayer } from "@/mymap/index.js";
import { WGS84ToMercator } from "@/mymap/utils/LngLatUtils";

import { FrameSelectLayer, FRAME_SELECT_STATE_KEY, FRAME_SELECT_EVENT } from "./layer/FrameSelectLayer";
import { PolygonSelectLayer, POLYGON_SELECT_STATE_KEY, POLYGON_SELECT_EVENT } from "./layer/PolygonSelectLayer";
import { PointSelectLayer, POINT_SELECT_STATE_KEY, POINT_SELECT_EVENT } from "./layer/PointSelectLayer";
import { NetworkLayer } from "./layer/NetworkLayer";
import { LinkStatsLayer } from "./layer/LinkStatsLayer";
import { LinkLayer, COLOR_LIST as LinkColorList } from "./layer/LinkLayer";
import { GuangZhouLayer } from "./layer/GuangZhouLayer";
import { IntersectionListLayer, COLOR_LIST as IntersectionColorList } from "./layer/IntersectionListLayer";
import { ImageListLayer } from "./layer/ImageListLayer";

import LinkFlow from "./components/LinkFlow.vue";
import LinkFlowQuery from "./components/LinkFlowQuery.vue";
import LinkPolygonSelect from "./components/LinkPolygonSelect.vue";
import RouteSelect from "./components/RouteSelect.vue";
import LinkSelect from "./components/LinkSelect.vue";
import CenterInput from "./components/CenterInput.vue";
import HelpDialog from "./components/HelpDialog/index.vue";
import VideoInputCrossroads from "./components/VideoInputCrossroads.vue";
import ManuallyEnteringCrossroads from "./components/ManuallyEnteringCrossroads.vue";
import DrawLine from "./components/DrawLine.vue";
import CrossroadsInstall from "./components/CrossroadsInstall.vue";
import CrossroadsDetail from "./components/CrossroadsDetail.vue";
import CrossroadsStatsEdit from "./components/CrossroadsStatsEdit.vue";
import CrossroadsList from "./components/CrossroadsList.vue";
import AddIntersection from "./components/AddIntersection.vue";
import UploadImageZip from "./components/UploadImageZip.vue";
import ImageListDialog from "./components/ImageListDialog.vue";

import { getGeomjson, queryAllMaker, getMatsimLink, intersectionList, mappictureAllMaker, mappictureDelete } from "@/api/index";

export const SHOW_LINK_ZOOM = 14;

export default {
  provide() {
    return {
      rootVue: this,
    };
  },
  data() {
    return {
      POLYGON_SELECT_STATE_KEY,
      POLYGON_SELECT_EVENT,
      SHOW_LINK_ZOOM,
      MAP_ZOOM_RANGE,
      FRAME_SELECT_STATE_KEY,
      POINT_SELECT_STATE_KEY,

      activeNames: ["1", "2", "3", "4"],
      // activeNames: ["4"],
      activeNames2: ["2-1", "2-2"],

      selectRouteId: null,
      selectLinkId: null,

      ruleForm: {
        zoom: 13,
        wayWidth: 5,
        twoWayOffset: 10,
        timeList: [],
        type: null,
        routeName: null,
        center: WGS84ToMercator(113.459868, 23.171394),
        routeId: null,
        linkId: null,
      },

      linkFlow: {
        visible: false,
        linkId: null,
      },
      linkFlowQuery: {
        visible: false,
        linkId: null,
      },
      frameLink: {
        visible: false,
        xyarr: null,
      },
      linkPolygonSelect: {
        visible: false,
        xyarr: null,
        state: POLYGON_SELECT_STATE_KEY.NOT_STARTED,
      },
      frameCrossroads: {
        visible: false,
        xyarr: null,
      },
      videoInputCrossroads: {
        visible: false,
        params: {},
      },
      manuallyEnteringCrossroads: {
        visible: false,
        params: {},
      },
      drawLine: {
        visible: false,
        params: {},
      },
      crossroadsInstall: {
        visible: false,
        state: POINT_SELECT_STATE_KEY.DISABLE,
      },
      crossroadsStatsEdit: {
        visible: false,
        params: {},
      },
      crossroadsDetail: {
        visible: false,
        params: {},
      },
      crossroadsList: {
        visible: false,
        params: {},
      },
      addIntersection: {
        visible: false,
        params: {},
      },

      imageDialog: {
        visible: false,
        data: null,
      },

      imageListDialog: {
        visible: false,
      },

      typeOptions: {
        0: "其他",
        1: "人工",
        2: "视频识别",
        3: "互联网路况估算",
      },
      typeColorOptions: JSON.parse(JSON.stringify(LinkColorList)),

      intersectionOptions: {
        0: "其他",
        1: "其他",
        2: "其他",
        3: "其他",
        4: "其他",
        5: "其他",
      },
      videoTypeOptions: {
        0: "未知",
        1: "俯视航拍",
        1: "侧面路拍",
        1: "正斜角拍摄",
      },
      videoStateOptions: {
        0: "等待划线",
        1: "等待运行",
        2: "正在运行",
        3: "运行成功",
        4: "运行失败",
        5: "等待录入",
        6: "录入成功",
      },
      intersectionStateOptions: {
        1: "有数据",
        0: "无数据",
      },
      intersectionStateColorOptions: JSON.parse(JSON.stringify(IntersectionColorList)),

      showStyleMenu: false,
      styleList: [],
      styleActive: 0,
      intersectionListData: [],
      imageListColor: "#ffa500",
      imageListHColor: "#67C23A",
      activeNames1: [],
      activeNames2: [],
      activeNames3: [],

      showLinkStatsLayer: false,
      showIntersectionListLayer: false,
      showImageListLayer: false,
    };
  },
  components: {
    LinkFlow,
    LinkFlowQuery,
    LinkPolygonSelect,
    HelpDialog,
    RouteSelect,
    LinkSelect,
    CenterInput,
    VideoInputCrossroads,
    DrawLine,
    CrossroadsInstall,
    CrossroadsDetail,
    CrossroadsStatsEdit,
    ManuallyEnteringCrossroads,
    CrossroadsList,
    AddIntersection,
    UploadImageZip,
    ImageListDialog,
  },
  computed: {
    showSetting() {
      return (
        !this.addIntersection.visible &&
        !this.crossroadsList.visible &&
        !this.videoInputCrossroads.visible &&
        !this.manuallyEnteringCrossroads.visible &&
        !this.drawLine.visible &&
        !this.crossroadsStatsEdit.visible &&
        !this.crossroadsInstall.visible &&
        !this.crossroadsDetail.visible &&
        !this.imageDialog.visible &&
        !this.imageListDialog.visible &&
        !this.linkFlow.visible &&
        !this.linkPolygonSelect.visible &&
        !this.linkFlowQuery.visible
      );
    },
    showCrossroadsList() {
      return this.crossroadsList.visible && !this.videoInputCrossroads.visible && !this.manuallyEnteringCrossroads.visible && !this.drawLine.visible && !this.crossroadsStatsEdit.visible && !this.crossroadsDetail.visible;
    },
  },
  watch: {
    showLinkStatsLayer(val) {
      if (val) {
        this._Map.addLayer(this._LinkStatsLayer);
      } else {
        this._Map.removeLayer(this._LinkStatsLayer);
      }
    },
    showIntersectionListLayer(val) {
      if (val) {
        this._Map.addLayer(this._IntersectionListLayer);
      } else {
        this._Map.removeLayer(this._IntersectionListLayer);
      }
    },
    showImageListLayer(val) {
      if (val) {
        this._Map.addLayer(this._ImageListLayer);
      } else {
        this._Map.removeLayer(this._ImageListLayer);
      }
    },
    typeColorOptions: {
      handler(val) {
        if (this._LinkStatsLayer) {
          this._LinkStatsLayer.setColors(val);
        }
        if (this._LinkLayer) {
          this._LinkLayer.setColors(val);
        }
      },
      deep: true,
    },
    intersectionStateColorOptions: {
      handler(val) {
        if (this._IntersectionListLayer) {
          this._IntersectionListLayer.setColors(val);
        }
      },
      deep: true,
    },
    imageListColor: {
      handler(val) {
        if (this._ImageListLayer) {
          this._ImageListLayer.setColor(val);
        }
      },
      deep: true,
    },
    imageListHColor: {
      handler(val) {
        if (this._ImageListLayer) {
          this._ImageListLayer.setHColor(val);
        }
      },
      deep: true,
    },
    "linkPolygonSelect.visible": {
      handler(val) {
        if (val) {
          this._Map.addLayer(this._PolygonSelectLayer);
        } else {
          this._Map.removeLayer(this._PolygonSelectLayer);
        }
      },
    },
  },
  created() {
    this.initLayer();
  },
  async mounted() {
    this.initMap();
    this.handleLoadNetwork();
    this.handleLoadMaker();
    this.handleLoadIntersectionList();
    this.handleLoadImageList();

    import("@/assets/json/guangzhou2.json").then((res) => {
      this._GuangZhouLayer.setData(res.default);
    });
    import("@/assets/json/huangpu2.json").then((res) => {
      this._HuangPuLayer.setData(res.default);
    });
  },
  methods: {
    // ****************************** 地图及图层初始化 -- start
    initLayer() {
      this._MapLayer = new MapLayer({ tileClass: DEFAULT_MAP_LAYER_STYLE, zIndex: 0 });
      {
        const styleMap = MAP_LAYER_STYLE;
        const itemDocList = [];
        const list = Object.values(styleMap);
        for (let i = 0, l = list.length; i < l; i++) {
          const value = list[i];
          if (value === this._MapLayer.tileClass) this.styleActive = i;
          const item = {
            title: value.style_name,
            url: new value(15, 26700, 14218, 200).getUrl(),
            c: value,
          };
          itemDocList.push(item);
        }
        this.styleList = itemDocList;
      }
      this._NetworkLayer = new NetworkLayer({
        zIndex: 10,
        lineWidth: this.ruleForm.wayWidth,
        event: {
          [MAP_EVENT.HANDLE_PICK_LEFT]: (res) => {
            this.linkFlow = {
              visible: false,
              linkId: null,
            };
            this.selectRouteId = res.data.id;
            this.getLink();
          },
        },
      });
      this._LinkLayer = new LinkLayer({
        zIndex: 30,
        colors: this.typeColorOptions,
        lineWidth: this.ruleForm.wayWidth,
        twoWayOffset: this.ruleForm.twoWayOffset,
        event: {
          [MAP_EVENT.HANDLE_PICK_LEFT]: (res) => {
            this.handleChangeLink(res.data);
          },
        },
      });
      this._LinkStatsLayer = new LinkStatsLayer({
        zIndex: 100,
        colors: this.typeColorOptions,
        event: {
          [MAP_EVENT.HANDLE_PICK_LEFT]: (res) => {
            this.handleMoveToLink({
              value: res.data.linkId,
              item: {
                origid: res.data.wayId,
              },
            });
          },
        },
      });
      this._IntersectionListLayer = new IntersectionListLayer({
        zIndex: 110,
        colors: this.intersectionStateColorOptions,
        event: {
          [MAP_EVENT.HANDLE_PICK_LEFT]: (res) => {
            this.handleSubmitAddIntersection(res.data);
          },
        },
      });
      this._ImageListLayer = new ImageListLayer({
        zIndex: 110,
        color: this.imageListColor,
        hColor: this.imageListHColor,
        event: {
          [MAP_EVENT.HANDLE_PICK_LEFT]: (res) => {
            this.handleShowImageDialog(res.data);
          },
        },
      });

      this._PolygonSelectLayer = new PolygonSelectLayer({
        zIndex: 200,
        event: {
          [POLYGON_SELECT_EVENT.STATE_CHANGE]: (res) => {
            this.linkPolygonSelect.state = res.data.state;
            if (this.linkPolygonSelect.state === POLYGON_SELECT_STATE_KEY.ENDED) {
              const path = res.data.path;
              path[path.length] = [...path[0]];
              this.handleStopPolygonSelect();
              this.linkPolygonSelect.xyarr = path;
            }
          },
        },
      });
      this._PointSelectLayer = new PointSelectLayer({
        zIndex: 120,
        color: "#ff0000",
        event: {
          [POINT_SELECT_EVENT.POINT_CHANGE]: (res) => {
            this.crossroadsInstall.visible = false;
            this.showAddIntersection(res.data.point);
          },
          [POINT_SELECT_EVENT.STATE_CHANGE]: (res) => {
            this.crossroadsInstall.state = res.data.state;
          },
        },
      });
      this._GuangZhouLayer = new GuangZhouLayer({
        zIndex: 10,
        color: "blue",
      });
      this._HuangPuLayer = new GuangZhouLayer({
        zIndex: 10,
        color: "red",
      });
    },
    initMap() {
      this._Map = new MyMap({
        rootId: "mapRoot",
        zoom: this.ruleForm.zoom,
        center: this.ruleForm.center,
        event: {
          [MAP_EVENT.UPDATE_ZOOM]: (res) => {
            this.ruleForm.zoom = Number(Number(this._Map.zoom).toFixed(2));
            if (this.ruleForm.zoom > SHOW_LINK_ZOOM) {
              this._Map.addLayer(this._NetworkLayer);
              this._Map.addLayer(this._LinkLayer);
            } else {
              this._Map.removeLayer(this._NetworkLayer);
              this._Map.removeLayer(this._LinkLayer);
            }
          },
          [MAP_EVENT.UPDATE_CENTER]: (res) => {
            this.ruleForm.center = this._Map.center;
          },
        },
      });
      this._Map.addLayer(this._MapLayer);
      if (this.ruleForm.zoom > SHOW_LINK_ZOOM) {
        this._Map.addLayer(this._NetworkLayer);
        this._Map.addLayer(this._LinkLayer);
      } else {
        this._Map.removeLayer(this._NetworkLayer);
        this._Map.removeLayer(this._LinkLayer);
      }
      if (this.showLinkStatsLayer) this._Map.addLayer(this._LinkStatsLayer);
      if (this.showIntersectionListLayer) this._Map.addLayer(this._IntersectionListLayer);
      if (this.showImageListLayer) this._Map.addLayer(this._ImageListLayer);
      if (this.linkPolygonSelect.visible) this._Map.addLayer(this._PolygonSelectLayer);
      this._Map.addLayer(this._PointSelectLayer);
      this._Map.addLayer(this._GuangZhouLayer);
      this._Map.addLayer(this._HuangPuLayer);
    },
    // ****************************** 地图及图层初始化 -- end
    // ****************************** 加载基础数据 -- start
    handleLoadNetwork() {
      getGeomjson({
        selectAll: true,
      }).then((res) => {
        this._NetworkData = res.data;
        this._NetworkLayer.setData(res.data);
        this.$emit("loadNetwork");
      });
    },
    handleLoadMaker() {
      let timeList = this.ruleForm.timeList || [];
      let params = {
        beginTime: timeList[0] || "",
        endTime: timeList[1] || "",
        type: this.ruleForm.type || "",
      };
      queryAllMaker(params).then((res) => {
        this._LinkStatsLayer.setData(res.data);
      });
    },
    handleLoadIntersectionList() {
      let params = {
        pageSize: 999999999,
        pageNum: 1,
      };
      intersectionList(params).then((res) => {
        this.intersectionListData = res.data.data;
        this._IntersectionListLayer.setData(res.data.data);
      });
    },
    handleLoadImageList() {
      mappictureAllMaker().then((res) => {
        this._ImageListLayer.setData(res.data);
      });
    },
    // ****************************** 加载基础数据 -- start
    // ****************************** 路段流量录入 -- start
    handleChangeLink(data) {
      this.linkFlow = {
        visible: true,
        linkId: data.id,
      };

      const { clientWidth, clientHeight } = this._Map.rootDoc;
      const [x1, y1] = this._Map.WindowXYToWebMercator(clientWidth / 3, clientHeight / 2);
      const [x2, y2] = this._Map.center;

      let center = [(data.fromxy[0] + data.toxy[0]) / 2 - (x2 - x1), (data.fromxy[1] + data.toxy[1]) / 2];
      this._Map.setCenter(center);
      this._LinkLayer.setSelectId(data.id);
    },
    linkFlowUpdateData() {
      this.handleLoadMaker();
      if (this.selectRouteId) {
        getMatsimLink(this.selectRouteId).then((res) => {
          this._LinkLayer.setData(res.data, this._LinkLayer.selectId);
        });
      }
    },
    linkFlowClose() {
      if (this.selectRouteId) {
        getMatsimLink(this.selectRouteId).then((res) => {
          this._LinkLayer.setData(res.data);
        });
      }
    },
    getLink() {
      if (this.selectRouteId) {
        getMatsimLink(this.selectRouteId).then((res) => {
          this._LinkLayer.setData(res.data);
        });
      }
    },
    // ****************************** 路段流量录入 -- end
    // ****************************** 地图及图层样式更新 -- start
    handleChangeStyle(i) {
      this.showStyleMenu = false;
      this.styleActive = i;
      this._MapLayer.setTileClass(this.styleList[i].c);
    },
    handleChangeZoomLavel() {
      this._Map.setZoom(this.ruleForm.zoom);
    },
    handleChangeTwoWayOffset(value) {
      if (this._NetworkLayer) {
        this._NetworkLayer.setValues({ twoWayOffset: value });
      }
      if (this._LinkLayer) {
        this._LinkLayer.setValues({ twoWayOffset: value });
      }
    },
    handleChangeWayWidth(value) {
      if (this._NetworkLayer) {
        this._NetworkLayer.setValues({ lineWidth: value });
      }
      if (this._LinkLayer) {
        this._LinkLayer.setValues({ lineWidth: value });
      }
    },
    // ****************************** 图层样式更新 -- start
    // ******************************* 选择交叉口大概位置 -- start
    handlePlayPointSelect() {
      this._PointSelectLayer.state = POINT_SELECT_STATE_KEY.ENABLE;
    },
    handleStopPointSelect() {
      this._PointSelectLayer.state = POINT_SELECT_STATE_KEY.DISABLE;
      this._PointSelectLayer.point = [0, 0];
    },
    showAddIntersection(center) {
      if (this._PointSelectLayer) this._PointSelectLayer.point = center;
      this.addIntersection.visible = true;
    },
    handleSubmitAddIntersection(res) {
      this.crossroadsInstall.visible = false;
      this.handleLoadIntersectionList();
      this.addIntersection.visible = false;
      this.crossroadsList.params = res || {};
      this.crossroadsList.visible = true;
      this.handleStopPointSelect();
    },
    // ******************************* 选择交叉口大概位置 -- start
    // ******************************* 交叉口列表 -- start
    handleShowCrossroadsDetail(row) {
      this.crossroadsDetail.params = row;
      this.crossroadsDetail.visible = true;
    },
    handleShowCrossroadsStatsEdit(row) {
      this.crossroadsStatsEdit.params = row;
      this.crossroadsStatsEdit.visible = true;
    },
    // ******************************* 交叉口列表 -- end
    // ******************************* 视频录入交叉口 -- start
    handleShowVideoInputCrossroads(res) {
      this.videoInputCrossroads.params = res;
      this.videoInputCrossroads.visible = true;
    },
    handleSubmitVideoInputCrossroads(form) {
      this.videoInputCrossroads.visible = false;
      this.handleShowDrawLine(form);
    },
    // ******************************* 视频录入交叉口 -- end

    // ******************************* 人工录入交叉口 -- start
    handleShowManuallyEnteringCrossroads(res) {
      this.manuallyEnteringCrossroads.params = res;
      this.manuallyEnteringCrossroads.visible = true;
    },
    handleSubmitManuallyEnteringCrossroads(form) {
      this.manuallyEnteringCrossroads.visible = false;
      this.handleShowDrawLine(form);
    },
    // ******************************* 人工录入交叉口 -- end
    // ******************************* 绘制检测线 -- start

    handleShowDrawLine(form) {
      this.drawLine.params = form;
      this.drawLine.visible = true;
    },
    handleDrawLineSuccess() {
      this.drawLine.visible = false;
      this.handleStopPointSelect();
      this.handleShowCrossroadsStatsEdit(this.drawLine.params);
    },
    handleShowCrossroadsStatsEdit(form) {
      this.crossroadsStatsEdit.params = form;
      this.crossroadsStatsEdit.visible = true;
    },
    handleRedraw() {
      this.crossroadsStatsEdit.visible = false;
      this.handleShowDrawLine(this.crossroadsStatsEdit.params);
    },
    // ******************************* 绘制检测线 -- end
    // ******************************* 定位 -- start
    handleMoveToRoute({ value }) {
      this.selectRouteId = value;
      getMatsimLink(this.selectRouteId).then((res) => {
        // 计算地图合适的中心点和zoom
        let { zoom, center } = this._Map.getFitZoomAndCenter(res.data[0].map((v) => v.fromxy));
        this._Map.setCenter(center);
        this._Map.setZoom(zoom);

        this._LinkLayer.setData(res.data);
      });
    },
    handleMoveToCenter() {
      this._Map.setCenter(this.ruleForm.center);
    },
    handleMoveToLink({ value, item }) {
      this.selectRouteId = item.origid;
      this.selectLinkId = value;
      getMatsimLink(this.selectRouteId).then((res) => {
        // 计算地图合适的中心点和zoom
        let { zoom, center } = this._Map.getFitZoomAndCenter(res.data[0].map((v) => v.fromxy));
        this._Map.setCenter(center);
        this._Map.setZoom(zoom);
        this._LinkLayer.setData(res.data);

        for (const route of res.data) {
          for (const link of route) {
            if (link.id == value) {
              setTimeout(() => {
                this.handleChangeLink(link);
              }, 500);
              return;
            }
          }
        }
      });
    },
    // ******************************* 定位 -- end
    // ******************************* 图片 -- start
    handleDeleteImage(row) {
      this.$confirm(`是否确认删除当前图片?`, "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return mappictureDelete(row.id);
        })
        .then(() => {
          this.imageDialog = {
            visible: false,
            data: null,
          };
          this.handleSetHMash(null);
          this.handleLoadImageList();
          this.$message.success("删除成功");
        })
        .catch(() => {});
    },
    handleShowImageDialog(row) {
      this.imageDialog = {
        visible: true,
        data: row,
      };
      this.handleSetHMash(row);
    },
    handleSetHMash(row) {
      this._ImageListLayer.setHMesh(row);
    },
    // ******************************* 图片 -- end

    // ****************************** 数据筛选 -- 区域框选 -- start
    handlePlayPolygonSelect() {
      if (this._PolygonSelectLayer) {
        this._PolygonSelectLayer.reset();
        this._PolygonSelectLayer.play();
        this.linkPolygonSelect.state = this._PolygonSelectLayer.state;
      }
    },
    handleReplayPolygonSelect() {
      if (this._PolygonSelectLayer) {
        this._PolygonSelectLayer.reset();
        this._PolygonSelectLayer.play();
        this.linkPolygonSelect.state = this._PolygonSelectLayer.state;
      }
    },
    handleStopPolygonSelect() {
      if (this._PolygonSelectLayer) {
        // this._PolygonSelectLayer.reset();
        this._PolygonSelectLayer.stop();
        this.linkPolygonSelect.state = this._PolygonSelectLayer.state;
        this.$emit("update:lock2D", false);
      }
    },
    // ****************************** 数据筛选 -- 区域框选 -- end
  },
};
</script>

<style lang="scss" scoped>
.root {
  width: 100vw;
  height: 100vh;
  user-select: none;
  #mapRoot {
    top: 0;
    left: 0;
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 10;
    overflow: hidden;

    .MapLayer_menu {
      position: absolute;
      z-index: 10000;
      bottom: 20px;
      right: 20px;
      height: 50px;
      width: 330px;
      display: flex;
      align-items: center;
      overflow: hidden;
      background: #00000038;
      transition: width 0.3s;
      border-radius: 5px;
      box-shadow: 0 0px 15px rgba(255, 255, 255, 0.8);

      &.hide {
        width: 20px !important;
        .open_hide_btn {
          transform: rotate(0);
        }
      }
      .open_hide_btn {
        position: relative;
        cursor: pointer;
        display: block;
        height: 100%;
        width: 20px;
        flex-shrink: 0;
        color: #fff;
        font-weight: bold;
        transition: transform 0.3s;
        transform: rotate(180deg);
        &::before,
        &::after {
          position: absolute;
          top: 50%;
          left: 50%;
          content: "";
          display: block;
          border-left: 2px solid #fff;
          border-bottom: 2px solid #fff;
          width: 8px;
          height: 8px;
          transform: translate(0, -50%) rotate(45deg);
        }
        &::before {
          left: 5px;
        }
        &::after {
          left: 10px;
        }
      }
      .item {
        box-sizing: border-box;
        cursor: pointer;
        display: block;
        height: 40px;
        width: 40px;
        margin-left: 10px;
        border-radius: 5px;
        border: 2px solid transparent;
        &.active {
          border-color: #409eff;
        }
      }
    }
  }
  .HelpDialog {
    bottom: 20px;
    left: 20px;
    position: absolute;
    z-index: 20;
  }
}

.setting_box {
  font-size: 14px;
  max-height: calc(100vh - 170px);
  overflow-y: scroll;
  &::-webkit-scrollbar {
    display: none;
  }
  .setting_form {
    padding: 0 20px;
  }
}
</style>
