// {
//   type: "RouteDetail",
//   data: {
//     uuid: "38e4047c-7a67-4c49-9e3b-cb40a22d8bd3",
//     routeId: "",
//   },
//   config: {},
//   name: "38e4047c-7a67-4c49-9e3b-cb40a22d8bd3",
// },

export default {
  publicTransitConfig: {
    showLayer: false,
    stopColor: "#2656C6",
    stopScale: 2,
    selectStop: false,
  },
  publicTransitToolvar: [
    {
      type: "RouteDetail",
      data: {
        uuid: "38e4047c-7a67-4c49-9e3b-cb40a22d8bd3",
        routeId: "",
      },
      config: {
        show: false,
        showTransitLines: true,
        transitLinesColor: "#ffd700",

        showReachableStops: true,
        reachableStopsColor: "#ffd700",
      },
      name: "38e4047c-7a67-4c49-9e3b-cb40a22d8bd3",
    },
    {
      type: "StopAndRoute",
      data: {
        uuid: "38e4047c-7a67-4c49-9e3b-cb40a22d8bd3",
        ids: [],
      },
      config: {
        show: false,
        stopColor: "#ffd700",
      },
      name: "38e4047c-7a67-4c49-9e3b-cb40a22d8bd3",
    },
    {
      type: "StopDetail",
      data: {
        uuid: "38e4047c-7a67-4c49-9e3b-cb40a22d8bd3",
        stopData: {},
      },
      config: {},
      name: "38e4047c-7a67-4c49-9e3b-cb40a22d8bd3",
    },
    {
      type: "RouteDepartures",
      data: {
        uuid: "38e4047c-7a67-4c49-9e3b-cb40a22d8bd3",
        routeId: "",
      },
      config: {},
      name: "38e4047c-7a67-4c49-9e3b-cb40a22d8bd3",
    },
  ],

  motorizedTravelConfig: {
    showLayer: false,
    lockSelectVehicle: true,
    showBus3DLayer: true,
    showSubway3DLayer: true,
    maxVehicleNum: 20000,
    modelSize: 3,
  },
  carTravelConfig: {
    showLayer: false,
    lockSelectVehicle: true,
    showBus3DLayer: true,
    showSubway3DLayer: true,
    showCar3DLayer: true,
    maxVehicleNum: 20000,
    modelSize: 3,
  },
  motorizedTravelToolvar: [
    {
      type: "CarDetail",
      data: {
        uuid: "38e4047c-7a67-4c49-9e3b-cb40a22d8bd3",
        carDetail: {},
      },
      config: {},
      name: "38e4047c-7a67-4c49-9e3b-cb40a22d8bd3",
    },
    {
      type: "BusDetail",
      data: {
        uuid: "38e4047c-7a67-4c49-9e3b-cb40a22d8bd3",
        busDetail: {},
      },
      config: {},
      name: "38e4047c-7a67-4c49-9e3b-cb40a22d8bd3",
    },
    {
      type: "SubwayDetail",
      data: {
        uuid: "38e4047c-7a67-4c49-9e3b-cb40a22d8bd3",
        subwayDetail: {},
      },
      config: {},
      name: "38e4047c-7a67-4c49-9e3b-cb40a22d8bd3",
    },
    {
      type: "CarTravelDetail",
      data: {
        uuid: "38e4047c-7a67-4c49-9e3b-cb40a22d8bd3",
        carDetail: {},
      },
      config: {},
      name: "38e4047c-7a67-4c49-9e3b-cb40a22d8bd3",
    },
  ],

  build3DConfig: {
    showLayer: false,
    buildColor: "#838385",
    buildOpacity: 80,
  },
  build3DConfig: [
    {
      type: "BuildDetail",
      data: {
        uuid: "38e4047c-7a67-4c49-9e3b-cb40a22d8bd3",
        buildDetail: {},
      },
      config: {},
      name: "38e4047c-7a67-4c49-9e3b-cb40a22d8bd3",
    },
  ],

  networkConfig: {
    showLayer: false,
    colors: 0,
    width: 1,
    videoIconWidth: 10,
    offset: 0,
    color: "#E9CDAA",
    showNode: false,
    showVideoIcon: false,
  },
  networkToolvar: [
    {
      type: "LineDetail",
      data: {
        uuid: "38e4047c-7a67-4c49-9e3b-cb40a22d8bd3",
        lineDetail: {},
      },
      config: {},
      name: "38e4047c-7a67-4c49-9e3b-cb40a22d8bd3",
    },
    {
      type: "NodeDetail",
      data: {
        uuid: "38e4047c-7a67-4c49-9e3b-cb40a22d8bd3",
        nodeDetail: {},
      },
      config: {},
      name: "38e4047c-7a67-4c49-9e3b-cb40a22d8bd3",
    },
    {
      type: "SelectLinkAnalysis",
      data: {
        uuid: "38e4047c-7a67-4c49-9e3b-cb40a22d8bd3",
        lineDetail: {},
      },
      config: {},
      name: "38e4047c-7a67-4c49-9e3b-cb40a22d8bd3",
    },
  ],

  activity3DConfig: {
    showLayer: false,
    color: "#5470c6",
    scale: 1,
    maxNum: 10000,
    showColorTypeTable: false,
    colorType: "activity",
    activityTypeList: [{ name: "", color: "" }],
    legTypeList: [{ name: "", color: "" }],
  },
  activity3DToolvar: [
    {
      type: "ActivityDetail",
      data: {
        uuid: "38e4047c-7a67-4c49-9e3b-cb40a22d8bd3",
        activityDetail: {},
      },
      config: {},
      name: "38e4047c-7a67-4c49-9e3b-cb40a22d8bd3",
    },
  ],

  geoJSONConfig: {
    showLayer: false,
  },
  geoJSONList: [
    {
      id: "uuid",
      _file: new File(),
      name: new File().name,
      show: true,
    },
  ],

  parkingGeoJSON: {
    id: "uuid",
    _file: new File(),
    name: new File().name,
    show: true,
  },
  parkingConfig: {
    showLayer: false,
    color: "#5470c6",
    scale: 1,
    maxNum: 10000,
    showColorTypeTable: false,
    colorType: "activity",
    activityTypeList: [{ name: "", color: "" }],
    legTypeList: [{ name: "", color: "" }],
  },
  parkingToolvar: [
    {
      type: "PolgonParkingDetail",
      data: {
        uuid: "38e4047c-7a67-4c49-9e3b-cb40a22d8bd3",
        polgonParkingDetail: {},
      },
      config: {},
      name: "38e4047c-7a67-4c49-9e3b-cb40a22d8bd3",
    },
    {
      type: "ParkingActivityDetail",
      data: {
        uuid: "38e4047c-7a67-4c49-9e3b-cb40a22d8bd3",
        activityDetail: {},
      },
      config: {},
      name: "38e4047c-7a67-4c49-9e3b-cb40a22d8bd3",
    },
  ],

  trafficRegionAnalysisConfig: {
    showLayer: false,
  },
  parkingToolvar: [
    {
      type: "MultiplePathsDetail",
      data: {
        uuid: "38e4047c-7a67-4c49-9e3b-cb40a22d8bd3",
        multiplePathsDetail: {},
      },
      config: {},
      name: "38e4047c-7a67-4c49-9e3b-cb40a22d8bd3",
    },
    {
      type: "SinglePathDetail",
      data: {
        uuid: "38e4047c-7a67-4c49-9e3b-cb40a22d8bd3",
        singlePathDetail: {},
      },
      config: {},
      name: "38e4047c-7a67-4c49-9e3b-cb40a22d8bd3",
    },
  ],

  activeNames: [],
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
