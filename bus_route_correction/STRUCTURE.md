### 项目结构 v2

```
|   .browserslistrc                                             /* 目标浏览器配置 */
|   .env.development                                            /* 开发环境变量 */
|   .env.production                                             /* 生产环境变量 */
|   .env.serve                                                  /* serve 环境变量 */
|   .gitignore                                                  /* git 忽略文件配置 */
|   babel.config.js                                             /* Babel (JS 版本兼容库) 配置文件 */
|   jsconfig.json                                               /* JS 项目配置文件 (路径别名等) */
|   LAYER_HEIGHT.md                                             /* 图层高度配置说明 */
|   package.json                                                /* 项目依赖包信息 */
|   package-lock.json                                           /* 项目依赖锁定文件 (npm) */
|   README.md                                                   /* 项目说明文档 */
|   STRUCTURE.md                                                /* 原项目结构说明 (v1) */
|   STRUCTURE.v2.md                                             /* 当前项目结构说明 (v2) */
|   vue.config.js                                               /* Vue CLI 项目配置文件 */
|   yarn.lock                                                   /* 项目依赖锁定文件 (yarn) */
|
+---public                                                      /* 静态文件目录 (项目运行和打包时都不会编译当前目录的文件) */
|   |   index.html                                              /* 项目入口编译模板文件 */
|   |
|   +---static
|   |   |   config.js                                           /* 项目配置文件 */
|   |   |   proj4.js                                            /* 坐标投影转换库 */
|   |   |
|   |   +---external
|   |   |   +---icon_traffic                                    /* 交通相关图标集合目录 (SVG/PNG) */
|   |   |   |
|   |   |   +---models                                          /* 3D 模型文件目录 (GLTF/GLB/STL) */
|   |   |   |
|   |   |   \---ptHelpImages                                    /* 公交功能帮助图像目录 */
|   |   |       +---comparativeAnalysis                         /* 对比分析帮助图目录 */
|   |   |       +---opAndca                                     /* 运营与配置分析帮助图目录 */
|   |   |       +---operationsAnalysis                          /* 运营分析帮助图目录 */
|   |   |       +---planAdjustment                              /* 方案调整帮助图目录 */
|   |   |       \---systemEvaluation                            /* 系统评估帮助图目录 */
|   |   |
|   |   +---fonts                                               /* 字体文件目录 */
|   |   |
|   |   +---img                                                 /* 图片资源目录 */
|   |   |
|   |   \---js
|   |           config.js
|   |           proj4.js
|   |
|   \---styles
|       \---theme-chalk
|               index.css
|
\---src
    |   App.vue (根目录无此文件，各 pages 独立拥有)              /* 注意：根 App.vue 在各 page 子目录下 */
    |   main.js (根目录无此文件，各 pages 独立拥有)              /* 注意：根 main.js 在各 page 子目录下 */
    |
    +---api                                                     /* API 接口目录 */
    |   |   arraybuffer.js                                      /* ArrayBuffer 请求封装 */
    |   |   contrast.js                                         /* 对比分析相关接口 */
    |   |   crt.js                                              /* CRT 相关接口 */
    |   |   database.js                                         /* 数据库相关接口 */
    |   |   feedback.js                                         /* 反馈相关接口 */
    |   |   index.js                                            /* API 统一出口 */
    |   |   login.js                                            /* 登录相关接口 */
    |   |   menu.js                                             /* 菜单相关接口 */
    |   |
    |   +---monitor                                             /* 监控管理接口 */
    |   |       cache.js                                        /* 缓存监控接口 */
    |   |       job.js                                          /* 定时任务接口 */
    |   |       jobLog.js                                       /* 任务日志接口 */
    |   |       logininfor.js                                   /* 登录日志接口 */
    |   |       online.js                                       /* 在线用户接口 */
    |   |       operlog.js                                      /* 操作日志接口 */
    |   |       server.js                                       /* 服务监控接口 */
    |   |
    |   +---system                                              /* 系统管理接口 */
    |   |   |   config.js                                       /* 参数配置接口 */
    |   |   |   dept.js                                         /* 部门管理接口 */
    |   |   |   menu.js                                         /* 菜单管理接口 */
    |   |   |   notice.js                                       /* 通知公告接口 */
    |   |   |   post.js                                         /* 岗位管理接口 */
    |   |   |   role.js                                         /* 角色管理接口 */
    |   |   |   user.js                                         /* 用户管理接口 */
    |   |   |
    |   |   \---dict                                            /* 字典管理接口 */
    |   |           data.js                                     /* 字典数据接口 */
    |   |           type.js                                     /* 字典类型接口 */
    |   |
    |   \---tool                                                /* 系统工具接口 */
    |           gen.js                                          /* 代码生成接口 */
    |
    +---assets                                                  /* 静态资源目录 (项目运行和打包时会编译当前目录的文件) */
    |   +---401_images                                          /* 401 页面图片目录 */
    |   |
    |   +---404_images                                          /* 404 页面图片目录 */
    |   |
    |   +---css                                                 /* 全局样式文件目录 (含字体文件) */
    |   |       element.style.scss                              /* Element UI 样式覆盖 */
    |   |       element.variables.scss                          /* Element UI 变量 */
    |   |       style.css                                       /* 全局自定义样式 */
    |   |
    |   +---icons                                               /* SVG 图标库 */
    |   |   |   index.js                                        /* SVG 图标注册 */
    |   |   |   svgo.yml                                        /* SVG 优化配置 */
    |   |   |
    |   |   \---svg                                             /* SVG 图标文件目录 (约 90+ 个) */
    |   |
    |   +---image                                               /* 项目图片资源目录 */
    |   |   +---home                                            /* 首页相关图片目录 */
    |   |   +---penguins                                        /* 企鹅贴图 (天空盒) 目录 */
    |   |   +---penguins2                                       /* 企鹅贴图 v2 (天空盒) 目录 */
    |   |   \---user                                            /* 用户相关图片目录 */
    |   |
    |   +---images                                              /* 通用图片目录 */
    |   |
    |   \---logo                                                /* Logo 资源目录 (含 logo.png) */
    |
    +---components                                              /* 全局通用组件目录 */
    |   |   AutoSize.vue                                        /* 自动调整大小组件 */
    |   |   ColorPicker.vue                                     /* 单个颜色选择器 */
    |   |   ColorSelect.vue                                     /* 渐变颜色选择器 */
    |   |   Dialog.vue                                          /* 弹窗组件 (可拖动) */
    |   |   DialogRight.vue                                     /* 右侧弹窗组件 */
    |   |   IconSelect.vue                                      /* 图标选择组件 */
    |   |   MyVIdeo.vue                                         /* 视频播放组件 (未使用) */
    |   |   Pagination.vue                                      /* 分页组件 */
    |   |   QuillEditor.vue                                     /* 富文本编辑器组件 */
    |   |   RouteSelect.vue                                     /* 线路选择器 */
    |   |   Tags.vue                                            /* 可增加标签组件 */
    |   |   TimeRangeSlider.vue                                 /* 时间范围滑块 */
    |   |   TimeSlider.vue                                      /* 时间滑块 */
    |   |   Typewriter.vue                                      /* 打字机效果组件 */
    |   |
    |   +---BeiAnBox                                            /* 备案号组件 */
    |   |       BeiAnBox.vue
    |   |       index.js
    |   |
    |   +---Clock                                               /* 时钟组件 (已弃用但仍被注册引用) */
    |   |       index.vue
    |   |       (图片资源同目录，未单独列出)
    |   |
    |   +---Drawer                                              /* 抽屉组件 */
    |   |       bottom.vue
    |   |       index.vue
    |   |       left.vue
    |   |       mixins.js
    |   |       right.vue
    |   |       top.vue
    |   |
    |   +---NewClock                                            /* 新的时钟/工具栏组件 */
    |   |   |   Bug.vue                                         /* Bug 按钮 */
    |   |   |   Help.vue                                        /* 帮助按钮 */
    |   |   |   index.vue
    |   |   |   Language.vue                                    /* 语言选择按钮 */
    |   |   |   Luopan.vue                                      /* 罗盘组件 (显示地图方向) */
    |   |   |   MapStyle.vue                                    /* 切换地图样式按钮 */
    |   |   |   TimeSlider.vue                                  /* 时间滑块 */
    |   |   |
    |   |   \---images                                          /* 新时钟组件图片目录 */
    |   |
    |   +---SvgIcon                                             /* SVG 图标组件 */
    |   |       index.vue
    |   |
    |   \---vue-codemirror                                      /* 代码编辑器组件 (文本对比控件) */
    |           formatting.js
    |           index.vue
    |
    +---directive                                               /* 自定义 Vue 指令 */
    |   |   index.js                                            /* 指令统一出口 */
    |   |
    |   +---dialog                                              /* 对话框拖动指令 */
    |   |       drag.js                                         /* 拖动指令 */
    |   |       dragHeight.js                                   /* 高度调整指令 */
    |   |       dragWidth.js                                    /* 宽度调整指令 */
    |   |
    |   +---module                                              /* 模块指令 */
    |   |       clipboard.js                                    /* 剪贴板指令 */
    |   |
    |   \---permission                                          /* 权限指令 */
    |           hasPermi.js                                     /* 菜单权限判断 */
    |           hasRole.js                                      /* 角色权限判断 */
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
    |   +---composer                                            /* Three.js 后期处理封装 */
    |   |       BloomComposer.js                                /* 泛光效果 */
    |   |
    |   +---geometry                                            /* Three.js 几何体封装 */
    |   |       GeoJSONLine.js                                  /* GeoJSON 线几何体 */
    |   |       GeoJSONPoint.js                                 /* GeoJSON 点几何体 */
    |   |       GeoJSONPolygon.js                               /* GeoJSON 多边形几何体 */
    |   |       Text2DGeometry.js                               /* 2D 文本几何体 */
    |   |
    |   +---layers                                              /* 地图图层 (基础) */
    |   |       MapLayer.js                                     /* 地图瓦片图层 v1 */
    |   |       MapLayer2.js                                    /* 地图瓦片图层 v2 (未使用) */
    |   |       OutlineLayer.js                                 /* 带呼吸效果的图层 */
    |   |       WeatherLayer.js                                 /* 天气图层 (未完成/未使用) */
    |   |
    |   +---main                                                /* 地图核心类 */
    |   |       EventListener.js                                /* 事件监听器 */
    |   |       Layer.js                                        /* 地图图层基类 */
    |   |       MyMap.js                                        /* 地图核心类 */
    |   |
    |   \---utils                                               /* 地图工具类 */
    |           BaiduLngLatUtils.py                             /* 百度坐标转换 (Python，未使用) */
    |           BaiduTileUtils.js                               /* 百度瓦片工具 */
    |           ColorBar2D.js                                   /* 颜色条 v1 */
    |           ColorBar2D.v2.js                                /* 颜色条 v2 */
    |           GeoJSON.worker.js                               /* GeoJSON 处理 Web Worker */
    |           index.js                                        /* 工具类出口 */
    |           LngLatUtils.js                                  /* 经纬度工具类 */
    |           ModelPool.js                                    /* 模型池 */
    |           OSMTileUtils.js                                 /* OSM 瓦片工具 (未使用) */
    |           SpriteText.js                                   /* 精灵文本 */
    |
    +---pages                                                   /* 多页面应用目录 (替代原 views 目录) */
    |   +---admin                                               /* 后台管理系统页面 */
    |   |   |   App.vue                                         /* Admin 根节点 */
    |   |   |   main.js                                         /* Admin 启动入口 */
    |   |   |   permission.js                                   /* Admin 路由权限控制 */
    |   |   |   router.js                                       /* Admin 路由配置 */
    |   |   |   settings.js                                     /* Admin 系统设置 */
    |   |   |
    |   |   +---components                                      /* Admin 通用组件 */
    |   |   |   +---Breadcrumb                                  /* 面包屑导航 */
    |   |   |   |       index.vue
    |   |   |   |
    |   |   |   +---Crontab                                     /* Cron 表达式组件 */
    |   |   |   |       day.vue / hour.vue / index.vue
    |   |   |   |       min.vue / month.vue / result.vue
    |   |   |   |       second.vue / week.vue / year.vue
    |   |   |   |
    |   |   |   +---DictData                                    /* 字典数据组件 */
    |   |   |   |       index.js
    |   |   |   |
    |   |   |   +---DictTag                                     /* 字典标签组件 */
    |   |   |   |       index.vue
    |   |   |   |
    |   |   |   +---Editor                                      /* 编辑器组件 */
    |   |   |   |       index.vue
    |   |   |   |
    |   |   |   +---FileUpload                                  /* 文件上传组件 */
    |   |   |   |       index.vue
    |   |   |   |
    |   |   |   +---Hamburger                                   /* 汉堡菜单按钮 */
    |   |   |   |       index.vue
    |   |   |   |
    |   |   |   +---HeaderSearch                                /* 顶部搜索组件 */
    |   |   |   |       index.vue
    |   |   |   |
    |   |   |   +---IconSelect                                  /* 图标选择组件 */
    |   |   |   |       index.vue
    |   |   |   |       requireIcons.js
    |   |   |   |
    |   |   |   +---ImagePreview                                /* 图片预览组件 */
    |   |   |   |       index.vue
    |   |   |   |
    |   |   |   +---ImageUpload                                 /* 图片上传组件 */
    |   |   |   |       index.vue
    |   |   |   |
    |   |   |   +---Pagination                                  /* 分页组件 */
    |   |   |   |       index.vue
    |   |   |   |
    |   |   |   +---PanThumb                                    /* 全景缩略图组件 (未使用) */
    |   |   |   |       index.vue
    |   |   |   |
    |   |   |   +---ParentView                                  /* 父级路由视图 */
    |   |   |   |       index.vue
    |   |   |   |
    |   |   |   +---RightPanel                                  /* 右侧面板组件 */
    |   |   |   |       index.vue
    |   |   |   |
    |   |   |   +---RightToolbar                                /* 右侧工具栏组件 */
    |   |   |   |       index.vue
    |   |   |   |
    |   |   |   +---RuoYi                                       /* 若依框架相关链接 */
    |   |   |   |   +---Doc                                     /* 文档链接 */
    |   |   |   |   |       index.vue
    |   |   |   |   |
    |   |   |   |   \---Git                                     /* Git 仓库链接 */
    |   |   |   |           index.vue
    |   |   |   |
    |   |   |   +---Screenfull                                  /* 全屏组件 */
    |   |   |   |       index.vue
    |   |   |   |
    |   |   |   +---SizeSelect                                  /* 尺寸选择组件 */
    |   |   |   |       index.vue
    |   |   |   |
    |   |   |   +---ThemePicker                                 /* 主题选择组件 */
    |   |   |   |       index.vue
    |   |   |   |
    |   |   |   +---TopNav                                      /* 顶部导航组件 */
    |   |   |   |       index.vue
    |   |   |   |
    |   |   |   \---iFrame                                      /* 内嵌 iframe 组件 */
    |   |   |           index.vue
    |   |   |
    |   |   +---layout                                          /* Admin 布局组件 */
    |   |   |   |   index.vue
    |   |   |   |
    |   |   |   +---components                                  /* 布局子组件 */
    |   |   |   |   |   AppMain.vue                             /* 主内容区 */
    |   |   |   |   |   index.js
    |   |   |   |   |   Navbar.vue                              /* 导航栏 */
    |   |   |   |   |
    |   |   |   |   +---IframeToggle                            /* iframe 切换 */
    |   |   |   |   |       index.vue
    |   |   |   |   |
    |   |   |   |   +---InnerLink                               /* 内部链接 */
    |   |   |   |   |       index.vue
    |   |   |   |   |
    |   |   |   |   +---Settings                                /* 系统设置面板 */
    |   |   |   |   |       index.vue
    |   |   |   |   |
    |   |   |   |   +---Sidebar                                 /* 侧边栏 */
    |   |   |   |   |       FixiOSBug.js
    |   |   |   |   |       Item.vue
    |   |   |   |   |       Link.vue
    |   |   |   |   |       Logo.vue
    |   |   |   |   |       SidebarItem.vue
    |   |   |   |   |       index.vue
    |   |   |   |   |
    |   |   |   |   \---TagsView                                /* 标签页视图 */
    |   |   |   |           ScrollPane.vue
    |   |   |   |           index.vue
    |   |   |   |
    |   |   |   \---mixin                                       /* 布局混入 */
    |   |   |           ResizeHandler.js                        /* 窗口大小处理 */
    |   |   |
    |   |   +---store                                           /* Admin Vuex 状态管理 */
    |   |   |   |   index.js
    |   |   |   |
    |   |   |   \---modules
    |   |   |           app.js                                  /* 应用状态 */
    |   |   |           permission.js                           /* 权限状态 */
    |   |   |           settings.js                             /* 设置状态 */
    |   |   |           tagsView.js                             /* 标签页状态 */
    |   |   |
    |   |   +---styles                                          /* Admin 样式文件 */
    |   |   |       btn.scss / element-ui.scss / element-variables.scss
    |   |   |       index.scss / mixin.scss / ruoyi.scss
    |   |   |       sidebar.scss / transition.scss / variables.scss
    |   |   |
    |   |   \---views                                           /* Admin 页面视图 */
    |   |       |   index.vue
    |   |       |   index_v1.vue                                /* 旧版首页 (未使用) */
    |   |       |   login.vue / register.vue
    |   |       |   redirect.vue
    |   |       |
    |   |       +---dashboard                                   /* 仪表盘 */
    |   |       |   |   BarChart.vue / LineChart.vue
    |   |       |   |   PanelGroup.vue / PieChart.vue
    |   |       |   |   RaddarChart.vue
    |   |       |   |
    |   |       |   \---mixins
    |   |       |           resize.js
    |   |       |
    |   |       +---error                                       /* 错误页面 */
    |   |       |       401.vue / 404.vue
    |   |       |
    |   |       +---monitor                                     /* 系统监控页面 */
    |   |       |   +---cache                                   /* 缓存监控 */
    |   |       |   |       index.vue / list.vue
    |   |       |   |
    |   |       |   +---druid                                   /* Druid 监控 */
    |   |       |   |       index.vue
    |   |       |   |
    |   |       |   +---job                                     /* 定时任务 */
    |   |       |   |       index.vue / log.vue
    |   |       |   |
    |   |       |   +---logininfor                              /* 登录日志 */
    |   |       |   |       index.vue
    |   |       |   |
    |   |       |   +---online                                  /* 在线用户 */
    |   |       |   |       index.vue
    |   |       |   |
    |   |       |   +---operlog                                 /* 操作日志 */
    |   |       |   |       index.vue
    |   |       |   |
    |   |       |   \---server                                  /* 服务监控 */
    |   |       |           index.vue
    |   |       |
    |   |       +---system                                      /* 系统管理页面 */
    |   |       |   +---config                                  /* 参数配置 */
    |   |       |   |       index.vue
    |   |       |   |
    |   |       |   +---dept                                    /* 部门管理 */
    |   |       |   |       index.vue
    |   |       |   |
    |   |       |   +---dict                                    /* 字典管理 */
    |   |       |   |       data.vue / index.vue
    |   |       |   |
    |   |       |   +---menu                                    /* 菜单管理 */
    |   |       |   |       index.vue
    |   |       |   |
    |   |       |   +---notice                                  /* 通知公告 */
    |   |       |   |       index.vue
    |   |       |   |
    |   |       |   +---post                                    /* 岗位管理 */
    |   |       |   |       index.vue
    |   |       |   |
    |   |       |   +---role                                    /* 角色管理 */
    |   |       |   |       authUser.vue / index.vue
    |   |       |   |       selectUser.vue
    |   |       |   |
    |   |       |   \---user                                    /* 用户管理 */
    |   |       |       |   authRole.vue / index.vue
    |   |       |       |
    |   |       |       \---profile                             /* 个人中心 */
    |   |       |               index.vue / resetPwd.vue
    |   |       |               userAvatar.vue / userInfo.vue
    |   |       |
    |   |       \---tool                                        /* 系统工具页面 */
    |   |           +---build                                   /* 表单构建 (未使用，路由未配置) */
    |   |           |       CodeTypeDialog.vue / DraggableItem.vue
    |   |           |       IconsDialog.vue / RightPanel.vue
    |   |           |       TreeNodeDialog.vue / index.vue
    |   |           |
    |   |           +---gen                                     /* 代码生成 */
    |   |           |       basicInfoForm.vue / createTable.vue
    |   |           |       editTable.vue / genInfoForm.vue
    |   |           |       importTable.vue / index.vue
    |   |           |
    |   |           \---swagger                                 /* Swagger 文档 */
    |   |                   index.vue
    |   |
    |   +---dh_index                                            /* 大华首页 (独立页面，未使用/已注释) */
    |   |       App.vue
    |   |       main.js
    |   |       store.js
    |   |       style.css
    |   |
    |   +---feedback                                            /* 反馈系统页面 */
    |   |   |   App.vue
    |   |   |   main.js
    |   |   |   router.js
    |   |   |   style.css
    |   |   |
    |   |   +---components
    |   |   |       CommentItem.vue
    |   |   |
    |   |   \---view
    |   |           add.vue                                     /* 新增反馈 */
    |   |           detail.vue                                  /* 反馈详情 */
    |   |           list.vue                                    /* 反馈列表 */
    |   |
    |   +---index                                               /* 系统首页入口 (独立页面) */
    |   |       App.vue
    |   |       main.js
    |   |       style.css
    |   |
    |   +---pt_index                                            /* PT 首页 (独立页面，通过 vue.config.js 入口加载) */
    |   |       App.vue
    |   |       main.js
    |   |       store.js
    |   |
    |   +---user                                                /* 用户端页面 (独立页面，通过 vue.config.js 入口加载) */
    |   |   |   App.vue
    |   |   |   main.js
    |   |   |   store.js
    |   |   |
    |   |   \---views
    |   |       login.vue
    |   |       register.vue
    |   |
    |   \---pt                                                  /* 公共交通 (PT) 主业务页面 */
    |       |   App.vue                                         /* PT 根节点 */
    |       |   main.js                                         /* PT 启动入口 */
    |       |   router.js                                       /* PT 路由配置 */
    |       |   store.js                                        /* PT 状态管理 */
    |       |   style.scss                                      /* PT 全局样式 */
    |       |
    |       \---views                                           /* PT 业务视图 */
    |           |   index.vue                                   /* PT 功能选择主页 */
    |           |   index2.vue                                  /* PT 主页 v2 */
    |           |   index3.vue                                  /* PT 主页 v3 */
    |           |
    |           +---comparativeAnalysis                         /* 对比分析模块 */
    |           |   |   index.vue                               /* 对比分析主页 */
    |           |   |
    |           |   \---component                               /* 对比分析组件 */
    |           |       +---AnalysisReport                      /* 公交出行影响对比分析报告 */
    |           |       |   |   echart_utils.js                 /* 图表工具函数 */
    |           |       |   |   index.vue                       /* 左侧工具控件 */
    |           |       |   |
    |           |       |   +---dialog                          /* 弹窗组件 */
    |           |       |   |   |   TestDialog.vue              /* 测试弹窗 */
    |           |       |   |   |
    |           |       |   |   +---ActivityAttributes          /* 活动属性弹窗 */
    |           |       |   |   |       ResidenceTime.vue       /* 停留时间弹窗 */
    |           |       |   |   |       TravelMode.vue          /* 出行方式弹窗 */
    |           |       |   |   |       TravelPurpose.vue       /* 出行目的弹窗 */
    |           |       |   |   |       TravelTime.vue          /* 出行时间弹窗 */
    |           |       |   |   |
    |           |       |   |   +---TravelAttribute             /* 出行属性弹窗 */
    |           |       |   |   |       index.vue
    |           |       |   |   |
    |           |       |   |   +---TravelerAttributes          /* 出行者属性弹窗 */
    |           |       |   |   |       TravelersAge.vue        /* 出行者年龄弹窗 */
    |           |       |   |   |       TravelersCarAvailability.vue /* 出行者车辆可使用情况弹窗 */
    |           |       |   |   |       TravelersCarLicense.vue /* 出行者机动车保有量弹窗 */
    |           |       |   |   |       TravelersEmployed.vue   /* 出行者就业情况弹窗 */
    |           |       |   |   |       TravelersSex.vue        /* 出行者性别弹窗 */
    |           |       |   |   |
    |           |       |   |   +---TravelUtilityTree           /* 出行效用决策树弹窗 */
    |           |       |   |   |       index.json              /* 决策树结构 JSON */
    |           |       |   |   |       index.vue
    |           |       |   |   |
    |           |       |   |   \---TravelVariationTree         /* 出行变化决策树弹窗 */
    |           |       |   |           index.json              /* 决策树结构 JSON */
    |           |       |   |           index.vue
    |           |       |   |
    |           |       |   \---toolbar                         /* 右侧工具控件 */
    |           |       |           ReportToolbar.vue           /* 报告控件 */
    |           |       |
    |           |       +---HelpDialog                          /* 帮助弹窗 */
    |           |       |       index.vue
    |           |       |       index2.vue                      /* 帮助弹窗 v2 (未使用) */
    |           |       |
    |           |       +---LinesAnalysis                       /* 线路对比分析 */
    |           |       |   |   index.vue                       /* 左侧工具控件 */
    |           |       |   |
    |           |       |   +---dialog                          /* 弹窗组件 */
    |           |       |   |   +---PassengerFlowDialog         /* 客流变化弹窗 */
    |           |       |   |   |       index.vue
    |           |       |   |   |       PassengersEnteringLeaving.vue /* 乘客进出图表 */
    |           |       |   |   |       RouteAttributes.vue     /* 路线属性图表 */
    |           |       |   |   |       RouteFlows.vue          /* 路线流量图表 */
    |           |       |   |   |       RouteTimeDiagram.vue    /* 路线时间图 */
    |           |       |   |   |
    |           |       |   |   +---RoutesChangeDialog          /* 线路变动信息弹窗 */
    |           |       |   |   |       index.vue
    |           |       |   |   |
    |           |       |   |   +---StopsChangeDialog           /* 站点变动信息弹窗 */
    |           |       |   |   |       index.vue
    |           |       |   |   |
    |           |       |   |   +---TimetableDialog             /* 时刻表对比弹窗 */
    |           |       |   |   |       index.vue
    |           |       |   |   |
    |           |       |   |   \---XmlComparisonDialog         /* XML 对比弹窗 */
    |           |       |   |           index.vue
    |           |       |   |
    |           |       |   +---layer                           /* 地图图层文件夹 */
    |           |       |   |       BusLineLayer.js             /* 单条公交线路图层 */
    |           |       |   |       BusLineListLayer.js         /* 多条公交线路图层 */
    |           |       |   |       BusStopLayer.js             /* 单个公交站点图层 */
    |           |       |   |       BusStopListLayer.js         /* 多个公交站点图层 */
    |           |       |   |       RouteFlowsLayer.js          /* 公交线路流量图层 */
    |           |       |   |
    |           |       |   \---toolbar                         /* 右侧工具控件 */
    |           |       |           LinesChangeInfo.vue         /* 线路比对分析控件 */
    |           |       |           RouteFlows.vue              /* 公交线路流量控件 */
    |           |       |
    |           |       +---PageConfig                          /* 页面配置组件 */
    |           |       |       configMixins.js                 /* 配置混入 */
    |           |       |       defaultConfig.js                /* 默认配置 */
    |           |       |       index.vue
    |           |       |
    |           |       \---Toolbar                             /* 右侧功能模块根节点 */
    |           |               index.vue
    |           |
    |           +---demo                                        /* 测试/演示模块 */
    |           |   \---page1
    |           |       |   index.vue
    |           |       |
    |           |       \---layer
    |           |               CarLayer.js
    |           |               CarLayer.worker.js
    |           |               LineLayer.js
    |           |
    |           +---operationsAnalysis                          /* MATSim 运营分析 (webViz) */
    |           |   |   index.vue                               /* 运营分析主页 */
    |           |   |   mixins.js                               /* 和对比分析主页共用代码 */
    |           |   |
    |           |   +---component                               /* 功能组件 */
    |           |   |   +---Activity3D                          /* 3D 活动模块 */
    |           |   |   |   |   index.vue
    |           |   |   |   |
    |           |   |   |   +---layer                           /* 图层 */
    |           |   |   |   |       Activity3DLayer.js          /* 3D 活动图层 */
    |           |   |   |   |       ActivityRoutesLayer.js      /* 3D 活动线路图层 */
    |           |   |   |   |       SelectActivityLayer.js      /* 3D 活动选择图层 */
    |           |   |   |   |
    |           |   |   |   +---toolbar                         /* 工具栏 */
    |           |   |   |   |       ActivityDetail.vue          /* 3D 活动详情 */
    |           |   |   |   |       SreachActivity.vue          /* 活动搜索 */
    |           |   |   |   |
    |           |   |   |   \---worker                          /* Web Worker 多线程 */
    |           |   |   |           Activity3DLayer.worker.js   /* 3D 活动图层数据处理 */
    |           |   |   |
    |           |   |   +---Build3D                             /* 3D 建筑物模块 */
    |           |   |   |   |   index.vue
    |           |   |   |   |
    |           |   |   |   +---layer                           /* 图层 */
    |           |   |   |   |       Build3DLayer.js             /* 3D 建筑物图层 v1 */
    |           |   |   |   |       Build3DLayer2.js            /* 3D 建筑物图层 v2 */
    |           |   |   |   |       Build3DLayer.worker.js      /* 建筑物图层 Worker */
    |           |   |   |   |       BuildFlowLayer.js           /* 建筑物流量图层 */
    |           |   |   |   |       SelectBuild3DLayer.js       /* 建筑物选择图层 */
    |           |   |   |   |
    |           |   |   |   \---toolbar                         /* 工具栏 */
    |           |   |   |           buildDetail.vue             /* 建筑物详情 */
    |           |   |   |           selectBuildAnalysis.vue     /* 建筑物流量分析 */
    |           |   |   |           sreachBuild.vue             /* 建筑物搜索 */
    |           |   |   |
    |           |   |   +---CarTravel                           /* 私家车出行模块 */
    |           |   |   |   |   index.vue
    |           |   |   |   |   utils.js                        /* 工具函数 */
    |           |   |   |   |
    |           |   |   |   +---layer                           /* 图层 */
    |           |   |   |   |       CarTravelLayer.js           /* 私家车图层 (小) */
    |           |   |   |   |       CarTravelLayer2.js          /* 私家车图层 (中) */
    |           |   |   |   |       CarTravelLayer3.js          /* 私家车图层 (大) */
    |           |   |   |   |       CarTravelLayer4.js          /* 测试图层 (未使用) */
    |           |   |   |   |
    |           |   |   |   +---toolbar                         /* 工具栏 */
    |           |   |   |   |       carTravelDetail.vue         /* 私家车出行详情 */
    |           |   |   |   |
    |           |   |   |   \---worker                          /* Web Worker */
    |           |   |   |           CarTravelLayer.worker.js
    |           |   |   |
    |           |   |   +---CityUpdateArea                      /* 城市更新区域分析模块 */
    |           |   |   |   |   index.vue
    |           |   |   |   |
    |           |   |   |   +---component                       /* 子组件 */
    |           |   |   |   |   +---AddAreaAnalysis             /* 添加区域分析流程 */
    |           |   |   |   |   |       Step1Dialog.vue
    |           |   |   |   |   |       Step2Dialog.vue
    |           |   |   |   |   |       index.vue
    |           |   |   |   |   |
    |           |   |   |   |   +---AnalysisDetail.vue          /* 区域分析详情 */
    |           |   |   |   |   +---AreaFromItem.vue            /* 区域表单控件 */
    |           |   |   |   |   \---MySlider.vue                /* 自定义滑块 */
    |           |   |   |   |
    |           |   |   |   +---layer                           /* 图层 */
    |           |   |   |   |       GeoJSONLabelLayer.js        /* GeoJSON 标签图层 */
    |           |   |   |   |       PolygonSelectLayer.js       /* 多边形选择图层 */
    |           |   |   |   |       SpriteText.js               /* 精灵文本图层 */
    |           |   |   |   |
    |           |   |   |   +---toolbar                         /* 工具栏 */
    |           |   |   |   |       AreaAnalysis.vue
    |           |   |   |   |       AreaList.vue
    |           |   |   |   |       AreaSreach.vue
    |           |   |   |   |       PlotAnalysis.vue
    |           |   |   |   |       index.vue
    |           |   |   |   |       (含 line2.json 数据)
    |           |   |   |   |
    |           |   |   |   \---worker                          /* Web Worker */
    |           |   |   |           PointsToGrids.worker.js
    |           |   |   |
    |           |   |   +---config                              /* 运行配置模块 */
    |           |   |   |   |   index.vue / index2.vue
    |           |   |   |   |
    |           |   |   |   +---all                             /* 全版本通用配置 */
    |           |   |   |   |   |   ConfigBodyer.vue            /* 配置页面主体 */
    |           |   |   |   |   |   utils.js
    |           |   |   |   |   |
    |           |   |   |   |   +---Editor                      /* XML 编辑器 */
    |           |   |   |   |   |       index.vue
    |           |   |   |   |   |
    |           |   |   |   |   \---Item                        /* 配置项控件 */
    |           |   |   |   |           index.vue
    |           |   |   |   |
    |           |   |   |   \---v15                             /* MATSim v15 运行配置 */
    |           |   |   |       |   ConfigBodyer.vue            /* 配置页面主体 */
    |           |   |   |       |   utils.js
    |           |   |   |       |
    |           |   |   |       +---Editor                      /* XML 编辑器 */
    |           |   |   |       |       index.vue
    |           |   |   |       |
    |           |   |   |       +---Item                        /* 配置项控件 (每个 .vue 对应一个 MATSim 配置模块) */
    |           |   |   |       |       ChangeMode.vue
    |           |   |   |       |       Controler.vue
    |           |   |   |       |       Counts.vue
    |           |   |   |       |       CustomizedModule.vue
    |           |   |   |       |       Facilities.vue
    |           |   |   |       |       Global.vue
    |           |   |   |       |       JDEQSim.vue
    |           |   |   |       |       LinkStats.vue
    |           |   |   |       |       Network.vue
    |           |   |   |       |       ParallelEventHandling.vue
    |           |   |   |       |       PlanCalcScore.vue
    |           |   |   |       |       Plans.vue
    |           |   |   |       |       Planscalcroute.vue
    |           |   |   |       |       PtCounts.vue
    |           |   |   |       |       Qsim.vue
    |           |   |   |       |       ReplanningAnnealer.vue
    |           |   |   |       |       Strategy.vue
    |           |   |   |       |       SubtourModeChoice.vue
    |           |   |   |       |       TimeAllocationMutator.vue
    |           |   |   |       |       Transit.vue
    |           |   |   |       |       TransitRouter.vue
    |           |   |   |       |       TravelTimeCalculator.vue
    |           |   |   |       |       Vehicles.vue
    |           |   |   |       |       VspExperimental.vue
    |           |   |   |       |
    |           |   |   |       \---样式                          /* 样式参考目录 (不参与打包) */
    |           |   |   |               (含 config.xml/fullConfig.xml 及 img 子目录，未单独列出)
    |           |   |   |
    |           |   |   +---GeoJSON                             /* GeoJSON 加载/显示模块 */
    |           |   |   |   |   index.vue
    |           |   |   |   |
    |           |   |   |   +---component                       /* 子组件 */
    |           |   |   |   |       GeoJSONSetting.vue          /* GeoJSON 设置面板 */
    |           |   |   |   |       GeoJSONVisualMap.vue        /* 视觉映射组件 v1 */
    |           |   |   |   |       GeoJSONVisualMap2.vue       /* 视觉映射组件 v2 */
    |           |   |   |   |       HeatMap.vue                 /* 热力图组件 */
    |           |   |   |   |
    |           |   |   |   +---layer                           /* 图层 */
    |           |   |   |   |   |   ColorBar2DUtil.js           /* 颜色条工具 */
    |           |   |   |   |   |   GeoJSONLayer.js             /* GeoJSON 图层 v1 */
    |           |   |   |   |   |   GeoJSONLayer2.js            /* GeoJSON 图层 v2 */
    |           |   |   |   |   |
    |           |   |   |   |   \---GeoJSONLayer                /* GeoJSON 图层子模块 (含 data.js/layer.js/line.js/point.js/polygon.js/utils.js/worker.worker.js 等) */
    |           |   |   |   |
    |           |   |   |   +---toolbar                         /* 工具栏 */
    |           |   |   |   |       geoJSONDetail2.vue          /* GeoJSON 样式调整 v2 */
    |           |   |   |   |
    |           |   |   |   \---worker                          /* Web Worker */
    |           |   |   |           GeoJSONLayer.worker.js
    |           |   |   |           GeoJSONLayer2.worker.js
    |           |   |   |
    |           |   |   +---HelpDialog                          /* 帮助弹窗 (已并入工具栏) */
    |           |   |   |       index.vue
    |           |   |   |       index2.vue                      /* 帮助弹窗 v2 (未使用) */
    |           |   |   |       page1.vue ~ page8.vue           /* 帮助分页 1-8 */
    |           |   |   |
    |           |   |   +---MotorizedTravel                     /* 机动化出行模块 (公交+地铁) */
    |           |   |   |   |   index.vue
    |           |   |   |   |   utils.js
    |           |   |   |   |
    |           |   |   |   +---layer                           /* 图层 */
    |           |   |   |   |       BusMotionLayer.js           /* 公交出行图层 */
    |           |   |   |   |       SubwayMotionLayer.js        /* 地铁出行图层 */
    |           |   |   |   |
    |           |   |   |   +---toolbar                         /* 工具栏 */
    |           |   |   |   |       busDetail.vue               /* 公交出行详情 */
    |           |   |   |   |       carDetail.vue               /* 私家车出行详情 (已弃用) */
    |           |   |   |   |       subwayDetail.vue            /* 地铁出行详情 */
    |           |   |   |   |
    |           |   |   |   \---worker                          /* Web Worker */
    |           |   |   |           BusMotionLayer.worker.js
    |           |   |   |           SubwayMotionLayer.worker.js
    |           |   |   |
    |           |   |   +---Network                             /* 路网模块 */
    |           |   |   |   |   index.vue
    |           |   |   |   |
    |           |   |   |   +---dialog                          /* 弹窗 */
    |           |   |   |   |       IntersectionFlows.vue       /* 节点流量分析 */
    |           |   |   |   |       LinkVolumes.vue             /* Link 流量分析 */
    |           |   |   |   |
    |           |   |   |   +---layer                           /* 图层 */
    |           |   |   |   |       LinkFlowLayer.js            /* Link 流量分析图层 */
    |           |   |   |   |       NetworkLayer.js             /* 路网图层 */
    |           |   |   |   |       SelectLineLayer.js          /* 已选 Link 图层 */
    |           |   |   |   |       SelectNodeLayer.js          /* 已选节点图层 */
    |           |   |   |   |
    |           |   |   |   +---menu                            /* 地图右键菜单 */
    |           |   |   |   |       Line.vue                    /* Link 右键菜单 */
    |           |   |   |   |       Node.vue                    /* Node 右键菜单 */
    |           |   |   |   |
    |           |   |   |   \---toolbar                         /* 工具栏 */
    |           |   |   |           lineDetail.vue              /* Link 详情 */
    |           |   |   |           nodeDetail.vue              /* Node 详情 */
    |           |   |   |           selectLinkAnalysis.vue      /* Link 流量分析详情 */
    |           |   |   |           sreachLineNode.vue          /* Link 和 Node 搜索 */
    |           |   |   |
    |           |   |   +---Parking                             /* 停车模块 */
    |           |   |   |   |   index.vue
    |           |   |   |   |
    |           |   |   |   +---layer                           /* 图层 */
    |           |   |   |   |       PolygonSelectLayer.js       /* 多边形选择图层 */
    |           |   |   |   |
    |           |   |   |   +---toolbar                         /* 工具栏 */
    |           |   |   |   |       ParkingActivityDetail.vue   /* 停车活动详情 */
    |           |   |   |   |       ParkingGeoJSONDetail.vue    /* 停车 GeoJSON 详情 */
    |           |   |   |   |       PolgonParkingDetail.vue     /* 多边形停车详情 */
    |           |   |   |   |
    |           |   |   |   \---worker                          /* Web Worker */
    |           |   |   |           ParkingGeoJSON.worker.js
    |           |   |   |
    |           |   |   +---PublicTransit                       /* 公交轨道站点模块 */
    |           |   |   |   |   enum.js                         /* 枚举定义 */
    |           |   |   |   |   index.vue
    |           |   |   |   |
    |           |   |   |   +---dialog                          /* 弹窗 */
    |           |   |   |   |   +---PassengersAtStop            /* 站点乘客弹窗 */
    |           |   |   |   |   |       index.vue
    |           |   |   |   |   |
    |           |   |   |   |   +---Transfers                   /* 换乘信息弹窗 */
    |           |   |   |   |   |       index.vue
    |           |   |   |   |   |
    |           |   |   |   |   +---TransitRoutesInfo           /* 线路信息弹窗 */
    |           |   |   |   |   |       AggregatedVehicleLoad.vue
    |           |   |   |   |   |       index.vue
    |           |   |   |   |   |       PassengersEnteringLeaving.vue
    |           |   |   |   |   |       RouteFlows.vue
    |           |   |   |   |   |       RouteGrid.vue
    |           |   |   |   |   |       RouteTimeDiagram.vue
    |           |   |   |   |   |       VehicleLoad.vue
    |           |   |   |   |   |
    |           |   |   |   |   \---TransitStopLoad             /* 站点载客弹窗 */
    |           |   |   |   |           index.vue
    |           |   |   |   |
    |           |   |   |   +---layer                           /* 图层 */
    |           |   |   |   |       LinkLayer.js                /* Link 图层 */
    |           |   |   |   |       ReachableStopsLayer.js      /* 可达站点图层 */
    |           |   |   |   |       RouteFlowsLayer.js          /* 线路流量图层 */
    |           |   |   |   |       SelectStopLayer.js          /* 已选站点图层 */
    |           |   |   |   |       StopsLayer.js               /* 站点图层 */
    |           |   |   |   |       TransitLinesLayer.js        /* 公交线路图层 */
    |           |   |   |   |
    |           |   |   |   +---menu                            /* 右键菜单 */
    |           |   |   |   |       Route.vue
    |           |   |   |   |       Stop.vue
    |           |   |   |   |
    |           |   |   |   \---toolbar                         /* 工具栏 */
    |           |   |   |           routeDepartures.vue
    |           |   |   |           routeDetail.vue             /* 线路详情 */
    |           |   |   |           sreachStopRoute.vue         /* 站点和线路搜索 */
    |           |   |   |           stopAndRoute.vue            /* 站点和线路详情 */
    |           |   |   |           stopDetail.vue              /* 站点详情 */
    |           |   |   |
    |           |   |   +---RoutePlanning                       /* 路线规划 (无人机) 模块 */
    |           |   |   |   |   index.vue
    |           |   |   |   |
    |           |   |   |   +---images                          /* UI 图片资源目录 */
    |           |   |   |   |
    |           |   |   |   +---layer                           /* 图层 */
    |           |   |   |   |   |   AirSpaceCube_100.js / AirSpaceCube_100.json
    |           |   |   |   |   |   AirSpacePolygon_100.js / AirSpacePolygon_100.geojson
    |           |   |   |   |   |   FlyableAreaLayer.js / FlyableAreaLayer2.js
    |           |   |   |   |   |   NetworkLayer.js
    |           |   |   |   |   |   PathCurve.js
    |           |   |   |   |   |   PointListLayer.js
    |           |   |   |   |   |   PointSelectLayer.js
    |           |   |   |   |   |   RouteListLayer.js
    |           |   |   |   |   |   SpriteText.js
    |           |   |   |   |   |   UAVListLayer.js
    |           |   |   |   |   |
    |           |   |   |   |   +---lines                       /* 线段库 (Line2 系列) */
    |           |   |   |   |   |       Line2.js / LineGeometry.js
    |           |   |   |   |   |       LineMaterial.js
    |           |   |   |   |   |       LineSegments2.js / LineSegmentsGeometry.js
    |           |   |   |   |   |       Wireframe.js / WireframeGeometry2.js
    |           |   |   |   |   |
    |           |   |   |   |   \---webgpu                      /* WebGPU 版本线段库 */
    |           |   |   |   |           Line2.js / LineSegments2.js / Wireframe.js
    |           |   |   |   |
    |           |   |   |   +---toolbar                         /* 工具栏 */
    |           |   |   |   |       RoutePlanningList.vue       /* 路线规划列表 */
    |           |   |   |   |
    |           |   |   |   \---worker                          /* Web Worker */
    |           |   |   |           UAVListLayer.worker.js
    |           |   |   |
    |           |   |   +---Toolbar                             /* 右侧功能模块根节点 */
    |           |   |   |       index.vue
    |           |   |   |
    |           |   |   \---TrafficRegionAnalysis               /* 交通区域分析模块 */
    |           |   |       |   index.vue
    |           |   |       |
    |           |   |       +---components                      /* 子组件 */
    |           |   |       |       HeatMapDialog.vue           /* 热力图弹窗 */
    |           |   |       |
    |           |   |       +---layer                           /* 图层 */
    |           |   |       |       AccessibilityLayer.js       /* 可达性图层 */
    |           |   |       |       DesireLineLayer.js          /* 期望线图层 */
    |           |   |       |       GridsLayer.js               /* 网格图层 */
    |           |   |       |       LinkFlowLayer.js            /* Link 流量图层 */
    |           |   |       |       PolygonGridLayer.js         /* 多边形网格图层 */
    |           |   |       |       PolygonSelectLayer.js       /* 多边形选择图层 */
    |           |   |       |
    |           |   |       \---toolbar                         /* 工具栏 */
    |           |   |               data.json                   /* 交通分析配置数据 */
    |           |   |               MultiplePathsDetail.vue     /* 多路径详情 */
    |           |   |               SinglePathDetail.vue        /* 单路径详情 */
    |           |   |               TRAGeoJSONHeader.vue        /* GeoJSON 头配置 */
    |           |
    |           +---planAdjustment                              /* 公交路线调整模块 */
    |           |   |   index.vue                               /* 路线调整主页 */
    |           |   |
    |           |   +---component                               /* 功能组件 */
    |           |   |   |   BMapBox.vue                         /* 百度地图控件 */
    |           |   |   |   ChangeByFile.vue                    /* 通过文件修改路线 */
    |           |   |   |   RouteSelect.vue                     /* 路线选择控件 */
    |           |   |   |   StartEdit.vue                       /* 发车信息编辑弹窗 */
    |           |   |   |   StopsEdit.vue                       /* 编辑站点弹窗 */
    |           |   |   |   StopsRoutesEdit.vue                 /* 编辑路径弹窗 */
    |           |   |   |   StopsRoutesSelect.vue               /* 选择路径控件 (已弃用) */
    |           |   |   |
    |           |   |   \---HelpDialog                          /* 帮助弹窗 */
    |           |   |           index.vue
    |           |   |           page1.vue ~ page6.vue           /* 帮助分页 1-6 */
    |           |   |
    |           |   +---layer                                   /* 图层 */
    |           |   |       BusLinkLayer.js                     /* 公交线路图层 */
    |           |   |       BusRouteLinkLayer.js                /* 公交路径图层 (站点间) */
    |           |   |       BusRouteLinkLayer.back.js           /* 备份版本 (未使用) */
    |           |   |       BusStopLayer.js                     /* 公交站点图层 */
    |           |   |       GuangZhouLayer.js                   /* 广州边界图层 */
    |           |   |       NetworkLayer.js                     /* 路网图层 */
    |           |   |       NetworkLineLayer.js                 /* 路网 Line 图层 */
    |           |   |       StopsLayer.js                       /* 停靠站点图层 */
    |           |   |
    |           |   \---worker                                  /* Web Worker */
    |           |           BuildingLayer.worker.js
    |           |           NetworkLayer.worker.js
    |           |           StopsLayer.worker.js
    |           |
    |           \---systemEvaluation                            /* 公交系统评估模块 */
    |               |   index.vue                               /* 系统评估主页 */
    |               |
    |               \---component
    |                   +---Accessibility                       /* 可达性评估 */
    |                   |   |   index.vue
    |                   |   |
    |                   |   +---component                       /* 子组件 */
    |                   |   |       BinningColors.vue           /* 分箱颜色配置 */
    |                   |   |
    |                   |   +---layer                           /* 图层 */
    |                   |   |       BinningLayer.js             /* 分箱图层 */
    |                   |   |       HeatmMapLayer.js            /* 热力图图层 */
    |                   |   |
    |                   |   \---worker                          /* Web Worker */
    |                   |           BinningLayer.worker.js
    |                   |
    |                   \---HelpDialog                          /* 帮助弹窗 */
    |                           index.vue
    |                           page1.vue ~ page6.vue           /* 帮助分页 1-6 */
    |
    +---plugins                                                 /* 插件目录 */
    |       download.js                                         /* 下载插件 (引用 OSS.js/errorCode.js) */
    |       index.js                                            /* 插件统一出口 */
    |
    +---store                                                   /* 全局 Vuex 状态管理 (PT 功能) */
    |   |   index.js
    |   |
    |   \---modules
    |           datasource.js                                   /* 数据源状态 */
    |           dict.js                                         /* 字典状态 */
    |           user.js                                         /* 用户状态 */
    |
    \---utils                                                   /* 全局工具类 */
        |   Bean.js                                             /* 公交线路修改数据 Bean 类 */
        |   OSS.js                                              /* 阿里云 OSS 工具类 */
        |   auth.js                                             /* 认证工具类 */
        |   cache.js                                            /* 缓存工具类 (未使用) */
        |   check.js                                            /* 数据验证工具类 (未使用) */
        |   colors.js                                           /* 颜色工具类 */
        |   echarts.utils.js                                    /* ECharts 图表工具 */
        |   errorCode.js                                        /* 错误码定义 */
        |   index.js                                            /* 工具类统一出口 v1 */
        |   index2.js                                           /* 工具类统一出口 v2 */
        |   jsencrypt.js                                        /* JS 加密库封装 */
        |   permission.js                                       /* 权限工具类 (未使用) */
        |   request.js                                          /* 请求工具类 (Axios 封装) */
        |   ruoyi.js                                            /* 若依框架工具 */
        |   scroll-to.js                                        /* 滚动动画工具 */
        |   utils.js                                            /* 通用工具函数 */
        |   validate.js                                         /* 表单验证工具 */
        |
        +---dict                                                /* 字典工具模块 */
        |       Dict.js                                         /* 字典核心类 */
        |       DictConverter.js                                /* 字典转换器 */
        |       DictData.js                                     /* 字典数据类 */
        |       DictMeta.js                                     /* 字典元数据类 */
        |       DictOptions.js                                  /* 字典选项类 */
        |       index.js
        |
        \---generator                                           /* 代码生成器工具模块 */
                config.js                                       /* 生成配置 */
                css.js                                          /* CSS 生成 */
                drawingDefault.js                               /* 绘图默认值 */
                html.js                                         /* HTML 生成 */
                icon.json                                       /* 图标 JSON */
                js.js                                           /* JS 生成 */
                render.js                                       /* 渲染函数 */
```
