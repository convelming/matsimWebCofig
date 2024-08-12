# MATSim 项目可视化，公交线路优化对比及自动生成报告（MATSim Visualization & Transit optimization with AIGC ）

This project is the front end codes for MATSim visualization and transit line optimization. Key innovation is
using Llama 3 (server end Ollama) to generate report of the scenarios before and after.
项木主要分了四个模块：
1. MATSim output 可视化展示 主要功能为MATSim 私家车、出行活动、公交线路、路网等的可视化展示
2. 公交运营系统评估 通过web GIS结合公交运营情况对其进行评价，并生成优化的公交线路、站点和发车时间的优化方案。
3. 公交线路修改 新建或对已有的公交线路进行调整，确认后将自动生成MASim模型并运行
4. 公交线路对比分析 与原有或选定的公交线路进行优化方案的对比分析，并自动就生成分析报告


## 项目依赖 Prerequisites
   - Node.js >= 14.x
   - npm >dd= 7.x
   
项目


## 如何安装使用 Installation
      ``` bash
      npm install
      npm run serve
### 如何将项目打包放入 Spring boot 的static 文件夹
### 如何单独调试




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