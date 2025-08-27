<template>
  <Dialog :top="20" :left="20" width="900px" title="区域调查记录" hideMinimize :visible="visible && selectState == POLYGON_SELECT_STATE_KEY.NOT_STARTED" @close="handleClose">
    <div class="FrameLinkDialog">
      <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="auto" size="mini" style="margin-bottom: 20px">
        <el-row :gutter="20">
          <el-col :span="24" :offset="0">
            <el-form-item label="调查区域">
              <el-button v-if="selectState == POLYGON_SELECT_STATE_KEY.NOT_STARTED" type="primary" size="mini" @click="handlePlayPolygonSelect()">开始圈定</el-button>
              <template v-if="selectState != POLYGON_SELECT_STATE_KEY.NOT_STARTED">
                <el-button type="primary" size="mini" @click="handleReplayPolygonSelect()">重新圈定</el-button>
                <el-button type="primary" size="mini" @click="handleStopPolygonSelect()">结束圈定</el-button>
              </template>
            </el-form-item>
          </el-col>
          <el-col :span="24" :offset="0">
            <el-form-item label="时间" prop="timeList">
              <el-date-picker v-model="dateRange" type="datetimerange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd HH:mm:ss" />
            </el-form-item>
            <el-form-item label="调查方式" prop="type">
              <el-select v-model="queryParams.type" placeholder="请选择" clearable>
                <el-option v-for="(v, i) in typeOptions" :key="String(i)" :label="v" :value="String(i)"> </el-option>
              </el-select>
            </el-form-item>
            <el-form-item> </el-form-item>
          </el-col>
          <el-col :span="24" :offset="0">
            <div style="display: flex">
              <el-button type="primary" icon="el-icon-search" @click="handleQuery" size="mini">搜索</el-button>
              <el-button icon="el-icon-refresh" @click="resetQuery" size="mini">重置</el-button>
              <el-button style="margin-left: auto" type="warning" plain icon="el-icon-download" :loading="exportLoading" @click="handleExport" :disabled="multiple" size="mini">导出</el-button>
              <el-button type="warning" plain icon="el-icon-download" :loading="exportAllLoading" @click="handleExportAll" size="mini">导出全部</el-button>
            </div>
          </el-col>
        </el-row>
      </el-form>
      <el-table class="small" v-loading="loading" :data="dataList" @selection-change="handleSelectionChange" height="calc(100vh - 400px)">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="记录编号" align="center" prop="id" />
        <el-table-column label="路段编号" align="center" prop="linkId" />
        <el-table-column label="开始时间" align="center" prop="beginTime" />
        <el-table-column label="结束时间" align="center" prop="endTime" />
        <el-table-column label="调查方式" align="center" prop="type">
          <span slot-scope="{ row }">{{ typeOptions[row.type] }}</span>
        </el-table-column>
        <el-table-column label="pcu/h" align="center" prop="pcuH" />
        <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
      </el-table>
      <pagination style="line-height: 1; padding-top: 20px" v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />
    </div>
  </Dialog>
</template>

<script>
import { FrameSelectLayer, FRAME_SELECT_STATE_KEY, FRAME_SELECT_EVENT } from "../layer/FrameSelectLayer";
import { PolygonSelectLayer, POLYGON_SELECT_STATE_KEY, POLYGON_SELECT_EVENT } from "../layer/PolygonSelectLayer";
import { statsQueryByArea, statsExport } from "@/api/index";

export default {
  inject: ["rootVue"],
  props: {
    visible: {
      type: Boolean,
    },
    selectState: {
      type: Number,
    },
    xyarr: {
      type: Array,
      default: () => [],
    },
    timeList: {
      type: Array,
      default: () => [],
    },
    type: {
      type: [Number, String],
      default: "",
    },
  },
  watch: {
    visible: {
      handler(val) {
        if (val) {
          this.dateRange = this.timeList || [];
          this.queryParams.type = this.type;
          this.handleQuery();
        }
      },
      immediate: true,
      deep: true,
    },
  },
  data() {
    return {
      FRAME_SELECT_STATE_KEY,
      FRAME_SELECT_EVENT,
      POLYGON_SELECT_STATE_KEY,
      POLYGON_SELECT_EVENT,
      // 遮罩层
      loading: false,
      // 导出遮罩层
      exportLoading: false,
      exportAllLoading: false,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 字典表格数据
      dataList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 状态数据字典
      statusOptions: [],
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        type: null,
        beginTime: null,
        endTime: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        dictName: [{ required: true, message: "字典名称不能为空", trigger: "blur" }],
        dictType: [{ required: true, message: "字典类型不能为空", trigger: "blur" }],
      },

      typeOptions: {
        0: "其他",
        1: "人工",
        2: "视频识别",
        3: "互联网路况估算",
        4: "交评核准",
      },
    };
  },
  created() {},
  methods: {
    handleClose() {
      this.$emit("update:visible", false);
      this.$emit("close");
    },
    /** 查询字典类型列表 */
    getList() {
      if (!this.xyarr) return;
      this.loading = true;
      let queryParams = JSON.parse(JSON.stringify(this.queryParams));
      queryParams.xyarr = this.xyarr;
      if (this.dateRange && this.dateRange[0] && this.dateRange[1]) {
        queryParams.beginTime = this.dateRange[0];
        queryParams.endTime = this.dateRange[1];
      }
      statsQueryByArea(queryParams).then((response) => {
        this.dataList = response.data.data;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.dataList = [];
      this.total = 0;
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        type: null,
        beginTime: null,
        endTime: null,
      };
      this.dataList = [];
      this.total = 0;
      this.getList();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm('是否确认删除字典编号为"' + ids + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return delType(ids);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        })
        .catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      const ids = this.ids;
      this.$confirm("是否确认导出数据项?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.exportLoading = true;
          return statsExport({
            ids: ids,
          });
        })
        .then((response) => {
          const blobUrl = window.URL.createObjectURL(response.data);
          // 这里的文件名根据实际情况从响应头或者url里获取
          const filename = `${new Date().getTime()}.xls`;
          const a = document.createElement("a");
          a.href = blobUrl;
          a.download = filename;
          a.click();
          window.URL.revokeObjectURL(blobUrl);
          this.exportLoading = false;
        })
        .catch((error) => {
          this.exportLoading = false;
        });
    },
    /** 导出按钮操作 */
    handleExportAll() {
      this.$confirm("是否确认导出所有数据项?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.exportAllLoading = true;
          return statsExport({
            xyarr: this.xyarr,
          });
        })
        .then((response) => {
          const blobUrl = window.URL.createObjectURL(response.data);
          // 这里的文件名根据实际情况从响应头或者url里获取
          const filename = `${new Date().getTime()}.xls`;
          const a = document.createElement("a");
          a.href = blobUrl;
          a.download = filename;
          a.click();
          window.URL.revokeObjectURL(blobUrl);
          this.exportAllLoading = false;
        })
        .catch((error) => {
          this.exportAllLoading = false;
        });
    },
    handlePlayPolygonSelect() {
      if (this.rootVue) {
        this.rootVue.handlePlayPolygonSelect();
      }
    },
    handleReplayPolygonSelect() {
      if (this.rootVue) {
        this.rootVue.handleReplayPolygonSelect();
      }
    },
    handleStopPolygonSelect() {
      if (this.rootVue) {
        this.rootVue.handleStopPolygonSelect();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.FrameLinkDialog {
}
</style>
