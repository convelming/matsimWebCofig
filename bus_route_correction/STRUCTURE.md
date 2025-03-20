### 项目结构

```
|   babel.config.js                                             /* babel(js版本兼容库) 配置文件 */
|   jsconfig.json                                               /* 公交线路修正数据 */
|   package-lock.json                                           /* 项目依赖包信息 */
|   package.json                                                /* 项目依赖包信息 */
|   vue.config.js                                               /* 项目配置文件 */
|   yarn.lock                                                   /* 项目依赖包信息 */
|
+---public                                                      /* 静态文件目录（项目运行和打包时都不会编译当前目录的文件） */
|   |   config.js                                               /* 项目配置文件 */
|   |   favicon.ico                                             /* 项目图标 */
|   |   index.html                                              /* 项目入口编译模板文件 */
|   |
|   \---models                                                  /* 3D 模型文件目录 */
|
\---src
    |   App.vue                                                 /* vue根节点 */
    |   main.js                                                 /* vue 启动入口文件 */
    +---api                                                     /* api接口目录 */
    |
    +---assets                                                  /* 静态资源目录（项目运行和打包时会编译当前目录的文件） */
    |
    +---components                                              /* 全局通用组件目录 */
    |   |   ColorPicker.vue                                     /* 单个颜色选择器 */
    |   |   ColorSelect.vue                                     /* 渐变颜色选择器 */
    |   |   Dialog.vue                                          /* 弹窗组件（可拖动） */
    |   |   Pagination.vue                                      /* 分页组件 */
    |   |   RouteSelect.vue                                     /* 线路选择器 */
    |   |   Tags.vue                                            /* 可增加标签组件 */
    |   |   TimeRangeSlider.vue                                 /* 时间范围滑块 */
    |   |   TimeSlider.vue                                      /* 时间滑块 */
    |   |
    |   +---Clock                                               /* 时钟组件（已弃用） */
    |   |
    |   +---Drawer                                              /* 抽屉组件 */
    |   |
    |   +---NewClock                                            /* 新的时钟组件 */
    |   |   |   Bug.vue                                         /* bug按钮 */
    |   |   |   Help.vue                                        /* 帮助按钮 */
    |   |   |   index.vue
    |   |   |   Language.vue                                    /* 语言选择按钮 */
    |   |   |   Luopan.vue                                      /* 轮盘组件（显示地图方向） */
    |   |   |   MapStyle.vue                                    /* 切换地图样式按钮 */
    |   |   |   TimeSlider.vue                                  /* 时间滑块 */
    |   |   |
    |   |   \---images                                          /* 新的时钟组件图片文件夹 */
    |   |
    |   \---vue-codemirror                                      /* 代码编辑器组件（文本对比控件） */
    |           formatting.js
    |           index.vue
    |
    +---language                                                /* 国际化组件 */
    |       base_lanuage_dict.json                              /* 基础语言字典 */
    |       index.js
    |       loader.js
    |       README.md                                           /* 使用方法 */
    |
    +---mymap                                                   /* 地图核心库 */
    |   |   index.js                                            /* 地图核心类统一导出文件 */
    |   |
    |   +---composer                                            /* three 后期处理封装 */
    |   |       BloomComposer.js                                /* 泛光效果 */
    |   |
    |   +---geometry                                            /* three 几何体封装 */
    |   |
    |   +---layers                                              /* 地图图层 */
    |   |       MapLayer.js                                     /* 地图瓦片图层 */
    |   |       OutlineLayer.js                                 /* 带呼吸效果的图层 */
    |   |       WeatherLayer.js                                 /* 天气图层（未完成） */
    |   |
    |   +---main
    |   |       EventListener.js                                /* 事件监听器 */
    |   |       Layer.js                                        /* 地图图层基类 */
    |   |       MyMap.js                                        /* 地图核心类 */
    |   |
    |   +---material
    |   |       Line2DMaterial.js                               /* 线段材质 */
    |   |
    |   \---utils
    |           ColorBar2D.js                                   /* 颜色条 */
    |           index.js                                        /* 工具类 */
    |           LngLatUtils.js                                  /* 经纬度工具类 */
    |           ModelPool.js                                    /* 模型池 */
    |
    +---router                                                  /* 路由配置 */
    |       index.js
    |
    +---store                                                    /* vuex 状态管理 */
    |   |   index.js
    |   |
    |   \---modules
    |           datasource.js                                   /* 数据源 */
    |
    +---utils                                                   /* 工具类 */
    |       Bean.js                                             /* 公交线路修改模块相关的一些数据Bean类 */
    |       cache.js                                            /* 缓存工具类 */
    |       check.js                                            /* 数据验证工具类 */
    |       colors.js                                           /* 颜色工具类 */
    |       index.js                                            /* 工具类 */
    |       OSS.js                                              /* 阿里云OSS工具类 */
    |       request.js                                          /* 请求工具类 */
    |       utils.js                                            /* 工具类 */
    |
    \---views
        |   index.vue                                           /* 主页 */
        |
        +---comparativeAnalysis                                 /* 对比分析 */
        |   |   index.vue                                       /* 对比分析主页 */
        |   |
        |   \---component                                       /* 对比分析组件 */
        |       +---AnalysisReport                              /* 公交出行影响对比分析报告功能模块 */
        |       |   |   index.vue                               /* 左侧工具控件 */
        |       |   |
        |       |   +---dialog
        |       |   |   +---ActivityAttributes                  /* 活动属性 */
        |       |   |   |       ResidenceTime.vue               /* 停留时间弹窗 */
        |       |   |   |       TravelMode.vue                  /* 出行方式弹窗 */
        |       |   |   |       TravelPurpose.vue               /* 出行目的弹窗 */
        |       |   |   |       TravelTime.vue                  /* 出行时间弹窗 */
        |       |   |   |
        |       |   |   +---TravelAttribute                     /* 出行属性弹窗 */
        |       |   |   |       index.vue
        |       |   |   |
        |       |   |   +---TravelerAttributes                  /* 出行者属性 */
        |       |   |   |       TravelersAge.vue                /* 出行者年龄弹窗 */
        |       |   |   |       TravelersCarAvailability.vue    /* 出行者车辆可使用情况弹窗 */
        |       |   |   |       TravelersCarLicense.vue         /* 出行者机动车保有量弹窗 */
        |       |   |   |       TravelersEmployed.vue           /* 出行者就业情况弹窗 */
        |       |   |   |       TravelersSex.vue                /* 出行者性别弹窗 */
        |       |   |   |
        |       |   |   +---TravelUtilityTree                   /* 出行效用决策树弹窗 */
        |       |   |   |       index.json                      /* 决策树结构json */
        |       |   |   |       index.vue
        |       |   |   |
        |       |   |   \---TravelVariationTree                 /* 出行变化决策树弹窗 */
        |       |   |           index.json                      /* 决策树结构json */
        |       |   |           index.vue
        |       |   |
        |       |   \---toolbar                                 /* 右侧工具控件 */
        |       |           ReportToolbar.vue                   /* 公交出行影响对比分析报告控件 */
        |       |
        |       +---HelpDialog                                  /* 帮助弹窗 */
        |       |
        |       +---LinesAnalysis                               /* 公交出行影响对比分析功能模块 */
        |       |   |   index.vue                               /* 左侧工具控件 */
        |       |   |
        |       |   +---dialog
        |       |   |   +---PassengerFlowDialog                 /* 客流变化弹窗 */
        |       |   |   |       index.vue
        |       |   |   |       PassengersEnteringLeaving.vue   /* 乘客进出图表 */
        |       |   |   |       RouteAttributes.vue             /* 路线属性图表 */
        |       |   |   |       RouteFlows.vue                  /* 路线流量图表 */
        |       |   |   |       RouteTimeDiagram.vue            /* 路线时间图时间 */
        |       |   |   |
        |       |   |   +---RoutesChangeDialog                  /* 线路变动信息弹窗 */
        |       |   |   |       index.vue
        |       |   |   |
        |       |   |   +---StopsChangeDialog                   /* 站点变动信息弹窗 */
        |       |   |   |       index copy.vue
        |       |   |   |       index.vue
        |       |   |   |
        |       |   |   +---TimetableDialog                     /* 时刻表对比弹窗 */
        |       |   |   |       index.vue
        |       |   |   |
        |       |   |   \---XmlComparisonDialog                 /* XML对比弹窗 */
        |       |   |           index.vue
        |       |   |
        |       |   +---layer                                   /* 地图图层文件夹 */
        |       |   |       BusLineLayer.js                     /* 单条公交线路图层 */
        |       |   |       BusLineListLayer.js                 /* 多条公交线路图层 */
        |       |   |       BusStopLayer.js                     /* 单个公交站点图层 */
        |       |   |       BusStopListLayer.js                 /* 多个公交站点图层 */
        |       |   |       RouteFlowsLayer.js                  /* l公交线路流量图层 */
        |       |   |
        |       |   \---toolbar                                 /* 右侧工具控件 */
        |       |           LinesChangeInfo.vue                 /* 线路比对分析控件 */
        |       |           RouteFlows.vue                      /* 公交线路流量控件 */
        |       |
        |       \---Toolbar                                     /* 右侧功能模块根节点 */
        |               index.vue
        |
        +---operationsAnalysis                                  /* MATSim webViz */
        |   |   index.vue                                       /* MATSim webViz主页 */
        |   |   mixins.js                                       /* MATSim webViz和方案对比分析主页共用代码（使用vue的混入功能实现代码共用） */
        |   |
        |   +---component
        |   |   +---Activity3D                                  /* 3D活动模块 */
        |   |   |   |   index.vue                               /* 左侧工具控件 */
        |   |   |   |
        |   |   |   +---layer                                   /* 地图图层文件夹 */
        |   |   |   |       Activity3DLayer.js                  /* 3D活动图层 */
        |   |   |   |       ActivityRoutesLayer.js              /* 3D活动线路图层 */
        |   |   |   |       SelectActivityLayer.js              /* 3D活动选择图层 */
        |   |   |   |
        |   |   |   +---toolbar                                 /* 右侧工具控件 */
        |   |   |   |       ActivityDetail.vue                  /* 3D活动详情 */
        |   |   |   |
        |   |   |   \---worker                                  /* web worker 多线程 */
        |   |   |           Activity3DLayer.worker.js           /* 3D活动图层多线程处理数据js */
        |   |   |
        |   |   +---Build3D                                     /* 3D建筑物 */
        |   |   |   |   index.vue                               /* 左侧工具控件 */
        |   |   |   |
        |   |   |   +---dialog                                  /* 弹窗 */
        |   |   |   +---layer                                   /* 地图图层文件夹 */
        |   |   |   |       Build3DLayer.js                     /* 3D建筑物图层 */
        |   |   |   |       BuildFlowLayer.js                   /* 3D建筑物流量图层 */
        |   |   |   |       SelectBuild3DLayer.js               /* 3D建筑物选择图层 */
        |   |   |   |
        |   |   |   \---toolbar                                 /* 右侧工具控件 */
        |   |   |           buildDetail.vue                     /* 3D建筑物详情 */
        |   |   |           selectBuildAnalysis.vue             /* 3D建筑物流量分析 */
        |   |   |           sreachBuild.vue                     /* 3D建筑物搜索 */
        |   |   |
        |   |   +---CarTravel                                   /* 私家车出行 */
        |   |   |   |   index.vue                               /* 左侧工具控件 */
        |   |   |   |   utils.js                                /* 私家车出行工具类 */
        |   |   |   |
        |   |   |   +---layer                                   /* 地图图层文件夹 */
        |   |   |   |       CarTravelLayer.js                   /* 私家车出行图层（小） */
        |   |   |   |       CarTravelLayer2.js                  /* 私家车出行图层（中） */
        |   |   |   |       CarTravelLayer3.js                  /* 私家车出行图层（大） */
        |   |   |   |       CarTravelLayer4.js                  /* 测试图层 */
        |   |   |   |
        |   |   |   +---toolbar                                 /* 右侧工具控件 */
        |   |   |   |       carTravelDetail.vue                 /* 私家车出行详情 */
        |   |   |   |
        |   |   |   \---worker                                  /* web worker 多线程 */
        |   |   |           CarTravelLayer.worker.js            /* 私家车出行图层多线程处理数据js */
        |   |   |
        |   |   +---GeoJSON                                     /* GeoJSON */
        |   |   |   |   index.vue                               /* 左侧工具控件 */
        |   |   |   |
        |   |   |   +---toolbar                                 /* 右侧工具控件 */
        |   |   |   |       geoJSONDetail.vue                   /* GeoJSON样式调整控件 */
        |   |   |   |
        |   |   |   +---worker                                 /* 右侧工具控件 */
        |   |   |   |       GeoJSONLayer.worker.js              /* GeoJSON图层多线程处理数据js */
        |   |   |   |
        |   |   |   \---layer                                   /* 地图图层文件夹 */
        |   |   |           GeoJSONLayer.js                     /* GeoJSON图层 */
        |   |   |
        |   |   +---HelpDialog                                  /* 帮助弹窗 */
        |   |   |
        |   |   +---MotorizedTravel                             /* 公共交通出行 */
        |   |   |   |   index.vue                               /* 左侧工具控件 */
        |   |   |   |   utils.js                                /* 公共交通出行工具类 */
        |   |   |   |
        |   |   |   +---layer                                   /* 地图图层文件夹 */
        |   |   |   |       BusMotionLayer.js                   /* 公交出行图层 */
        |   |   |   |       SubwayMotionLayer.js                /* 地铁出行图层 */
        |   |   |   |       CarMotionLayer.js                   /* 私家车出行图层（已弃用） */
        |   |   |   |       SelectBusMotionLayer.js             /* 已选择公交出行图层（暂未完成，功能在对应的出行图层实现） */
        |   |   |   |       SelectSubwayMotionLayer.js          /* 已选择地铁出行图层（暂未完成，功能在对应的出行图层实现） */
        |   |   |   |       SelectCarMotionLayer.js             /* 已选择私家车出行图层（暂未完成，功能在对应的出行图层实现） */
        |   |   |   |
        |   |   |   +---toolbar                                 /* 右侧工具控件 */
        |   |   |   |       busDetail.vue                       /* 公交出行详情 */
        |   |   |   |       carDetail.vue                       /* 私家车出行详情（已弃用） */
        |   |   |   |       subwayDetail.vue                    /* 地铁出行详情 */
        |   |   |   |
        |   |   |   \---worker                                  /* web worker 多线程 */
        |   |   |           BusMotionLayer.worker.js            /* 公交出行图层多线程处理数据js */
        |   |   |           CarMotionLayer.worker.js            /* 私家车出行图层多线程处理数据js（已弃用） */
        |   |   |           SubwayMotionLayer.worker.js         /* 地铁出行图层多线程处理数据js */
        |   |   |
        |   |   +---Network                                     /* 路网 */
        |   |   |   |   index.vue                               /* 左侧工具控件 */
        |   |   |   |
        |   |   |   +---dialog                                  /* 弹窗 */
        |   |   |   |       IntersectionFlows.vue               /* 节点流量分析 */
        |   |   |   |       LinkVolumes.vue                     /* Link流量分析 */
        |   |   |   |
        |   |   |   +---layer                                   /* 地图图层文件夹 */
        |   |   |   |       LinkFlowLayer.js                    /* Link流量分析图层 */
        |   |   |   |       NetworkLayer.js                     /* 路网图层 */
        |   |   |   |       SelectLineLayer.js                  /* 已选择Link图层 */
        |   |   |   |       SelectNodeLayer.js                  /* 已选择节点图层 */
        |   |   |   |
        |   |   |   +---menu                                    /* 地图右键菜单 */
        |   |   |   |       Line.vue                            /* Link的地图右键菜单 */
        |   |   |   |       Node.vue                            /* Node的地图右键菜单 */
        |   |   |   |
        |   |   |   \---toolbar                                 /* 右侧工具控件 */
        |   |   |           lineDetail.vue                      /* Link详情 */
        |   |   |           nodeDetail.vue                      /* Node详情 */
        |   |   |           selectLinkAnalysis.vue              /* Link流量分析详情 */
        |   |   |           sreachLineNode.vue                  /* Link和Node搜索 */
        |   |   |
        |   |   +---Parking                                     /* 停车 */
        |   |   |   |   index.vue                               /* 左侧工具控件 */
        |   |   |   |
        |   |   |   +---layer                                   /* 地图图层文件夹 */
        |   |   |   |       PolygonSelectLayer.js               /* 多边形划定选择图层 */
        |   |   |   |
        |   |   |   \---toolbar                                 /* 右侧工具控件 */
        |   |   |           PolgonParkingDetail.vue             /* 多边形划定停车详情 */
        |   |   |           ParkingActivityDetail.vue           /* 停车活动详情 */
        |   |   |           ParkingGeoJSONDetail.vue            /* 停车GsoJSON详情 */
        |   |   |
        |   |   +---PublicTransit                               /* 公交轨道站点 */
        |   |   |   |   enum.js                                 /* 公交轨道站点枚举 */
        |   |   |   |   index.vue                               /* 左侧工具控件 */
        |   |   |   |
        |   |   |   +---dialog                                  /* 弹窗 */
        |   |   |   |   +---PassengersAtStop                    /* 停靠站点的乘客弹窗 */
        |   |   |   |   |       index.vue
        |   |   |   |   |
        |   |   |   |   +---Transfers                           /* 换乘信息弹窗 */
        |   |   |   |   |       index.vue
        |   |   |   |   |
        |   |   |   |   +---TransitRoutesInfo                   /* 线路信息弹窗 */
        |   |   |   |   |       AggregatedVehicleLoad.vue       /* Aggregated Vehicle Load图表 */
        |   |   |   |   |       index.vue
        |   |   |   |   |       PassengersEnteringLeaving.vue   /* Passengers Entering / Leaving图表 */
        |   |   |   |   |       RouteFlows.vue                  /* Route Flows图表 */
        |   |   |   |   |       RouteGrid.vue                   /* Route Grid图表 */
        |   |   |   |   |       RouteTimeDiagram.vue            /* oute-Time Diagram图表 */
        |   |   |   |   |       VehicleLoad.vue                 /* Vehicle Load图表 */
        |   |   |   |   |
        |   |   |   |   \---TransitStopLoad                     /* 停靠站点的乘客弹窗 */
        |   |   |   |           index.vue
        |   |   |   |
        |   |   |   +---layer                                   /* 地图图层文件夹 */
        |   |   |   |       LinkLayer.js                        /* Link图层（没有使用） */
        |   |   |   |       ReachableStopsLayer.js              /* 可达站点图层 */
        |   |   |   |       SelectStopLayer.js                  /* 已选择停靠站点图层 */
        |   |   |   |       StopsLayer.js                       /* 停靠站点图层 */
        |   |   |   |       TransitLinesLayer.js                /* 公交轨道线路图层 */
        |   |   |   |
        |   |   |   +---menu                                    /* 地图右键菜单 */
        |   |   |   |       Route.vue                           /* Route的地图右键菜单 */
        |   |   |   |       Stop.vue                            /* Stop的地图右键菜单 */
        |   |   |   |
        |   |   |   \---toolbar                                 /* 右侧工具控件 */
        |   |   |           routeDepartures.vue
        |   |   |           routeDetail.vue                     /* Route详情 */
        |   |   |           sreachStopRoute.vue                 /* Stop和Route搜索 */
        |   |   |           stopAndRoute.vue                    /* Stop和Route详情 */
        |   |   |           stopDetail.vue                      /* Stop详情 */
        |   |   |
        |   |   \---Toolbar                                     /* 右侧功能模块根节点 */
        |   |           index.vue
        |   |
        |   \---config                                          /* 运行配置模块 */
        |       |   index.vue
        |       |
        |       \---v15                                         /* MATSim v15 运行配置 */
        |           |   ConfigBodyer.vue                        /* 运行配置模块页面主体 */
        |           |   utils.js                                /* 运行配置工具函数 */
        |           |
        |           +---Editor                                  /* 运行配置模块XML编辑器 */
        |           |       index.vue
        |           |
        |           +---Item                                    /* 运行配置模块对应配置的控件 */
        |           |
        |           \---样式                                    /* 运行配置模块样式参考文件（不参与项目运行和打包） */
        |
        +---planAdjustment                                      /* 公交路线调整 */
        |   |   index.vue                                       /* 公交路线调整主页 */
        |   |
        |   +---component                                       /* 公交路线调整控件 */
        |   |   |   BMapBox.vue                                 /* 百度地图控件 */
        |   |   |   RouteSelect.vue                             /* 路线选择控件 */
        |   |   |   StartEdit.vue                               /* 发车信息编辑弹窗 */
        |   |   |   StopsEdit.vue                               /* 编辑站点弹窗 */
        |   |   |   StopsRoutesEdit.vue                         /* 编辑路径弹窗 */
        |   |   |   StopsRoutesSelect.vue                       /* 选择路径控件（已弃用） */
        |   |   |
        |   |   \---HelpDialog                                  /* 帮助弹窗 */
        |   |
        |   +---layer                                           /* 地图图层文件夹 */
        |   |       BusLinkLayer.js                             /* 公交轨道线路图层 */
        |   |       BusRouteLinkLayer.js                        /* 公交路径图层（站点间路径） */
        |   |       BusStopLayer.js                             /* 公交轨道站点图层 */
        |   |       GuangZhouLayer.js                           /* 广州边界图层 */
        |   |       NetworkLayer.js                             /* 路网图层 */
        |   |       NetworkLineLayer.js                         /* 路网Line图层 */
        |   |       StopsLayer.js                               /* 停靠站点图层 */
        |   |
        |   \---worker                                          /* web worker 多线程 */
        |           NetworkLayer.worker.js                      /* NetworkLayer图层多线程处理数据js */
        |
        +---systemEvaluation                                    /* 公交系统评估 （已弃用） */
        |
        \---test                                                /* 测试模块 */
```
