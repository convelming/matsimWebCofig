# road_traffic_survey — 道路交通调查 3D 可视化系统（Vue 2 版）

基于 **Vue 2.7 + Vue CLI 5 + Three.js 0.149** 的道路交通流量调查、交叉口数据采集、无人机航拍可视化、低空 UAM 展示及 GeoTIFF / NetCDF 数据分析综合平台。涵盖 17 种独立 3D 演示页面（含无人机航路、风场、类鸟群、GeoJSON 立柱、鸟群 GPGPU、GoView 嵌入、数据包动态加载等）和主系统调查页面（路段流量 / 交叉口流量 / 图片上传 / 交评出图）。

---

## 项目简介

road_traffic_survey 是一套面向交通调查业务的 3D 可视化与数据采集平台，主要解决：

1. **道路交通调查主系统**（[home2/index.vue](file:///d:/JINHUA/project/matsimWebCofig/road_traffic_survey/src/views/home2/index.vue)）：
   - 地图底图切换 + 定位（路段搜索 / LinkId 搜索 / 中心坐标 / Zoom Slider）
   - 路段流量录入与查询（含图选、框选、画线路选、双向偏移、按车道图标着色）
   - 交叉口流量调查：手动录入、视频输入、绘制停车线、车辆计数 AI 识别
   - 图片 ZIP 批量上传与地图锚点（`mappicture` 图片树）
   - 交评道路运行现状出图（CTProject：新增/载入/绘图模式/出图项目管理）
2. **17 个独立 3D 演示页**：无人机轨迹还原、低空 UAM 航路、新丰/广州地形图加载、GeoTIFF + NetCDF 气象数据可视化、风场流线、类鸟群 GPGPU、GoView BI 大屏嵌入、ZIP 数据包动态加载、GeoJSON 立柱化（按起始终止时间拉伸）等。
3. **额外组件库**：4 向 Drawer（上/下/左/右）、NewClock（时间轴+罗盘+语言+地图样式+Bug 反馈+帮助）、Sector（扇区）、UploadVideo、Pagination 等。
4. **自研 MyMap 引擎**：Three.js 封装 + 建筑轮廓层（OutlineLayer）、天气层（WeatherLayer）、路网层、Bloom 后期、Fat Line 宽线、天空盒 6 面、瓦片工具（OSM/Baidu）、3D 模型对象池（24 款车辆 + 无人机 GLTF）。

---

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 核心框架 | Vue | ^2.7.16 |
| 脚手架 | @vue/cli-service | ~5.0.0 |
| 路由 | vue-router | ^3.5.1 |
| 状态管理 | Vuex | ^3.6.2 |
| UI 组件库 | Element UI | ^2.15.14 |
| 3D 引擎 | three | ^0.149.0 |
| GIS 可视化（备选） | deck.gl | ^8.9.31 |
| 图表 | ECharts | ^5.4.3 |
| 2D 图形 | konva | ^9.3.14 |
| 动画 | GSAP | ^3.12.7 |
| Tween.js | @tweenjs/tween.js | ^20.0.3 |
| 物理引擎（无人机） | cannon-es | ^0.20.0 |
| 栅格数据 | geotiff | ^2.1.3 + utif | ^3.1.0 |
| 气象 NetCDF | netcdfjs | ^3.0.0 |
| HTTP | axios | ^1.5.1 |
| 坐标投影 | proj4 | ^2.9.0 |
| 日期处理 | moment | ^2.29.3 |
| CSS | sass | ^1.32.7 + sass-loader ^12.0.0 |
| 宽线 | meshline | ^3.1.6 |
| 法线计算 | polyline-normals | ^2.0.2 |
| 压缩包 | jszip | ^3.10.1 |
| Worker | worker-loader | ^3.0.8 |
| Fetch polyfill | whatwg-fetch | ^3.6.19 |

---

## 页面模块

页面路由位于 `src/views/` 目录，分两部分：**主系统页面**（2 套实现 + 1 菜单页）与 **Demo 演示页**（17 个）。

### 一、主系统页面

#### 1. 道路调查主系统（主页）
- **路由**：`/` 与 `/index2` → `views/home2/index.vue`
- 基础：`#mapRoot` + `MyMap` + `MapLayer` 底图 + 4 个业务图层封装（layer/ 子目录）
- 顶部样式切换：可切换 4 种地图风格（MapLayer_menu 侧滑条）
- 5 大设置折叠面板：

| 面板 | 子模块组件 | 功能 |
|------|------|------|
| 1. 定位 | [RouteSelect](file:///d:/JINHUA/project/matsimWebCofig/road_traffic_survey/src/views/home2/components/RouteSelect.vue) + [LinkSelect](file:///d:/JINHUA/project/matsimWebCofig/road_traffic_survey/src/views/home2/components/LinkSelect.vue) + [CenterInput](file:///d:/JINHUA/project/matsimWebCofig/road_traffic_survey/src/views/home2/components/CenterInput.vue) + zoom slider | 按路段名、linkId、经纬度定位；zoom > SHOW_LINK_ZOOM 显示路网视图 |
| 2. 路段流量 | [LinkFlow](file:///d:/JINHUA/project/matsimWebCofig/road_traffic_survey/src/views/home2/components/LinkFlow.vue) + [LinkFlowQuery](file:///d:/JINHUA/project/matsimWebCofig/road_traffic_survey/src/views/home2/components/LinkFlowQuery.vue) + [LinkSelect](file:///d:/JINHUA/project/matsimWebCofig/road_traffic_survey/src/views/home2/components/LinkSelect.vue) + [LinkPolygonSelect](file:///d:/JINHUA/project/matsimWebCofig/road_traffic_survey/src/views/home2/components/LinkPolygonSelect.vue) + [DrawLine](file:///d:/JINHUA/project/matsimWebCofig/road_traffic_survey/src/views/home2/components/DrawLine.vue) + [FrameLink](file:///d:/JINHUA/project/matsimWebCofig/road_traffic_survey/src/views/home.back/components/FrameLink.vue) | 开始录入（按路段方向逐条填写）、查询；图选 + 画线路选 + 框选 + 多边形圈选；图标颜色按 highway 类型自定义；双向路段偏移 / 路段宽度滑条 |
| 3. 交叉口 | [CrossroadsInstall](file:///d:/JINHUA/project/matsimWebCofig/road_traffic_survey/src/views/home2/components/CrossroadsInstall.vue) + [CrossroadsList](file:///d:/JINHUA/project/matsimWebCofig/road_traffic_survey/src/views/home2/components/CrossroadsList.vue) + [CrossroadsDetail](file:///d:/JINHUA/project/matsimWebCofig/road_traffic_survey/src/views/home2/components/CrossroadsDetail.vue) + [CrossroadsStatsEdit](file:///d:/JINHUA/project/matsimWebCofig/road_traffic_survey/src/views/home2/components/CrossroadsStatsEdit.vue) + [ManuallyEnteringCrossroads](file:///d:/JINHUA/project/matsimWebCofig/road_traffic_survey/src/views/home2/components/ManuallyEnteringCrossroads.vue) + [VideoInputCrossroads](file:///d:/JINHUA/project/matsimWebCofig/road_traffic_survey/src/views/home2/components/VideoInputCrossroads.vue) + [DrawLine](file:///d:/JINHUA/project/matsimWebCofig/road_traffic_survey/src/views/home2/components/DrawLine.vue) | 新增交叉口（中心点 + 出入口方向线）、手动录入 16 向流量表、视频封面 + 车辆计数 AI 识别 (`runVehicleCounts`)、下载分析视频 / 轨迹图 / 导出流量表 Excel |
| 4. 图片上传 | [UploadImageZip](file:///d:/JINHUA/project/matsimWebCofig/road_traffic_survey/src/views/home2/components/UploadImageZip.vue) + [ImageListDialog](file:///d:/JINHUA/project/matsimWebCofig/road_traffic_survey/src/views/home2/components/ImageListDialog.vue) | ZIP 批量上传（带项目 / 文件夹树）、图片 Marker 列表、预览、重命名、路径删除 |
| 5. 交评出图 | [CTProject/AddDialog](file:///d:/JINHUA/project/matsimWebCofig/road_traffic_survey/src/views/home2/components/CTProject/AddDialog.vue) + [ListDialog](file:///d:/JINHUA/project/matsimWebCofig/road_traffic_survey/src/views/home2/components/CTProject/ListDialog.vue) + [DrawingModelDialog](file:///d:/JINHUA/project/matsimWebCofig/road_traffic_survey/src/views/home2/components/CTProject/DrawingModelDialog.vue) + [ModeDialog](file:///d:/JINHUA/project/matsimWebCofig/road_traffic_survey/src/views/home2/components/CTProject/ModeDialog.vue) | 新建/载入出图项目、绘制模式切换、饱和度样本（框选设置服务水平） |
| 帮助 | [HelpDialog](file:///d:/JINHUA/project/matsimWebCofig/road_traffic_survey/src/views/home2/components/HelpDialog/index.vue) 5 页 | 系统操作说明（`page1.vue`~`page5.vue`） |

- 业务图层（home2/layer）：ColorBar2D、DrawLineLayer、FrameSelectLayer、GeoJSONLayer（Worker 版）、GuangZhouLayer、ImageListLayer、IntersectionListLayer、LinkLayer、LinkStatsLayer、LinksLayer

#### 2. 主系统旧版（备份）
- **路由**：无直接引用，`views/home.back/index.vue`
- 对应组件备份：`home.back/components/` 和 `home.back/layer/`，与 home2 功能基本一致，保留早期 `FrameLink`、`AddIntersection`、`IntersectionList` 实现。

#### 3. Demo 导航菜单页
- **路由**：`/demo/Menu` → `views/demo/menu.vue`
- 左侧卡片导航，点击跳转到下方 17 个 demo 页面（`demoPage` 路由组 + menu.title）。

---

### 二、Demo 演示页（17 个）

全部位于 `views/demo/`，路由前缀 `/demo/*`：

| 路由 | 文件 | 标题 | 核心能力 |
|------|------|------|------|
| page1 | `page1/index.vue` | 无人机拍摄路段 3D 演示 | CarLayer / UAVLayer / LineLayer Worker + 车辆轨迹 uavTrackHPdemo.json + 无人机航拍视频 uavVideo 1~3 |
| page2 | `page2/index2.vue` | 低空（基础版） | 3D 建筑 + 路网 + 无人机 + 停机坪 SVG |
| page3 | `index3.vue` | 低空（新丰县） | 新丰地理数据 + 气象风场 + GeoTIFF + GeoJSON Label + 瓦片（layer3 多版实现 + TianDiTu/Baidu/OSM 瓦片工具） |
| page4 | `index4.vue` | 低空（新丰县 - GoView 嵌入 1） | 与 page3 核心相同 + iframe 方式嵌入 GoView BI 大屏 |
| page5 | `index5.vue` | 低空（新丰县 - 地形图测试） | TifLayer + 加载 DEM 地形图 |
| page6 | `index6.vue` | 低空（新丰县 - GoView 嵌入 2） | 第二版 GoView 大屏嵌入页 |
| page7 | `index7.vue` | 低空（新丰县 - 无操作面板） | 简化版：仅加载图层，隐藏控制面板 |
| page8 | `index8.vue` | 低空（广州 - 固定加载项目数据） | 广州黄埔固定 GeoJSON + Network + UAVList（layer4） |
| page9 | `index9.vue` | 低空（动态加载数据包 ZIP） | 后端上传 data.zip 后解压加载 NetCDF 气象 + GeoJSON + 地形 |
| page10 | `index10.vue` | 低空（同 page9） | 同 page9，功能等价测试 |
| page11 | `index11.vue` | 广州市低空无人机航路规划 | 广州低空 + 航路规划专项演示 |
| page12 | `index12.vue` | 风场测试页面 | WindLineLayer + NetCDF 读取（U/V 风分量/温湿压/海浪等 12 变量，c35aad5…nc） |
| page13 | `index13.vue` | 类鸟群测试页面 | Birds.js / Birds2.js + webgl_gpgpu_birds（GPGPU 粒子 27000+） |
| page14 | `index14.vue` | 查看 GeoJson 文件 | GeoJSON 通用查看器 |
| page15 | `index15.vue` | GeoJSON 点根据 st 和 et 生成立柱 | 按 feature.properties.startTime / endTime 拉伸为柱体 + 颜色图例 |
| UAVBox | `page3/UAVBox/index.vue`（+index2.vue） | 无人机动画测试页面 | 无人机飞行框视口独立测试（fullscreen 切换） |
| UAVPhysicsBox | `page4/UAVPhysicsBox.vue` | 无人机物理引擎测试 | page4/UAVPhysics.js（cannon-es 6 自由度 + 旋翼模型） |

- Demo 共享数据：test3dNetworkCleaned.json/xml、3 版 test3dNetworkPathInMatsim.json、停机坪.svg、title.svg、广州/黄埔 GeoJSON、NetCDF 样本。
- Worker 多版本：CarLayer.worker / UAVListLayer.worker / UAVListLayer2.worker / UAVListLayer4.worker / GeoJSONLayer.home.worker / TileLayer.worker，用于大规模粒子/点数据并行渲染。

---

## 通用业务图层 (utils/MapLayer 思路)

在 home.back/layer/ 和 home2/layer/ 下封装了 10 种业务图层类，后续重构的 road_traffic_survey2 已升级为通用 `utils/MapLayer` 模块：

| 图层 | 作用 |
|------|------|
| GuangZhouLayer | 广州区域专题边界 |
| NetworkLayer | MATSim 3D 网络（节点 + 边 + 几何体） |
| LinkLayer | 单路段/多路段（选路交互） |
| LinksLayer | 批量路段着色 |
| LinkStatsLayer | 路段流量值 + 颜色条 |
| IntersectionListLayer | 交叉口 Marker 列表 |
| ImageListLayer | 图片 Marker + 树状目录 |
| DrawLineLayer | 画线工具（路选） |
| FrameSelectLayer | 矩形框选 |
| PolygonSelectLayer / PointSelectLayer | 多边形圈选 / 点选 |
| ColorBar2D | 颜色图例条（连续色带） |

---

## 公共组件（src/components）

| 组件/目录 | 文件 | 说明 |
|------|------|------|
| **Drawer** | `Drawer/index.vue / top / bottom / left / right.vue + mixins.js` | 四方向抽屉面板（带动效遮罩） |
| **NewClock** | `NewClock/index.vue + TimeSlider / Luopan / MapStyle / Language / Bug / Help.vue` | 顶部工具栏合集：数字时钟（DigitalNumbers-Regular.ttf）、罗盘、底图样式切换、中英双语、Bug 截图上报、帮助页 |
| Dialog | `Dialog.vue` | 可拖拽、最小化、关闭的通用对话框 |
| Sector | `Sector.vue` | 扇区统计组件 |
| UploadVideo | `UploadVideo.vue` | 视频上传组件 |
| pagination | `pagination.vue` | Element UI 分页封装 |

---

## 路由配置

- 入口：`src/router/index.js`，基于 `VueRouter` v3
- 导出常量 `demoPage`（17 条 demo 路由）供导航菜单复用
- 主路由结构：
  ```
  /             → views/home2/index.vue
  /index2       → views/home2/index.vue   (备用入口)
  /demo/Menu    → views/demo/menu.vue
  /demo/page1~15 + UAVBox + UAVPhysicsBox  → 对应 demo 页
  ```

---

## API 接口（src/api/index.js）

基于 `src/utils/request.js` Axios 封装，共 **约 53 个**接口，按模块分：

### 1. 路网 / OSM / MATSim
| 函数 | 方法 | 路径 |
|------|------|------|
| getGeomjson | POST | `/osm/way/getGeomjson`（获取区域路段 GeoJSON） |
| getWayByName | GET | `/osm/way/getWayByName` |
| getOsmLinksByArea | POST | `/osm/way/getOsmLinksByArea`（框选 OSMWay + Link） |
| getMatsimLink | GET | `/matsim/link/getMatsimLink/{origid}` |
| matsimLinkDetail | GET | `/matsim/link/{id}?projectId=` |
| matsimLinkUpdate / UpdateInWay | POST | `/matsim/link/update`、`/updateInWay` |
| getReverseLink | GET | `/matsim/link/getReverseLink/{id}` |
| getAllLinkType | GET | `/matsim/link/getAllHighwayType` |
| getLinkById | GET | `/matsim/link/getLinkId` |

### 2. 路段流量（link/stats）
| 函数 | 方法 | 路径 |
|------|------|------|
| statsDetail / Insert / Update / Delete | G/P/P/D | `/link/stats/{id}`、`/insert`、`/update`、`/delete/{id}` |
| statsQueryByArea / QueryByLinkId | POST | `/link/stats/queryByArea`、`/queryByLinkId/{linkId}` |
| queryAllMaker | GET | `/link/stats/queryAllMaker`（全部路段流量标记） |
| statsExport | POST | `/link/stats/export`（Excel 导出，blob） |
| queryAvgStats / statsReinstated | POST | `/queryAvgStats`、`/reinstated`(流量复用) |

### 3. 交叉口（crossroads）
| 函数 | 方法 | 路径 |
|------|------|------|
| crossroadsInsert / List / Delete / Update / Detail |  | `/crossroads/insert`、`/list`、`/delete/{ids}`、`/update`、`/detail/{id}` |
| crossroadsSaveLine | POST | `/crossroads/saveline`（绘制停车线） |
| getCrossroadsFrame | GET | `/crossroads/frame/{id}`（视频封面帧） |
| crossroadsCorssStatsTable | GET | `/crossroads/corssStatsTable/{id}`（流量表） |
| crossroadsInsertStats / UpdateStats / DeleteStats | P/P/D | `/insertStats`、`/updateStats`、`/deleteStats/{id}` |
| crossroadsInoutlink | GET | `/crossroads/inoutlink/{id}`（出入 link） |
| crossroadsRunVehicleCounts | GET | `/crossroads/runVehicleCounts/{id}`（AI 车辆计数） |
| crossroadsAnalyzeVideo / TrackImage / ExportCorssStatsTable | window.open 新页 | `/analyzeVideo/{id}`、`/trackImage/{id}`、`/exportCorssStatsTable/{id}` |

### 4. 中心点（intersection）
| 函数 | 方法 | 路径 |
|------|------|------|
| intersectionList / Insert / Delete / Update / Detail |  | `/intersection/list`、`/insert`、`/delete/{id}`、`/update`、`/detail/{id}` |

### 5. 地图图片树（mappicture）
| 函数 | 方法 | 路径 |
|------|------|------|
| mappictureAllMaker | POST | `/mappicture/allMaker` |
| mappictureUploadimg | POST | `/mappicture/uploadimg`（ZIP/图片） |
| mappictureTreeList | POST | `/mappicture/treeList` |
| mappictureDelete / DeleteByPath / Rename |  | `/delete/{ids}`、`/deleteByPath`、`/rename` |

### 6. 出图项目（link/project）
| 函数 | 方法 | 路径 |
|------|------|------|
| projectList / Insert / Update / Delete / Detail |  | `/link/project/list`、`/insert`（multipart）、`/update`、`/delete/{id}`、`/detail/{id}` |
| projectAddSample / QuerySample | POST | `/link/project/add/sample`、`/query/sample`（框选服务水平样本） |
| jsonAllProject | GET | `/link/project/geojson`（项目范围） |

### 7. 其他
- `fileUpload(file)`：POST `/file/upload`（multipart）

---

## 核心 3D 地图引擎 (src/mymap)

与 ocean_web 共享同一套 MyMap 架构的早期版本：

| 模块 | 文件 | 说明 |
|------|------|------|
| **入口** | `index.js` | 导出 MyMap / Layer / MapLayer / OutlineLayer / MOUSE_BUTTONS 等 |
| **核心类** | `main/MyMap.js` | Three.js 场景、中心点、zoom、enableRotate、鼠标手势、图层管理 |
| **图层基类** | `main/Layer.js + EventListener.js` | |
| **内置图层** | `layers/MapLayer.js` 瓦片层 | |
| | `layers/OutlineLayer.js` 3D 建筑白膜 | |
| | `layers/WeatherLayer.js` ❗新增 - 雨雪雾天气特效（本项目独有） | |
| **后期** | `composer/BloomComposer.js` Bloom 辉光 | |
| **材质** | `material/Line2DMaterial.js` 屏幕空间 2D 宽线 | |
| **工具** | `utils/BaiduTileUtils.js / OSMTileUtils.js` 瓦片换算 | |
| | `utils/LngLatUtils.js` 经纬度/墨卡托 | |
| | `utils/ColorBar2D.js` 颜色图例 | |
| | `utils/ModelPool.js` 24 款车辆 + 无人机 GLTF 对象池 | |
| | `utils/lines/Line2 / LineSegments2 + Geometry + Material` Fat Line 宽线 | |
| | `utils/CSS2DRenderer.js` DOM 标注 2D 渲染器 | |
| **天空盒** | `skybox/{front,back,left,right,up,down}.jpg` | 六面立方体贴图 + readme 说明 |

---

## 环境变量

| 变量 | `.env.development` | `.env.production` | 说明 |
|------|------|------|------|
| VUE_APP_TITLE | "" | "" | 页面标题 |
| VUE_APP_BASE_API | `/dev_api` | ""（空，走同源） | Axios baseURL 前缀 |
| VUE_APP_PUBLIC_PATH | `.` | `.` | 部署路径 |
| VUE_APP_DEMO_SERVER | `http://192.168.60.231:23334/demo` | 同开发 | Demo 静态数据服务器（page8/9 动态数据） |

---

## 静态资源

### 3D 模型 (public/models)
24 款车辆 + 飞行器（含 blend 源文件 / mtl+obj / stl / glb 多种格式）：
- Sedan / SUV / Hatchback / Van / Roadster / Limousine / Muscle / Muscle2 / Monster_Truck / Pickup / Sports（轿车/SUV/皮卡/跑车等 11 款民用）
- Bus / Subway / Taxi（公交、地铁、出租）
- Police_Sedan / Police_SUV / Police_Muscle / Police_Sports（4 款警车）
- Ambulance / Firetruck（急救、消防）
- 无人机.glb / .mtl+.obj / .stl ×3 版本（UAV 多种）

### 数据
- `public/data.zip`：数据包样本（可被 page9 直接读取）
- `public/static/js/config.js + proj4.js`：Proj4 坐标投影全局配置
- `public/static/fonts/MiSans VF_Regular.json`：Three.js 中文字体分片

### 项目内数据
`src/assets/json/`：广州 / 黄埔各 3 份（geojson 与 JS 导入版）
`src/assets/video/`：video1~5.gif（首页/菜单封面动图）
`src/assets/image/`：address / camera / point / point2 / intersection / lg_red 等图标

---

## 项目结构

```
road_traffic_survey/
├── public/
│   ├── models/*.{glb,stl,obj,mtl,blend}   # 24 款 3D 模型（含源文件）
│   ├── static/{js,img,fonts}               # proj4 配置/图片/字体
│   ├── data.zip                             # demo 数据包
│   ├── index.html / keyPressed.html         # 入口 HTML
│   └── favicon.ico
├── src/
│   ├── api/index.js                         # 53 个后端接口（OSM/MATSim/流量/交叉口/图片/出图）
│   ├── assets/
│   │   ├── css/{style.scss, DigitalNumbers-Regular.ttf}
│   │   ├── image/ address/point/intersection 等图标
│   │   ├── json/{guangzhou,huangpu}*.{json,js}  # 广州/黄埔 GeoJSON
│   │   ├── video/video1~5.gif               # 菜单封面动图
│   │   └── logo.png
│   ├── components/
│   │   ├── Drawer/{index,top,bottom,left,right}.vue + mixins.js
│   │   ├── NewClock/{index,TimeSlider,Luopan,MapStyle,Language,Bug,Help}.vue
│   │   ├── Dialog.vue, Sector.vue, UploadVideo.vue, pagination.vue
│   ├── mymap/                               # Three.js 3D 地图引擎（含 WeatherLayer）
│   │   ├── main/ (MyMap, Layer, EventListener)
│   │   ├── layers/ (MapLayer, OutlineLayer, WeatherLayer)
│   │   ├── composer/ (BloomComposer)
│   │   ├── material/ (Line2DMaterial)
│   │   ├── utils/ (瓦片/经纬度/颜色条/模型池/宽线/CSS2D)
│   │   └── skybox/*.jpg
│   ├── router/index.js                      # Vue 2 路由（导出 demoPage 17 条）
│   ├── store/index.js                       # Vuex
│   ├── utils/{request, ruoyi, OSS, SVGLoader, cache, check, index, userApi}.js
│   ├── views/
│   │   ├── demo/
│   │   │   ├── menu.vue                      # 17 demo 导航菜单
│   │   │   ├── page1/{index.vue, layer/{Car,UAV,Line}Layer{.worker}.js, data/*}  # 无人机路段3D
│   │   │   ├── page2/{index2.vue, layer/{Build3D,Network3D,UAV}Layer.js, data/*}  # 低空基础
│   │   │   ├── page3/
│   │   │   │   ├── index3~index15.vue       # 13 个新丰/广州/风场/鸟群/GeoJSON 立柱/地形图 demo
│   │   │   │   ├── UAVBox/{index,index2}.vue+fullscreen svg
│   │   │   │   ├── layer/ + layer2/ + layer3/ + layer4/ (4 套图层迭代版 + 多 Worker)
│   │   │   │   ├── data/{NetCDF,GeoJSON,tile,svg} + GeoTIFF.utils.js + wind.py
│   │   │   │   └── images/* (气象 12 个指标图标 + UI 切片)
│   │   │   └── page4/{UAVPhysicsBox.vue, UAVPhysics.js, textures}  # cannon-es 无人机物理
│   │   ├── home.back/                        # 早期调查页面备份（home2 的前版）
│   │   │   ├── index.vue + 25 个组件 + 10 个 layer
│   │   └── home2/                            # 现行主系统（/ 和 /index2）
│   │       ├── index.vue
│   │       ├── components/ (30+ 组件：LinkFlow、CrossroadsInstall、CTProject x4、HelpDialog x5 等)
│   │       └── layer/ (11 个业务图层：GeoJSON Worker、LinksLayer、ImageListLayer...)
│   ├── App.vue
│   └── main.js
├── .env.development / .env.production
├── babel.config.js / jsconfig.json
├── package.json
└── README.md
```

---

## 推荐 IDE 配置

[VS Code](https://code.visualstudio.com/) + [Vetur](https://marketplace.visualstudio.com/items?itemName=octref.vetur)（Vue 2 项目，**不要启用 Volar Takeover**）。

## 自定义配置

参见 [Vue CLI Configuration Reference](https://cli.vuejs.org/config/)。

---

## 项目安装

```sh
yarn install
```

### 开发模式（热更新）

```sh
yarn serve       # 或 yarn dev（别名）—— vue-cli-service serve
```

### 生产构建

```sh
yarn build       # vue-cli-service build
```

---

## 升级路线

本项目已衍生第二代版本 **road_traffic_survey2**（Vue 3 + Vite + Pinia + Element Plus），迁移点：

1. Vue 2 → Vue 3 + `<script setup>`
2. Element UI → Element Plus 2.11
3. 公共业务图层升级：`utils/MapLayer/` 下 20+ 标准模块化图层
4. 页面重构：NoMapLayout（首页）+ MapLayout（上传/下载/反馈）双布局
5. 新增：首页数据库 / 工具库 / 平台库 + 新闻 + 空间查询下载
6. 移除：17 个 demo 页面（已归档在此项目保留演示用途）
