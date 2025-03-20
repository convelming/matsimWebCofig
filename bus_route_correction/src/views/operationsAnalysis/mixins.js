import Toolbar from "./component/Toolbar/index.vue";
import PublicTransit from "./component/PublicTransit/index.vue";
import MotorizedTravel from "./component/MotorizedTravel/index.vue";
import Build3D from "./component/Build3D/index.vue";
import Network from "./component/Network/index.vue";
import Activity3D from "./component/Activity3D/index.vue";
import GeoJSON from "./component/GeoJSON/index.vue";
import CarTravel from "./component/CarTravel/index.vue";
import Parking from "./component/Parking/index.vue";
import TrafficRegionAnalysis from "./component/TrafficRegionAnalysis/index.vue";

import PageConfig from "./component/PageConfig/index.vue";

import NewClock from "@/components/NewClock/index.vue";

import { MyMap, MapLayer, MAP_LAYER_STYLE } from "@/mymap/index.js";
import { getTimeInterval, getCenterZoom, saveUserCfg, getUserCfg, userCfgList } from "@/api/index.js";
import { guid } from "@/utils/utils.js";

import defaultConfig from "./component/PageConfig/defaultConfig.js";

export default {
  components: {
    PublicTransit,
    Toolbar,
    MotorizedTravel,
    Build3D,
    Network,
    Activity3D,
    GeoJSON,
    CarTravel,
    Parking,
    TrafficRegionAnalysis,

    NewClock,
    PageConfig,
  },
  data() {
    return {
      defaultConfig,

      loading: false,
      _Map: null,
      _MapLayer: null,
      activeNames: [],

      showLayerPublicTransit: false,
      lock2DPublicTransit: false,

      showLayerMotorizedTravel: false,
      lock2DMotorizedTravel: false,

      showLayerBuild3D: false,
      lock2DBuild3D: false,

      showLayerNetwork: false,
      lock2DNetwork: false,

      showLayerActivity3D: false,
      lock2DActivity3D: false,

      showLayerCarTravel: false,
      lock2DCarTravel: false,

      showLayerGeoJSON: false,
      lock2DGeoJSON: false,
      GeoJSONList: [],

      showLayerParking: false,
      lock2DParking: false,
      parkingGeoJSON: null,

      showLayerTrafficRegionAnalysis: false,
      lock2DTrafficRegionAnalysis: false,

      showStopToolbar: true,

      showClock: true,

      showHelpDialog: false,

      time: 3600 * 8 - 360,
      speed: 0,
      minTime: 0,
      maxTime: 3600 * 24.5,
      range: [],
      center: [0, 0],
      activeNames: [],
    };
  },
  watch: {
    showLayerPublicTransit(val) {
      this.handleChangeTimeSpeed();
      this.handleChangeMapCameraControls();
      this.handleToolbarActiveModel("PublicTransit");
    },
    lock2DPublicTransit(val) {
      this.handleChangeTimeSpeed();
      this.handleChangeMapCameraControls();
    },
    showLayerMotorizedTravel(val) {
      this.handleChangeTimeSpeed();
      this.handleChangeMapCameraControls();
      this.handleToolbarActiveModel("MotorizedTravel");
    },
    lock2DMotorizedTravel(val) {
      this.handleChangeTimeSpeed();
      this.handleChangeMapCameraControls();
    },
    showLayerBuild3D(val) {
      this.handleChangeTimeSpeed();
      this.handleChangeMapCameraControls();
      this.handleToolbarActiveModel("Build3D");
    },
    lock2DBuild3D(val) {
      this.handleChangeTimeSpeed();
      this.handleChangeMapCameraControls();
    },
    showLayerNetwork(val) {
      this.handleChangeTimeSpeed();
      this.handleChangeMapCameraControls();
      this.handleToolbarActiveModel("Network");
    },
    lock2DNetwork(val) {
      this.handleChangeTimeSpeed();
      this.handleChangeMapCameraControls();
    },
    showLayerActivity3D(val) {
      this.handleChangeTimeSpeed();
      this.handleChangeMapCameraControls();
      this.handleToolbarActiveModel("Activity3D");
    },
    lock2DActivity3D(val) {
      this.handleChangeTimeSpeed();
      this.handleChangeMapCameraControls();
    },
    showLayerCarTravel(val) {
      this.handleChangeTimeSpeed();
      this.handleChangeMapCameraControls();
      this.handleToolbarActiveModel("CarTravel");
    },
    lock2DCarTravel(val) {
      this.handleChangeTimeSpeed();
      this.handleChangeMapCameraControls();
    },
    showLayerGeoJSON(val) {
      this.handleChangeTimeSpeed();
      this.handleChangeMapCameraControls();
      this.handleToolbarActiveModel("GeoJSON");
    },
    lock2DGeoJSON(val) {
      this.handleChangeTimeSpeed();
      this.handleChangeMapCameraControls();
    },
    showLayerParking(val) {
      this.handleChangeTimeSpeed();
      this.handleChangeMapCameraControls();
      this.handleToolbarActiveModel("Parking");
    },
    lock2DParking(val) {
      this.handleChangeTimeSpeed();
      this.handleChangeMapCameraControls();
    },
    showLayerTrafficRegionAnalysis(val) {
      this.handleChangeTimeSpeed();
      this.handleChangeMapCameraControls();
      this.handleToolbarActiveModel("TrafficRegionAnalysis");
    },
    lock2DTrafficRegionAnalysis(val) {
      this.handleChangeTimeSpeed();
      this.handleChangeMapCameraControls();
    },
  },
  provide() {
    return {
      rootVue: this,
    };
  },
  created() {
    const { database, datasource } = this.$route.params;
    this.$store.dispatch("setDataBase", database);
    this.$store.dispatch("setDataSource", database + "/" + datasource);
  },
  mounted() {
    Promise.all([getTimeInterval(), getCenterZoom()]).then(([timeRes, rangeRes]) => {
      // this.minTime = timeRes.data.minTime;
      // this.maxTime = timeRes.data.maxTime;
      this.range = rangeRes.data.range.map((v) => [v.x, v.y]);
      this.center = [rangeRes.data.center.x, rangeRes.data.center.y];

      this.initMap();
      this.handleChangeMapCameraControls();

      if (this.$route.query.configName) {
        getUserCfg({ fileName: this.$route.query.configName }).then((res) => {
          this.initByConfig(res);
        });
      }
    });
  },
  beforeDestroy() {},
  methods: {
    initByConfig(config) {
      config = Object.assign({}, defaultConfig, config);

      this.showStopToolbar = config.showStopToolbar;

      this.showClock = config.showClock;

      this.showHelpDialog = config.showHelpDialog;

      this.time = config.time;
      this.minTime = config.minTime;
      this.maxTime = config.maxTime;
      this.speedCommand(config.speed);
      this._Map.setCenter(config.center);
      this._Map.setZoom(config.zoom);
      this._Map.setPitchAndRotation(config.pitch, config.rotation);
      this.activeNames = config.activeNames;
      Object.entries(this.$refs).forEach(([k, v]) => {
        console.log(k, v.name);
        if (v.configKey == "ToolbarConfig") {
          v.initByConfig(config);
        } else if (v.initByConfig && v.configKey) {
          v.initByConfig(config[v.configKey]);
        }
      });
    },
    async getConfig() {
      let cameraRotation = this._Map.cameraRotation;
      console.log(cameraRotation);

      const config = {
        key: "PageConfig",

        showStopToolbar: this.showStopToolbar,

        showClock: this.showClock,

        showHelpDialog: this.showHelpDialog,

        time: this.time,
        speed: this.speed,
        minTime: this.minTime,
        maxTime: this.maxTime,
        center: this._Map.center,
        zoom: this._Map.zoom,
        rotation: cameraRotation.rotationDeg,
        pitch: cameraRotation.pitchDeg,

        activeNames: this.activeNames,
      };
      for (const [k, v] of Object.entries(this.$refs)) {
        if (v.configKey == "ToolbarConfig") {
          Object.assign(config, await v.exportConfig());
        } else if (v.exportConfig && v.configKey) {
          config[v.configKey] = await v.exportConfig();
        }
      }
      return config;
    },
    // 速度控制
    speedCommand(value) {
      this._speed = value;
      this.speed = value;
    },
    canChangeTimeSpeed() {
      let enableRotate = false;
      if (this.showLayerPublicTransit) enableRotate = true;
      if (this.showLayerMotorizedTravel) enableRotate = true;
      if (this.showLayerBuild3D) enableRotate = true;
      if (this.showLayerNetwork) enableRotate = true;
      if (this.showLayerActivity3D) enableRotate = true;
      if (this.showLayerGeoJSON) enableRotate = true;
      if (this.showLayerCarTravel) enableRotate = true;
      if (this.showLayerParking) enableRotate = true;
      if (this.showLayerTrafficRegionAnalysis) enableRotate = true;
      return enableRotate;
    },
    canChangeMapCameraControls() {
      let enableRotate = true;
      if (this.showLayerPublicTransit && this.lock2DPublicTransit) enableRotate = false;
      if (this.showLayerMotorizedTravel && this.lock2DMotorizedTravel) enableRotate = false;
      if (this.showLayerBuild3D && this.lock2DBuild3D) enableRotate = false;
      if (this.showLayerNetwork && this.lock2DNetwork) enableRotate = false;
      if (this.showLayerActivity3D && this.lock2DActivity3D) enableRotate = false;
      if (this.showLayerGeoJSON && this.lock2DGeoJSON) enableRotate = false;
      if (this.showLayerCarTravel && this.lock2DCarTravel) enableRotate = false;
      if (this.showLayerParking && this.lock2DParking) enableRotate = false;
      if (this.showLayerTrafficRegionAnalysis && this.lock2DTrafficRegionAnalysis) enableRotate = false;
      return enableRotate;
    },
    handleToolbarActiveModel(id) {
      try {
        this.$refs.Toolbar.handleActiveModel(id);
      } catch (error) {}
    },
    handleShowHelp() {
      this.showHelpDialog = true;
    },
    handleUpdateTime(value) {
      this.time = value;
      this.$emit("timeChange", this.time);
    },
    handleChangeTimeSpeed() {},
    handleChangeMapCameraControls() {},
    initMap() {
      this._Map = new MyMap({
        rootId: "mapRoot",
        enableRotate: true,
      });
      this._Map.setFitZoomAndCenterByPoints(this.range);
      if (this.isDev) {
        this._Map.minPitch = -90;
        this._Map.setCenter([12634435.302642914, 2645511.8325935453]);
        this._Map.setZoom(14);
      }

      this._MapLayer = new MapLayer({ tileClass: MAP_LAYER_STYLE[0], zIndex: -1 });
      this._Map.addLayer(this._MapLayer);
    },
    handleShowStopAndRoute(selectStopIds) {
      if (this.$refs.Toolbar) {
        this.$refs.Toolbar.add("StopAndRoute", {
          uuid: guid,
          ids: selectStopIds,
        });
        this.showStopToolbar = true;
      }
    },
    handleShowStopDetailByStopData(stopData) {
      if (this.$refs.Toolbar) {
        this.$refs.Toolbar.add("StopDetail", {
          uuid: stopData.id,
          stopData: stopData,
        });
        this.showStopToolbar = true;
      }
    },
    handleShowRouteDetail(routeId) {
      if (this.$refs.Toolbar) {
        this.$refs.Toolbar.add("RouteDetail", {
          uuid: routeId,
          routeId: routeId,
        });
        this.showStopToolbar = true;
      }
    },
    handleShowRouteDepartures(routeId) {
      if (this.$refs.Toolbar) {
        this.$refs.Toolbar.add("RouteDepartures", {
          uuid: routeId,
          routeId: routeId,
        });
        this.showStopToolbar = true;
      }
    },
    handleShowBusDetail({ uuid, busDetail }) {
      if (this.$refs.Toolbar) {
        this.$refs.Toolbar.add("BusDetail", {
          uuid: uuid,
          busDetail: busDetail,
        });
        this.showStopToolbar = true;
      }
    },
    handleShowSubwayDetail({ uuid, subwayDetail }) {
      if (this.$refs.Toolbar) {
        this.$refs.Toolbar.add("SubwayDetail", {
          uuid: uuid,
          subwayDetail: subwayDetail,
        });
        this.showStopToolbar = true;
      }
    },
    handleShowCarDetail({ uuid, carDetail }) {
      if (this.$refs.Toolbar) {
        this.$refs.Toolbar.add("CarDetail", {
          uuid: uuid,
          carDetail: carDetail,
        });
        this.showStopToolbar = true;
      }
    },
    handleShowCarTravelDetail({ uuid, carDetail }) {
      if (this.$refs.Toolbar) {
        this.$refs.Toolbar.add("CarTravelDetail", {
          uuid: uuid,
          carDetail: carDetail,
        });
        this.showStopToolbar = true;
      }
    },
    handleShowBuildDetail({ uuid, buildDetail }) {
      if (this.$refs.Toolbar) {
        this.$refs.Toolbar.add("BuildDetail", {
          uuid: uuid,
          buildDetail: buildDetail,
        });
        this.showStopToolbar = true;
      }
    },
    handleShowLineDetail({ uuid, lineDetail }) {
      if (this.$refs.Toolbar) {
        this.$refs.Toolbar.add("LineDetail", {
          uuid: uuid,
          lineDetail: lineDetail,
        });
        this.showStopToolbar = true;
      }
    },
    handleShowNodeDetail({ uuid, nodeDetail }) {
      if (this.$refs.Toolbar) {
        this.$refs.Toolbar.add("NodeDetail", {
          uuid: uuid,
          nodeDetail: nodeDetail,
        });
        this.showStopToolbar = true;
      }
    },
    handleShowSelectLinkAnalysis({ uuid, lineDetail }) {
      if (this.$refs.Toolbar) {
        this.$refs.Toolbar.add("SelectLinkAnalysis", {
          uuid: uuid,
          lineDetail: lineDetail,
        });
        this.showStopToolbar = true;
      }
    },
    handleShowSelectBuildAnalysis({ uuid, buildDetail }) {
      if (this.$refs.Toolbar) {
        this.$refs.Toolbar.add("SelectBuildAnalysis", {
          uuid: uuid,
          buildDetail: buildDetail,
        });
        this.showStopToolbar = true;
      }
    },
    handleShowActivityDetail({ uuid, activityDetail }) {
      if (this.$refs.Toolbar) {
        this.$refs.Toolbar.add("ActivityDetail", {
          uuid: uuid,
          activityDetail: activityDetail,
        });
        this.showStopToolbar = true;
      }
    },
    handleShowParkingActivityDetail({ uuid, activityDetail }) {
      if (this.$refs.Toolbar) {
        this.$refs.Toolbar.add("ParkingActivityDetail", {
          uuid: uuid,
          activityDetail: activityDetail,
        });
        this.showStopToolbar = true;
      }
    },
    handleShowPolgonParkingDetail({ uuid, polgonParkingDetail }) {
      if (this.$refs.Toolbar) {
        this.$refs.Toolbar.add("PolgonParkingDetail", {
          uuid: uuid,
          polgonParkingDetail: polgonParkingDetail,
        });
        this.showStopToolbar = true;
      }
    },
    handleClearGeoJSON() {
      try {
        this.GeoJSONList = [];
        this.$refs.Toolbar.GeoJSON.activeName = [];
      } catch (error) {}
    },
    handleAddGeoJSON(GeoJSON, open) {
      try {
        this.GeoJSONList.push(GeoJSON);
        this.$refs.Toolbar.GeoJSON.activeName.push(GeoJSON.id);
        if (open) {
          this.$refs.Toolbar.handleActiveModel("GeoJSON");
        }
      } catch (error) {
        console.log(error);
      }
    },
    handleShowSinglePathDetail({ uuid, singlePathDetail }) {
      if (this.$refs.Toolbar) {
        this.$refs.Toolbar.add("SinglePathDetail", {
          uuid: uuid,
          singlePathDetail: singlePathDetail,
        });
        this.showStopToolbar = true;
      }
    },
    handleShowMultiplePathsDetail({ uuid, multiplePathsDetail }) {
      if (this.$refs.Toolbar) {
        this.$refs.Toolbar.add("MultiplePathsDetail", {
          uuid: uuid,
          multiplePathsDetail: multiplePathsDetail,
        });
        this.showStopToolbar = true;
      }
    },
  },
};
