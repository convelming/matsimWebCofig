<template>
  <div class="back">
    <div class="root">
      <div class="module">
        <el-dropdown class="language" @command="changeLanguage" placement="top-start" trigger="click">
          <div class="module_menu">{{ { "zh-CN": "中文（简体）", "en-US": "English" }[page_language] }}<i class="el-icon-arrow-down el-icon--right"></i></div>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="zh-CN" :disabled="page_language == 'zh-CN'">中文（简体）</el-dropdown-item>
            <!-- <el-dropdown-item command="zh_MO" :disabled="page_language == 'zh-MO'">中文（繁體）</el-dropdown-item> -->
            <el-dropdown-item command="en-US" :disabled="page_language == 'en-US'">English</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
      <div class="title">
        <img class="logo" src="@/assets/image/favicon.png" alt="" />
        <span>{{ $l("智慧公交线网仿真与在线优化平台") }}</span>
      </div>
      <div class="list">
        <div @click="handleClickItem('operationsAnalysis')" class="item" style="background-color: yellowgreen">
          <div class="item_title">
            <img class="item_icon" src="@/assets/image/公交.svg" />
            <span>MATSim webViz</span>
          </div>
          <div class="item_detail">
            {{ $l("加载指定项目的matsim模型可视化，分析整个城市区域居民出行活动及交通系统运行情况") }}
          </div>
          <div class="el-icon-question item_help" @click.stop="showOAHelpDialog = true"></div>
        </div>
        <div @click="handleClickItem('planAdjustment')" class="item" style="background-color: #f0704b">
          <div class="item_title">
            <img class="item_icon" src="@/assets/image/修改or意见.svg" />
            <span>{{ $l("线路方案调整") }}</span>
          </div>
          <div class="item_detail">
            {{ $l("按照一定的策略新建或调整公交线路，站点，发车信息，实时更新线路信息。") }}
          </div>
          <div class="el-icon-question item_help" @click.stop="showPAHelpDialog = true"></div>
        </div>
        <div @click="handleClickItem('comparativeAnalysis')" class="item" style="background-color: #52b3ba">
          <div class="item_title">
            <img class="item_icon" src="@/assets/image/比幅对比_1.svg" />
            <span>{{ $l("方案对比分析") }}</span>
          </div>
          <div class="item_detail">
            {{ $l("根据调整优化的线路方案，呈现城市居民在线路调整后的反应，并将对比结果可视化呈现。") }}
          </div>
          <div class="el-icon-question item_help" @click.stop="showCAHelpDialog = true"></div>
        </div>
        <div @click="handleClickItem('systemEvaluation')" class="item" style="background-color: #0070c0">
          <div class="item_title">
            <img class="item_icon" src="@/assets/image/评估.svg" />
            <span>{{ $l("公交系统评估") }}</span>
          </div>
          <div class="item_detail">
            {{ $l("公交系统总体运行评估包括可达性。") }}
          </div>
          <div class="el-icon-question item_help" @click.stop="showSEHelpDialog = true"></div>
        </div>
      </div>
    </div>
    <OAHelpDialog class="item_help" :visible.sync="showOAHelpDialog" />
    <PAHelpDialog class="item_help" :visible.sync="showPAHelpDialog" />
    <CAHelpDialog class="item_help" :visible.sync="showCAHelpDialog" />
    <SEHelpDialog class="item_help" :visible.sync="showSEHelpDialog" />

    <!-- 请选择基准MATSIM模型 -->
    <el-dialog class="tabel_dialog" :title="$l('请选择基准MATSIM模型')" :visible.sync="dataBaseDialog.show" width="500px">
      <div class="tabel_toolbar">
        <el-button type="primary" size="mini" icon="el-icon-refresh-right" @click="handleGetDataBaseList()">{{ $l("刷新列表") }}</el-button>
      </div>
      <el-table height="400" :data="dataBaseList" border stripe @row-click="handleSelectDataBase" v-loading="dataBaseListLoading">
        <el-table-column width="50" align="center">
          <el-checkbox slot-scope="{ row }" :value="dataBaseDialog.dataBase == row.name" @click="handleSelectDataBase(row)" />
        </el-table-column>
        <el-table-column prop="name" :label="$l('基准名称')"> </el-table-column>
      </el-table>
      <span slot="footer">
        <el-button :disabled="!dataBaseDialog.dataBase" type="primary" @click="handleChangeDataBase">{{ $l("确定") }}</el-button>
        <el-button @click="dataBaseDialog.show = false">{{ $l("取消") }}</el-button>
      </span>
    </el-dialog>

    <!-- 公交运行分析 -->
    <el-dialog class="tabel_dialog" :title="$l('公交运行分析')" :visible.sync="operationsAnalysisDialog.show" width="900px">
      <div class="tabel_toolbar">
        <el-button type="primary" size="mini" icon="el-icon-arrow-left" @click="handleToSelectDataBase('operationsAnalysis')">{{ $l("返回上一级") }}</el-button>
        <el-button type="primary" size="mini" icon="el-icon-refresh-right" @click="handleGetDateSourceList()">{{ $l("刷新列表") }}</el-button>
      </div>
      <el-table height="400" :data="dataSourceList" border stripe v-loading="dateSourceListLoading">
        <el-table-column prop="name" :label="$l('方案名称')" width="100" />
        <el-table-column prop="detail" :label="$l('方案简介')" />
        <el-table-column prop="loadStatus" :label="$l('方案状态')" width="150">
          <template slot-scope="{ row }">{{ $l(row.loadStatus) }} / {{ $l(row.runStatus) }}</template>
        </el-table-column>
        <el-table-column :label="$l('操作')" width="250">
          <template slot-scope="{ row }">
            <el-button v-if="row.runStatus == '已运行' && row.loadStatus == '已加载'" type="primary" size="mini" @click="handleOperationsAnalysisToDetail(row)">{{ $l("查看") }}</el-button>
            <!-- <el-button v-if="row.noRun"  type="success" size="mini" :loading="row.runStatus == '运行中'" @click="handleOperationsAnalysisRun(row)">{{ $l("运行") }}</el-button> -->
            <el-button v-if="!row.noLoad" type="warning" size="mini" :loading="row.loadStatus == '加载中'" @click="handleOperationsAnalysisLoad(row)">{{ $l("加载") }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 线路方案调整 -->
    <el-dialog class="tabel_dialog" :title="$l('线路方案调整')" :visible.sync="planAdjustmentDialog.show" width="900px">
      <div class="tabel_toolbar">
        <el-button type="primary" size="mini" icon="el-icon-arrow-left" @click="handleToSelectDataBase('planAdjustment')">{{ $l("返回上一级") }}</el-button>
        <el-button type="primary" size="mini" icon="el-icon-refresh-right" @click="handleGetDateSourceList()">{{ $l("刷新列表") }}</el-button>
        <el-button type="primary" size="mini" icon="el-icon-add" @click="handleShowAddPlanAdjustmentDialog()">{{ $l("新建方案") }}</el-button>
      </div>
      <el-table height="400" :data="dataSourceList.filter((v) => !v.noRun)" border stripe v-loading="dateSourceListLoading">
        <el-table-column prop="name" :label="$l('方案名称')" width="100" />
        <el-table-column prop="detail" :label="$l('方案简介')" />
        <el-table-column prop="loadStatus" :label="$l('方案状态')" width="150">
          <template slot-scope="{ row }">{{ $l(row.loadStatus) }} / {{ $l(row.runStatus) }}</template>
        </el-table-column>
        <el-table-column :label="$l('操作')" width="300">
          <template slot-scope="{ row }">
            <el-button v-if="!row.noRun && row.loadStatus == '已加载'" type="primary" size="mini" @click="handlePlanAdjustmentToDetail(row)">{{ $l("修改") }}</el-button>
            <el-button v-if="!row.noLoad" :loading="row.loadStatus == '加载中'" type="warning" size="mini" @click="handlePlanAdjustmentLoad(row)">{{ $l("加载") }}</el-button>
            <el-button v-if="!row.noRun" type="success" size="mini" :loading="row.runStatus == '运行中'" @click="handleOperationsAnalysisRun(row)">{{ $l("运行") }}</el-button>
            <el-button v-if="!row.noRun" type="danger" size="mini" @click="handleDelect(row)">{{ $l("删除") }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 方案对比分析 -->
    <el-dialog class="tabel_dialog" :title="$l('方案对比分析')" :visible.sync="comparativeAnalysisDialog.show" width="900px">
      <div class="tabel_toolbar">
        <el-button type="primary" size="mini" icon="el-icon-arrow-left" @click="handleToSelectDataBase('comparativeAnalysis')">{{ $l("返回上一级") }}</el-button>
        <el-button type="primary" size="mini" icon="el-icon-refresh-right" @click="handleGetDateSourceList()">{{ $l("刷新列表") }}</el-button>
      </div>
      <el-table height="400" :data="dataSourceList" border stripe v-loading="dateSourceListLoading">
        <el-table-column :label="$l('基础方案')" width="90" align="center">
          <template slot-scope="{ row }">
            <el-checkbox v-model="comparativeAnalysisDialog.dataSource1" false-label="" :true-label="row.name" :disabled="row.loadStatus != '已加载' || row.runStatus != '已运行' || comparativeAnalysisDialog.dataSource2 == row.name">{{ "" }}</el-checkbox>
          </template>
        </el-table-column>
        <el-table-column :label="$l('对比方案')" width="90" align="center">
          <template slot-scope="{ row }">
            <el-checkbox v-model="comparativeAnalysisDialog.dataSource2" false-label="" :true-label="row.name" :disabled="row.loadStatus != '已加载' || row.runStatus != '已运行' || comparativeAnalysisDialog.dataSource1 == row.name">{{ "" }}</el-checkbox>
          </template>
        </el-table-column>
        <el-table-column prop="name" :label="$l('方案名称')" />
        <el-table-column prop="detail" :label="$l('方案简介')" />
        <el-table-column prop="loadStatus" :label="$l('方案状态')" width="150">
          <template slot-scope="{ row }">{{ $l(row.loadStatus) }} / {{ $l(row.runStatus) }}</template>
        </el-table-column>
        <el-table-column :label="$l('操作')" width="180">
          <template slot-scope="{ row }">
            <el-button v-if="!row.noLoad" type="warning" size="mini" :loading="row.loadStatus == '加载中'" @click="handleOperationsAnalysisLoad(row)">{{ $l("加载") }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="display: flex; justify-content: center; margin-top: 20px">
        <el-button type="primary" size="small" @click="handleComparativeAnalysisToDetail()" :disabled="!comparativeAnalysisDialog.dataSource1 || !comparativeAnalysisDialog.dataSource2">{{ $l("确认") }}</el-button>
      </div>
    </el-dialog>

    <!-- 公交运营评估 -->
    <el-dialog class="tabel_dialog" :title="$l('公交运营评估')" :visible.sync="systemEvaluationDialog.show" width="600px">
      <div class="tabel_toolbar">
        <el-button type="primary" size="mini" icon="el-icon-arrow-left" @click="handleToSelectDataBase('systemEvaluation')">{{ $l("返回上一级") }}</el-button>
        <el-button type="primary" size="mini" icon="el-icon-refresh-right" @click="handleGetDateSourceList()">{{ $l("刷新列表") }}</el-button>
      </div>
      <el-table height="400" :data="dataSourceList" border stripe v-loading="dateSourceListLoading">
        <el-table-column prop="name" :label="$l('方案名称')" />
        <el-table-column prop="detail" :label="$l('方案简介')" />
        <el-table-column prop="loadStatus" :label="$l('方案状态')" width="150">
          <template slot-scope="{ row }">{{ $l(row.loadStatus) }} / {{ $l(row.runStatus) }}</template>
        </el-table-column>
        <el-table-column :label="$l('操作')" width="180">
          <template slot-scope="{ row }">
            <el-button v-if="!row.noLoad" type="warning" size="mini" :loading="row.loadStatus == '加载中'" @click="handleSystemEvaluationLoad(row)">{{ $l("加载") }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <el-dialog class="tabel_dialog" :title="$l('新建方案')" :visible.sync="addPlanAdjustmentDialog.show" width="550px">
      <el-form :model="addPlanAdjustmentDialog.form" ref="addForm" :rules="addPlanAdjustmentDialog.rules" label-width="100px" :inline="false" size="small">
        <el-form-item :label="$l('基础方案')" prop="source">
          <el-select v-model="addPlanAdjustmentDialog.form.source">
            <el-option v-for="item in dataSourceList" :key="item.name" :label="item.name" :value="item.name"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$l('新方案名称')" prop="target">
          <el-input v-model="addPlanAdjustmentDialog.form.target"></el-input>
        </el-form-item>
        <el-form-item :label="$l('新方案描述')" prop="detail">
          <el-input type="textarea" v-model="addPlanAdjustmentDialog.form.detail" :autosize="{ minRows: 2 }"> </el-input>
        </el-form-item>
        <el-form-item>
          <el-button :loading="addPlanAdjustmentDialog.loading" type="primary" @click="handleAddPlanAdjustment">{{ $l("立即创建") }}</el-button>
          <el-button @click="addPlanAdjustmentDialog.show = false">{{ $l("取消") }}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<language>
{
  "公交运行分析": {
    "zh-CN":"公交运行分析",
    "en-US":"Public Transit Analysis",
  },
  "刷新列表": {
    "zh-CN":"刷新列表",
    "en-US":"Refresh",
  },
  "返回上一级": {
    "zh-CN":"返回上一级",
    "en-US":"Return",
  },
  "新建方案": {
    "zh-CN":"新建方案",
    "en-US":"Create Scheme",
  },
  "未运行": {
  "zh-CN":"未运行",
  "en-US":"Pending",
  },
  "运行中": {
  "zh-CN":"运行中",
  "en-US":"Running",
  },
  "已运行": {
  "zh-CN":"已运行",
  "en-US":"Executed",
  },
  "未加载": {
  "zh-CN":"未加载",
  "en-US":"Unload",
  },
  "加载中": {
  "zh-CN":"加载中",
  "en-US":"Loading",
  },
  "已加载": {
  "zh-CN":"已加载",
  "en-US":"Loaded",
  },
  "保存方案": {
    "zh-CN":"保存方案",
    "en-US":"Save Scheme",
  },
  "立即创建": {
    "zh-CN":"立即创建",
    "en-US":"Create",
  },
  "新方案名称": {
    "zh-CN":"新方案名称",
    "en-US":"New Scheme Name",
  },
  "新方案描述": {
    "zh-CN":"新方案描述",
    "en-US":"Scheme Description",
  },
  "方案创建成功": {
    "zh-CN":"方案创建成功",
    "en-US":"Scheme Created",
  },
  "方案保存成功": {
    "zh-CN":"方案保存成功",
    "en-US":"Scheme Saved",
  },
  "请输入方案名称": {
    "zh-CN":"请输入方案名称",
    "en-US":"Please enter a scheme name",
  },
  "方案名称只能使用英文字母，数字和下划线": {
    "zh-CN":"方案名称只能使用英文字母，数字和下划线",
    "en-US":"Please only use English letters, numbers, or underscores",
  },
  "方案名称不能以base结尾": {
    "zh-CN":"方案名称不能以base结尾",
    "en-US":"Scheme names already existed",
  },
  "方案名称": {
    "zh-CN":"方案名称",
    "en-US":"Scheme Name",
  },
  "方案简介": {
    "zh-CN":"方案简介",
    "en-US":"Scheme Introduction",
  },
  "方案状态": {
    "zh-CN":"内存/模型",
    "en-US":"Memory/Model",
  },
  "基准名称": {
    "zh-CN":"基准名称",
    "en-US":"Base Scenario",
  },
  "运行状态": {
    "zh-CN":"运行状态",
    "en-US":"Running",
  },
  "加载状态": {
    "zh-CN":"加载状态",
    "en-US":"Loading",
  },
  "基础方案": {
    "zh-CN":"基础方案",
    "en-US":"Base scenario",
  },
  "对比方案": {
    "zh-CN":"对比方案",
    "en-US":"Comparison scheme",
  },
  "请选择基准MATSIM模型": {
    "zh-CN":"请选择基准MATSIM模型",
    "en-US":"Please select a base MATSim scenario",
  },
  "智慧公交线网仿真与在线优化平台": {
    "zh-CN":"MATSim广州&公交优化平台",
    "en-US":"MATSim Viz & PT Optimization with AIGC",
  },
  "城市公交路线规划平台": {
    "zh-CN":"城市公交路线规划平台",
    "en-US":"Platform of Urban Public Tranist Planning ",
  },
  "展示整个公交系统的运行现状，包括线路、发车时间，客流量信息及其OD分布等": {
    "zh-CN":"展示整个公交系统的运行现状，包括线路、发车时间，客流量信息及其OD分布等",
    "en-US":"Demonstrate the entire transit operating system, including routes, departure times, passenger flow and trip information, etc.",
  },
  "线路方案调整": {
    "zh-CN":"线路方案调整",
    "en-US":"PT Route Modification",
  },
  "按照一定的策略新建或调整公交线路，站点，发车信息，实时更新线路信息。": {
    "zh-CN":"按照一定的策略新建或调整公交线路、站点、发车信息并生成新的线路数据和模型。",
    "en-US":"Create or revise bus routes, via-stops, and time tables according to optimization strategies, and update user reactions in almost-real-time.",
  },
  "方案对比分析": {
    "zh-CN":"方案对比分析",
    "en-US":"Analysis & Comparison of PT Optimizations",
  },
  "根据调整优化的线路方案，呈现城市居民在线路调整后的反应，并将对比结果可视化呈现。": {
    "zh-CN":"根据调整优化的线路方案，呈现城市居民在线路调整后的反应，并将对比结果可视化呈现。",
    "en-US":"According to modified PT schemes, visualizing travel behaviours before and after, with AIGC reports",
  },
  "公交系统评估": {
    "zh-CN":"公交系统评估",
    "en-US":"Public Transit Assessment",
  },
  "公交运营评估": {
    "zh-CN":"公交运营评估",
    "en-US":"Public Transit Operations Evaluation",
  },
  "公交系统总体运行评估包括可达性。": {
    "zh-CN":"公交系统总体运行评估包括可达性。",
    "en-US":"The overall operational assessment of the transit system includes accessibility.",
  },
  "克隆": {
    "zh-CN":"克隆",
    "en-US":"Copy",
  },
  "方案克隆成功": {
    "zh-CN":"方案克隆成功",
    "en-US":"Scheme Copied",
  },
  "MATSim webViz": {
    "zh-CN":"MATSim webViz",
    "en-US":"MATSim webViz",
  },
  "加载指定项目的matsim模型可视化，分析整个城市区域居民出行活动及交通系统运行情况": {
    "zh-CN":"加载指定项目的MATSim模型可视化，分析整个城市区域居民出行活动及交通系统运行情况",
    "en-US":"Load a MATSim scenario to visualize, analyse travel behaviours and activities of the entire region",
  },
  "是否删除方案：": {
    "zh-CN":"是否删除方案：",
    "en-US":"Do you want to delete the scheme:",
  },
  "确认":{
    "zh-CN":"确认",
    "en-US":"confirm",
  }
}
</language>

<script>
import OAHelpDialog from "./operationsAnalysis/component/HelpDialog/index2.vue";
import PAHelpDialog from "./planAdjustment/component/HelpDialog/index.vue";
import CAHelpDialog from "./comparativeAnalysis/component/HelpDialog/index2.vue";
import SEHelpDialog from "./systemEvaluation/component/HelpDialog/index.vue";

export default {
  components: {
    OAHelpDialog,
    PAHelpDialog,
    CAHelpDialog,
    SEHelpDialog,
  },
  data() {
    return {
      module_list: [],
      dateSourceListLoading: false,
      dateBaseListLoading: false,
      dataBaseDialog: {
        show: false,
        dataBase: "",
        itemKey: "",
      },
      operationsAnalysisDialog: {
        show: false,
        dataSource: "",
      },
      planAdjustmentDialog: {
        show: false,
        dataSource: "",
      },
      comparativeAnalysisDialog: {
        show: false,
        dataSource1: "",
        dataSource2: "",
      },
      systemEvaluationDialog: {
        show: false,
        dataSource: "",
      },
      addPlanAdjustmentDialog: {
        show: false,
        form: "",
        loading: false,
        rules: {
          target: {
            validator: (rule, value, callback) => {
              if (!value) {
                callback(new Error(this.$l("请输入方案名称")));
              // } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
              //   callback(new Error(this.$l("方案名称只能使用英文字母，数字和下划线")));
              // } else if (value.slice(-4).toLowerCase() == "base") {
              //   callback(new Error(this.$l("方案名称不能以base结尾")));
              } else {
                callback();
              }
            },
          },
        },
      },

      showOAHelpDialog: false,
      showPAHelpDialog: false,
      showCAHelpDialog: false,
      showSEHelpDialog: false,
    };
  },
  computed: {
    dataBase() {
      return this.$store.getters.dataBase;
    },
    dataBaseList() {
      return this.$store.getters.dataBaseList;
    },
    dataBaseListLoading() {
      return this.$store.getters.dataBaseListLoading;
    },
    dataSource() {
      return this.$store.getters.dataSource;
    },
    dataSourceList() {
      return this.$store.getters.dataSourceList;
    },
    dataSourceListLoading() {
      return this.$store.getters.dataSourceListLoading;
    },
  },
  created() {
    console.log("index created");
    const dataBase = this.$route.params.base;
    if (dataBase) {
      this.$store.dispatch("setDataBase", dataBase);
      this.$store.dispatch("getDataSourceList", dataBase);
    }
  },
  methods: {
    handleGetDataBaseList() {
      this.$store.dispatch("getDataBaseList", this.dataBase);
    },
    handleGetDateSourceList() {
      this.$store.dispatch("getDataSourceList", this.dataBase);
    },
    handleShowDataBase(itemKey = "") {
      this.dataBaseDialog.show = true;
      this.dataBaseDialog.dataBase = this.dataBase;
      this.dataBaseDialog.itemKey = itemKey;
    },
    handleSelectDataBase(row, column, event) {
      this.dataBaseDialog.dataBase = row.name;
    },
    handleChangeDataBase() {
      this.$store.dispatch("setDataBase", this.dataBaseDialog.dataBase);
      this.$store.dispatch("getDataSourceList", this.dataBaseDialog.dataBase);
      const itemKey = this.dataBaseDialog.itemKey;
      this.dataBaseDialog.dataBase = "";
      this.dataBaseDialog.itemKey = "";
      this.dataBaseDialog.show = false;
      if (itemKey) {
        this.$nextTick(() => {
          this.handleClickItem(itemKey);
        });
      }
    },
    handleClickItem(key) {
      if (!this.dataBase && key != "systemEvaluation") {
        this.handleShowDataBase(key);
        return;
      }
      switch (key) {
        case "operationsAnalysis":
          this.handleShowOperationsAnalysisDialog();
          break;
        case "planAdjustment":
          this.handleShowPlanAdjustmentDialog();
          break;
        case "comparativeAnalysis":
          this.handleShowComparativeAnalysisDialog();
          break;
        case "systemEvaluation":
          window.open("http://192.168.60.231:23334/kepler.gl.html", "_blank");
          // this.handleShowSystemEvaluationDialog();
          break;
      }
    },
    // 公交运行分析
    handleShowOperationsAnalysisDialog() {
      this.operationsAnalysisDialog.show = true;
      this.operationsAnalysisDialog.dataSource = "";
    },
    handleOperationsAnalysisToDetail(row) {
      const [database, datasource] = row.name.split("/");
      const href = this.$router.resolve({
        name: "operationsAnalysis",
        params: { database: database, datasource: datasource },
      }).href;
      window.open(href, "_blank");
      // this.$router.push({
      //   name: "operationsAnalysis",
      //   params: { database: database, datasource: datasource },
      // });
    },
    handleOperationsAnalysisLoad(row) {
      this.$store.dispatch("loadDataSource", row);
    },
    handleOperationsAnalysisRun(row) {
      // this.$store.dispatch("runDataSource", {
      //   ...row,
      //   xml: "",
      // });
      const [database, datasource] = row.name.split("/");
      const href = this.$router.resolve({
        name: "operationsAnalysisConfig",
        params: { database: database, datasource: datasource },
      }).href;
      window.open(href, "_blank");
    },
    // 线路方案调整
    handleShowPlanAdjustmentDialog() {
      this.planAdjustmentDialog.show = true;
      this.planAdjustmentDialog.dataSource = "";
    },
    handleShowAddPlanAdjustmentDialog() {
      this.addPlanAdjustmentDialog.show = true;
      this.addPlanAdjustmentDialog.form = {
        base: this.dataBase,
        source: "",
        target: "",
        detail: "",
      };
    },
    handleAddPlanAdjustment() {
      this.$refs.addForm.validate((valid) => {
        if (!valid) return;
        this.addPlanAdjustmentDialog.loading = true;
        const form = JSON.parse(JSON.stringify(this.addPlanAdjustmentDialog.form));
        console.log(form);
        this.$store
          // .dispatch("createDataSource", {
          //   base: form.source,
          //   key: form.target,
          //   detail: form.detail,
          // })
          .dispatch("copyDataSource", {
            source: form.source,
            target: form.base + "/" + form.target,
            detail: form.detail,
          })
          .then((res) => {
            this.$message.success(this.$l("方案创建成功"));
            this.addPlanAdjustmentDialog.show = false;
          })
          .finally(() => {
            this.addPlanAdjustmentDialog.loading = false;
          });
      });
    },
    handlePlanAdjustmentToDetail(row) {
      const [database, datasource] = row.name.split("/");
      const href = this.$router.resolve({
        name: "planAdjustment",
        params: { database: database, datasource: datasource },
      }).href;
      window.open(href, "_blank");
      // this.$router.push({
      //   name: "planAdjustment",
      //   params: { database: database, datasource: datasource },
      // });
    },
    handlePlanAdjustmentLoad(row) {
      this.$store.dispatch("loadDataSource", row);
    },
    // 方案对比分析
    handleShowComparativeAnalysisDialog() {
      this.comparativeAnalysisDialog.show = true;
      this.comparativeAnalysisDialog.dataSource1 = "";
      this.comparativeAnalysisDialog.dataSource2 = "";
    },
    //
    handleShowSystemEvaluationDialog() {
      this.systemEvaluationDialog.show = true;
      this.systemEvaluationDialog.dataSource = "";
    },
    handleSystemEvaluationToDetail(row) {
      const [database, datasource] = row.name.split("/");
      const href = this.$router.resolve({
        name: "systemEvaluation",
        params: { database: database, datasource: datasource },
      }).href;
      window.open(href, "_blank");
    },
    handleSystemEvaluationLoad(row) {
      this.$store.dispatch("loadDataSource", row);
    },
    handleComparativeAnalysisToDetail() {
      const [database1, datasource1] = this.comparativeAnalysisDialog.dataSource1.split("/");
      const [database2, datasource2] = this.comparativeAnalysisDialog.dataSource2.split("/");
      const href = this.$router.resolve({
        name: "comparativeAnalysis",
        params: { database1: database1, datasource1: datasource1, database2: database2, datasource2: datasource2 },
      }).href;
      window.open(href, "_blank");
    },
    handleDelect(row) {
      console.log(row);

      this.$confirm(this.$l("是否删除方案：") + row.name + "?", this.$l("警告"), {
        confirmButtonText: this.$l("确定"),
        cancelButtonText: this.$l("取消"),
        type: "warning",
      })
        .then(() => {
          return this.$store.dispatch("deleteDataSource", row);
        })
        .then(() => {
          this.$message.success("删除成功");
        })
        .catch(() => {});
    },
    handleToSelectDataBase(key) {
      this.handleShowDataBase(key);
      switch (key) {
        case "operationsAnalysis":
          this.operationsAnalysisDialog.show = false;
          this.operationsAnalysisDialog.dataSource = "";
          break;
        case "planAdjustment":
          this.planAdjustmentDialog.show = false;
          this.planAdjustmentDialog.dataSource = "";
          break;
        case "comparativeAnalysis":
          this.comparativeAnalysisDialog.show = false;
          this.comparativeAnalysisDialog.dataSource1 = "";
          this.comparativeAnalysisDialog.dataSource2 = "";
          break;
        case "systemEvaluation":
          this.systemEvaluationDialog.show = false;
          this.systemEvaluationDialog.dataSource = "";
          break;
      }
    },
    changeLanguage(lan) {
      this.$setLanguage(lan);
    },
  },
};
</script>

<style lang="scss" scoped>
.back {
  box-sizing: border-box;
  width: 100vw;
  height: 100vh;
  background-image: url("~@/assets/image/gz.jpeg");
  background-size: cover;
  background-repeat: no-repeat;
  overflow: auto;
}

.root {
  width: 100%;
  min-width: 1200px;
}

.module {
  width: 1100px;
  margin: 0 auto;
  height: 80px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  .module_menu {
    cursor: pointer;
    font-size: 16px;
    color: #fff;
  }
}

.title {
  width: 1100px;
  font-size: 60px;
  line-height: 60px;
  font-weight: bold;
  margin: 0 auto;
  color: #fff;
  display: flex;
  align-items: center;
  padding-bottom: 50px;
  .logo {
    width: auto;
    height: 60px;
    margin-right: 20px;
    margin-top: 5px;
  }
}

.list {
  width: 1200px;
  margin: auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  /* margin: -10px; */
}
.item {
  position: relative;
  width: 550px;
  height: 300px;
  display: block;
  text-decoration: none;
  box-sizing: border-box;
  border-radius: 10px;
  overflow: hidden;
  margin: 20px;
  padding: 30px;
  color: #fff;
  background-size: cover;
  background-repeat: no-repeat;
  user-select: none;
  cursor: pointer;

  .item_title {
    display: flex;
    align-items: center;
    font-weight: bold;
    font-size: 40px;
  }
  .item_icon {
    width: 100px;
    height: 100px;
    margin-right: 30px;
  }
  .item_detail {
    width: 100%;
    font-size: 18px;
    line-height: 20px;
    margin-top: 10px;
  }
  .item_help {
    position: absolute;
    left: 20px;
    bottom: 20px;
    color: #fff;
    font-size: 20px;
    cursor: pointer;
  }
}

.tabel_dialog {
  ::v-deep {
    .el-dialog__body {
      padding-top: 10px;
    }
  }
  .tabel_toolbar {
    margin-bottom: 10px;
  }
}
// @media screen and (max-width: 1200px) {
//   .title {
//     width: 100vw;
//     box-sizing: border-box;
//     padding: 5vw;
//     margin: 0;
//     font-size: 7vw;
//     line-height: 10vw;
//     display: flex;
//     align-items: center;
//   }
//   .logo {
//     width: auto;
//     height: 11vw;
//     margin-right: 2vw;
//     margin-top: 1vw;
//   }
//   .list {
//     width: 100vw;
//     padding-bottom: 10vw;
//   }
//   .item {
//     width: 90vw;
//     height: auto;
//     border-radius: 1vw;
//     margin: 1vw;
//     padding: 4vw;

//     .item_icon {
//       width: 15vw;
//       height: 15vw;
//     }
//     .item_title {
//       font-size: 6vw;
//       line-height: 4vw;
//     }
//     .item_detail {
//       font-size: 3vw;
//       line-height: 4vw;
//       font-weight: 400;
//       margin-top: 2vw;
//     }
//   }
// }
</style>
