<!-- App -->
<template>
  <div id="app" class="App">
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
        <div class="box">
          <div class="left">
            <h2>{{ $l("广州市黄埔区居民出行可视化") }}</h2>
            <p>
              {{ $l("行程数据来源：") }}<span href="#">{{ $l("2023年9月-10月广州居民出行街头问卷调查") }}</span>
            </p>
            <p>
              {{ $l("路网数据来源：") }}<span href="#">{{ $l("OpenStreetMap") }}</span>
            </p>
            <p>
              {{ $l("公交数据来源：") }}<span href="#">{{ $l("高德地图") }}</span>
            </p>
            <el-row :gutter="20">
              <el-col :span="12">
                <p>{{ $l("出行次数") }}</p>
                <h1>{{ $l("63.3万") }}</h1>
              </el-col>
              <el-col :span="12">
                <p>{{ $l("建筑物数量") }}</p>
                <h1>{{ $l("62.2万") }}</h1>
              </el-col>
              <el-col :span="12">
                <p>{{ $l("人口数量") }}</p>
                <h1>{{ $l("30万") }}</h1>
              </el-col>
            </el-row>
            <div class="footer" v-if="defaultDataSource">
              <div class="defaultDataSource" @click="handleClickItem('operationsAnalysis')">
                <span>{{ defaultDataSource.dataSource }} ({{ $l(defaultDataSource.loadStatus) }})</span>
                <span class="dian" style="background-color: #67c23a" v-if="defaultDataSource.loadStatus == '已加载'"></span>
                <span class="dian" style="background-color: #e6a23c" v-else-if="defaultDataSource.loadStatus == '加载中'"></span>
                <span class="dian" style="background-color: #909399" v-else-if="defaultDataSource.loadStatus == '未加载'"></span>
              </div>
              <el-button type="primary" size="small" @click="handleOperationsAnalysisToDetail(defaultDataSource)">{{ $l("进入页面") }}</el-button>
            </div>
            <div class="footer" v-else>
              <div class="defaultDataSource" @click="handleClickItem('operationsAnalysis')">
                <span>未设置默认方案，请点击查看</span>
              </div>
            </div>
          </div>
        </div>

        <BeiAnBox />
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
        <el-button :disabled="!dataBaseDialog.dataBase" type="primary" size="mini" @click="handleChangeDataBase">{{ $l("确定") }}</el-button>
        <el-button size="mini" @click="dataBaseDialog.show = false">{{ $l("取消") }}</el-button>
      </span>
    </el-dialog>

    <!-- 公交运行分析 -->
    <el-dialog class="tabel_dialog" :title="$l('公交运行分析')" :visible.sync="operationsAnalysisDialog.show" width="900px">
      <div class="tabel_toolbar">
        <el-button type="primary" size="mini" icon="el-icon-arrow-left" @click="handleToSelectDataBase('operationsAnalysis')">{{ $l("返回上一级") }}</el-button>
        <el-button type="primary" size="mini" icon="el-icon-refresh-right" @click="handleGetDateSourceList(dataBase)">{{ $l("刷新列表") }}</el-button>
        <el-input style="margin-left: auto; width: 200px" v-model="operationsAnalysisDialog.sreach" :placeholder="$l('搜索')" size="mini" clearable @change="" />
      </div>
      <el-table height="400" :data="dataSourceList.filter((v) => v.name.includes(operationsAnalysisDialog.sreach))" border stripe v-loading="dataSourceListLoading">
        <el-table-column prop="name" :label="$l('方案名称')" width="100"> </el-table-column>
        <el-table-column prop="detail" :label="$l('方案简介')"> </el-table-column>
        <el-table-column prop="loadStatus" :label="$l('方案状态')" width="150">
          <template slot-scope="{ row }">{{ $l(row.loadStatus) }} / {{ $l(row.runStatus) }}</template>
        </el-table-column>
        <el-table-column prop="loadStatus" :label="$l('系数')" width="150">
          <template slot-scope="{ row }">
            <span style="margin-right: 10px">{{ row.scale }}</span>
            <i class="el-icon-edit" @click="handleChangeScale(row)"></i>
          </template>
        </el-table-column>
        <el-table-column :label="$l('操作')" width="250">
          <template slot-scope="{ row }">
            <el-button v-if="row.runStatus == '已运行' && row.loadStatus == '已加载'" type="primary" size="mini" @click="handleOperationsAnalysisToDetail(row)">{{ $l("查看") }}</el-button>
            <el-button v-if="!row.noLoad" type="warning" size="mini" :loading="row.loadStatus == '加载中'" @click="handleOperationsAnalysisLoad(row)">{{ $l("加载") }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<language>
{
  进入页面: {
    "zh-CN": "进入页面",
    "en-US": "Enter page",
  },
  请选择基准MATSIM模型: {
    "zh-CN": "请选择基准MATSIM模型",
    "en-US": "Please select a base MATSim scenario",
  },
  刷新列表: {
    "zh-CN": "刷新列表",
    "en-US": "Refresh",
  },
  基准名称: {
    "zh-CN": "基准名称",
    "en-US": "Base Scenario",
  },
  公交运行分析: {
    "zh-CN": "公交运行分析",
    "en-US": "Public Transit Analysis",
  },
  刷新列表: {
    "zh-CN": "刷新列表",
    "en-US": "Refresh",
  },
  返回上一级: {
    "zh-CN": "返回上一级",
    "en-US": "Return",
  },
  搜索: {
    "zh-CN": "搜索",
    "en-US": "sreach",
  },
  方案名称: {
    "zh-CN": "方案名称",
    "en-US": "Scheme Name",
  },
  方案简介: {
    "zh-CN": "方案简介",
    "en-US": "Scheme Introduction",
  },
  方案状态: {
    "zh-CN": "内存/模型",
    "en-US": "Memory/Model",
  },
  未运行: {
    "zh-CN": "未运行",
    "en-US": "Pending",
  },
  运行中: {
    "zh-CN": "运行中",
    "en-US": "Running",
  },
  已运行: {
    "zh-CN": "已运行",
    "en-US": "Executed",
  },
  未加载: {
    "zh-CN": "未加载",
    "en-US": "Unload",
  },
  加载中: {
    "zh-CN": "加载中",
    "en-US": "Loading",
  },
  已加载: {
    "zh-CN": "已加载",
    "en-US": "Loaded",
  },
  "加载中...": {
    "zh-CN": "加载中...",
    "en-US": "Loading...",
  },
  确定: {
    "zh-CN": "确定",
    "en-US": "Confirm",
  },
  取消: {
    "zh-CN": "取消",
    "en-US": "Cancel",
  },
  操作: {
    "zh-CN": "操作",
    "en-US": "Operation",
  },
  查看: {
    "zh-CN": "查看",
    "en-US": "Check",
  },
  加载: {
    "zh-CN": "加载",
    "en-US": "Load",
  },
  系数: {
    "zh-CN": "系数",
    "en-US": "系数",
  },
  请输入系数: {
    "zh-CN": "请输入系数",
    "en-US": "请输入系数",
  },
  请输入数字作为系数: {
    "zh-CN": "请输入数字作为系数",
    "en-US": "请输入数字作为系数",
  },
  提示: {
    "zh-CN": "提示",
    "en-US": "Prompt",
  },
}
</language>

<script>
const BASE_API_URL = "";

export default {
  name: "App",
  data() {
    return {
      defaultDataSource: {},

      dataBaseDialog: {
        show: false,
        dataBase: "",
        itemKey: "",
      },

      operationsAnalysisDialog: {
        show: false,
        dataSource: "",
        sreach: "",
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
  async created() {
    this.page_language = sessionStorage.getItem("language") || this.page_language;
    await this.getDefaultDataSource();
    await this.handleGetDataBaseList();
    await this.handleGetDateSourceList(this.dataBase);
    this._interval = setInterval(async () => {
      await this.getDefaultDataSource();
      if (this.defaultDataSource.loadStatus == "已加载") {
        clearInterval(this._interval);
      }
    }, 5000);
  },
  mounted() {},
  beforeDestroy() {
    clearInterval(this._interval);
  },
  methods: {
    changeLanguage(lan) {
      this.$setLanguage(lan);
    },
    getDefaultDataSource() {
      return this.$store.dispatch("getDefaultBase").then((res) => {
        try {
          const [database, datasource] = res.data.name.split("/");
          res.data.dataBase = database;
          res.data.dataSource = datasource;
          this.defaultDataSource = res.data;
        } catch (error) {
          this.defaultDataSource = {};
        }
      });
    },
    handleOperationsAnalysisLoad(row) {
      return this.$store.dispatch("loadDataSource", row);
    },
    handleOperationsAnalysisToDetail(row) {
      const [database, datasource] = row.name.split("/");
      const href = `/pt.html#/operationsAnalysis/${database}/${datasource}`;
      window.open(href, "_blank");
    },
    handleGetDataBaseList() {
      return this.$store.dispatch("getDataBaseList", this.dataBase);
    },
    handleGetDateSourceList() {
      return this.$store.dispatch("getDataSourceList", this.dataBase);
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
      }
    },
    handleToSelectDataBase(key) {
      this.handleShowDataBase(key);
      switch (key) {
        case "operationsAnalysis":
          this.operationsAnalysisDialog.show = false;
          this.operationsAnalysisDialog.dataSource = "";
          break;
      }
    },
    handleShowOperationsAnalysisDialog() {
      this.operationsAnalysisDialog.show = true;
      this.operationsAnalysisDialog.dataSource = "";
    },
    handleChangeScale(row) {
      this.$prompt(this.$l("请输入系数"), this.$l("提示"), {
        confirmButtonText: this.$l("确定"),
        cancelButtonText: this.$l("取消"),
        inputValue: row.scale,
        inputValidator: (value) => {
          if (!Number.isFinite(Number(value))) return this.$l("请输入数字作为系数");
        },
      })
        .then(({ value }) => updateScale({ key: row.name, scale: value }))
        .then(() => {
          this.$message.success(this.$l("修改成功"));
          this.handleGetDateSourceList();
        })
        .catch(() => {});
    },
  },
};
</script>

<style lang="scss" scoped>
.back {
  box-sizing: border-box;
  width: 100vw;
  height: 100vh;
  // background-image: url("../img/gz.jpeg");
  background-image: url("~@/assets/image/gz.jpeg");
  background-size: cover;
  background-repeat: no-repeat;
  overflow: auto;
}

.root {
  box-sizing: border-box;
  width: 100%;
  /* min-width: 1200px; */
  padding: 40px;
}

.module {
  /* width: 1100px;
  margin: 0 auto; 
  height: 80px; */
  margin-bottom: 40px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
.module .module_menu {
  cursor: pointer;
  font-size: 16px;
  color: #fff;
}

.title {
  /* width: 1100px;
  font-size: 60px; */
  line-height: 60px;
  font-weight: bold;
  margin: 0 auto;
  color: #fff;
  display: flex;
  align-items: center;
  padding-bottom: 50px;
}

.title .logo {
  width: auto;
  height: 60px;
  margin-right: 20px;
  margin-top: 5px;
}

.box {
  /* width: 1100px;
  margin: auto; */
  padding-bottom: 50px;
  /* margin: -10px; */
  display: flex;
  justify-content: flex-end;
}

.box .left {
  box-sizing: border-box;
  width: 350px;
  background: #ffffffcc;
  padding: 20px 25px;
  border-radius: 5px;
}
.box .left .footer {
  padding-top: 20px;
  display: flex;
  align-items: center;
  border-top: 1px solid #999999;
}
.defaultDataSource {
  cursor: pointer;
  height: 30px;
  font-size: 14px;
  border: 1px solid #999999;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-right: 10px;
  padding: 0 10px;
}
.dian {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 50%;
}

.tabel_dialog .el-dialog__body {
  padding-top: 10px;
}

.tabel_dialog .tabel_toolbar {
  display: flex;
  margin-bottom: 10px;
}

.BeiAnBox {
  position: absolute;
  bottom: 0px;
}
</style>
