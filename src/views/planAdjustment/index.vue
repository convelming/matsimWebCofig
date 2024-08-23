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
        <el-form ref="tlForm" size="small" label-width="auto">
          <el-form-item :label="$l('路线名称')" >
            <RouteSelect ref="routeSelect" v-model="tlForm.id" :label.sync="tlForm.name" @change="handleGetRouteDetail" />
          </el-form-item>
        </el-form>
        <template v-if="tlForm.obj">
          <div class="tr_list">
            <el-collapse v-model="activeNames">
              <el-collapse-item v-for="(v, i) in tlForm.obj.transitRoutes" :name="String(i)" :key="i">
                <div slot="title">
                  <el-checkbox v-model="v.showLayer" @change="updateLayer">{{ $l("线路") }} {{ i + 1 }}</el-checkbox>
                </div>
                <el-row :gutter="20">
                  <el-col :span="24">
                    <el-input class="row" v-model="v.routeId" size="small"></el-input>
                  </el-col>
                </el-row>
                <div class="stop_list">
                  <div class="stop_item">{{ v.startStop.name }}</div>
                  <div class="el-icon-d-arrow-right"></div>
                  <div class="stop_item">{{ v.endStop.name }}</div>
                </div>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-button type="primary" @click="handleOpenStopsEdit(i)" size="small">{{ $l("编辑站点") }}</el-button>
                  </el-col>
                  <el-col :span="12">
                    <el-button type="primary" @click="handleOpenStopsRoutesEdit(i)" size="small">{{ $l("编辑路径") }}</el-button>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-button type="primary" @click="handleOpenStartEdit(i)" size="small">{{ $l("编辑发车信息") }}</el-button>
                  </el-col>
                  <el-col :span="12">
                    <el-button type="danger" @click="handleDeleteTransitRoute(i)" size="small">{{ $l("删除线路") }}</el-button>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-button style="width: 100%" type="warning" @click="handleCreateTransitRouteByIndex(i)" size="small">{{ $l("生成反向线路") }}</el-button>
                  </el-col>
                  <el-col :span="12">
                    <el-button style="width: 100%" type="warning" @click="handleCloneTransitRouteByIndex(i)" size="small">{{ $l("克隆线路") }}</el-button>
                  </el-col>
                </el-row>
              </el-collapse-item>
            </el-collapse>
          </div>
          <el-row style="padding-top: 20px" :gutter="20">
            <el-col :span="24">
              <el-button type="success" size="small" @click="handleCreateTransitRoute">{{ $l("添加线路") }}</el-button>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-button type="danger" size="small" @click="handleDelete" :loading="deleteLoading">{{ $l("删除路线") }}</el-button>
            </el-col>
            <el-col :span="8">
              <el-button type="primary" size="small" @click="handleSave" :loading="saveLoading">{{ $l("保存路线") }}</el-button>
            </el-col>
            <el-col :span="8">
              <el-button type="info" size="small" @click="handleCancel">{{ $l("取消编辑") }}</el-button>
            </el-col>
          </el-row>
        </template>
        <template v-else>
          <el-table class="small my_tabel" :data="changedList" border stripe height="calc(100vh - 220px)" v-loading="loading1">
            <el-table-column :label="$l('路线名称')" prop="lineName" show-overflow-tooltip />
            <el-table-column width="80" :label="$l('操作')">
              <template slot-scope="{ row }">
                <el-button type="primary" size="mini" @click="handleEditRoute(row)">{{ $l("编辑") }}</el-button>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </div>
    </Dialog>

    <StopsEdit :show="stopsEditObj.open" :transitRouteJSON="stopsEditObj.transitRouteJSON" @close="handleCloseStopsEdit" @change="handleChangeStopsEdit" />

    <StopsRoutesEdit :show="stopsRoutesEditObj.open" :transitRouteJSON="stopsRoutesEditObj.transitRouteJSON" @close="handleCloseStopsRoutesEdit" @toEditStops="handleToEditStops" @change="handleChangeStopsRoutesEdit" />

    <StartEdit :show="startEditObj.open" :transitRouteJSON="startEditObj.transitRouteJSON" @close="handleCloseStartEdit" @change="handleChangeStartEdit" />

    <div class="HelpBtnList">
      <div class="_flex">
        <div class="el-icon-question" @click="showHelpDialog = true"></div>
        <a class="bug" href="https://doc.weixin.qq.com/sheet/e3_AdQA8Aa_ADMt1qh97LkSHer6ALqI2?scode=APwA6gfEAA0aeGdABPAdQA8Aa_ADM&tab=f2oofj" target="_blank">BUG</a>
        <el-dropdown class="language" @command="changeLanguage" placement="top-start" trigger="click">
          <img src="@/assets/image/locale.svg" style="width: 100%; height: 100%" />
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="zh-CN" :disabled="page_language == 'zh-CN'">中文（简体）</el-dropdown-item>
            <el-dropdown-item command="en-US" :disabled="page_language == 'en-US'">English</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>

    <HelpDialog :visible.sync="showHelpDialog" />

    <div class="MapLayer_menu" :class="{ hide: !showStyleMenu }" :style="`width: ${styleList.length * 50 + 30}px`">
      <div class="open_hide_btn" @click="showStyleMenu = !showStyleMenu"></div>
      <img class="item" :class="{ active: styleActive == i }" v-for="(v, i) in styleList" :src="v.url" :title="v.style_name" :key="i" @click="handleChangeStyle(i)" />
    </div>
  </div>
</template>

<language>
{
  "Line":{
    "zh-CN": "公交路线", // line 路线 route 线路
    "en-US": "Line"
  },
  "Route":{
    "zh-CN": "上下行线路",
    "en-US": "Route"
  },
  "路线名称": {
    "zh-CN":"公交路线名称",
    "en-US":"Line Name"
  },
  "添加线路": {
    "zh-CN":"添加单条上下行线路",
    "en-US":"Add Transit Route"
  },
  "克隆线路": {
    "zh-CN":"复制单条上下行线路",
    "en-US":"Copy Transit Route"
  },
  "线路": {
    "zh-CN":"线路",
    "en-US":"Transit Route"
  },
  "线路名称": {
    "zh-CN":"线路名称",
    "en-US":"Line name"
  },
  "编辑站点": {
    "zh-CN":"编辑站点",
    "en-US":"Edit Stop"
  },
  "编辑路径": {
    "zh-CN":"编辑路径",
    "en-US":"Edit Path"
  },
  "编辑发车信息": {
    "zh-CN":"编辑发车信息",
    "en-US":"Edit Departures"
  },
  "生成反向线路": {
    "zh-CN":"生成反向线路",
    "en-US":"Create Reversed Route"
  },
  "删除路线": {
    "zh-CN":"删除路线",
    "en-US":"Delete Route"
  },
  "保存路线": {
    "zh-CN":"保存路线",
    "en-US":"Save Route"
  },
  "取消编辑": {
    "zh-CN":"取消编辑",
    "en-US":"Cancel Edit"
  },
  "站点编辑": {
    "zh-CN":"站点编辑",
    "en-US":"Edit Stops"
  },
  "路径编辑": {
    "zh-CN":"路径编辑",
    "en-US":"Edit Paths"
  },
  "发车信息编辑": {
    "zh-CN":"发车信息编辑",
    "en-US":"Edit Departures"
  },
  "保存成功": {
    "zh-CN":"保存成功",
    "en-US":"Save Success"
  },
  "是否删除：": {
    "zh-CN":"是否删除：",
    "en-US":"Delete?"
  },
  "提示": {
    "zh-CN":"提示",
    "en-US":"Tips"
  },
  "反转：": {
    "zh-CN":"反转：",
    "en-US":"Reverse:"
  },
  "克隆：": {
    "zh-CN":"拷贝：",
    "en-US":"Copy:"
  },
  "请输入方案名称": {
    "zh-CN":"请输入方案名称",
    "en-US":"Please Enter Scheme Name"
  },
  "提示": {
    "zh-CN":"提示",
    "en-US":"Tips"
  },
  "确定": {
    "zh-CN":"确定",
    "en-US":"Confirm"
  },
  "取消": {
    "zh-CN":"取消",
    "en-US":"Cancel"
  },
  "方案名称只能使用英文字母，数字和下划线": {
    "zh-CN":"方案名称只能使用英文字母，数字和下划线",
    "en-US":"Use Only letters, numbers or '_'"
  },
  "方案名称不能以base结尾": {
    "zh-CN":"方案名称不能重复",
    "en-US":"Scheme names cannot be the same."
  },
  "方案创建成功": {
    "zh-CN":"方案创建成功",
    "en-US":"Program Created"
  },
  "方案保存成功": {
    "zh-CN":"方案保存成功",
    "en-US":"Scheme Saved"
  },
  "删除线路": {
    "zh-CN":"删除线路",
    "en-US":"Delete Route"
  },
  "获取路线详情失败：": {
    "zh-CN":"获取路线详情失败：",
    "en-US":"Getting Route Info Failed"
  },
  "另存为新方案": {
    "zh-CN":"另存为新方案",
    "en-US":"Save as New Scheme"
  },
  "继续保存": {
    "zh-CN":"继续保存",
    "en-US":"Continue Saving"
  },
  "此方案模型已经运行，由于运行时间比较久，建议另存为新的方案": {
    "zh-CN":"此方案模型已经运行，由于运行时间比较久，建议另存为新的方案",
    "en-US":"This scenario is running. Create a new scheme to modify."
  },
}
</language>

<script>
const moment = require("moment");
import { MyMap, MAP_EVENT, MapLayer, MAP_LAYER_STYLE } from "@/mymap/index.js";

import { getByLineId, saveByLine, deleteTransitLine, changeLines, getCenterZoom, lineIsRun, saveNewScheme } from "@/api/index";

import BMapBox from "./component/BMapBox.vue";
import RouteSelect from "./component/RouteSelect.vue";
import StopsEdit from "./component/StopsEdit.vue";
import StopsRoutesEdit from "./component/StopsRoutesEdit.vue";
import StartEdit from "./component/StartEdit.vue";
import HelpDialog from "./component/HelpDialog/index.vue";

import { BusLinkLayer } from "./layer/BusLinkLayer";
import { BusStopLayer } from "./layer/BusStopLayer";

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
      activeNames: [1, 2],
      database: "",
      datasource: "",

      showHelpDialog: false,
      showStyleMenu: false,
      styleList: [],
      styleActive: 0,

      showUpLayer: true,
      showDownLayer: true,

      saveLoading: false,
      deleteLoading: false,
      _map: null,
      _MapLayer: null,
      _LinkLayerList: null,
      _StopLayerList: null,

      loading1: true,
      changedList: [],

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
    showUpLayer: {
      handler(val) {
        this._UpBusLinkLayer.visible = val;
        this._UpBusStopLayer.visible = val;
      },
    },
    showDownLayer: {
      handler(val) {
        this._DownBusLinkLayer.visible = val;
        this._DownBusStopLayer.visible = val;
      },
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
    Promise.all([getCenterZoom()]).then(([rangeRes]) => {
      this.range = rangeRes.data.range.map((v) => [v.x, v.y]);
      this.initMap();
      this.revertData();
      this.getChangedList();
    });
  },
  beforeDestroy() {
    this._map.dispose();
  },
  methods: {
    changeLanguage(lan) {
      this.$setLanguage(lan);
    },
    handleChangeStyle(i) {
      this.showStyleMenu = false;
      this.styleActive = i;
      this._MapLayer.setTileClass(this.styleList[i].c);
    },
    getChangedList() {
      this.loading1 = true;
      changeLines()
        .then((res) => {
          this.changedList = res.data;
        })
        .finally(() => {
          this.loading1 = false;
        });
    },
    // 初始化地图
    initMap() {
      this._map = new MyMap({
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
      this._MapLayer = new MapLayer({ tileClass: MAP_LAYER_STYLE[0], zIndex: -1 });
      this._map.addLayer(this._MapLayer);
      {
        const styleMap = MAP_LAYER_STYLE;
        const itemDocList = [];
        const list = Object.values(styleMap);
        for (let i = 0, l = list.length; i < l; i++) {
          const value = list[i];
          if (value === this._MapLayer.tileClass) this.styleActive = i;
          const item = {
            title: value.style_name,
            url: new value(15, 26700, 14218, 200).url,
            c: value,
          };
          itemDocList.push(item);
        }
        this.styleList = itemDocList;
      }
      console.log(this._map.setFitZoomAndCenterByPoints(this.range));
    },
    // 恢复上一次编辑未保存的数据
    revertData() {
      try {
        let tlForm = JSON.parse(sessionStorage.getItem(this.datasource + "_tlForm"));
        if (tlForm && tlForm.obj) {
          const obj = new Bean.TransitLine(tlForm.obj);
          this.tlForm = {
            id: tlForm.id,
            name: tlForm.name,
            obj: obj,
          };
          this.activeNames = obj.transitRoutes.map((v, i) => String(i));
          this.bMapBoxObj = {
            width: document.body.clientWidth / 2,
            open: this.bMapBoxObj.open,
            busName: this.tlForm.obj.name,
            center: this._map ? this._map.center : [12604071, 2640970],
            zoom: this._map ? this._map.zoom : 16,
          };

          this.setFitZoomAndCenterByTransitRoute();
          this.$nextTick(() => {
            this.$refs.routeSelect.remoteMethod(tlForm.name);
          });

          this.updateLayer();
          this.getChangedList();
        }
      } catch (error) {
        this.tlForm = {
          id: null,
          name: null,
          obj: null,
        };
        this.updateLayer();
        this.getChangedList();
      }
    },
    updateLayer() {
      const routes = this.tlForm.obj ? this.tlForm.obj.transitRoutes || [] : [];
      const layers1 = this._LinkLayerList || [];
      const layers2 = this._StopLayerList || [];
      const l = Math.max(routes.length, layers1.length);
      const showLayer = !this.stopsEditObj.open && !this.stopsRoutesEditObj.open && !this.startEditObj.open;
      console.log("updateLayer", this.stopsEditObj.open);
      for (let i = 0; i < l; i++) {
        const route = routes[i];
        let layer1 = layers1[i];
        let layer2 = layers2[i];
        if (route && route.showLayer && showLayer) {
          if (!layer1) {
            layer1 = new BusLinkLayer({
              zIndex: 6,
              color: 0xf56c6c,
              visible: true,
            });
            layers1[i] = layer1;
          }
          if (!layer2) {
            layer2 = new BusStopLayer({
              zIndex: 8,
              color: 0x67c23a,
              visible: true,
            });
            layers2[i] = layer2;
          }
          layer1.setData(route);
          layer2.setData(route);
          this._map.addLayer(layer1);
          this._map.addLayer(layer2);
        } else {
          if (layer1) {
            this._map.removeLayer(layer1);
          }
          if (layer2) {
            this._map.removeLayer(layer2);
          }
        }
      }
      this._LinkLayerList = layers1;
      this._StopLayerList = layers2;
    },
    handleEditRoute(row) {
      getByLineId({
        lineId: row.lineId,
      })
        .then((res) => {
          if (res.data && res.data.lineId) {
            let obj = new Bean.TransitLine(res.data);
            this.tlForm.obj = obj;
            this.activeNames = obj.transitRoutes.map((v, i) => String(i));
            this.bMapBoxObj = {
              width: document.body.clientWidth / 2,
              open: this.bMapBoxObj.open,
              busName: this.tlForm.obj.name,
              center: this._map ? this._map.center : [12604071, 2640970],
              zoom: this._map ? this._map.zoom : 16,
            };
            this.$nextTick(() => {
              this.$refs.routeSelect.remoteMethod(row.lineName);
            });
            this.setFitZoomAndCenterByTransitRoute();
          } else {
            this.$message.error(this.$l("获取线路详情失败：") + `${row.lineName}`);
          }
        })
        .finally(() => {
          this.updateLayer();
        });
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
            this.activeNames = obj.transitRoutes.map((v, i) => String(i));
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
          this.tlForm.obj = obj;
        })
        .finally(() => {
          this.updateLayer();
        });
    },
    // 根据线路设置地图的缩放和中心点
    setFitZoomAndCenterByTransitRoute(transitRoute) {
      this.$nextTick(() => {
        setTimeout(() => {
          if (!transitRoute) transitRoute = this.tlForm.obj.transitRoutes[0];
          const list = transitRoute.stops.map((v) => v.coord.toList());
          const res2 = this._map.getFitZoomAndCenter(list);
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
    handleOpenStopsEdit(index) {
      this.openSetting = false;
      const transitRoute = this.tlForm.obj.transitRoutes[index];
      this.stopsEditObj = {
        title: `${transitRoute.routeId} - ${this.$l("站点编辑")}`,
        open: true,
        index: index,
        transitRouteJSON: transitRoute.toJSON(),
      };
      this.updateLayer();
      // this.setFitZoomAndCenterByTransitRoute(transitRoute);
    },
    // 关闭 站点编辑 弹窗回调
    handleCloseStopsEdit() {
      this.openSetting = true;
      this.bMapBoxObj.open = false;
      this.stopsEditObj = {
        title: this.$l("站点编辑"),
        open: false,
        index: -1,
        transitRouteJSON: undefined,
      };
      this.updateLayer();
      // this.setFitZoomAndCenterByTransitRoute();
    },
    // 保存 站点编辑 弹窗回调
    handleChangeStopsEdit(data) {
      let transitRoute = new Bean.TransitRoute(data);
      this.$set(this.tlForm.obj.transitRoutes, this.stopsEditObj.index, transitRoute);
      this.handleCloseStopsEdit();
      this.updateLayer();
    },
    // 打开 路径编辑 弹窗
    handleOpenStopsRoutesEdit(index) {
      this.openSetting = false;
      const transitRoute = this.tlForm.obj.transitRoutes[index];
      this.stopsRoutesEditObj = {
        title: `${transitRoute.routeId} - ${this.$l("路径编辑")}`,
        open: true,
        index: index,
        transitRouteJSON: transitRoute.toJSON(),
      };
      // this.setFitZoomAndCenterByTransitRoute(transitRoute);
      this.updateLayer();
    },
    // 关闭 路径编辑 弹窗回调
    handleCloseStopsRoutesEdit() {
      this.openSetting = true;
      this.bMapBoxObj.open = false;
      this.stopsRoutesEditObj = {
        title: this.$l("路径编辑"),
        open: false,
        index: -1,
        transitRouteJSON: undefined,
      };
      // this.setFitZoomAndCenterByTransitRoute();
      this.updateLayer();
    },
    // 路径编辑 弹窗 跳转到 站点编辑 弹窗
    handleToEditStops() {
      let index = this.stopsRoutesEditObj.index;
      {
        this.stopsRoutesEditObj = {
          title: this.$l("路径编辑"),
          open: false,
          index: -1,
          transitRouteJSON: undefined,
        };
        // this.setFitZoomAndCenterByTransitRoute();
      }
      {
        this.openSetting = false;
        const transitRoute = this.tlForm.obj.transitRoutes[index];

        this.bMapBoxObj.open = false;
        this.stopsEditObj = {
          title: `${transitRoute.routeId} - ${this.$l("站点编辑")}`,
          open: true,
          index: index,
          transitRouteJSON: transitRoute.toJSON(),
        };
        // this.setFitZoomAndCenterByTransitRoute(transitRoute);
      }
      this.updateLayer();
    },
    // 保存 路径编辑 弹窗回调
    handleChangeStopsRoutesEdit(data) {
      let transitRoute = new Bean.TransitRoute(data);
      this.$set(this.tlForm.obj.transitRoutes, this.stopsRoutesEditObj.index, transitRoute);
      this.handleCloseStopsRoutesEdit();
      this.updateLayer();
    },
    // 打开 发车信息编辑 弹窗
    handleOpenStartEdit(index) {
      this.openSetting = false;
      const transitRoute = this.tlForm.obj.transitRoutes[index];
      this.startEditObj = {
        title: `${transitRoute.routeId} - ${this.$l("发车信息编辑")}`,
        open: true,
        index: index,
        transitRouteJSON: transitRoute.toJSON(),
      };
      this.updateLayer();
    },
    // 关闭 发车信息编辑 弹窗回调
    handleCloseStartEdit() {
      this.openSetting = true;
      this.startEditObj = {
        title: this.$l("发车信息编辑"),
        open: false,
        index: -1,
        transitRouteJSON: undefined,
      };

      // this.setFitZoomAndCenterByTransitRoute();
      this.updateLayer();
    },
    // 保存 发车信息编辑 弹窗回调
    handleChangeStartEdit(data) {
      let transitRoute = new Bean.TransitRoute(data);
      this.$set(this.tlForm.obj.transitRoutes, this.startEditObj.index, transitRoute);
      this.handleCloseStartEdit();
      this.updateLayer();
    },
    handleCreateTransitRoute() {
      this.activeNames.push(String(this.tlForm.obj.transitRoutes.length));
      this.tlForm.obj.transitRoutes.push(new Bean.TransitRoute());
      this.updateLayer();
    },
    handleCreateTransitRouteByIndex(index) {
      const oldRoute = this.tlForm.obj.transitRoutes[index];
      if (oldRoute) {
        let stops = oldRoute.toJSON().stops.reverse();
        let params = new Bean.TransitRouteParams();
        params.stops = stops;
        params.routeId = `${this.$l("反转：")}${oldRoute.routeId}`;
        params.discard = false;
        this.activeNames.push(String(this.tlForm.obj.transitRoutes.length));
        this.tlForm.obj.transitRoutes.push(new Bean.TransitRoute(params));
      }
      this.updateLayer();
    },
    handleCloneTransitRouteByIndex(index) {
      const oldRoute = this.tlForm.obj.transitRoutes[index];
      if (oldRoute) {
        let params = oldRoute.toJSON();
        params.routeId = `${this.$l("克隆：")}${oldRoute.routeId}`;
        this.activeNames.push(String(this.tlForm.obj.transitRoutes.length));
        this.tlForm.obj.transitRoutes.push(new Bean.TransitRoute(params));
      }
      this.updateLayer();
    },
    async handleDeleteTransitRoute(index) {
      try {
        const item = this.tlForm.obj.transitRoutes[index];
        await this.$confirm(`${this.$l("是否删除：")}${item.routeId}`, this.$l("提示"));
        this.tlForm.obj.transitRoutes.splice(index, 1);
        this.updateLayer();
      } catch (error) {}
    },
    // 保存公交路线编辑结果
    handleSave() {
      this.saveLoading = true;
      lineIsRun().then((isRun) => {
        if (isRun.data) {
          this.$prompt(this.$l("此方案模型已经运行，由于运行时间比较久，建议另存为新的方案"), "提示", {
            distinguishCancelAndClose: true,
            confirmButtonText: this.$l("另存为新方案"),
            cancelButtonText: this.$l("继续保存"),
            inputValue: `${this.datasource}_${moment().format("yyyyMMDDHHmmss")}`,
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
          })
            .then((value) => {
              let params = this.tlForm.obj.toJSON();
              this.saveLoading = false;
              saveNewScheme({
                transitLine: params,
                key: value.value,
                detail: "",
              })
                .then((res) => {
                  this.tlForm = {
                    id: "",
                    name: "",
                    obj: null,
                  };
                  this.saveLoading = false;
                  this.$message.success(this.$l("保存成功"));
                  this.updateLayer();
                  this.getChangedList();
                })
                .catch((err) => {
                  this.saveLoading = false;
                });
            })
            .catch((error) => {
              if (error == "cancel") {
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
                    this.updateLayer();
                    this.getChangedList();
                  })
                  .catch((err) => {
                    this.saveLoading = false;
                  });
              } else {
                this.saveLoading = false;
              }
            });
        } else {
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
              this.updateLayer();
              this.getChangedList();
            })
            .catch((err) => {
              this.saveLoading = false;
            });
        }
      });
    },
    // 取消编辑公交路线
    handleCancel() {
      this.tlForm = {
        id: "",
        name: "",
        obj: null,
      };
      this.updateLayer();
      this.getChangedList();
    },
    // 删除编辑公交路线
    async handleDelete() {
      try {
        await this.$confirm(`${this.$l("是否删除：")}${this.tlForm.id}`, this.$l("提示"));
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
        this.updateLayer();
        this.getChangedList();
      } catch (error) {
        this.deleteLoading = false;
      }
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
  .footer {
    padding-top: 10px;
    text-align: right;
  }
  .el-row + .el-row {
    padding-top: 10px;
  }
  .el-col {
    * {
      display: block;
      width: 100%;
    }
  }

  .tr_list {
    background-color: #eef2fd;
    border: 1px solid #ccc;
    border-radius: 8px;
    height: calc(100vh - 300px);
    user-select: none;
    overflow-y: auto;
    ::v-deep {
      .el-collapse-item {
        padding: 0 10px;
        border-bottom: 1px solid #ccc;
      }
      .el-collapse-item__header {
        background-color: transparent;
      }
      .el-collapse-item__wrap {
        background-color: transparent;
      }
    }
    &::-webkit-scrollbar {
      display: none;
    }
    .stop_list {
      padding: 10px 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .stop_item {
        box-sizing: border-box;
        padding: 0 10px;
        width: 100%;
        height: 32px;
        line-height: 32px;
        font-size: 12px;
        border-radius: 3px;
        border: 1px solid #dcdfe6;
        text-wrap: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        background-color: #fff;
      }
      .el-icon-d-arrow-right {
        padding: 0 15px;
        line-height: 32px;
        height: 32px;
      }
    }
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
</style>
