# ocean_web — 低空经济 UAM 航路规划可视化系统

基于 Vue 3 + Three.js 的城市低空交通（Urban Air Mobility, UAM）航路规划与飞行模拟 3D 可视化平台。以三维地图为底，提供起降点管理、航路搜索、航线新增、航班时刻表配置、多视角飞行模拟回放等核心能力。

## 项目简介

ocean_web 是面向低空经济场景的 **UAM 航路规划与可视化系统**，核心能力：

- 基于自研 `MyMap`（Three.js 封装）3D 地图引擎渲染底图 + 建筑轮廓 + 航线几何
- 可视化管理城市低空起降点（Vertiport）网络
- 起终点航路检索与航线详情卡片展示（含首末班、发班间隔、航程/耗时、途经节点步骤列表）
- 新增航线表单：起终点、首末班时间、发班间隔（秒）、巡航高度（米），自动拼接航线名称
- 飞行模拟面板：5 种视角（自由/第一人称/第三人称 + 两种定制视角）× 6 档倍速（x0~x20）+ 时间轴滑条与时间选择器
- 支持地图点击直接选取起终点，点击航线卡片自动定位至起点
- `autofit.js` 全局 1920×1080 大屏自适应缩放（忽略 3D 地图容器避免拉伸变形）

---

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 核心框架 | Vue | ^3.5.31 |
| 语言 | TypeScript | ~6.0.0 |
| 构建工具 | Vite | ^8.0.3 |
| 路由 | Vue Router | ^4.5.1 |
| 状态管理 | Pinia | ^3.0.4 |
| UI 组件库 A | Ant Design Vue | ^4.2.6 |
| UI 组件库 B | Element Plus | ^2.9.0 |
| 3D 引擎 | three | 0.148.0 |
| HTTP 客户端 | axios | ^1.5.1 |
| 日期处理 | dayjs | ^1.11.13 |
| 大屏自适应 | autofit.js | ^3.1.3 |
| CSS 预处理器 | Sass | ^1.91.0 |
| SVG 加载 | vite-svg-loader | ^5.1.0 |
| 文件下载 | file-saver | ^2.0.5 |
| 代码格式化 | Prettier | 3.8.1 |
| 代码检查 | ESLint + Oxlint | ^10.1.0 / ~1.57.0 |
| 自动导入 | unplugin-auto-import | ^20.1.0 |
| 组件自动注册 | unplugin-vue-components | ^0.28.0 |
| Vue DevTools | vite-plugin-vue-devtools | ^8.1.1 |

---

## 页面模块

页面位于 `src/views/` 目录，采用「布局页 + 子路由页」两级结构。

### 1. 3D 地图布局 (MapLayout.vue)

- **路由**：`/routeplan`（父路由，重定向至 `/routeplan/index`）
- **职责**：承载 3D 地图根容器与全局资源
- 核心实现：
  - `#mapRoot` 作为 Three.js 渲染的根 DOM（100vw × 100vh）
  - **autofit.js 初始化**：1920×1080 基准分辨率，`contain` 模式缩放，**明确忽略 `#mapRoot`** 防止 3D 场景拉伸
  - **MyMap 初始化**：
    - 中心点：黄浦区 `[12634609, 2659952]`，zoom `10.74`
    - 鼠标按键：右键拖拽（`MOUSE_BUTTONS.RIGHT`）
    - 允许旋转视角（`enableRotate: true`）
    - 科学城中心点配置也已预留注释
  - `MapLayer`（zIndex=-1）作为底图图层加入地图
  - `provide('MapRef', MapRef)` 与 `provide('showMap', showMap)` 向子路由注入地图实例引用与显示开关
  - `onUnmounted` 调用 `MapRef.value?.dispose()` 释放 Three.js 资源

### 2. 航路规划主页 (routeplan/index.vue)

- **路由**：`/routeplan/index`（根路径 `/` 也重定向到此处）
- **依赖注入**：通过父级 `provide` 获得 `MapRef`（MyMap 实例）
- **三大面板 + 右上角时间控制**（使用 Element Plus `<transition name="el-zoom-in-center">` 切换动效）：

#### 2.1 左侧航路规划面板（主面板）
- 标题：`航路规划`（带 `CustomTitle` 底部装饰形状）
- **起终点选择区**：
  - 自定义 `MSelect` 选择起降点（label=name / value=id）
  - 右侧 `AimOutlined` 图标切换「地图点击取点」模式：先点起点再点终点，自动查询
  - 选择变化自动 `handleGetList` 触发搜索
- **操作按钮**：搜索航线 / 添加航线（渐变蓝色按钮，悬停提升）
- **航线卡片列表**（左侧纵向滚动，滚动条美化）：
  - 每张卡片 = 1 条航线，虚线边框（选中变为实线 + 不透明度恢复）
  - 卡头：航线详情标题 + 显示/隐藏 `a-switch`（控制航线层是否渲染）
  - 航线信息：航线名称 / 首班时间 / 发班间隔 / 航程距离 / 预计耗时
  - **途经节点步骤列表**（有 steps 才显示，编号 1..n，步骤名 + 距离）
  - 「飞行模拟」按钮进入模拟面板
  - 点击整张卡片：`handleSetCenterByRoute` → `layer.goToStart()` 相机定位起点

#### 2.2 添加航线表单面板
- 自定义 `MInput` / `MSelect` / `MTimePicker` 表单组件：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | 航线名称 | 文本 | 当起终点均选 + 空时自动拼接 `{起点名} - {终点名}` |
  | 起点 / 终点 | 下拉（起降点） | 必填 |
  | 首班时间 / 末班时间 | 时间选择器 | 转秒存后端，必填 |
  | 发班间隔 | 文本（秒） | 必填 |
  | 巡航高度 | 文本（米） | 必填 |
- 提交前字段校验 → 成功后 `addFormShow=false` 重新拉取列表

#### 2.3 飞行模拟面板
- **航线详情**（复用卡片结构，右上角 `CloseOutlined` 关闭）
- **时间控制**：
  - `a-slider` 进度滑条：`max = 航线总耗时(秒)`，与下方时间选择器双向绑定
  - `a-time-picker` 精确跳转 + 禁用超出范围的时分秒
- **视角选择**（5 种）：
  | value | 视角 |
  |-------|------|
  | 0 | 自由移动 |
  | 1 | 第一人称 |
  | 3 | 第三人称 |
  | 4 | 第一人称（定制） |
  | 6 | 第三人称（定制） |
- **倍速选择**（6 档）：`x0 / x1 / x2 / x5 / x10 / x20`
- **播放控制**：
  - `开始模拟`：若停在末尾则回到起点，默认切第一人称、倍速 x2
  - `停止模拟`：倍速归零
  - 进入模拟时备份全局时间/倍速，退出后还原；默认使用第三人称
- **主循环 player**（`requestAnimationFrame` 驱动）：
  - 每帧累加：`time += (dTime / 1000) * time_step`
  - 超过 `48h` 归零循环
  - 预留 6 种视角相机跟随逻辑（第一/第三人称 + 定制版），含头部/尾部偏移与防抖动距离限制

#### 2.4 右上角全局时间面板
- 独立于模拟面板，控制全场景时间轴：
  - 时间选择器 + 倍速选择器（x0~x20）
- 与飞行模拟面板配合：打开模拟的时间选择器时自动暂停倍速，关闭后恢复

---

## 子组件

| 组件 | 路径 | 说明 |
|------|------|------|
| CustomTitle | `src/components/CustomTitle.vue` | 标题组件（可选底部装饰底图 `bottom-shape.png`） |
| MInput | `src/views/routeplan/components/MInput.vue` | 带标题前缀的表单输入框 |
| MSelect | `src/views/routeplan/components/MSelect.vue` | 带标题前缀的下拉选择器（label-key / value-key 自定义） |
| MTimePicker | `src/views/routeplan/components/MTimePicker.vue` | 带标题前缀的时间选择器 |

---

## 业务图层（routeplan/layers）

| 图层 | 路径 | 说明 |
|------|------|------|
| UamLayer | `views/routeplan/layers/UamLayer.js` | 无人机航线层：按时间驱动飞机模型沿航路点移动、goToStart 定位、updateRunnerByTime 帧更新 |
| PointLayer | `views/routeplan/layers/PointLayer.js` | 起降点图层（点击取点回调） |
| Line2 系列 | `views/routeplan/layers/lines/*.js` | 宽线几何体与材质（含 Wireframe + WebGPU 备选实现） |

---

## 核心 3D 地图引擎 (src/mymap)

自研的 Three.js 封装层，提供类 GIS 地图操作体验：

| 模块 | 文件 | 说明 |
|------|------|------|
| **入口** | `index.js` | 导出 MyMap / Layer / MapLayer / OutlineLayer |
| **核心类** | `main/MyMap.js` | Three.js 场景封装：中心点、缩放级别、旋转、鼠标手势、相机、图层管理、dispose 资源释放 |
| **图层基类** | `main/Layer.js` / `EventListener.js` | 生命周期、zIndex、事件体系 |
| **内置图层** | `layers/MapLayer.js` | 底图瓦片层（OSM/Baidu 工具在 utils） |
| | `layers/OutlineLayer.js` | 3D 建筑轮廓白膜层 |
| **后期合成** | `composer/BloomComposer.js` | Bloom 辉光后期效果 |
| **材质** | `material/Line2DMaterial.js` | 屏幕空间 2D 宽线 Shader 材质 |
| **工具** | `utils/BaiduTileUtils.js` | 百度瓦片坐标换算 |
| | `utils/OSMTileUtils.js` | OSM 瓦片坐标换算 |
| | `utils/LngLatUtils.js` | 经纬度 / Web 墨卡托互转 |
| | `utils/ColorBar2D.js` | 颜色图例条（连续色带） |
| | `utils/ModelPool.js` | 车辆/飞行器 3D 模型对象池（GLTF 缓存复用） |
| | `utils/lines/Line2.js, LineSegments2.js, LineGeometry.js, LineMaterial.js, LineSegmentsGeometry.js, Wireframe.js, WireframeGeometry2.js` | Fat Line 宽线实现（支持 WebGPU 版本） |
| | `utils/CSS2DRenderer.js` | DOM 标注 2D 渲染器 |
| **天空盒** | `skybox/{front,back,left,right,up,down}.jpg` | 立方体贴图 6 面天空盒 |

---

## 通用业务图层工具 (src/utils/MapLayer)

可直接在 MyMap 中组合使用的 17 种业务图层：

| 图层文件 | 功能 |
|----------|------|
| GeoJSONLayer.js + GeoJSONLayer.worker.js | GeoJSON 渲染（Web Worker 拆分大数据） |
| PolygonsLayer.js | 多边形批量绘制 |
| LinksLayer.js / LinkLayer.js / LinkStatsLayer.js | 路段/连接线批量 + 统计着色 |
| NetworkLayer.js | 交通网络图（节点 + 边） |
| GuangZhouLayer.js | 广州市区域专题底图 |
| ImageListLayer.js | 多图片拼接栅格层 |
| IntersectionListLayer.js | 交叉口列表层 |
| DrawLineLayer.js | 交互画线 |
| FrameSelectLayer.js | 框选交互 |
| PolygonSelectLayer.js | 多边形圈选交互 |
| PointSelectLayer.js | 点选交互 |
| ColorBar2D.js + ColorBar2DUtil.js | 色带图例组件 |

---

## 路由配置

- 入口文件：`src/router/index.ts`
- 模式：Hash 模式（`createWebHashHistory`）
- 路由表：
  ```
  /                           → redirect  /routeplan/index
  /routeplan                  → MapLayout.vue  (布局，带 3D 地图)
    └─ /routeplan/index       → routeplan/index.vue
  ```

---

## API 接口

接口定义：`src/api/routeplan.js`（基于 `src/utils/request.js` 的 Axios 封装）

| 函数 | 方法 | 路径 | 说明 |
|------|------|------|------|
| `listUam(params)` | GET | `/uam/route/infList` | 起降点列表（填充起终点下拉） |
| `genUamRoute(data)` | POST | `/uam/route/genRoute` | 生成 3 条临时候选航路 |
| `saveRoute(data)` | POST | `/uam/route2/saveRoute` | 新增/保存航线（起终点、时刻表、高度等） |
| `getRouteList(params)` | GET | `/uam/route2/routeList` | 航线列表（按 startId/endId 过滤） |

- 开发代理：`VITE_APP_BASE_API`（默认 `/dev`）→ `http://192.168.60.231:8088`
- 接口前缀通过 `.env.development` / `.env.production` 切换

---

## 环境变量

| 变量 | 开发 `.env.development` | 生产 `.env.production` | 说明 |
|------|------|------|------|
| VITE_APP_TITLE | `matsim_visualization` | `matsim_visualization` | 页面标题 |
| VITE_APP_BASE_API | `/dev` | ``（空，走同源） | 后端 API 前缀 |
| VITE_APP_PUBLIC_PATH | `/` | `/vue/` | 部署子路径 |
| VITE_APP_EXTERNAL_FILE_PATH | `/static/external` | `/vue/static/external` | 外部静态资源（3D 模型/图标）目录 |
| VITE_APP_OUTPUT_DIR | ``（空，默认 dist） | `./ocean_web_dist` | `vite build` 输出目录 |

---

## 静态资源

### 3D 模型库 (public/external/models)
共 24 款 GLTF/GLB 模型，用于道路与低空交通仿真：

| 分类 | 模型 |
|------|------|
| 民用轿车 | Sedan, SUV, Hatchback, Van, Roadster, Limousine, Muscle, Muscle_2, Monster_Truck, Pickup, Sports |
| 出租车 / 公交 | Taxi, Bus, Subway |
| 警务/应急 | Police_Sedan, Police_SUV, Police_Muscle, Police_Sports, Ambulance, Firetruck |
| 低空飞行器 | 无人机.glb / 无人机.stl |

### 交通图标集 (public/external/icon_traffic)
覆盖地面、轨道、低空、水上的全模式交通 SVG 图标：公交、出租、地铁、火车、飞机、直升机、火箭、船舶、帆船、步行、骑行、加油站、停车场、交通信号灯、摄像头、餐饮、酒店等 100+ 枚。

### 字体 (public/static/fonts)
- DigitalNumbers-Regular.ttf：数字时钟字体
- MiSans VF_Regular.json：中文字体（JSON 分片，用于 THREE 文字挤出）

---

## 项目结构

```
ocean_web/
├── public/
│   ├── favicon.ico
│   ├── static/
│   │   ├── js/config.js, proj4.js   # Proj4 坐标投影
│   │   └── fonts/                   # 数字/中文字体
│   └── external/
│       ├── models/*.gltf            # 24 款 3D 模型
│       └── icon_traffic/*.svg       # 100+ 交通图标
├── src/
│   ├── api/routeplan.js             # UAM 航路 4 个接口
│   ├── assets/
│   │   ├── style/{base,func,main,variables}.scss   # SCSS 变量全局注入
│   │   ├── images/{bottom-shape.png, point.svg}    # 标题底图/取点图标
│   │   └── logo.svg
│   ├── components/CustomTitle.vue   # 通用标题组件
│   ├── mymap/                       # 自研 Three.js 3D 地图引擎
│   │   ├── index.js
│   │   ├── main/ (MyMap, Layer, EventListener)
│   │   ├── layers/ (MapLayer, OutlineLayer)
│   │   ├── composer/ (BloomComposer)
│   │   ├── material/ (Line2DMaterial)
│   │   ├── utils/ (瓦片/经纬度/颜色条/模型池/宽线/CSS2D)
│   │   └── skybox/front..down.jpg   # 天空盒 6 面
│   ├── router/index.ts              # Hash 路由
│   ├── stores/counter.ts
│   ├── utils/
│   │   ├── MapLayer/*.js            # 17 种业务图层（GeoJSON/路网/交互选择等）
│   │   ├── index.js
│   │   └── request.js               # Axios 拦截器封装
│   ├── views/
│   │   ├── MapLayout.vue            # 3D 地图 + autofit 自适应 布局页
│   │   └── routeplan/
│   │       ├── index.vue            # 航路规划主页（3 面板 + 时间控制）
│   │       ├── components/{MInput,MSelect,MTimePicker}.vue
│   │       └── layers/ (UamLayer, PointLayer, Line2 宽线)
│   ├── App.vue
│   └── main.ts                      # 入口（含 TypeScript）
├── .env.development / .env.production / .env.serve
├── auto-import-eslintrc.json        # unplugin-auto-import ESLint 全局定义
├── auto-import-ts.d.ts              # 自动导入 TS 类型
├── components.d.ts                  # 组件自动注册类型
├── eslint.config.ts                 # ESLint 10 + Oxlint 双检查
├── .oxlintrc.json
├── .prettierrc.json
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── vite.config.ts                   # Vite 8 配置（代理/别名/SCSS 注入/svg/自动导入）
└── package.json
```

---

## 推荐 IDE 配置

[VS Code](https://code.visualstudio.com/) + [Vue - Official (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)（禁用 Vetur） + [TypeScript Vue Plugin](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin)。

## 推荐浏览器扩展

- Chromium 内核（Chrome / Edge / Brave 等）：
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [启用 Chrome DevTools Custom Object Formatter](http://bit.ly/object-formatters)
- Firefox：
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [启用 Firefox DevTools Custom Object Formatter](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## TS 对 `.vue` 导入的类型支持

TypeScript 默认无法识别 `.vue` 文件的类型导出，因此本项目使用 `vue-tsc`（而非 `tsc`）进行类型检查；编辑器端同样需要 **Volar** 插件启用「Takeover Mode」让 TS Language Service 识别 `.vue`。

## 自定义配置

参见 [Vite Configuration Reference](https://vite.dev/config/)。

---

## 项目安装

```sh
yarn
```

### 开发模式（热更新）

```sh
yarn dev        # Vite 端口 80，自动打开浏览器，/dev 代理到 192.168.60.231:8088
```

### 类型检查 + 生产构建

```sh
yarn build      # 1) vue-tsc 类型检查  2) vite build 打包
```

### 仅执行 Vite 构建（跳过类型检查）

```sh
yarn build-only
```

### 本地预览生产构建产物

```sh
yarn preview
```

### 仅类型检查

```sh
yarn type-check
```

### Lint 代码（Oxlint + ESLint 双通道）

```sh
yarn lint       # 并行执行 lint:oxlint + lint:eslint，均带 --fix
```

### 代码格式化

```sh
yarn format     # Prettier 格式化 src/
```

---

## Node 版本要求

```
^20.19.0 || >=22.12.0
```
