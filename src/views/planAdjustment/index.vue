<template>
  <div class="index">
    <div class="grid_root">
      <div class="Drawer_row">
        <div></div>
        <div class="mapBox">
          <div id="mapRoot"></div>
        </div>
        <Drawer :show.sync="bMapBoxObj.open" direction="right" :size="bMapBoxObj.width">
          <BMapBox ref="bmapBox" :busName="bMapBoxObj.busName" :center="bMapBoxObj.center" :zoom="bMapBoxObj.zoom" @centerAndZoom="handleCenterAndZoom"></BMapBox>
        </Drawer>
      </div>
    </div>
    <Dialog :visible="openSetting" width="350px" hideClose hideMinimize>
      <div class="setting_box">
        <el-form ref="tlForm" size="small">
          <el-form-item :label="$l('路线名称')">
            <RouteSelect ref="routeSelect" v-model="tlForm.id" :label.sync="tlForm.name" @change="handleGetRouteDetail" />
          </el-form-item>
          <el-form-item v-if="tlForm.obj" :label="$l('有无上下行')">
            <el-switch v-model="tlForm.obj.down.discard" :active-value="false" :inactive-value="true" />
          </el-form-item>
        </el-form>
        <template v-if="tlForm.obj">
          <el-form v-if="!tlForm.obj.up.discard" ref="upForm" size="small">
            <el-form-item :label="$l('上行名称')">
              <el-input style="width: 200px" v-model="tlForm.obj.up.routeId"></el-input>
            </el-form-item>
            <el-form-item :label="$l('上行路线站点编辑')">
              <el-button type="primary" @click="handleOpenStopsEdit('up')">{{ $l("点击打开站点编辑") }}</el-button>
            </el-form-item>
            <el-form-item :label="$l('上行路线路径编辑')">
              <el-button type="primary" @click="handleOpenStopsRoutesEdit('up')">{{ $l("点击打开路径编辑") }}</el-button>
            </el-form-item>
            <el-form-item :label="$l('上行路线发车编辑')">
              <el-button type="primary" @click="handleOpenStartEdit('up')">{{ $l("点击编辑发车信息") }}</el-button>
            </el-form-item>
          </el-form>
          <el-form v-if="!tlForm.obj.down.discard" ref="downForm" size="small">
            <el-form-item label-width="0">
              <el-button style="width: 100%" type="warning" @click="handleCreateDownByUp">{{ $l("按上行路线反正生成下行路线") }}</el-button>
            </el-form-item>
            <el-form-item :label="$l('下行名称')">
              <el-input style="width: 200px" v-model="tlForm.obj.down.routeId"></el-input>
            </el-form-item>
            <el-form-item :label="$l('下行路线站点编辑')">
              <el-button type="primary" @click="handleOpenStopsEdit('down')">{{ $l("点击打开站点编辑") }}</el-button>
            </el-form-item>
            <el-form-item :label="$l('下行路线路径编辑')">
              <el-button type="primary" @click="handleOpenStopsRoutesEdit('down')">{{ $l("点击打开路径编辑") }}</el-button>
            </el-form-item>
            <el-form-item :label="$l('下行路线发车编辑')">
              <el-button type="primary" @click="handleOpenStartEdit('down')">{{ $l("点击编辑发车信息") }}</el-button>
            </el-form-item>
          </el-form>
          <div class="footer">
            <el-button type="primary" size="small" @click="handleDelete" :loading="deleteLoading">{{ $l("删除") }}</el-button>
            <el-button type="primary" size="small" @click="handleSave" :loading="saveLoading">{{ $l("保存") }}</el-button>
            <el-button type="primary" size="small" @click="handleCancel">{{ $l("取消") }}</el-button>
          </div>
        </template>
        <!-- <el-divider></el-divider>
        <div class="footer">
          <el-button type="primary" size="mini" @click="handleCreateDataSource()">{{ $l("新建方案") }}</el-button>
          <el-button type="primary" size="mini" @click="handleSaveDataSource()">{{ $l("保存方案") }}</el-button>
        </div> -->
      </div>
    </Dialog>

    <StopsEdit v-if="stopsEditObj.open" :left="stopsEditObj.left" :width="stopsEditObj.width" @close="handleCloseStopsEdit" @change="handleChangeStopsEdit" :transitRouteJSON="stopsEditObj.transitRouteJSON" />

    <Dialog width="450px" :title="stopsRoutesEditObj.title" :visible.sync="stopsRoutesEditObj.open" @close="handleCloseStopsRoutesEdit">
      <StopsRoutesEdit v-if="stopsRoutesEditObj.open" :transitRouteJSON="stopsRoutesEditObj.transitRouteJSON" @toEditStops="handleToEditStops" @change="handleChangeStopsRoutesEdit" />
    </Dialog>

    <Dialog :title="startEditObj.title" :width="startEditObj.width" :left="startEditObj.left" :visible.sync="startEditObj.open" @close="handleCloseStartEdit">
      <StartEdit v-if="startEditObj.open" :transitRouteJSON="startEditObj.transitRouteJSON" @change="handleChangeStartEdit" />
    </Dialog>

    <div class="HelpBtnList">
      <div class="_flex">
        <div class="el-icon-question" @click="showHelpDialog = true"></div>
        <a class="bug" href="https://doc.weixin.qq.com/sheet/e3_AdQA8Aa_ADMt1qh97LkSHer6ALqI2?scode=APwA6gfEAA0aeGdABPAdQA8Aa_ADM&tab=f2oofj" target="_blank">BUG</a>
        <el-dropdown class="language" @command="changeLanguage" placement="top-start" trigger="click">
          <img src="@/assets/image/locale.svg" style="width: 100%; height: 100%" />
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="zh-CN" :disabled="page_language == 'zh-CN'">中文（简体）</el-dropdown-item>
            <!-- <el-dropdown-item command="zh_MO" :disabled="page_language == 'zh-MO'">中文（繁體）</el-dropdown-item> -->
            <el-dropdown-item command="en-US" :disabled="page_language == 'en-US'">English</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
    <HelpDialog :visible.sync="showHelpDialog" />
  </div>
</template>

<language>
{
  "路线名称": {
    "zh-CN":"路线名称",
    "en-US":"Route name"
  },
  "有无上下行": {
    "zh-CN":"有无上下行",
    "en-US":"With or without up and down"
  },
  "上行名称": {
    "zh-CN":"上行名称",
    "en-US":"Uplink name"
  },
  "上行路线站点编辑": {
    "zh-CN":"上行路线站点编辑",
    "en-US":"Upper Route Stations Edit"
  },
  "点击打开站点编辑": {
    "zh-CN":"点击打开站点编辑",
    "en-US":"Click to open the site editor"
  },
  "上行路线路径编辑": {
    "zh-CN":"上行路线路径编辑",
    "en-US":"Uplink Route Path Editor"
  },
  "点击打开路径编辑": {
    "zh-CN":"点击打开路径编辑",
    "en-US":"Click to open the path editor"
  },
  "上行路线发车编辑": {
    "zh-CN":"上行路线发车编辑",
    "en-US":"Upward Route Departure Edit"
  },
  "点击编辑发车信息": {
    "zh-CN":"点击编辑发车信息",
    "en-US":"Click to edit departure information"
  },
  "按上行路线反正生成下行路线": {
    "zh-CN":"按上行路线反正生成下行路线",
    "en-US":"Generate downward routes by upward routes anyway"
  },
  "下行名称": {
    "zh-CN":"下行名称",
    "en-US":"Downstream name"
  },
  "下行路线站点编辑": {
    "zh-CN":"下行路线站点编辑",
    "en-US":"Down-Route Stations Edit"
  },
  "点击打开站点编辑": {
    "zh-CN":"点击打开站点编辑",
    "en-US":"Click to open the site editor"
  },
  "下行路线路径编辑": {
    "zh-CN":"下行路线路径编辑",
    "en-US":"Down-Route Path Editor"
  },
  "点击打开路径编辑": {
    "zh-CN":"点击打开路径编辑",
    "en-US":"Click to open the path editor"
  },
  "下行路线发车编辑": {
    "zh-CN":"下行路线发车编辑",
    "en-US":"Down-Route Departure Edit"
  },
  "点击编辑发车信息": {
    "zh-CN":"点击编辑发车信息",
    "en-US":"Click to edit departure information"
  },
  "删除": {
    "zh-CN":"删除",
    "en-US":"delete"
  },
  "保存": {
    "zh-CN":"保存",
    "en-US":"save"
  },
  "取消": {
    "zh-CN":"取消",
    "en-US":"cancel"
  },
  "新建方案": {
    "zh-CN":"新建方案",
    "en-US":"New scheme"
  },
  "保存方案": {
    "zh-CN":"保存方案",
    "en-US":"Save scheme"
  },
  "站点编辑": {
    "zh-CN":"站点编辑",
    "en-US":"Stop edit"
  },
  "路径编辑": {
    "zh-CN":"路径编辑",
    "en-US":"Path edit"
  },
  "发车信息编辑": {
    "zh-CN":"发车信息编辑",
    "en-US":"Departure Info Edit"
  },
  "保存成功": {
    "zh-CN":"保存成功",
    "en-US":"Save Success"
  },
  "确认删除？": {
    "zh-CN":"确认删除？",
    "en-US":"Confirm delete？"
  },
  "提示": {
    "zh-CN":"提示",
    "en-US":"Tips"
  },
  "反转：": {
    "zh-CN":"反转：",
    "en-US":"reverse："
  },
  "请输入方案名称": {
    "zh-CN":"请输入方案名称",
    "en-US":"Please enter the name of the program"
  },
  "提示": {
    "zh-CN":"提示",
    "en-US":"Tips"
  },
  "确定": {
    "zh-CN":"确定",
    "en-US":"confirm"
  },
  "取消": {
    "zh-CN":"取消",
    "en-US":"cancel"
  },
  "方案名称只能使用英文字母，数字和下划线": {
    "zh-CN":"方案名称只能使用英文字母，数字和下划线",
    "en-US":"Only letters, numbers and underscores may be used in program names"
  },
  "方案名称不能以base结尾": {
    "zh-CN":"方案名称不能以base结尾",
    "en-US":"Program names cannot end in base"
  },
  "方案创建成功": {
    "zh-CN":"方案创建成功",
    "en-US":"Program creation success"
  },
  "方案保存成功": {
    "zh-CN":"方案保存成功",
    "en-US":"Program saving success"
  },
}
</language>

<script>
import "@/mymap/style.css";

import { Map, MAP_EVENT, LocalMapLayer, MAP_LAYER_STYLE, LocalMapTile } from "@/mymap/index.js";

import { getByLineId, saveByLine, deleteTransitLine } from "@/api/index";

import BMapBox from "./component/BMapBox.vue";
import RouteSelect from "./component/RouteSelect.vue";
import StopsEdit from "./component/StopsEdit.vue";
import StopsRoutesEdit from "./component/StopsRoutesEdit.vue";
import StartEdit from "./component/StartEdit.vue";
import HelpDialog from "./component/HelpDialog/index.vue";

import { BusLinkLayer } from "./layer/BusLinkLayer";
import { BusStopLayer } from "./layer/BusStopLayer";
import { StopsLayer } from "./layer/StopsLayer";
import { NetworkLayer } from "./layer/NetworkLayer";
import { NetworkLayer2 } from "./layer/NetworkLayer2";
import { NetworkLineLayer } from "./layer/NetworkLineLayer";
import { BusRouteLinkLayer } from "./layer/BusRouteLinkLayer";

import * as Bean from "@/utils/Bean";

export default {
  components: {
    BMapBox,
    RouteSelect,
    StopsEdit,
    StopsEdit,
    StopsRoutesEdit,
    StartEdit,
    HelpDialog,
  },
  data() {
    return {
      database: "",
      datasource: "",

      showHelpDialog: false,

      saveLoading: false,
      deleteLoading: false,
      _map: null,
      _LocalMapLayer: null,
      _UpBusLinkLayer: null,
      _UpBusBusStopLayerLayer: null,
      _DownBusLinkLayer: null,
      _DownBusBusStopLayerLayer: null,

      _EditBusLinkLayer: null,
      _EditBusStopLayer: null,

      _NetworkLayer: null,
      _NetworkLayer2: null,
      _NetworkLineLayer: null,
      _StopsLayer: null,

      lineOffset: 0,
      tlForm: {
        id: null,
        name: null,
        obj: null,
      },

      openSetting: true,

      bMapBoxObj: {
        width: 400,
        open: false,
        busName: "",
        zoom: 16,
        center: [12604071, 2640970],
      },
      stopsEditObj: {
        title: "站点编辑",
        open: false,
        routeType: "up",
        right: 20,
        transitRouteJSON: undefined,
      },
      stopsRoutesEditObj: {
        title: "路径编辑",
        open: false,
        routeType: "up",
        transitRouteJSON: undefined,
      },
      startEditObj: {
        title: "发车信息编辑",
        open: false,
        routeType: "up",
        transitRouteJSON: undefined,
      },
    };
  },
  watch: {
    tlForm: {
      handler(val) {
        if (val) {
          sessionStorage.setItem(this.datasource + "_tlForm", JSON.stringify(val));
        }
      },
      deep: true,
    },
  },
  provide() {
    return {
      rootVue: this,
    };
  },
  created() {
    const { database, datasource } = this.$route.params;
    this.database = database;
    this.datasource = datasource;
    this.$store.dispatch("setDataBase", database);
    this.$store.dispatch("setDataSource", database + "/" + datasource);
  },
  async mounted() {
    this.initLayer();
    this.initMap();
    this.resetLayer();
    this.revertData();
  },
  beforeDestroy() {
    this._map.dispose();
  },
  methods: {
    changeLanguage(lan) {
      this.$setLanguage(lan);
    },
    // 初始化地图
    initMap() {
      this._map = new Map({
        rootId: "mapRoot",
        center: this.bMapBoxObj.center,
        zoom: this.bMapBoxObj.zoom,
        event: {
          [MAP_EVENT.UPDATE_CAMERA_HEIGHT]: (res) => {
            this.bMapBoxObj.zoom = res.target.zoom;
          },
          [MAP_EVENT.UPDATE_CAMERA_POSITION]: (res) => {
            this.bMapBoxObj.center = res.data.webMercator;
          },
        },
      });

      this._map.addLayer(this._LocalMapLayer);
      this._map.addLayer(this._StopsLayer);
      // this._map.addLayer(this._NetworkLayer);
      this._map.addLayer(this._NetworkLayer2);
      this._map.addLayer(this._NetworkLineLayer);
      this._map.addLayer(this._UpBusLinkLayer);
      this._map.addLayer(this._UpBusStopLayer);
      this._map.addLayer(this._DownBusLinkLayer);
      this._map.addLayer(this._DownBusStopLayer);
      this._map.addLayer(this._EditBusLinkLayer);
      this._map.addLayer(this._EditBusStopLayer);
      this._map.addLayer(this._BusRouteLinkLayer);
    },
    // 初始化图层
    initLayer() {
      this._LocalMapLayer = new LocalMapLayer({
        zIndex: 0,
      });
      this._StopsLayer = new StopsLayer({
        zIndex: 2,
        color: 0x409eff,
        visible: false,
      });
      // this._NetworkLayer = new NetworkLayer({
      //   zIndex: 3,
      //   color: 0x409eff,
      //   visible: false,
      // });
      this._NetworkLayer2 = new NetworkLayer2({
        zIndex: 3,
        color: 0x409eff,
        visible: false,
      });
      this._NetworkLineLayer = new NetworkLineLayer({
        zIndex: 4,
        color: 0x67c23a,
        visible: false,
      });

      this._UpBusLinkLayer = new BusLinkLayer({
        zIndex: 5,
        color: 0xf56c6c,
        visible: true,
      });
      this._DownBusLinkLayer = new BusLinkLayer({
        zIndex: 6,
        color: 0xf56c6c,
        visible: true,
      });
      this._EditBusLinkLayer = new BusLinkLayer({
        zIndex: 7,
        color: 0xf56c6c,
        visible: true,
      });

      this._UpBusStopLayer = new BusStopLayer({
        zIndex: 8,
        color: 0x67c23a,
        visible: true,
      });
      this._DownBusStopLayer = new BusStopLayer({
        zIndex: 9,
        color: 0x67c23a,
        visible: true,
      });
      this._EditBusStopLayer = new BusStopLayer({
        zIndex: 10,
        color: 0x67c23a,
        highStopColor: 0xe6a23c,
        visible: true,
      });
      this._BusRouteLinkLayer = new BusRouteLinkLayer({
        zIndex: 11,
        linkColor: 0xf56c6c,
        stopColor: 0x67c23a,
        middleLinkColor: 0xffffff,
        visible: true,
      });
    },
    // 还原图层到初始状态
    resetLayer() {
      this._StopsLayer.update();
      this._StopsLayer.hide();

      // this._NetworkLayer.update();
      // this._NetworkLayer.show();
      this._NetworkLayer2.hide();
      this._NetworkLineLayer.update();
      this._NetworkLineLayer.hide();

      this._UpBusLinkLayer.setData();
      this._UpBusLinkLayer.hide();

      this._UpBusStopLayer.setData();
      this._UpBusStopLayer.hide();

      this._DownBusLinkLayer.setData();
      this._DownBusLinkLayer.hide();

      this._DownBusStopLayer.setData();
      this._DownBusStopLayer.hide();

      this._EditBusLinkLayer.setData();
      this._EditBusLinkLayer.hide();

      this._EditBusStopLayer.setData();
      this._EditBusStopLayer.hide();

      this._BusRouteLinkLayer.setData();
      this._BusRouteLinkLayer.hide();
    },
    // 恢复上一次编辑未保存的数据
    revertData() {
      try {
        let tlForm = JSON.parse(sessionStorage.getItem(this.datasource + "_tlForm"));
        if (tlForm && tlForm.obj) {
          this.tlForm = {
            id: tlForm.id,
            name: tlForm.name,
            obj: new Bean.TransitLine(tlForm.obj),
          };
          this.bMapBoxObj = {
            width: document.body.clientWidth / 2,
            open: this.bMapBoxObj.open,
            busName: this.tlForm.obj.name,
            center: this._map ? this._map.center : [12604071, 2640970],
            zoom: this._map ? this._map.zoom : 16,
          };

          this._UpBusLinkLayer.setData(this.tlForm.obj.up);
          this._UpBusStopLayer.setData(this.tlForm.obj.up);
          this._DownBusLinkLayer.setData(this.tlForm.obj.down);
          this._DownBusStopLayer.setData(this.tlForm.obj.down);

          this._UpBusLinkLayer.show();
          this._UpBusStopLayer.show();
          this._DownBusLinkLayer.show();
          this._DownBusStopLayer.show();
          this.setFitZoomAndCenterByTransitRoute();
          this.$nextTick(() => {
            this.$refs.routeSelect.remoteMethod(tlForm.name);
          });
        }
      } catch (error) {
        this.tlForm = {
          id: null,
          name: null,
          obj: null,
        };
        this.resetLayer();
      }
    },
    // 获取线路详情
    handleGetRouteDetail({ value, item }) {
      getByLineId({
        lineId: value,
      })
        .then((res) => {
          if (res.data && res.data.lineId) {
            let obj = new Bean.TransitLine(res.data);
            this.tlForm.obj = obj;
            this.bMapBoxObj = {
              width: document.body.clientWidth / 2,
              open: this.bMapBoxObj.open,
              busName: this.tlForm.obj.name,
              center: this._map ? this._map.center : [12604071, 2640970],
              zoom: this._map ? this._map.zoom : 16,
            };
            this.setFitZoomAndCenterByTransitRoute();
          } else {
            throw new Error("获取线路详情失败");
          }
        })
        .catch((res) => {
          let obj = new Bean.TransitLine({
            name: item.name,
          });
          obj.up.discard = false;
          this.tlForm.obj = obj;
        })
        .finally(() => {
          this._UpBusLinkLayer.setData(this.tlForm.obj.up);
          this._UpBusStopLayer.setData(this.tlForm.obj.up);
          this._DownBusLinkLayer.setData(this.tlForm.obj.down);
          this._DownBusStopLayer.setData(this.tlForm.obj.down);

          this._UpBusLinkLayer.show();
          this._UpBusStopLayer.show();
          this._DownBusLinkLayer.show();
          this._DownBusStopLayer.show();
          // this.setFitZoomAndCenterByTransitRoute();
        });
    },
    // 根据线路设置地图的缩放和中心点
    setFitZoomAndCenterByTransitRoute(transitRoute) {
      this.$nextTick(() => {
        setTimeout(() => {
          if (!transitRoute) transitRoute = this.tlForm.obj.up;
          const list = transitRoute.stops.map((v) => v.coord.toList());
          const res2 = this._map.getFitZoomAndCenterPoints(list);
          this.handleCenterAndZoom({
            center: res2.center,
            zoom: res2.zoom,
          });
        }, 500);
      });
    },
    // 改变地图的缩放和中心点
    handleCenterAndZoom({ zoom, center }) {
      function toFixed(num) {
        return Number(Number(num).toFixed(5));
      }
      let json1 = JSON.stringify({
        center: center.map(toFixed),
        zoom: toFixed(zoom),
      });
      let json2 = JSON.stringify({
        center: this._map.center.map(toFixed),
        zoom: toFixed(this._map.zoom),
      });
      if (this._map && json1 !== json2) {
        if (!zoom) zoom = this._map.zoom;
        if (!center) center = this._map.center;
        this.bMapBoxObj.zoom = zoom;
        this.bMapBoxObj.center = center;
        this._map.setZoom(zoom);
        this._map.setCenter(center);
      }
    },
    // 打开 站点编辑 弹窗
    handleOpenStopsEdit(routeType) {
      this.openSetting = false;
      const transitRoute = this.tlForm.obj[routeType];
      this.$nextTick(() => {
        // let left = 20;
        // if (this.$refs.bmapBox.$el) {
        //   left = document.body.clientWidth / 2 - 320;
        // }
        this.stopsEditObj = {
          title: `${transitRoute.routeId} - ${this.$l("站点编辑")}`,
          open: true,
          routeType: routeType,
          transitRouteJSON: transitRoute.toJSON(),
          width: "300px",
          left: 20,
        };
      });

      this._UpBusLinkLayer.hide();
      this._UpBusStopLayer.hide();
      this._DownBusLinkLayer.hide();
      this._DownBusStopLayer.hide();

      this._EditBusLinkLayer.show();
      this._EditBusStopLayer.show();
      // this.setFitZoomAndCenterByTransitRoute(transitRoute);
    },
    // 关闭 站点编辑 弹窗回调
    handleCloseStopsEdit() {
      this.openSetting = true;
      this.bMapBoxObj.open = false;
      this.stopsEditObj = {
        title: this.$l("站点编辑"),
        open: false,
        routeType: "up",
        transitRouteJSON: undefined,
      };

      this._UpBusLinkLayer.show();
      this._UpBusStopLayer.show();
      this._DownBusLinkLayer.show();
      this._DownBusStopLayer.show();

      this._EditBusLinkLayer.hide();
      this._EditBusStopLayer.hide();

      this._EditBusLinkLayer.setData();
      this._EditBusStopLayer.setData();
      // this.setFitZoomAndCenterByTransitRoute();
    },
    // 保存 站点编辑 弹窗回调
    handleChangeStopsEdit(data) {
      let transitRoute = new Bean.TransitRoute(data);
      this.$set(this.tlForm.obj, this.stopsEditObj.routeType, transitRoute);
      this._UpBusLinkLayer.setData(this.tlForm.obj.up);
      this._UpBusStopLayer.setData(this.tlForm.obj.up);
      this._DownBusLinkLayer.setData(this.tlForm.obj.down);
      this._DownBusStopLayer.setData(this.tlForm.obj.down);
      this.handleCloseStopsEdit();
    },
    // 打开 路径编辑 弹窗
    handleOpenStopsRoutesEdit(routeType) {
      this.openSetting = false;
      const transitRoute = this.tlForm.obj[routeType];
      this.stopsRoutesEditObj = {
        title: `${transitRoute.routeId} - ${this.$l("路径编辑")}`,
        open: true,
        routeType: routeType,
        transitRouteJSON: transitRoute.toJSON(),
      };
      this._UpBusLinkLayer.hide();
      this._UpBusStopLayer.hide();
      this._DownBusLinkLayer.hide();
      this._DownBusStopLayer.hide();

      this._EditBusLinkLayer.show();
      this._EditBusStopLayer.show();
      // this.setFitZoomAndCenterByTransitRoute(transitRoute);
    },
    // 关闭 路径编辑 弹窗回调
    handleCloseStopsRoutesEdit() {
      this.openSetting = true;
      this.bMapBoxObj.open = false;
      this.stopsRoutesEditObj = {
        title: this.$l("路径编辑"),
        open: false,
        routeType: "up",
        transitRouteJSON: undefined,
      };
      this._UpBusLinkLayer.show();
      this._UpBusStopLayer.show();
      this._DownBusLinkLayer.show();
      this._DownBusStopLayer.show();

      this._EditBusLinkLayer.hide();
      this._EditBusLinkLayer.setData();
      this._EditBusStopLayer.hide();
      this._EditBusStopLayer.setData();

      this._BusRouteLinkLayer.hide();
      this._BusRouteLinkLayer.removeEventListener(MAP_EVENT.HANDLE_PICK_LEFT);
      // this._NetworkLayer.hide();
      // this._NetworkLayer.removeEventListener(MAP_EVENT.HANDLE_PICK_LEFT);
      this._NetworkLayer2.hide();
      this._NetworkLayer2.removeEventListener(MAP_EVENT.HANDLE_PICK_LEFT);
      this._NetworkLineLayer.hide();
      this._NetworkLineLayer.removeEventListener(MAP_EVENT.HANDLE_PICK_LEFT);

      // this.setFitZoomAndCenterByTransitRoute();
    },
    // 路径编辑 弹窗 跳转到 站点编辑 弹窗
    handleToEditStops() {
      let routeType = this.stopsRoutesEditObj.routeType;
      {
        // this.handleCloseStopsRoutesEdit();
        // this.openSetting = true;
        // this.bMapBoxObj.open = false;
        this.stopsRoutesEditObj = {
          title: this.$l("路径编辑"),
          open: false,
          routeType: "up",
          transitRouteJSON: undefined,
        };
        // this._UpBusLinkLayer.show();
        // this._UpBusStopLayer.show();
        // this._DownBusLinkLayer.show();
        // this._DownBusStopLayer.show();

        // this._EditBusLinkLayer.hide();
        // this._EditBusLinkLayer.setData();
        // this._EditBusStopLayer.hide();
        // this._EditBusStopLayer.setData();

        this._BusRouteLinkLayer.hide();
        this._BusRouteLinkLayer.removeEventListener(MAP_EVENT.HANDLE_PICK_LEFT);
        // this._NetworkLayer.hide();
        // this._NetworkLayer.removeEventListener(MAP_EVENT.HANDLE_PICK_LEFT);
        this._NetworkLayer2.hide();
        this._NetworkLayer2.removeEventListener(MAP_EVENT.HANDLE_PICK_LEFT);
        this._NetworkLineLayer.hide();
        this._NetworkLineLayer.removeEventListener(MAP_EVENT.HANDLE_PICK_LEFT);

        // this.setFitZoomAndCenterByTransitRoute();
      }
      {
        // this.handleOpenStopsEdit(routeType);
        this.openSetting = false;
        const transitRoute = this.tlForm.obj[routeType];

        // this.bMapBoxObj.open = false;
        // let left = 20;
        // if (this.$refs.bmapBox.$el) {
        //   left = document.body.clientWidth - this.$refs.bmapBox.$el.clientWidth - 320;
        // }
        this.stopsEditObj = {
          title: `${transitRoute.routeId} - ${this.$l("站点编辑")}`,
          open: true,
          routeType: routeType,
          transitRouteJSON: transitRoute.toJSON(),
          width: "300px",
          left: 20,
        };

        this._UpBusLinkLayer.hide();
        this._UpBusStopLayer.hide();
        this._DownBusLinkLayer.hide();
        this._DownBusStopLayer.hide();

        this._EditBusLinkLayer.show();
        this._EditBusStopLayer.show();
        // this.setFitZoomAndCenterByTransitRoute(transitRoute);
      }
    },
    // 保存 路径编辑 弹窗回调
    handleChangeStopsRoutesEdit(data) {
      let transitRoute = new Bean.TransitRoute(data);
      this.$set(this.tlForm.obj, this.stopsRoutesEditObj.routeType, transitRoute);
      this._UpBusLinkLayer.setData(this.tlForm.obj.up);
      this._UpBusStopLayer.setData(this.tlForm.obj.up);
      this._DownBusLinkLayer.setData(this.tlForm.obj.down);
      this._DownBusStopLayer.setData(this.tlForm.obj.down);
      // this.handleCloseStopsRoutesEdit();
    },
    // 打开 发车信息编辑 弹窗
    handleOpenStartEdit(routeType) {
      this.openSetting = false;
      const transitRoute = this.tlForm.obj[routeType];

      const bWidth = document.body.clientWidth;
      let width = 900;
      if (bWidth < width) {
        width = bWidth * 0.8;
      }
      let left = (bWidth - width) / 2;
      this.startEditObj = {
        title: `${transitRoute.routeId} - ${this.$l("发车信息编辑")}`,
        open: true,
        routeType: routeType,
        transitRouteJSON: transitRoute.toJSON(),
        left: left,
        width: width + "px",
      };

      this._UpBusLinkLayer.hide();
      this._UpBusStopLayer.hide();
      this._DownBusLinkLayer.hide();
      this._DownBusStopLayer.hide();

      this._EditBusLinkLayer.show();
      this._EditBusStopLayer.show();
    },
    // 关闭 发车信息编辑 弹窗回调
    handleCloseStartEdit() {
      this.openSetting = true;
      this.startEditObj = {
        title: this.$l("发车信息编辑"),
        open: false,
        routeType: "up",
        transitRouteJSON: undefined,
      };

      this._UpBusLinkLayer.show();
      this._UpBusStopLayer.show();
      this._DownBusLinkLayer.show();
      this._DownBusStopLayer.show();

      this._EditBusLinkLayer.hide();
      this._EditBusStopLayer.hide();

      this._EditBusLinkLayer.setData();
      this._EditBusStopLayer.setData();
      // this.setFitZoomAndCenterByTransitRoute();
    },
    // 保存 发车信息编辑 弹窗回调
    handleChangeStartEdit(data) {
      let transitRoute = new Bean.TransitRoute(data);
      this.$set(this.tlForm.obj, this.startEditObj.routeType, transitRoute);
      this._UpBusLinkLayer.setData(this.tlForm.obj.up);
      this._UpBusStopLayer.setData(this.tlForm.obj.up);
      this._DownBusLinkLayer.setData(this.tlForm.obj.down);
      this._DownBusStopLayer.setData(this.tlForm.obj.down);
      this.handleCloseStartEdit();
    },
    // 保存公交线路编辑结果
    handleSave() {
      this.saveLoading = true;
      let params = this.tlForm.obj.toJSON();
      saveByLine(params)
        .then((res) => {
          this.tlForm = {
            id: "",
            name: "",
            obj: null,
          };
          this.saveLoading = false;
          this.$message.success(this.$l("保存成功"));
          this.resetLayer();
        })
        .catch((err) => {
          this.saveLoading = false;
        });
    },
    // 取消
    handleCancel() {
      this.tlForm = {
        id: "",
        name: "",
        obj: null,
      };
      this.resetLayer();
    },
    async handleDelete() {
      try {
        await this.$confirm(this.$l("确认删除？"), this.$l("提示"));
        this.deleteLoading = true;
        await deleteTransitLine({
          lineId: this.tlForm.id,
        });
        this.tlForm = {
          id: "",
          name: "",
          obj: null,
        };
        this.deleteLoading = false;
        this.resetLayer();
      } catch (error) {
        this.deleteLoading = false;
      }
    },
    handleCreateDownByUp() {
      let stops = this.tlForm.obj.up.toJSON().stops.reverse();
      let params = new Bean.TransitRouteParams();
      params.stops = stops;
      params.routeId = `${this.$l("反转：")}${this.tlForm.obj.up.routeId}`;
      params.discard = false;
      this.tlForm.obj.down = new Bean.TransitRoute(params);
    },
    async handleCreateDataSource() {
      try {
        const { value, action } = await this.$prompt(this.$l("请输入方案名称"), this.$l("提示"), {
          confirmButtonText: this.$l("确定"),
          cancelButtonText: this.$l("取消"),
          inputValidator: (value) => {
            if (!value) {
              return this.$l("请输入方案名称");
            }
            if (!/^[a-zA-Z0-9_]+$/.test(value)) {
              return this.$l("方案名称只能使用英文字母，数字和下划线");
            }
            if (value.slice(-4).toLowerCase() == "base") {
              return this.$l("方案名称不能以base结尾");
            }
            return true;
          },
        });
        if (action == "confirm") {
          const data = await this.$store.dispatch("saveDataSource", {
            key: value,
          });
          if (data.code == 200) {
            this.$message.success(this.$l("方案创建成功"));
            this.$router.replace({
              name: "index",
              params: {
                base: this.database,
              },
            });
          }
        }
      } catch (error) {}
    },
    async handleSaveDataSource() {
      const data = await this.$store.dispatch("saveDataSource", {
        key: this.datasource,
      });
      if (data.code == 200) {
        this.$message.success(this.$l("方案保存成功"));
        this.$router.replace({
          name: "index",
          params: {
            base: this.database,
          },
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep {
  .setting_box .el-form-item__content {
    text-align: right;
  }
}
.setting_box {
  user-select: none;
  .footer {
    padding-top: 10px;
    text-align: right;
  }
}
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
    width: 100%;
    height: 100%;
    #mapRoot {
      width: 100%;
      height: 100%;
    }
  }

  .lineOffset {
    bottom: 100px;
    left: 20px;
    position: absolute;
    z-index: 20;
    ::v-deep .el-slider__runway {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
    }
  }
}

.HelpBtnList {
  bottom: 20px;
  left: 20px;
  position: absolute;
  z-index: 20;
  ._flex {
    display: flex;
    align-items: center;
  }
  .el-icon-question {
    color: #409eff;
    font-size: 40px;
    cursor: pointer;
  }
  .bug {
    box-sizing: border-box;
    width: 40px;
    height: 40px;
    margin-left: 20px;
    border-radius: 50%;
    background-color: #f56c6c;
    color: #fff;
    font-weight: bold;
    text-align: center;
    line-height: 40px;
    font-size: 12px;
    text-decoration: none;
    display: block;
  }
  .language {
    box-sizing: border-box;
    width: 40px;
    height: 40px;
    margin-left: 20px;
    border-radius: 50%;
    background-color: #e6a23c;
    color: #fff;
    display: block;
    padding: 5px;
    box-sizing: border-box;
    cursor: pointer;
  }
}
</style>
