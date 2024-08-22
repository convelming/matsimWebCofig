
import { MyMap, MapLayer, MAP_LAYER_STYLE } from "@/mymap/index.js";
import { getTimeInterval, getCenterZoom } from "@/api/index.js";
import { guid } from "@/utils/index.js";

export default {
  watch: {
  },

  data() {
    return {
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
      parkingGeoJSON: { geoId: "9c5791a5-e5ce-4637-9731-7664cc53cea3" },

      showStopToolbar: true,

      showClock: true,

      showHelpDialog: false,

      time: 3600 * 8 - 360,
      speed: 0,
      minTime: 0,
      maxTime: 3600 * 24.5,
      range: [],
      center: [0, 0],

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
    Promise.all([
      getTimeInterval(),
      getCenterZoom()
    ]).then(([timeRes, rangeRes]) => {
      // this.minTime = timeRes.data.minTime;
      // this.maxTime = timeRes.data.maxTime;
      this.range = rangeRes.data.range.map(v => [v.x, v.y]);
      this.center = [rangeRes.data.center.x, rangeRes.data.center.y];

      this.initMap();
      this.handleChangeMapCameraControls();
    })
  },
  beforeDestroy() {
  },
  methods: {
    handleToolbarActiveModel(id) {
      try {
        this.$refs.Toolbar.handleActiveModel(id);
      } catch (error) {

      }
    },
    handleShowHelp() {
      this.showHelpDialog = true;
    },
    handleUpdateTime(value) {
      this.time = value;
      this.$emit("timeChange", this.time);
    },
    handleChangeTimeSpeed() {
    },
    handleChangeMapCameraControls() {
    },
    initMap() {
      this._Map = new MyMap({
        rootId: "mapRoot",
        enableRotate: true,
      });
      // this._Map.setFitZoomAndCenterByPoints(this.range);

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
  },
};