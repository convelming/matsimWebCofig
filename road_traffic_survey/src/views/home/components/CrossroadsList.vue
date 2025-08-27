<template>
  <Dialog class="CrossroadsList" title="交叉口调查记录" :top="40" :left="40" :width="600" hideMinimize :visible="visible" @close="handleClose">
    <div class="CrossroadsList_body" v-loading="loading">
      <div>
        <el-form ref="form" label-width="auto" inline size="mini">
          <el-form-item label="交叉口名称">
            <el-select v-model="crossroadsList.intersectionId" @change="handleSreachCrossroadsList" @clear="handleGetIntersectionList('')" :remote-method="handleGetIntersectionList" filterable remote clearable placeholder="请输入关键词">
              <el-option v-for="item in intersectionList.data" :key="item.id + item.name" :label="item.name" :value="item.id"> </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <div style="margin-bottom: 18px">
        <el-button type="primary" size="mini" @click="handleGetCrossroadsList">刷新</el-button>
        <el-button type="primary" size="mini" :disabled="!crossroadsList.intersectionId" @click="handleShowEditIntersection">修改交叉口名称</el-button>
        <el-button type="primary" size="mini" :disabled="!crossroadsList.intersectionId" @click="handleShowManuallyEnteringCrossroads">人工录入</el-button>
        <el-button type="primary" size="mini" :disabled="!crossroadsList.intersectionId" @click="handleShowVideoInputCrossroads">视频识别</el-button>
      </div>
      <el-table class="small" :data="crossroadsList.data" border stripe height="calc(100vh - 400px)" v-loading="crossroadsList.loading">
        <el-table-column prop="id" label="id" width="50px" />
        <el-table-column prop="name" label="交叉口" min-width="80px" />
        <el-table-column prop="type" label="调查方式" min-width="80px">
          <template slot-scope="{ row }">{{ typeOptions[row.type] }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" min-width="80px">
          <template slot-scope="{ row }">{{ videoStateOptions[row.status] }}</template>
        </el-table-column>
        <el-table-column prop="beginTime,endTime" label="调查日期" width="160px">
          <template slot-scope="{ row }">
            <div>{{ row.beginTime }}</div>
            <div>{{ row.endTime }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="操作" label="操作" width="130px">
          <div slot-scope="{ row }" class="operate_btn">
            <!-- 状态（0等待划线，1等待运行，2正在运行，3运行成功，4运行失败，5等待录入，6录入成功 -->
            <el-button v-if="(row.status == 1 || row.status == 3 || row.status == 4) && row.type == 2" type="text" size="mini" @click="handleRunCrossroad(row)">运行</el-button>
            <el-button type="text" size="mini" @click="handleShowCrossroadsDetail(row)">查看</el-button>
            <el-button type="text" size="mini" @click="handleDeleteCrossroad(row)">移除</el-button>
            <el-button type="text" size="mini" @click="handleShowDrawLine(row)">检测线绘制</el-button>
            <!-- <el-button v-if="(row.status == 0 || row.status == 4) && row.type == 1" type="text" size="mini" @click="handleShowManuallyEnteringCrossroads(row)">检测线绘制</el-button> -->
          </div>
        </el-table-column>
      </el-table>
      <pagination class="crossroads_pagination" :total="crossroadsList.total" :page.sync="crossroadsList.pageNum" :limit.sync="crossroadsList.pageSize" @pagination="handleGetCrossroadsList" />
    </div>
  </Dialog>
</template>

<script>
import { intersectionList, intersectionDetail, intersectionInsert, intersectionDelete, intersectionUpdate, crossroadsList, crossroadsDetail, crossroadsDelete, crossroadsRunVehicleCounts } from "@/api/index";

export default {
  name: "CrossroadsList",
  props: {
    visible: {
      type: Boolean,
    },
    params: {
      type: Object,
    },
  },
  inject: ["rootVue"],
  components: {},
  computed: {},
  watch: {
    params: {
      handler(val) {
        this.init();
      },
      immediate: true,
      deep: true,
    },
    visible: {
      handler(val) {
        this.init();
      },
      immediate: true,
      deep: true,
    },
  },
  data() {
    return {
      loading: false,

      intersectionList: {
        data: [],
        loading: false,

        name: "",
        pageNum: 1,
        pageSize: 99999999,
        total: 0,
      },

      crossroadsList: {
        data: [],
        loading: false,

        intersectionId: "",
        pageNum: 1,
        pageSize: 10,
        total: 0,
      },

      typeOptions: {
        0: "其他",
        1: "人工",
        2: "视频识别",
        3: "互联网路况估算",
        4: "交评核准",
      },
      videoTypeOptions: {
        0: "未知",
        1: "俯视航拍",
        1: "侧面路拍",
        1: "正斜角拍摄",
      },
      videoStateOptions: {
        0: "等待划线",
        1: "等待运行",
        2: "正在运行",
        3: "运行成功",
        4: "运行失败",
        5: "等待录入",
        6: "录入成功",
      },

      editIntersection: {
        show: true,
        form: {
          id: "",
          name: "",
        },
      },
    };
  },
  created() {},
  mounted() {},
  methods: {
    init() {
      if (!this.visible) return;
      this.handleGetIntersectionList(this.params.name);
      this.handleSreachCrossroadsList(this.params.id);
    },
    handleClose() {
      this.handleSreachClear();
      this.$emit("update:visible", false);
      this.$emit("close");
    },
    handleSreachClear() {},
    handleGetIntersectionList(query) {
      console.log(query);

      this.intersectionList.loading = true;
      this.intersectionList.name = query;
      intersectionList({
        name: this.intersectionList.name,
        pageSize: this.intersectionList.pageSize,
        pageNum: this.intersectionList.pageNum,
      })
        .then((res) => {
          const { data, pageSize, pageNum, total } = res.data;
          this.intersectionList.data = data;
          this.intersectionList.pageSize = pageSize;
          this.intersectionList.pageNum = pageNum;
          this.intersectionList.loading = false;
        })
        .catch((err) => {
          this.intersectionList.loading = false;
        });
    },
    async handleShowEditIntersection() {
      const form = (await intersectionDetail(this.crossroadsList.intersectionId)).data;
      form.name = (
        await this.$prompt("请输入交叉口名称", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          inputValue: form.name,
          inputPlaceholder: "请输入交叉口名称",
          inputPattern: /\S/,
        })
      ).value;
      await intersectionUpdate(form);
      this.handleGetIntersectionList(form.name);
      this.handleGetCrossroadsList();
      this.$message.success("修改成功");
    },
    // ******************************* 交叉口列表 -- start
    handleSreachCrossroadsList(id) {
      console.log("handleSreachCrossroadsList", id);
      this.crossroadsList.intersectionId = id;
      this.crossroadsList.pageNum = 1;
      this.handleGetCrossroadsList();
    },
    handleGetCrossroadsList() {
      this.crossroadsList.loading = true;
      const form = {
        intersectionId: this.crossroadsList.intersectionId,
        pageSize: this.crossroadsList.pageSize,
        pageNum: this.crossroadsList.pageNum,
      };
      if (form.intersectionId) {
        intersectionDetail(form.intersectionId).then((res) => {
          if (this.rootVue._Map) {
            this.rootVue._Map.setCenter([res.data.x, res.data.y]);
            this.rootVue._Map.setZoom(16);
          }
          this.selectIntersection = res.data;
        });
      } else {
        this.selectIntersection = null;
      }
      crossroadsList(form)
        .then((res) => {
          const { data, pageSize, pageNum, total } = res.data;
          this.crossroadsList.data = data;
          this.crossroadsList.pageSize = pageSize;
          this.crossroadsList.pageNum = pageNum;
          this.crossroadsList.total = total;
          this.crossroadsList.loading = false;
        })
        .catch((err) => {
          this.crossroadsList.loading = false;
        });
    },
    handleDeleteCrossroad(row) {
      const id = row.id;
      this.$confirm('是否确认删除编号为"' + id + '"的记录?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return crossroadsDelete(id);
        })
        .then(() => {
          this.handleGetCrossroadsList();
          this.$message.success("删除成功");
        })
        .catch((err) => {
          console.log(err);
        });
    },
    handleRunCrossroad(row) {
      crossroadsRunVehicleCounts(row.id).then((res) => {
        this.handleGetCrossroadsList();
      });
    },
    handleShowCrossroadsDetail(row) {
      this.$emit("showCrossroadsDetail", row);
    },
    handleShowCrossroadsStatsEdit(row) {
      this.$emit("showCrossroadsStatsEdit", row);
    },
    handleShowDrawLine(row) {
      this.$emit("showDrawLine", row);
    },
    handleShowManuallyEnteringCrossroads(row) {
      this.$emit("showManuallyEnteringCrossroads", {
        intersectionId: this.crossroadsList.intersectionId,
      });
    },
    handleShowVideoInputCrossroads(row) {
      this.$emit("showVideoInputCrossroads", {
        intersectionId: this.crossroadsList.intersectionId,
      });
    },
    // ******************************* 交叉口列表 -- end
  },
};
</script>

<style lang="scss" scoped>
.CrossroadsList {
  .crossroads_pagination {
    // position: relative;
    // margin-top: 10px;
    // left: -12px;
    padding: 20px 0 0 0;
  }
  .operate_btn {
    .el-button--text {
      margin: 0 5px !important;
    }
  }
}
</style>
