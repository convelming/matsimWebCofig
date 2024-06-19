
import { Map, LocalMapLayer } from "@/mymap/index.js";

export default {
  watch: {
  },

  data() {
    return {
      loading: false,
      _Map: null,
      _MapLayer: null,
      activeNames: ["PublicTransit", "MotorizedTravel", "Build3D", "Network", "Activity3D", "GeoJSON"],

      showLayerPublicTransit: false,
      showLayerMotorizedTravel: false,
      showLayerBuild3D: false,
      showLayerNetwork: false,
      showLayerActivity3D: false,
      showLayerGeoJSON: false,

      showStopToolbar: false,

      showClock: true,

      showHelpDialog: false,

      timePlay: true,
      time: 0,
      speed: 0,
      minTime: 0,
      maxTime: 3600 * 28,
    };
  },
  watch: {
    showLayerPublicTransit(val) {
      this.handleChangeMapCameraControls();
    },
    showLayerMotorizedTravel(val) {
      // if (val) {
      //   this.timePlay = true;
      //   this.speed = 5;
      // } else {
      //   this.timePlay = false;
      //   this.speed = 0;
      // }
      this.handleChangeMapCameraControls();
    },
    showLayerBuild3D(val) {
      this.handleChangeMapCameraControls();
    },
    showLayerNetwork(val) {
      this.handleChangeMapCameraControls();
    },
    showLayerActivity3D(val) {
      this.handleChangeMapCameraControls();
    },
    showLayerGeoJSON(val) {
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
    this.initLayer();
    this.initMap();
    this.handleChangeMapCameraControls();
  },
  beforeDestroy() {
  },
  methods: {
    handleShowHelp() {
      console.log("handleShowHelp");
      this.showHelpDialog = true;
    },
    handleUpdateTime(value) {
      this.time = value;
      this.$emit("timeChange", this.time);
    },
    handleChangeMapCameraControls() {
      let enableRotate = true;
      if (this.showLayerPublicTransit) enableRotate = false;
      if (enableRotate) {
        this._Map.enableRotate = true;
      } else {
        this._Map.enableRotate = false;
        this._Map.setPitchAndRotation(90, 0);
      }
    },
    initMap() {
      this._Map = new Map({
        rootId: "mapRoot",
        zoom: 11,
        enableRotate: true,
        zoom: 16,
        // minPitch: -90,
        center: [12636623.734089389443398, 2642681.88545402046293],
      });
      this._Map.addLayer(this._MapLayer);
      window._Map = this._Map;
    },
    initLayer() {
      this._MapLayer = new LocalMapLayer({ zIndex: -1 });
    },
    handleShowStopAndRoute(selectStopIds) {
      if (this.$refs.Toolbar) {
        this.$refs.Toolbar.add("StopAndRoute", {
          ids: selectStopIds,
        });
        this.showStopToolbar = true;
      }
    },
    handleShowStopDetailByStopId(stopId) {
      if (this.$refs.Toolbar) {
        this.$refs.Toolbar.add("StopDetail", {
          stopId: stopId,
        });
        this.showStopToolbar = true;
      }
    },
    handleShowStopDetailByStopData(stopData) {
      if (this.$refs.Toolbar) {
        this.$refs.Toolbar.add("StopDetail", {
          stopData: stopData,
        });
        this.showStopToolbar = true;
      }
    },
    handleShowRouteDetail(routeId) {
      if (this.$refs.Toolbar) {
        this.$refs.Toolbar.add("RouteDetail", {
          routeId: routeId,
        });
        this.showStopToolbar = true;
      }
    },
    handleShowRouteDepartures(routeId) {
      if (this.$refs.Toolbar) {
        this.$refs.Toolbar.add("RouteDepartures", {
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
  },
};