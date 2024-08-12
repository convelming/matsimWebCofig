# MATSim 项目可视化，公交线路优化对比及自动生成报告（MATSim Visualization & Transit optimization with AIGC ）

This project is the front end codes for MATSim visualization and transit line optimization. Key innovation is
using Llama 3 (server end Ollama) to generate report of the scenarios before and after.
项木主要分了四个模块：
1. MATSim output 可视化展示 主要功能为MATSim 私家车、出行活动、公交线路、路网等的可视化展示
2. 公交运营系统评估 通过web GIS结合公交运营情况对其进行评价，并生成优化的公交线路、站点和发车时间的优化方案。
3. 公交线路修改 新建或对已有的公交线路进行调整，确认后将自动生成MASim模型并运行
4. 公交线路对比分析 与原有或选定的公交线路进行优化方案的对比分析，并自动就生成分析报告
   
前端的代码在VS code里完成，主要架构采用vue 2 版本，采用前后端分离的方式进行。后端的代码可在 [MATSimWebViz](https://github.com/convelming/matsimWebViz.git) 找到。


## 项目 主要依赖 Prerequisites

项目所有依赖可以在package.json里找到。 需要注意的是Node需要16+，Vue版本是2.6, 暂时不兼容3.0以上的版本；Three.js需要148的版本，

## 如何安装使用 Installation
第一次使用时请运行 ```npm install``` 下载依赖库，依赖库下载完整后 运行```npm run serve``` 开启本地服务。
### 如何将项目打包放入 Spring boot 的static 文件夹
      运行 
      npm run build

然后将打包生成的文件放到后端static 文件夹下即可

### 如何进行本地调试
调试时需要在本地/服务器端运行后端服务，服务器地址在vue.config.js中修改 devServer.proxy.target ip地址如：http://localhost:1234 
修改后需要重新运行```npm run serve``` 按照配置的ip使用浏览器打开指定页面
### 浏览器兼容  
开发时使用的是微软edge浏览器，兼容谷歌Chrome，其他浏览器的兼容性有待进一步测试

### 网络地图配置 
项目可使用本地瓦片地图服务或Mapbox的在线地图等八个地图，配置位置在/public/config.js,以第一个为 默认样式，如有需要，可对默认地图进行调整，也可以进入模型后在右上角进行手动选取。
本地/服务器端瓦片地图需要自行爬取。
### CRS
前端在渲染和展示是所有位置信息使用的坐标系是墨卡托（WGS84/Pseudo-Mercator），EPSG：3857。导入MATSim模型时自动适配地图范围和显示位置，不同的坐标系可以进行自动转换，但是需要在MATSim输出文件里指定其使用的坐标系。

### 安全性 测试中
如发现有潜在的安全问题，请联系作者或开发人员。

### 项目总体架构
参照 STRUCTURE.md

在使用Markdown（MD）格式撰写文本时，通常有以下几个基本要求和约定：
1. 标题
   使用 # 表示标题。# 的数量表示标题的级别：
   # 一级标题
   ## 二级标题
   ### 三级标题

2. 段落
   段落之间使用空行分隔。
3. 强调
   使用 * 或 _ 包围的文本表示斜体：
   *斜体*
   使用 ** 或 __ 包围的文本表示加粗：
   **加粗**
4. 列表
   无序列表使用 -、+ 或 *：
   - 项目一
   - 项目二
     有序列表使用数字后跟 .：
   1. 第一项
   2. 第二项
5. 链接
   使用 [链接文本](URL) 来创建链接：
   [Google](https://www.google.com)
6. 图片
   使用 ![替代文本](图片URL) 来插入图片：
   ![Alt text](https://www.example.com/image.jpg)
7. 引用
   使用 > 表示引用块：
   > 这是一个引用块
8. 代码块
   使用三个反引号包围代码块，语言名称可选：
    ```python
    print("Hello, world!")
9. 表格
   使用 | 分隔列，使用 - 分隔表头与表内容：
   | 表头1 | 表头2 |
   | ------ | ------ |
   | 内容1  | 内容2  |
10. 分隔线
   使用三个或以上的 - 或 * 来创建分隔线：
    ---
11. 行内代码
   使用单个反引号包围行内代码：
   这是 `行内代码` 示例。
12. HTML 标签
    在 Markdown 中，可以嵌入部分 HTML 标签来实现更复杂的格式需求。
13. 注释
    Markdown 不支持原生注释，但可以使用 HTML 的注释格式：
    <!-- 这是一个注释 -->
通过这些格式，您可以结构化地呈现文本内容，同时确保其在 Markdown 兼容的工具或平台上显示效果一致。