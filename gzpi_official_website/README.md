# 城市交通科学研究院官方网站 (gzpi_official_website)

广州市城市规划勘测设计研究院（GZPI）城市交通科学研究院官方门户网站。

## 项目简介

城市交通科学研究院是广州市城市规划勘测设计研究院（GZPI）的一支重要特色化专业团队，秉承"创新、跨界、融合、共赢"理念，以"为政府和市场提供城市智慧交通全体系、全链条解决方案"为愿景。本官网用于展示研究院概况、新闻动态、项目成果、科研建设成果及人才招聘信息。

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 核心框架 | Vue | ^3.5.25 |
| 构建工具 | Vite | ^7.2.4 |
| 路由 | Vue Router | ^4.5.1 |
| 状态管理 | Pinia | ^3.0.4 |
| UI 组件库 | Element Plus | 2.12.0 |
| 图表 | ECharts + vue-echarts | 5.5.1 / ^7.0.3 |
| HTTP 客户端 | Axios | ^1.11.0 |
| CSS 预处理器 | Sass | 1.77.5 |
| 代码格式化 | Prettier | 3.6.2 |
| 自动导入 | unplugin-auto-import | 20.3.0 |
| 组件自动注册 | unplugin-vue-components | ^30.0.0 |
| 循环滚动 | @joyday/vue-loop-scroll | ^1.1.4 |
| 文件下载 | file-saver | ^2.0.5 |

## 页面模块

项目位于 [views/](./src/views/) 目录，共包含以下 6 个页面：

### 1. 首页 (home.vue)
- 路径：`/`
- 全屏沉浸式视频背景
- 核心数据指标浮动展示（科研建设 275+、获奖项目 144 项、研究生比例 93%）
- 底部模块导航横向循环滚动，一键跳转至各子页面
- 顶部快捷菜单和搜索入口

### 2. 本院概况 (bygk.vue)
- 路径：`/bygk`
- **认识研究院**：团队愿景介绍、人才结构数据看板
  - 研究生占比 90%
  - 90后、00后占比 72%
  - 非交通专业人员比例 40%
  - 副高以上占比 32%
- **组织架构树**：三层可视化架构图
  - 第一层：城市交通研究院
  - 第二层：智慧交通研究所、轨道交通设计所/TOD规划设计所、交通规划设计所、低空经济研究中心
  - 第三层：各所下属业务方向（共12个细分方向）

### 3. 新闻中心 (xwzx.vue)
- 路径：`/xwzx`
- **院内新闻**：卡片式新闻列表，支持图片懒加载
- 分页器（每页 6 条，支持上下页/页码跳转/总数显示）
- 点击跳转至新闻详情页（外链打开）
- 数据通过后端 API 动态获取（`newsList` 接口）

### 4. 项目展示 (xmzs.vue)
- 路径：`/xmzs`
- 四大业务板块分类展示：
  - **城市综合交通规划**：广州、东莞、遵义、南沙等综合交通规划项目
  - **智慧交通**：多智能体仿真平台、拥堵评估优化、智慧道路工程、停车数字治理等
  - **枢纽与物流**：铁路客运枢纽、物流基地多式联运、交通物流融合、TOD综合开发等
  - **低空经济**：空天地一体低空智能网联基础设施、多智能体低空仿真平台

### 5. 科研成果 (kycg.vue)
- 路径：`/kycg`
- **项目获奖**：
  - 获奖总数 114 项（国家及部级奖 19 项、省级 34 项、市级 61 项、局级 21 项）
  - 历年获奖项目滚动列表（含2022-2024年广东省一等奖、特等奖等）
- **集体荣誉**：共 11 次
  - 5 次先进集体（2015/2018/2020/2021/2022 连续三年蝉联）
  - 3 次优秀党支部（2016/2021/2024）
  - 3 次质量管理奖（2016/2017/2021）
- **科研建设**：共 275+ 项
  - 科研课题 50 项（含国家自然科学基金面上项目 1 项、优秀课题 22 项）
  - 论文专著 167 篇（核心期刊 51 篇、出版专著 8 部）
  - 知识产权 40 项（发明专利 23 项、实用新型 7 项、软件著作权 11 项）
  - 主编和参编标准 18 项

### 6. 人才招聘 (rczp.vue)
- 路径：`/rczp`
- **招聘岗位表格**：含岗位名称、地区、招聘人数、学历要求、发布日期
- 每行支持展开查看职位描述和简历投递方式
- 当前开放岗位（示例）：
  - 低空经济与物流产业策划师/规划师
  - 中高级 Java 开发
  - 中高级 webGIS 开发
  - 主创规划师及规划师岗（TOD规划设计）
  - 规划师岗（低空规划设计）
  - 规划师岗（物流规划/产业咨询）
  - 助理规划师岗（物流规划/产业咨询）

## 公共组件

| 组件 | 路径 | 说明 |
|------|------|------|
| MHeader | [MHeader.vue](./src/components/MHeader.vue) | 全局顶部导航栏（Logo、6 个页面导航、搜索框），sticky 吸顶 |
| MFooter | [MFooter.vue](./src/components/MFooter.vue) | 全局页脚组件 |

## 路由配置

- 路由模式：Hash 模式（`createWebHashHistory`）
- 入口文件：[index.js](./src/router/index.js)
- 支持通过 query 参数 `?scroll=id` 定位到页面锚点

## API 接口

接口定义位于 [home.js](./src/api/home.js)，基于 Axios 封装：

| 接口函数 | 方法 | 路径 | 说明 |
|----------|------|------|------|
| `newsList` | GET | `/news/page` | 新闻分页列表 |
| `newsDetail` | GET | `/news/detail/{id}` | 新闻详情 |
| `newsAdd` | PUT | `/news` | 新增新闻 |
| `newsUpdate` | POST | `/news/update` | 修改新闻 |
| `newsDelete` | DELETE | `/news/delete/{ids}` | 删除新闻 |
| `newsAnnexAdd` | PUT | `/newsAnnex` | 新增附件 |
| `newsAnnexDelete` | DELETE | `/newsAnnex/delete/{ids}` | 删除附件 |
| `newsAnnexBatchDownload` | GET | `/newsAnnex/batchDownload/{ids}` | 批量下载附件 |
| `pdfWatermark` | POST | `/pdf/watermark` | PDF 添加水印 |
| `indexHotLinkClick` | POST | `/indexHotLink/click` | 热点链接点击统计 |
| `indexHotLinkHotLinks` | GET | `/indexHotLink/hotLinks` | 获取热点链接列表 |

接口基础地址通过环境变量 `VITE_APP_BASE_API` 配置，详见 [.env.development](./.env.development) 和 [.env.production](./.env.production)。

## 项目结构

```
gzpi_official_website/
├── public/                  # 静态资源
│   ├── favicon.ico
│   └── *.mp4                # 首页背景视频
├── src/
│   ├── api/                 # 接口定义
│   │   └── home.js
│   ├── assets/              # 静态资源
│   │   ├── base.css
│   │   ├── main.css
│   │   ├── favicon.png
│   │   ├── logo.svg
│   │   └── image/           # 各页面图片资源（bygk/footer/header/home/kycg/rczp/xmzs/xwzx）
│   ├── components/          # 公共组件
│   │   ├── MHeader.vue
│   │   └── MFooter.vue
│   ├── router/              # 路由配置
│   │   └── index.js
│   ├── stores/              # Pinia 状态
│   │   └── counter.js
│   ├── utils/               # 工具函数
│   │   ├── index.js
│   │   └── request.js       # Axios 封装
│   ├── views/               # 页面模块（6个）
│   │   ├── home.vue
│   │   ├── bygk.vue
│   │   ├── xwzx.vue
│   │   ├── xmzs.vue
│   │   ├── kycg.vue
│   │   └── rczp.vue
│   ├── App.vue
│   └── main.js
├── .env.development         # 开发环境变量
├── .env.production          # 生产环境变量
├── .prettierrc.json         # Prettier 配置
├── jsconfig.json
├── vite.config.js           # Vite 配置（含 SVG 图标、Gzip 压缩、Vue DevTools 插件）
└── package.json
```

## 推荐 IDE 配置

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)（需禁用 Vetur）。

## 推荐浏览器扩展

- Chromium 内核浏览器（Chrome / Edge / Brave 等）：
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [在 Chrome DevTools 中启用 Custom Object Formatter](http://bit.ly/object-formatters)
- Firefox：
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [在 Firefox DevTools 中启用 Custom Object Formatter](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## 自定义配置

详见 [Vite Configuration Reference](https://vite.dev/config/)。

## 项目安装

```sh
npm install
```

### 开发环境编译与热更新

```sh
npm run dev
```

### 生产环境编译与压缩

```sh
npm run build
```

### 本地预览生产构建产物

```sh
npm run preview
```

### 代码格式化

```sh
npm run format
```

## Node 版本要求

```
^20.19.0 || >=22.12.0
```
