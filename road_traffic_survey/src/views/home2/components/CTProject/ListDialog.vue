<!-- ListDialog -->
<template>
  <Dialog title="载入项目" class="ListDialog" :top="20" :left="20" width="600px" hideMinimize :visible="visible" @close="handleClose">
    <el-form :model="queryParams" ref="queryForm" label-width="auto" :inline="true" size="mini">
      <el-form-item label="项目名">
        <el-input v-model="queryParams.name"></el-input>
      </el-form-item>
      <el-form-item label="创建人">
        <el-input v-model="queryParams.creator"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="list" border stripe height="calc(100vh - 400px)" :loading="loading">
      <el-table-column prop="name" label="项目名"> </el-table-column>
      <el-table-column prop="creator" label="创建人"> </el-table-column>
      <el-table-column prop="projectTime" label="项目时间"> </el-table-column>
      <el-table-column prop="操作" label="操作" width="130px">
        <div slot-scope="{ row }" class="operate_btn">
          <el-button type="text" size="mini" @click="$emit('showProject', row.id)">载入</el-button>
          <el-button type="text" style="color: red" size="mini" @click="handleDelete(row)">删除</el-button>
        </div>
      </el-table-column>
    </el-table>
    <pagination class="crossroads_pagination" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />
  </Dialog>
</template>

<script>
import { projectList, projectInsert, projectDelete, projectAddSample, projectQuerySample } from "@/api/index";
export default {
  name: "ListDialog",
  inject: ["rootVue"],
  props: {
    visible: {
      type: Boolean,
    },
  },
  components: {},
  computed: {
    _Map() {
      return this.rootVue._Map;
    },
  },
  watch: {
    visible: {
      handler(val) {
        this.s_visible = val;
        if (val) {
          this.handleEnable();
        } else {
          this.handleDisable();
        }
      },
    },
  },
  data() {
    return {
      s_visible: false,
      loading: false,
      list: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: "",
        creator: "",
      },
      total: 0,
    };
  },
  created() {},
  mounted() {
    this._interval = setInterval(() => {
      if (!this._Map) return;
      clearInterval(this._interval);
      if (this.s_visible) {
        this.handleEnable();
      }
    }, 1000);
  },
  methods: {
    handleEnable() {
      this.resetQuery();
    },
    handleDisable() {},
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        name: "",
        creator: "",
      };
      this.handleQuery();
    },
    getList() {
      this.loading = true;
      projectList(this.queryParams)
        .then((res) => {
          console.log(res);
          this.list = res.data.data;
          this.loading = false;
        })
        .catch((err) => {
          console.log(err);
          this.loading = false;
        });
    },
    handleClose() {
      this.addForm = {
        name: "",
        creator: "",
        projectTime: "",
        file: "",
        xyarr: "",
        xyarrType: 1,
      };
      this.$emit("update:visible", false);
      this.$emit("close");
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const dictIds = row.dictId;
      this.$confirm('是否确认删除字典编号为"' + dictIds + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return projectDelete(dictIds);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        })
        .catch(() => {});
    },
  },
};
</script>

<style lang="scss" scoped>
.ListDialog {
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
