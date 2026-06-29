# road_traffic_survey2 — 交通数据采集应用平台（Vue 3 + Vite 重构版）

**road_traffic_survey** 的第二代重构版本：Vue 3.5 + Vite 7 + Pinia 3 + Element Plus 2.11，提供「**双布局（首页无图 / 上传下载带图）** + **4 大菜单（首页 / 数据上传 / 数据下载 / 问题反馈）**」的交通调查数据管理平台。

首页聚合数据库 / 工具库 / 平台库 + 热门功能 + 新闻 + 公告；数据上传菜单覆盖路段流量录入、交叉口采集（含视频 AI 识别）、图片批量管理、交评出图（CTProject）、视频上传；数据下载菜单提供树状多类型数据（GeoJSON / 文件夹 / PDF / TXT / 交叉口与路段流量表 / 上传图片 / iframe 等 9 类）+ 空间查询（矩形/圆/多边形+缓冲区+按 route_id 路网过滤）的空间化数据挖掘下载。

---

## 项目简介

road_traffic_survey2 是面向「交通调查业务全流程」的 Web 平台，核心能力：

1. **首页门户**（NoMapLayout + `/home`）：
   - 数据库（按年度/区域/类别展示数据入口按钮）
   - 工具库（道路交通模型 / 数据 / 图片下载入口）
   - 平台库（平台搭建项目入口汇总）
   - 热门功能（快捷按钮跳转至核心子功能）
   - 新闻 + 公告（富文本 Quill 编辑器、图片 PDF 附件、批量下载、PDF 水印、路由 meta type=0/1 区分新闻与公告）
2. **数据上传**（MapLayout + `/upload`）：7 类菜单（其中 GIS / CAD / 栅格文件 3 类预留）
   - 人工数车：`LinkFlow 路段流量录入`、`IntersectionFlow 交叉口流量`（含中心点、手动录入、视频输入、16 向流量表编辑、绘制方向线、AI 车辆计数）
   - 航拍视频（仅视频 + 两识别项研发中）、拍照图片（仅图片 ZIP 上传/Sreach 查询 + ImageList 预览）
   - CTProject 交评道路运行现状出图（新增/载入/绘制模式切换）
3. **数据下载**（MapLayout + `/download`）：
   - 9 类型树形数据项（DefaultItem / FolderItem / GeoJSONItem / PDFItem / TXTItem / FileItem / IframeItem / IntersectionFlowItem / LinkFlowItem / UploadImageItem + GeoJSONVM 查看器）
   - 空间查询 `SpatialQuery`：矩形 / 圆形 / 多边形 + 缓冲区、地图取点绘制、`RouteInfo` 按 route_id 过滤路网信息 → 一键生成 GeoJSON 下载
4. **问题反馈**（MapLayout + `/feedback`）：外链至 `http://192.168.60.231:23105/vue/feedback.html#/`
5. **MyMap 3D 地图引擎**：Three.js 封装 + 建筑白膜 + 瓦片底图 + 多种业务图层（GeoJSON Worker 版、选图交互层、网络/路段/交叉口/图片/画线/框选/颜色条）
6. **Vite 插件增强**：vite-plugin-static-copy 保持 assets 原路径、vite-svg-loader SVG 组件化、unplugin-auto-import、vue-devtools

---

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 核心框架 | Vue | ^3.5.18 |
| 构建工具 | Vite | ^7.0.6 |
| 语言升级 | 从 Vue 2.7 升级为 Vue 3 Composition API + `<script setup>` |
| 路由 | Vue Router | ^4.5.1（Hash 模式） |
| 状态管理 | Pinia | ^3.0.3（替代 Vuex） |
| UI 组件库 | Element Plus | ^2.11.1（替代 Element UI 2） |
| 3D 引擎 | three | ^0.149.0（与老项目一致，方便图层复用） |
| 图表 | ECharts 5.5.1 + vue-echarts | 7.0.3 |
| 富文本 | @vueup/vue-quill | ^1.2.0（新闻/公告编辑） |
| 工具函数 | @vueuse/core | ^14.3.0 |
| 事件总线 | mitt | ^3.0.1 |
| 2D 图形 | konva | ^9.3.14（空间查询绘制） |
| 日期处理 | moment | ^2.29.3（全局 prototype 挂载 `$moment`） |
| HTTP | axios | ^1.11.0 |
| 坐标投影 | proj4 | ^2.9.0 |
| 压缩包 | jszip | ^3.10.1（图片 ZIP 批量上传） |
| 文件下载 | file-saver | ^2.0.5（GeoJSON / Excel / 附件下载） |
| CSS | sass | ^1.91.0 + vite `additionalData: @use "@/assets/style/func.scss" as func;` |
| SVG 加载 | vite-svg-loader | ^5.1.0（默认 `url` 模式，`?component` 转组件） |
| 代码格式化 | Prettier | 3.6.2 |
| 自动导入 | unplugin-auto-import | ^20.1.0（自动导入 vue / vue-router / pinia） |
| 静态资源复制 | vite-plugin-static-copy | ^4.1.0（保持 assets 相对路径） |
| Vue DevTools | vite-plugin-vue-devtools | ^8.0.0（已注释，按需启用） |
| Vite 插件 | @vitejs/plugin-vue | ^6.0.1 |

---

## 页面模块（src/views）

双布局结构：**NoMapLayout（首页/新闻详情，不带地图）** + **MapLayout（上传/下载/反馈，带 MyMap 3D 地图 + 顶部菜单 + 左下角工具栏）**

### 一、布局层

#### 1. 无图布局（NoMapLayout）
- **路由**：`/` 重定向 `/home`；包裹 `/home`、`/news/detail`、`/notice/detail`
- 提供全屏 `<RouterView />` 容器，不加载 MyMap

#### 2. 地图布局（MapLayout）
- **路由**：`/maplayout` → 子路由 `/upload`（默认）、`/download`、`/feedback`
- 顶部导航栏 `class="header"`：
  - 标题：**交通数据采集应用平台**
  - 4 枚 MButton 菜单：首页（→`/home`）、数据上传（→`/upload`）、数据下载（→`/download`）、问题反馈（外链反馈地址）
- 左下角 4 个圆形工具栏：反馈图标（研发中）、快捷跳转、样式切换（下拉 3 种 MapStyle 底图）
- 右下角 `#mapRoot`（MyMap 3D 容器）与 `<RouterView />`（上传/下载/反馈页面）
- MyMap 初始化：中心点 `[12634609, 2659952]`（黄浦）、zoom 10.74、MapLayer 底图
- 页面响应式缩放：`window.onresize` 动态计算 `scaleStyle` 自适应容器

---

### 二、首页（home/index.vue）
- **路由**：`/home`，位于 `NoMapLayout`
- 左中右三栏卡片式布局（`.max_box` + `.left / .center / .right`，虽未展示右栏）
- **左侧栏**
  | 区块 | 数据来源 | 内容 |
  |------|------|------|
  | 数据库 | `sjk_list`（ref 配置） | 年度类别 × 区域类别 → MButton 链接跳转 |
  | 工具库 | `mxk_list` | 道路交通模型 / 数据 / 图片下载 等入口 |
  | 平台库 | `ptk_list` | 平台搭建项目汇总入口 |
- **中间栏**
  - 热门功能卡片（`rm_list`）：快捷跳转 → 上传/下载核心子功能
  - 新闻卡片：
    - 封面图 / 列表 / 富文本内容
    - 上传 + 编辑模式切换（`showEditNews`）：每条新闻带编辑/删除
    - 路由跳转 `/news/detail?id=xxx`（VueRouter hash）
    - 新闻分类：`type=0` 新闻 / `type=1` 公告（路由 meta 控制）
  - 公告卡：同新闻组件，共享 `News/NewsDetail.vue` 页面
- 数据依赖 `home.js` API（新闻/附件/PDF 水印/热点链接）

### 三、新闻/公告详情页（home/News/*.vue）
- **路由**：`/news/detail`（type=0） & `/notice/detail`（type=1，同一组件不同 meta）
- `NewsDetail.vue`：从 query.id 取 `newsDetail(id)`，含附件（多文件下载/批量下载 `newsAnnexBatchDownload`），调用 `pdfWatermark` 对 PDF 自动打水印
- `AddNews.vue`：`@vueup/vue-quill` 富文本编辑器 + 附件上传 + `newsAdd / newsUpdate / newsDelete`

---

### 四、数据上传（upload/index.vue）
- **路由**：`/upload`（MapLayout 子路由）
- 默认展示左侧折叠菜单（MDialog 包裹，宽度 300px），共 **7 大类**（4/5/6 为预留空菜单，研发中），点击已实现的子菜单项切换到对应功能面板：

| 一级菜单 | 二级项目 | 面板组件 | 功能 |
|------|------|------|------|
| 1. 人工数车 | 1-1 路段流量录入 | `LinkFlow/index.vue`（含 `AELinkFlow` + `LinkDetail` + `CopyFlow`） | 路段流量 CRUD；复制流量到反向/全 Way；AELinkFlow 快速编辑 |
| | 1-2 交叉口流量录入 | `IntersectionFlow/index.vue`（含 `AddIntersection` / `CrossroadsDetail` / `CrossroadsStatsEdit` / `DrawLine` / `InputCrossroads` + ManuallyEntering + `VideoInputCrossroads` + `AEIntersectionFlow`） | 交叉口新增/删除/编辑、画出入口方向线、16 向流量表、AI 视频车辆计数、封面帧、视频/轨迹/Excel 导出 |
| 2. 航拍视频 | 2-1 仅视频 | `UploadVideo/index.vue` | 视频批量上传（交评/项目/路口分类） |
| | 2-2 路段流量识别 | ——（ElMessage 研发中） | |
| | 2-3 交叉口流量识别 | ——（ElMessage 研发中） | |
| 3. 拍照图片 | 3-1 仅图片 | `UploadImage/index.vue`（含 `Upload.vue` / `ImageList.vue` + `ImagePreview.vue` + `Sreach.vue`） | ZIP 批量上传、按文件夹/项目管理、地图锚点预览、搜索查询 `Sreach` |
| 4. GIS 文件 | ——（空 children） | ——（ElMessage 研发中） | 预留 |
| 5. CAD 文件 | ——（空 children） | ——（ElMessage 研发中） | 预留 |
| 6. 栅格文件 | ——（空 children） | ——（ElMessage 研发中） | 预留 |
| 7. 交评道路运行现状出图 | 7-1 开始出图 | `CTProject/index.vue`（含 `AddDialog` + `ListDialog` + `DrawingModelDialog` + `ModeDialog`） | 新建/载入出图项目、绘制模式、出图模型、饱和度样本服务水平设置 |

---

### 五、数据下载（download/index.vue）
- **路由**：`/download`（MapLayout 子路由）
- 双功能：**数据树下载** + **空间查询下载**

#### 5.1 数据树（download/Tree）
- `download/Tree/index.js`：自定义渲染 Tree 组件，枚举 `TreeItemEnum`（10 种类型）
- 每种类型对应 `download/Tree/components/*Item.vue`：
  | 组件名 | 用途 |
  |------|------|
  | FolderItem | 文件夹节点（可展开/收起） |
  | DefaultItem | 通用链接按钮下载 |
  | GeoJSONItem + GeoJSONVM.vue | 在 MyMap 中叠加图层预览 + 下载 GeoJSON |
  | PDFItem | PDF 预览 + 下载（自动调用 PDF 水印） |
  | TXTItem | 文本文件查看 + 下载 |
  | FileItem | 通用文件（含 XLSX/PNG 等图标识别） |
  | IframeItem | 嵌入 iframe 预览第三方平台数据 |
  | IntersectionFlowItem | 交叉口流量表查询 + Excel 导出 |
  | LinkFlowItem | 路段流量表查询 + Excel 导出 |
  | UploadImageItem | 图片项目图片下载 + ZIP 打包 |
- 路由参数 `?open=路径;路径,ALL` 可自动展开/勾选指定节点（`checkList` 解析）。
- `mixins.js`（老项目遗留封装，兼容复用）

#### 5.2 空间查询（download/SpatialQuery）
- `SpatialQuery/index.vue`（含 `mixins.js` + `components/SelectArea.vue` + `components/RouteInfo.vue`）
- **SelectArea**：提供 3 种选图控件（Rectangle 矩形 / Circle 圆形 / Polygon 多边形），每一种支持：
  - 手绘取点（地图点击绘制）
  - 输入经纬度数组（精确几何）
  - 缓冲区半径（Buffer，单位米）
  - Konva 画布渲染
- **RouteInfo**：按 `route_id`（路名）过滤、按车速等指标筛选，调用 `statsQueryByArea` 或 `roadInfo`
- `spatialResult` 聚合后，一键下载生成标准 GeoJSON（`file-saver`）
- 常驻图层：`NetworkLayer`（路网）

---

### 六、问题反馈（feedback/index.vue）
- **路由**：`/feedback`（MapLayout 子路由）
- 外链跳转至独立反馈系统：`http://192.168.60.231:23105/vue/feedback.html#/`

---

## 通用业务图层工具（utils/MapLayer）

road_traffic_survey2 相比老版本，对业务图层做了统一模块化升级：

| 图层文件 | 用途 |
|------|------|
| `GeoJSONLayer.js` + `GeoJSONLayer.worker.js` | GeoJSON 大规模要素 Worker 渲染（支持 Point/MultiPoint/LineString/Polygon + 颜色映射） |
| `GeoJSONLayer/` ❗新目录版 | `layer.js / point.js / line.js / polygon.js / data.js / utils.js / worker.worker.js + point.svg`：面向组件的重构版 |
| `SelectLayer/` ❗新目录版 | `CircleSelectLayer / RectangleSelectLayer / PolygonSelectLayer（含 PathLayer + utils.js + index.js）`：3 种空间查询交互层（下载页使用） |
| `LinkLayer.js` | 单路段交互选择 |
| `LinksLayer.js` | 批量路段 + 双向偏移/着色 |
| `LinkStatsLayer.js` | 路段流量与颜色条 |
| `GuangZhouLayer.js` | 广州专题边界（与老版本共享） |
| `NetworkLayer.js` | MATSim 3D 网络 |
| `PolygonsLayer.js` | 批量多边形层 |
| `IntersectionListLayer.js` | 交叉口 Marker 列表 |
| `ImageListLayer.js` | 图片 Marker 树 |
| `DrawLineLayer.js` | 画线交互 |
| `FrameSelectLayer.js` | 矩形框选 |
| `PointSelectLayer.js` / `PolygonSelectLayer.js` | 点选 / 多边形圈选 |
| `ColorBar2D.js` + `ColorBar2DUtil.js` | 颜色图例组件 |

---

## 公共组件（src/components）

| 组件 | 说明 |
|------|------|
| [MButton.vue](file:///d:/JINHUA/project/matsimWebCofig/road_traffic_survey2/src/components/MButton.vue) | 万能按钮：支持 `type=router`（路由）、`type=a`（新窗口链接）、`record` 埋点（研发中）、`activeClass`、带 SVG icon + label |
| Dialog.vue（全局注册为 **MDialog**） | `main.js:app.component('MDialog', Dialog)`，可拖拽：最小化、隐藏关闭、标题/副标题、x/y 定位 |
| Pagination.vue（全局注册为 **MPagination**） | Element Plus 分页封装（pageSize/size-change/current-change） |
| RouteSelect.vue | 路段下拉搜索 + 关键字模糊匹配 + 图标 |
| Sector.vue | 扇区统计组件（与老版本共享） |
| UploadVideo.vue（全局注册为 **MUploadVideo**） | 视频上传组件（交评/项目/路口分类） |
| QuillEditor（全局注册，来自 @vueup/vue-quill） | 新闻/公告富文本编辑器（`main.js` 注册 snow 主题 CSS） |

---

## 路由配置

- **入口**：`src/router/index.js`，Hash 模式（`createWebHashHistory`）
- `scrollBehavior`：保存已滚动位置，否则跳转至 `{top: 0}`
- 路由表：
  ```
  /                           → NoMapLayout 重定向 /home
  /home                       → views/home/index.vue  (首页)
  /news/detail    meta type=0 → views/home/News/NewsDetail.vue  (新闻详情)
  /notice/detail  meta type=1 → views/home/News/NewsDetail.vue  (公告详情，同组件不同类型)

  /maplayout                  → MapLayout 重定向 /upload
  /upload                     → views/upload/index.vue    (5 大类上传面板)
  /download                   → views/download/index.vue  (树状下载 + 空间查询)
  /feedback                   → views/feedback/index.vue  (问题反馈)
  ```

---

## API 接口（src/api）

### 1. 核心业务（api/index.js）
与 road_traffic_survey 基本一致，**约 54 个**，在原有基础上新增 `statsCalcPcu`：

| 模块 | 数量 | 示例 |
|------|------|------|
| OSM / 路网 geom | 5 | `getGeomjson / getWayByName / getOsmLinksByArea / getMatsimLink / getLinkById` |
| MATSim link | 7 | `matsimLinkDetail / Update / UpdateInWay / getAllLinkType / getReverseLink` 等 |
| 路段流量 link/stats | 12 | 含新增 `statsCalcPcu`（PCU 换算） + 流量复用 `statsReinstated` + Excel `statsExport`（blob） |
| 交叉口 crossroads | 17 | 含 5 个流量行接口 + 出入 link / runVehicleCounts（AI） / 3 个新页 `window.open`（视频/轨迹/Excel） |
| 中心点 intersection | 5 | list/insert/delete/update/detail |
| 图片树 mappicture | 6 | `uploadimg` + `treeList` + `allMaker` + `delete`/`deleteByPath` + `rename` |
| 出图项目 link/project | 9 | list/insert(FormData)/update/delete/detail + `addSample`/`querySample` + `jsonAllProject`(GeoJSON 范围) |
| 其他 | 2 | `fileUpload`(multipart) + `statsCalcPcu` |

### 2. 首页（api/home.js）
新闻、公告、附件、PDF 水印、热点链接：

| 函数 | 方法 | 路径 | 说明 |
|------|------|------|------|
| `newsList` | GET | `/news/page` | 分页新闻/公告 |
| `newsDetail(id)` | GET | `/news/detail/{id}` | 富文本详情 |
| `newsAdd / newsUpdate / newsDelete` | PUT/POST/DELETE | `/news`、`/news/update`、`/news/delete/{ids}` | |
| `newsAnnexAdd / newsAnnexDelete / newsAnnexBatchDownload` | PUT/DELETE/GET | `/newsAnnex*` | 新闻附件 CRUD + 批量下载（blob） |
| `pdfWatermark` | POST | `/pdf/watermark`（multipart） | PDF 上传返回带水印 blob |
| `indexHotLinkClick / indexHotLinkHotLinks` | POST/GET | `/indexHotLink/*` | 热点链接点击统计 + 列表 |

### 3. 下载门户（api/download.js）
| 函数 | 方法 | 路径 | 说明 |
|------|------|------|------|
| `roadInfo(data)` | POST | `/portal/roadInfo` | 空间查询/门户路网查询专用 |

---

## 核心 3D 地图引擎（src/mymap）

与 road_traffic_survey / ocean_web 同架构，是共享的统一版本：

| 模块 | 文件 | 说明 |
|------|------|------|
| **入口** | `index.js` | 导出 `MyMap / Layer / MapLayer / OutlineLayer`（4 个核心） |
| **核心** | `main/MyMap.js` + `main/Layer.js` + `main/EventListener.js` | Three.js 场景、鼠标手势、enableRotate、zoom、图层事件总线 |
| **内置图层** | `layers/MapLayer.js`（多风格瓦片切换 MapStyle） + `layers/OutlineLayer.js`（3D 建筑白膜） | |
| **后期合成** | `composer/BloomComposer.js` | Bloom 辉光 |
| **材质** | `material/Line2DMaterial.js` | 屏幕空间 2D 宽线 Shader |
| **工具** | `utils/BaiduTileUtils / OSMTileUtils / LngLatUtils / ColorBar2D / ModelPool / CSS2DRenderer` | 坐标/瓦片/图例/GLTF 对象池/DOM 标注 |
| | `utils/lines/Line2 / LineSegments2 + Geometry + Material` | Fat Line 宽线系列 |
| **天空盒** | `skybox/{front,back,left,right,up,down}.jpg` | 6 面 + readme.txt |

---

## 环境变量

| 变量 | `.env.development` | `.env.production` | 说明 |
|------|------|------|------|
| VITE_APP_TITLE | "" | "" | 页面标题 |
| VITE_APP_BASE_API | `/dev-api` | `/api/link/status` | Axios baseURL 前缀；开发时代理至 `192.168.60.231:23104` |
| VITE_APP_PUBLIC_PATH | `./` | `./` | 部署子路径（相对路径，适合多目录发布） |
| VITE_APP_DEMO_SERVER | `http://192.168.60.231:23334/demo` | 同开发 | 老 demo 页静态资源地址（目前主要用于共享资源） |

---

## 静态资源

### 交通 SVG 图标集（assets/icon_traffic）
100+ 枚 `remixicon` 风格交通图标：bus / subway / taxi / car / truck / police-car / charging-pile / e-bike-2 / bike / walk / footprint / plane / rocket / ship / sailboat / space-ship / flight-land-takeoff / train / luggage / passport / parking / map / map-pin / navigation / compass / signal-tower / goblet / restaurant / hotel / cup / oil / camera / traffic-light / barricade 等。

### UI 切图（assets/images/Home + MapLayout）
Home：数据库/工具库/平台库/热门功能/新闻/标签/搜索/上传/实时报导/日期/区域/下载/宣传/图标等 SVG/PNG
MapLayout：4 个菜单（upload/download/home/feedback）+ 4 个工具栏按钮图标

### 其他
- `Circle.svg / Rectangle.svg / Polygon.svg`：空间查询选图按钮
- `bg_line.png / bg_wave02@2x.png / 地图@2x.png / 图钉.png / xlsx.svg / 附件.svg / defult_xinpian@2x.png / close.svg / address.png / sreach.svg`

### 字体 / 样式
- `assets/style/base.scss / func.scss / main.scss`（`func.scss` 全局通过 `additionalData` 注入所有 `<style lang="scss">`，免 import）
- 全局 icon_traffic PNG 图标可用于 `vite-svg-loader` 两种模式：默认 URL（`<img>`）或 `?component`（Vue 组件）

---

## 项目结构

```
road_traffic_survey2/
├── public/
│   ├── favicon.ico + favicon.png
│   ├── home_menu.js / download_menu.js      # 首页/下载页的 window.win_home_menu / win_download_menu（菜单配置）
│   └── index.html
├── src/
│   ├── api/
│   │   ├── index.js                         # 54 个核心接口（路/流量/交叉口/图片/出图）
│   │   ├── home.js                          # 新闻/公告/附件/PDF 水印/热点
│   │   └── download.js                      # 门户路网查询 roadInfo
│   ├── assets/
│   │   ├── icon_traffic/*.svg               # 100+ 交通 SVG 图标
│   │   ├── images/ (Home/, MapLayout/, 各种切图)
│   │   ├── style/{base,func,main}.scss
│   │   └── logo.svg
│   ├── components/  MButton.vue, Dialog.vue, Pagination.vue, RouteSelect.vue, Sector.vue, UploadVideo.vue
│   ├── mymap/                               # 3D 地图共享引擎（MyMap+瓦片+宽线+辉光+天空盒+模型池）
│   │   ├── main / layers / composer / material / utils / skybox
│   ├── router/index.js                      # Hash：NoMapLayout + MapLayout 双布局
│   ├── stores/counter.js                    # Pinia 示例
│   ├── utils/
│   │   ├── MapLayer/                        # 20+ 业务图层（GeoJSON+Worker / SelectLayer / 路/交叉口/图片/网络）
│   │   ├── request.js                       # Axios 封装
│   │   └── index.js
│   ├── views/
│   │   ├── NoMapLayout.vue                  # 首页/新闻/公告 无图布局
│   │   ├── MapLayout.vue                    # 上传/下载/反馈 地图布局（顶部 4 菜单 + 左下工具栏 + 3D 地图）
│   │   ├── home/
│   │   │   ├── index.vue                    # 首页（3 库 + 热门 + 新闻 + 公告）
│   │   │   └── News/{AddNews.vue, NewsDetail.vue}
│   │   ├── upload/
│   │   │   ├── index.vue                    # 上传 5 大类折叠菜单
│   │   │   ├── LinkFlow/{index, AELinkFlow, LinkDetail, CopyFlow}.vue
│   │   │   ├── IntersectionFlow/ (8 文件：交叉口增删改查/画线/视频/手动/AI)
│   │   │   ├── UploadImage/ (5 文件：上传/列表/预览/搜索)
│   │   │   ├── UploadVideo/index.vue
│   │   │   └── CTProject/ (4 Dialog：新增/载入/绘图模式/模型)
│   │   ├── download/
│   │   │   ├── index.vue                    # 树下载 + 空间查询
│   │   │   ├── Tree/index.js + mixins.js + style.scss
│   │   │   ├── Tree/components/ (10 类 TreeItem：Folder / GeoJSON+VM / PDF / TXT / File / Iframe / 流量表 / 图片)
│   │   │   └── SpatialQuery/ index.vue + mixins.js + components/SelectArea.vue + RouteInfo.vue
│   │   └── feedback/index.vue
│   ├── App.vue
│   └── main.js                              # 入口：挂载 Element Plus、moment、全局样式、pinia、router
├── .env.development / .env.production
├── vite.config.js                           # Vite 7：80 端口、代理 /dev-api → 23104、static-copy、svg-loader、auto-import(vue/router/pinia)、输出 ./road_traffic_survey2/
├── jsconfig.json / .prettierrc.json
├── package.json
└── README.md
```

---

## 推荐 IDE 配置

[VS Code](https://code.visualstudio.com/) + [Vue - Official（Volar）](https://marketplace.visualstudio.com/items?itemName=Vue.volar)（Vue 3 项目推荐启用 **Takeover Mode**，需禁用 Vetur）+ [TypeScript Vue Plugin](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin)。

### 推荐浏览器扩展
- Chromium 内核（Chrome / Edge / Brave 等）：
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [在 Chrome DevTools 中启用 Custom Object Formatter](http://bit.ly/object-formatters)
- Firefox：
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [在 Firefox DevTools 中启用 Custom Object Formatter](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

---

## 自定义配置

详见 [Vite Configuration Reference](https://vite.dev/config/)。

---

## 项目安装

```sh
yarn
```

### 开发模式（热更新）

```sh
yarn dev        # 端口 80，自动打开浏览器；/dev-api 代理到 http://192.168.60.231:23104
```

### 生产构建

```sh
yarn build      # vite build，输出目录 ./road_traffic_survey2/
```

### 本地预览生产构建产物

```sh
yarn preview
```

### 代码格式化

```sh
yarn format     # Prettier 3.6.2 格式化 src/
```

---

## Node 版本要求

```
^22.0.0
```

---

## 与 road_traffic_survey（Vue 2 版）的关系

road_traffic_survey2 是 road_traffic_survey 的**重构升级版本**：

| 维度 | road_traffic_survey（Vue 2） | road_traffic_survey2（Vue 3） |
|------|------|------|
| 框架 | Vue 2.7 + Vue CLI 5 + Vuex | Vue 3.5 + Vite 7 + Pinia |
| UI 库 | Element UI 2.15 | Element Plus 2.11 |
| 页面结构 | 单布局 + home2/back 双版本 + 17 个 demo 页 | NoMapLayout + MapLayout 双布局 + 4 大主菜单 |
| 首页入口 | 直入调查主系统（MapLayout） | 门户首页（数据库/工具库/平台库/新闻/公告） |
| 调查功能 | home2 面板式 5 大模块 + HelpDialog 5 页 | upload 折叠菜单 7 大类（3 类预留，4 类已实现；组件全面升级 Vue 3） |
| 下载功能 | ——（无） | ❗新增：树状多类型 + 空间查询 |
| 新闻/公告 | ——（无） | ❗新增：Quill 富文本 + PDF 水印 + 附件批量下载 |
| 业务图层 | home.back/layer + home2/layer（分散） | 统一为 `utils/MapLayer/`（含 SelectLayer 新架构与 GeoJSON 分目录版） |
| 3D 演示页 | 17 个 demo（路段/低空/鸟群/风场/GeoTIFF/NetCDF/GPGPU…） | 已剥离归档（保留在 v1） |
| 公共组件 | Drawer + NewClock 7 子项 | 简化为 MButton / Dialog / Pagination / RouteSelect / Sector / UploadVideo |
| 构建/代理 | vue-cli（无明确代理配置） | Vite：80 端口 / static-copy / svg-loader / auto-import / 明确 23104 代理 |

> 如需使用原有 17 个 3D 演示页（无人机/风场/鸟群/地形图/GoView 嵌入 等），请访问 sibling 项目 **road_traffic_survey**。
