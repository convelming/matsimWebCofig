<template>
  <div class="back">
    <div class="root">
      <div class="module">
        <div class="module_menu" @click="handleShowDataBase">{{ dataBase || $l("请选择基准MATSIM模型") }}<i class="el-icon-arrow-down el-icon--right"></i></div>
      </div>
      <div class="title">
        <img class="logo" src="@/assets/image/favicon.png" alt="" />
        <span>{{ $l("城市公交路线规划平台") }}</span>
      </div>
      <div class="list">
        <div @click="handleClickItem('operationsAnalysis')" class="item" style="background-color: yellowgreen">
          <div class="item_title">
            <img class="item_icon" src="@/assets/image/公交.svg" />
            <span>{{ $l("公交运行分析") }}</span>
          </div>
          <div class="item_detail">
            {{ $l("展示整个公交系统的运行现状，包括线路、发车时间，客流量信息及其OD分布等") }}
          </div>
          <!-- <OAHelpDialog class="item_help" /> -->
        </div>
        <div @click="handleClickItem('planAdjustment')" class="item" style="background-color: #f0704b">
          <div class="item_title">
            <img class="item_icon" src="@/assets/image/修改or意见.svg" />
            <span>{{ $l("线路方案调整") }}</span>
          </div>
          <div class="item_detail">
            {{ $l("按照一定的策略新建或调整公交线路，站点，发车信息，实时更新线路信息。") }}
          </div>
          <PAHelpDialog class="item_help" />
        </div>
        <div @click="handleClickItem('comparativeAnalysis')" class="item" style="background-color: #52b3ba">
          <div class="item_title">
            <img class="item_icon" src="@/assets/image/比幅对比_1.svg" />
            <span>{{ $l("方案对比分析") }}</span>
          </div>
          <div class="item_detail">
            {{ $l("根据调整优化的线路方案，呈现城市居民在线路调整后的反应，并将对比结果可视化呈现。") }}
          </div>
          <!-- <CAHelpDialog class="item_help" /> -->
        </div>
        <div @click="handleClickItem('systemEvaluation')" class="item" style="background-color: #0070c0">
          <div class="item_title">
            <img class="item_icon" src="@/assets/image/评估.svg" />
            <span>{{ $l("公交系统评估") }}</span>
          </div>
          <div class="item_detail">
            {{ $l("公交系统总体运行评估包括可达性。") }}
          </div>
          <SEHelpDialog class="item_help" />
        </div>
      </div>
    </div>

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
    <el-dialog class="tabel_dialog" :title="$l('公交运行分析')" :visible.sync="operationsAnalysisDialog.show" width="600px">
      <div class="tabel_toolbar">
        <el-button type="primary" size="mini" icon="el-icon-refresh-right" @click="handleGetDateSourceList()">{{ $l("刷新列表") }}</el-button>
      </div>
      <el-table height="400" :data="dataSourceList" border stripe v-loading="dateSourceListLoading">
        <el-table-column prop="name" :label="$l('方案名称')" />
        <el-table-column prop="detail" :label="$l('方案简介')" />
        <el-table-column prop="loadStatus" :label="$l('方案状态')">
          <template slot-scope="{ row }">{{ row.loadStatus }} / {{ row.runStatus }}</template>
        </el-table-column>
        <el-table-column :label="$l('操作')" width="250">
          <template slot-scope="{ row }">
            <el-button :disabled="row.runStatus != '已运行' || row.loadStatus != '已加载'" type="primary" size="mini" @click="handleOperationsAnalysisToDetail(row)">{{ $l("查看") }}</el-button>
            <el-button type="primary" size="mini" :disabled="row.noRun" :loading="row.runStatus == '运行中'" @click="handleOperationsAnalysisRun(row)">{{ $l("运行") }}</el-button>
            <el-button type="primary" size="mini" :disabled="row.noLoad" :loading="row.loadStatus == '加载中'" @click="handleOperationsAnalysisLoad(row)">{{ $l("加载") }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 线路方案调整 -->
    <el-dialog class="tabel_dialog" :title="$l('线路方案调整')" :visible.sync="planAdjustmentDialog.show" width="600px">
      <div class="tabel_toolbar">
        <el-button type="primary" size="mini" icon="el-icon-refresh-right" @click="handleGetDateSourceList()">{{ $l("刷新列表") }}</el-button>
        <el-button type="primary" size="mini" icon="el-icon-add" @click="handlePlanAdjustmentCreate()">{{ $l("新建方案") }}</el-button>
      </div>
      <el-table height="400" :data="dataSourceList" border stripe v-loading="dateSourceListLoading">
        <el-table-column prop="name" :label="$l('方案名称')" />
        <el-table-column prop="detail" :label="$l('方案简介')" />
        <el-table-column prop="loadStatus" :label="$l('方案状态')">
          <template slot-scope="{ row }">{{ row.loadStatus }} / {{ row.runStatus }}</template>
        </el-table-column>
        <el-table-column :label="$l('操作')" width="180">
          <template slot-scope="{ row }">
            <el-button :disabled="row.loadStatus != '已加载'" type="primary" size="mini" @click="handlePlanAdjustmentToDetail(row)">{{ $l("修改") }}</el-button>
            <el-button type="primary" size="mini" :disabled="row.noLoad" :loading="row.loadStatus == '加载中'" @click="handlePlanAdjustmentLoad(row)">{{ $l("加载") }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 方案对比分析 -->
    <el-dialog class="tabel_dialog" :title="$l('方案对比分析')" :visible.sync="comparativeAnalysisDialog.show" width="900px">
      <div class="tabel_toolbar">
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
            <!-- <el-checkbox v-model="comparativeAnalysisDialog.dataSource2" false-label="" :true-label="row.name">{{ "" }}</el-checkbox> -->
            <el-checkbox v-model="comparativeAnalysisDialog.dataSource2" false-label="" :true-label="row.name" :disabled="row.loadStatus != '已加载' || row.runStatus != '已运行' || comparativeAnalysisDialog.dataSource1 == row.name">{{ "" }}</el-checkbox>
          </template>
        </el-table-column>
        <el-table-column prop="name" :label="$l('方案名称')" />
        <el-table-column prop="detail" :label="$l('方案简介')" />
        <el-table-column prop="loadStatus" :label="$l('方案状态')">
          <template slot-scope="{ row }">{{ row.loadStatus }} / {{ row.runStatus }}</template>
        </el-table-column>
        <el-table-column :label="$l('操作')" width="180">
          <template slot-scope="{ row }">
            <el-button type="primary" size="mini" :disabled="row.noRun" :loading="row.runStatus == '运行中'" @click="handleOperationsAnalysisRun(row)">{{ $l("运行") }}</el-button>
            <el-button type="primary" size="mini" :disabled="row.noLoad" :loading="row.loadStatus == '加载中'" @click="handleOperationsAnalysisLoad(row)">{{ $l("加载") }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="display: flex; justify-content: center; margin-top: 20px">
        <el-button type="primary" size="small" @click="handleComparativeAnalysisToDetail()" :disabled="!comparativeAnalysisDialog.dataSource1 || !comparativeAnalysisDialog.dataSource2">确定</el-button>
      </div>
    </el-dialog>

    <!-- 公交运营评估 -->
    <el-dialog class="tabel_dialog" :title="$l('公交运营评估')" :visible.sync="systemEvaluationDialog.show" width="600px">
      <div class="tabel_toolbar">
        <el-button type="primary" size="mini" icon="el-icon-refresh-right" @click="handleGetDateSourceList()">{{ $l("刷新列表") }}</el-button>
      </div>
      <el-table height="400" :data="dataSourceList" border stripe v-loading="dateSourceListLoading">
        <el-table-column prop="name" :label="$l('方案名称')" />
        <el-table-column prop="detail" :label="$l('方案简介')" />
        <el-table-column prop="loadStatus" :label="$l('方案状态')">
          <template slot-scope="{ row }">{{ row.loadStatus }} / {{ row.runStatus }}</template>
        </el-table-column>
        <el-table-column :label="$l('操作')" width="180">
          <template slot-scope="{ row }">
            <el-button :disabled="row.loadStatus != '已加载'" type="primary" size="mini" @click="handleSystemEvaluationToDetail(row)">{{ $l("查看") }}</el-button>
            <el-button type="primary" size="mini" :disabled="row.noLoad" :loading="row.loadStatus == '加载中'" @click="handleSystemEvaluationLoad(row)">{{ $l("加载") }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<language>
{
  "公交运行分析": {
    "zh-CN":"公交运行分析",
    "en-US":"公交运行分析",
  },
  "新建方案": {
    "zh-CN":"新建方案",
    "en-US":"新建方案",
  },
  "保存方案": {
    "zh-CN":"保存方案",
    "en-US":"保存方案",
  },
  "方案创建成功": {
    "zh-CN":"方案创建成功",
    "en-US":"方案创建成功",
  },
  "方案保存成功": {
    "zh-CN":"方案保存成功",
    "en-US":"方案保存成功",
  },
  "请输入方案名称": {
    "zh-CN":"请输入方案名称",
    "en-US":"请输入方案名称",
  },
  "方案名称只能使用英文字母，数字和下划线": {
    "zh-CN":"方案名称只能使用英文字母，数字和下划线",
    "en-US":"方案名称只能使用英文字母，数字和下划线",
  },
  "方案名称不能以base结尾": {
    "zh-CN":"方案名称不能以base结尾",
    "en-US":"方案名称不能以base结尾",
  },
  "方案名称": {
    "zh-CN":"方案名称",
    "en-US":"方案名称",
  },
  "方案简介": {
    "zh-CN":"方案简介",
    "en-US":"方案简介",
  },
  "方案状态": {
    "zh-CN":"方案状态",
    "en-US":"方案状态",
  },
  "基准名称": {
    "zh-CN":"基准名称",
    "en-US":"基准名称",
  },
  "运行状态": {
    "zh-CN":"运行状态",
    "en-US":"运行状态",
  },
  "加载状态": {
    "zh-CN":"加载状态",
    "en-US":"加载状态",
  },
  "基础方案": {
    "zh-CN":"基础方案",
    "en-US":"基础方案",
  },
  "对比方案": {
    "zh-CN":"对比方案",
    "en-US":"对比方案",
  },
  "请选择基准MATSIM模型": {
    "zh-CN":"请选择基准MATSIM模型",
    "en-US":"请选择基准MATSIM模型",
  },
  "城市公交路线规划平台": {
    "zh-CN":"城市公交路线规划平台",
    "en-US":"城市公交路线规划平台",
  },
  "展示整个公交系统的运行现状，包括线路、发车时间，客流量信息及其OD分布等": {
    "zh-CN":"展示整个公交系统的运行现状，包括线路、发车时间，客流量信息及其OD分布等",
    "en-US":"展示整个公交系统的运行现状，包括线路、发车时间，客流量信息及其OD分布等",
  },
  "线路方案调整": {
    "zh-CN":"线路方案调整",
    "en-US":"线路方案调整",
  },
  "按照一定的策略新建或调整公交线路，站点，发车信息，实时更新线路信息。": {
    "zh-CN":"按照一定的策略新建或调整公交线路，站点，发车信息，实时更新线路信息。",
    "en-US":"按照一定的策略新建或调整公交线路，站点，发车信息，实时更新线路信息。",
  },
  "方案对比分析": {
    "zh-CN":"方案对比分析",
    "en-US":"方案对比分析",
  },
  "根据调整优化的线路方案，呈现城市居民在线路调整后的反应，并将对比结果可视化呈现。": {
    "zh-CN":"根据调整优化的线路方案，呈现城市居民在线路调整后的反应，并将对比结果可视化呈现。",
    "en-US":"根据调整优化的线路方案，呈现城市居民在线路调整后的反应，并将对比结果可视化呈现。",
  },
  "公交系统评估": {
    "zh-CN":"公交系统评估",
    "en-US":"公交系统评估",
  },
  "公交运营评估": {
    "zh-CN":"公交运营评估",
    "en-US":"公交运营评估",
  },
  "公交系统总体运行评估包括可达性。": {
    "zh-CN":"公交系统总体运行评估包括可达性。",
    "en-US":"公交系统总体运行评估包括可达性。",
  },
}
</language>

<script>
import OAHelpDialog from "./operationsAnalysis/component/HelpDialog/index2.vue";
import PAHelpDialog from "./planAdjustment/component/HelpDialog/index2.vue";
import CAHelpDialog from "./comparativeAnalysis/component/HelpDialog/index2.vue";
import SEHelpDialog from "./systemEvaluation/component/HelpDialog/index2.vue";

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
    async handlePlanAdjustmentCreate() {
      try {
        const { value, action } = await this.$prompt(this.$l("请输入方案名称"), this.$l("提示"), {
          confirmButtonText: this.$l("确定"),
          cancelButtonText: this.$l("取消"),
          inputValidator: (value) => {
            if (!value) {
              return this.$l("请输入方案名称");
            }
            if (!/^[a-zA-Z0-9_]+$/.test(value)) {
              return this.$l("方案名称只能使用英文字母，数字和下划线");
            }
            if (value.slice(-4).toLowerCase() == "base") {
              return this.$l("方案名称不能以base结尾");
            }
            return true;
          },
        });
        if (action == "confirm") {
          const data = await this.$store.dispatch("createDataSource", {
            base: this.dataBase,
            key: value,
          });
          if (data.code == 200) {
            this.$message.success(this.$l("方案创建成功"));
          }
        }
      } catch (error) {}
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
  },
};
</script>

<style lang="scss" scoped>
.back {
  box-sizing: border-box;
  width: 100vw;
  height: 100vh;
  background-image: url("~@/assets/image/back.jpg");
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
