<template>
  <transition name="el-zoom-in-right">
    <div class="LineFlow" v-show="visible">
      <div class="_header">
        <i class="el-icon-close" @click="close"></i>
        <span style="margin-left: 20px">Link流量详情</span>
      </div>
      <div class="_bodyer">
        <el-row :gutter="10">
          <el-col :span="infoEdit ? 24 : 8">
            <el-form class="form_box" ref="infoForm" :model="infoForm" :rules="infoRules" label-width="100px" :inline="false" size="small" label-position="left">
              <el-form-item label="SegmentID：" prop="origid">
                <template v-if="!infoEdit">{{ info.origid }}</template>
                <template v-else>{{ infoForm.origid }}</template>
              </el-form-item>
              <el-form-item label="LinkID：" prop="id">
                <template v-if="!infoEdit">{{ info.id }}</template>
                <template v-else>{{ infoForm.id }}</template>
              </el-form-item>
              <el-form-item label="道路名称：" prop="name">
                <template v-if="!infoEdit">{{ info.name }}</template>
                <el-input v-else v-model="infoForm.name"></el-input>
              </el-form-item>
              <el-form-item label="车道数：" prop="lane">
                <template v-if="!infoEdit">{{ info.lane }}</template>
                <el-input-number v-else style="width: 100%" v-model="infoForm.lane" :min="0" :step="1" step-strictly> </el-input-number>
              </el-form-item>
              <el-form-item label="道路类型：" prop="type">
                <template v-if="!infoEdit">{{ linkTypeOption[info.type] }}</template>
                <el-select v-else v-model="infoForm.type" style="width: 100%">
                  <el-option v-for="(item, key) in linkTypeOption" :key="key" :label="item" :value="key"> </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="自由流速度：" prop="freespeed">
                <template v-if="!infoEdit">{{ info.freespeed }} 米 / 秒</template>
                <el-input-number v-else style="width: 100%" v-model="infoForm.freespeed" :min="0"> </el-input-number>
              </el-form-item>
              <el-form-item label-width="0px">
                <template v-if="!infoEdit">
                  <el-button type="primary" @click="handleEditInfo">编辑</el-button>
                  <el-button type="primary" @click="handleReverse">切换反向道路</el-button>
                </template>
                <template v-if="infoEdit">
                  <el-button type="success" @click="handleUpdateLink">更新当前link</el-button>
                  <el-button type="success" @click="handleUpdateInWay">更新整段segment</el-button>
                  <el-button type="warning" @click="handleCloseEditInfo">取消</el-button>
                </template>
              </el-form-item>
            </el-form>
          </el-col>
          <el-col :span="infoEdit ? 24 : 16">
            <div class="chart_box">
              <div ref="echart" class="chart"></div>
            </div>
          </el-col>
          <el-col :span="24">
            <div style="font-size: 14px; line-height: 32px; margin-bottom: 10px">
              <span style="width: 100px">历史信息：</span>
              <el-select v-model="queryParams.type" clearable multiple @change="handleQuery" size="small">
                <el-option v-for="(label, key) in typeOptions" :key="key" :label="label" :value="key"> </el-option>
              </el-select>
              <el-button icon="el-icon-plus" type="primary" size="small" @click="handleAdd">添加</el-button>
            </div>
            <el-table class="small" height="calc(100vh - 450px)" v-loading="loading" :data="dataList" @selection-change="handleSelectionChange">
              <el-table-column type="selection" width="55" align="center" />
              <el-table-column label="编号" align="center" prop="id" />
              <el-table-column label="调查开始时间" align="center" prop="beginTime" />
              <el-table-column label="调查结束时间" align="center" prop="endTime" />
              <el-table-column label="调查方式" align="center" prop="type">
                <span slot-scope="{ row }">{{ typeOptions[row.type] || "" }}</span>
              </el-table-column>
              <el-table-column label="pcu/h" align="center" prop="pcuH" />
              <el-table-column label="小型客车" align="center" prop="scar" />
              <el-table-column label="小型货车" align="center" prop="struck" />
              <el-table-column label="中型客车" align="center" prop="mcar" />
              <el-table-column label="中型货车" align="center" prop="mtruck" />
              <el-table-column label="大型客车" align="center" prop="lcar" />
              <el-table-column label="大型货车" align="center" prop="ltruck" />
              <el-table-column label="视频" align="center">
                <a slot-scope="{ row }" :href="`/file/download?url=${row.video}`" class="file_name">
                  {{ row.video }}
                </a>
              </el-table-column>
              <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
              <el-table-column label="操作" fixed="right" min-width="150" align="center" class-name="small-padding fixed-width">
                <template slot-scope="scope">
                  <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改</el-button>
                  <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>

            <pagination style="line-height: 1; padding-top: 20px" layout="total, sizes, prev, pager, next" :pagerCount="5" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />
          </el-col>
        </el-row>
      </div>

      <!-- 添加或修改参数配置对话框 -->
      <Dialog :title="title" :visible.sync="open" :left="440" width="550px" handleClose>
        <el-form ref="form" :model="form" :rules="rules" label-width="80px">
          <el-form-item label="调查时间" prop="timeList">
            <el-date-picker v-model="form.timeList" type="datetimerange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd HH:mm:ss" />
            <div style="color: red">注意: 请输入实际调查起止时间，时长需准确</div>
          </el-form-item>
          <el-form-item label="调查方式" prop="type">
            <el-radio-group v-model="form.type">
              <el-radio v-for="(v, i) in typeOptions" :key="i" :label="String(i)">{{ v }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="上传视频" prop="video">
            <UploadVideo v-model="form.video" />
          </el-form-item>
          <el-form-item label="视频录像是否可以覆盖到对向车道" label-width="auto" prop="isTwoWay">
            <el-switch v-model="form.isTwoWay" :active-value="true" :inactive-value="false"> </el-switch>
          </el-form-item>
          <el-form-item label="观察数据">
            <div style="color: red">注：请输入实际观测到数量无需换算成一小时的量</div>
            <el-form-item label="小型客车" prop="scar" label-width="auto">
              <el-input-number :step="1" step-strictly :min="0" v-model="form.scar" />
              辆
            </el-form-item>
            <el-form-item label="小型货车" prop="struck" label-width="auto">
              <el-input-number :step="1" step-strictly :min="0" v-model="form.struck" />
              辆
            </el-form-item>
            <el-form-item label="中型客车" prop="mcar" label-width="auto">
              <el-input-number :step="1" step-strictly :min="0" v-model="form.mcar" />
              辆
            </el-form-item>
            <el-form-item label="中型货车" prop="mtruck" label-width="auto">
              <el-input-number :step="1" step-strictly :min="0" v-model="form.mtruck" />
              辆
            </el-form-item>
            <el-form-item label="大型客车" prop="lcar" label-width="auto">
              <el-input-number :step="1" step-strictly :min="0" v-model="form.lcar" />
              辆
            </el-form-item>
            <el-form-item label="大型货车" prop="ltruck" label-width="auto">
              <el-input-number :step="1" step-strictly :min="0" v-model="form.ltruck" />
              辆
            </el-form-item>
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input type="textarea" v-model="form.remark" placeholder="请输入备注" :autosize="{ minRows: 3 }" />
          </el-form-item>
        </el-form>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </Dialog>
    </div>
  </transition>
</template>

<script>
import { statsQueryByLinkId, matsimLinkDetail, matsimLinkUpdate, matsimLinkUpdateInWay, getAllLinkType, getReverseLink, statsDetail, statsInsert, statsUpdate, statsDelete, queryAvgStats } from "@/api/index";

import * as echarts from "echarts";
export default {
  components: {},
  props: {
    visible: {
      type: Boolean,
    },
    linkId: {
      type: [String, Number],
    },
  },
  watch: {
    linkId: {
      handler(val) {
        if (val != this._linkId) {
          this._linkId = val;
          this.infoEdit = false;
          if (this.visible) {
            this.getAllLinkType();
            this.getDetail();
            this.handleQuery();
            this.initEcharts();
          }
        }
      },
      immediate: true,
      deep: true,
    },
  },
  data() {
    return {
      info: {},
      infoEdit: false,
      infoForm: {},
      infoRules: {},
      // 遮罩层
      loading: true,
      // 导出遮罩层
      exportLoading: false,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 字典表格数据
      dataList: [],

      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        type: null,
        beginTime: null,
        endTime: null,
      },

      // 是否显示弹出层
      open: false,
      // 弹出层标题
      title: "",
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        timeList: [{ required: true, message: "时间不能为空", trigger: "blur" }],
        type: [{ required: true, message: "调查方式不能为空", trigger: "blur" }],
      },

      typeOptions: {
        0: "其他",
        1: "人工",
        2: "视频识别",
        3: "互联网路况估算",
      },
      linkTypeOption: [],
    };
  },
  methods: {
    handleCloseEditInfo() {
      this.infoEdit = false;
      this.updateEcharts();
    },
    handleReverse() {
      getReverseLink(this.linkId).then((res) => {
        console.log(res);
        if (res.data) {
          this.$emit("changeLink", res.data);
        } else {
          this.$message.warning("切换失败，没有找到反向道路");
        }
      });
    },
    initEcharts() {
      this.$nextTick(() => {
        this._echart = echarts.init(this.$refs.echart);
        this.updateEcharts();
      });
    },
    updateEcharts() {
      queryAvgStats({
        ids: this.ids,
        linkId: this.linkId,
        type: this.queryParams.type ? this.queryParams.type.join(",") : null,
      }).then((res) => {
        this._echart.resize();
        this._echart.setOption(this.getEchartsOption(res.data));
      });
    },
    getEchartsOption(data) {
      let list = new Array(24).fill().map((v, i) => {
        return (
          data.find((v) => v.hour == i) || {
            hour: i,
            pcu_h: 0,
            scar: 0,
            struck: 0,
            mcar: 0,
            mtruck: 0,
            lcar: 0,
            ltruck: 0,
          }
        );
      });
      console.log(list);
      return {
        tooltip: {
          trigger: "axis",
        },
        legend: {
          data: ["pcu/h", "小型客车", "小型货车", "中型客车", "中型货车", "大型客车", "大型货车"],
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        toolbox: {
          feature: {
            saveAsImage: {},
          },
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: list.map((v) => v.hour.toString()),
        },
        yAxis: [
          {
            type: "value",
            position: "left",
            alignTicks: true,
          },
          {
            type: "value",
            position: "right",
            alignTicks: true,
          },
        ],
        series: [
          {
            name: "pcu/h",
            type: "bar",
            yAxisIndex: 1,
            data: list.map((v) => v.pcu_h),
          },
          {
            name: "小型客车",
            type: "line",
            smooth: true,
            data: list.map((v) => v.scar),
          },
          {
            name: "小型货车",
            type: "line",
            smooth: true,
            data: list.map((v) => v.struck),
          },
          {
            name: "中型客车",
            type: "line",
            smooth: true,
            data: list.map((v) => v.mcar),
          },
          {
            name: "中型货车",
            type: "line",
            smooth: true,
            data: list.map((v) => v.mtruck),
          },
          {
            name: "大型客车",
            type: "line",
            smooth: true,
            data: list.map((v) => v.lcar),
          },
          {
            name: "大型货车",
            type: "line",
            smooth: true,
            data: list.map((v) => v.ltruck),
          },
        ],
      };
    },
    close() {
      this.$emit("update:visible", false);
      this.$emit("close");
    },
    getAllLinkType() {
      getAllLinkType().then((res) => {
        let linkTypeOption = {};
        for (const { code, name } of res.data) {
          linkTypeOption[code] = name;
        }
        this.linkTypeOption = linkTypeOption;
      });
    },
    handleEditInfo() {
      this.infoForm = {
        id: this.info.id,
        origid: this.info.origid,
        name: this.info.name,
        lane: this.info.lane,
        type: this.info.type,
        freespeed: this.info.freespeed,
      };
      this.infoEdit = true;
      this.updateEcharts();
    },
    handleUpdateLink() {
      this.$refs["infoForm"].validate((valid) => {
        if (valid) {
          let from = JSON.parse(JSON.stringify(this.infoForm));
          matsimLinkUpdate(from).then((response) => {
            this.$message.success("修改成功");
            this.infoEdit = false;
            this.getDetail();
          });
        }
      });
    },
    handleUpdateInWay() {
      this.$refs["infoForm"].validate((valid) => {
        if (valid) {
          let from = JSON.parse(JSON.stringify(this.infoForm));
          matsimLinkUpdateInWay(from).then((response) => {
            this.$message.success("修改成功");
            this.infoEdit = false;
            this.getDetail();
          });
        }
      });
    },
    getDetail() {
      matsimLinkDetail(this.linkId).then((res) => {
        res.data.freespeed = Number(res.data.freespeed).toFixed(2);
        this.info = res.data;
      });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
      this.updateEcharts();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.handleQuery();
    },
    /** 查询字典类型列表 */
    getList() {
      if (!this.linkId) return;
      this.loading = true;
      const queryParams = {
        pageNum: this.queryParams.pageNum,
        pageSize: this.queryParams.pageSize,
        beginTime: this.queryParams.beginTime,
        endTime: this.queryParams.endTime,
        type: this.queryParams.type ? this.queryParams.type.join(",") : null,
      };
      statsQueryByLinkId(this.linkId, queryParams).then((response) => {
        this.dataList = response.data.data;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
      this.updateEcharts();
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加道路信息";
    },

    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        linkId: this.linkId,
        timeList: [],
        beginTime: null,
        endTime: null,
        type: "0",
        pcuH: 0,
        remark: null,
        isTwoWay: false,
        video: "",
        scar: "",
        struck: "",
        mcar: "",
        mtruck: "",
        lcar: "",
        ltruck: "",
      };
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id;
      statsDetail(id).then((response) => {
        response.data.timeList = [response.data.beginTime, response.data.endTime];
        this.form = response.data;
        this.open = true;
        this.title = "修改道路信息";
      });
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          let from = JSON.parse(JSON.stringify(this.form));
          from.beginTime = from.timeList[0];
          from.endTime = from.timeList[1];
          if (from.id != undefined) {
            statsUpdate(from).then((response) => {
              this.$message.success("修改成功");
              this.open = false;
              this.getList();
              this.$emit("updateData");
            });
          } else {
            statsInsert(from).then((response) => {
              this.$message.success("新增成功");
              this.open = false;
              this.getList();
              this.$emit("updateData");
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id;
      this.$confirm('是否确认编号为"' + ids + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return statsDelete(ids);
        })
        .then(() => {
          this.getList();
          this.$message.success("删除成功");
          this.$emit("updateData");
        })
        .catch(() => {});
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep {
  .form_box {
    .el-form-item {
      margin-bottom: 5px;
    }
  }
}
.LineFlow {
  height: 100vh;
  width: 33vw;
  min-width: 600px;
  position: fixed;
  z-index: 1000;
  top: 0;
  right: 0;
  background-color: #fff;
  ._header {
    padding: 20px 20px 0px 20px;
    height: 20px;
    line-height: 20px;
    .el-icon-close {
      cursor: pointer;
    }
  }
  ._bodyer {
    box-sizing: border-box;
    height: calc(100vh - 40px);
    padding: 20px 20px 20px 20px;
    overflow-y: auto;
  }
  .chart_box {
    height: 260px;
    .chart {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
