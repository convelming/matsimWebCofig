<template>
  <Dialog class="CrossroadsStatsEdit" title="编辑交叉口流量线" :top="50" :left="100" width="calc(100vw - 200px)" hideMinimize :visible="visible" @close="handleClose">
    <div class="CrossroadsStatsEdit_body" v-loading="loading">
      <div style="margin-bottom: 18px">
        <el-button type="primary" size="mini" @click="loadData">刷新</el-button>
        <el-button type="primary" size="mini" @click="$emit('redraw')">重新绘制检测线</el-button>
      </div>
      <el-row :gutter="20">
        <el-col :span="24" :lg="16" :xl="16">
          <div class="canvas" id="CrossroadsStatsEdit_canvas"></div>
        </el-col>
        <el-col :span="24" :lg="8" :xl="8">
          <el-table class="small" :data="tableList1" border height="calc(100vh - 240px)" :row-class-name="tableRowClassName" @row-click="handleTableRowClick">
            <el-table-column label="编号" prop="id" />
            <el-table-column label="线名" prop="name" />
            <el-table-column label="初始线" prop="inLink" />
            <el-table-column label="终点线" prop="outLink" />
            <el-table-column label="操作" width="150">
              <template slot-scope="{ row }">
                <el-button type="text" @click="handleEdit(row)">修改</el-button>
                <el-button type="text" @click="handleDelete(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
    </div>

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog title="修改交叉口流量" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px" size="mini">
        <el-form-item label="线名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleSave">确 定</el-button>
        <el-button @click="open = false">取 消</el-button>
      </div>
    </el-dialog>
  </Dialog>
</template>

<script>
import Konva from "konva";
import { crossroadsCorssStatsTable, crossroadsDeleteStats, crossroadsUpdateStats, crossroadsInsertStats, crossroadsInoutlink, crossroadsAnalyzeVideo, crossroadsTrackImage, crossroadsExportCorssStatsTable, crossroadsDetail } from "@/api/index";
import { JsonParse } from "@/utils";
import * as THREE from "three";

export default {
  name: "CrossroadsStatsEdit",
  props: {
    visible: {
      type: Boolean,
    },
    params: {
      type: Object,
    },
  },
  components: {},
  computed: {},
  watch: {
    visible: {
      handler(val) {
        if (val) {
          this.loadData();
        }
      },
      immediate: true,
      deep: true,
    },
  },
  data() {
    return {
      loading: false,
      tableList1: [],
      inLinkList: [],
      outLinkList: [],
      form: {},
      rules: {
        center: [{ required: true, message: "交叉口位置不能为空", trigger: "blur" }],
      },
      open: false,

      drawWidth: 1200,
      drawHeight: 675,
      detail: {},
      selectLineId: -1,
    };
  },
  created() {},
  mounted() {
    this._stage = new Konva.Stage({
      container: "CrossroadsStatsEdit_canvas",
      width: this.drawWidth,
      height: this.drawHeight,
      draggable: true,
    });
    this._layer = new Konva.Layer();
    this._stage.add(this._layer);
    this._group = new Konva.Group({});
    this._layer.add(this._group);

    this._resizeObserver = new ResizeObserver((entries) => {
      // 节流
      if (this._setSizeTimeout) return;
      this._setSizeTimeout = setTimeout(() => {
        this.drawWidth = entries[0].target.clientWidth;
        this.drawHeight = entries[0].target.clientHeight;
        this._stage.width(this.drawWidth);
        this._stage.height(this.drawHeight);
        this._setSizeTimeout = null;
      }, 1000 / 120);
    });
    this._resizeObserver.observe(document.getElementById("CrossroadsStatsEdit_canvas"));
  },

  beforeDestroy() {
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
    if (this._stage) {
      this._stage.destroy();
    }
  },
  methods: {
    loadData() {
      Promise.all([this.getCrossroadsDetail(), this.getCrossroadsCorssStatsTable()]).then((res) => {
        setTimeout(() => {
          this.handleDraw();
        }, 200);
      });
    },
    handleClose() {
      this.$emit("update:visible", false);
      this.$emit("close");
    },
    getCrossroadsDetail() {
      return crossroadsDetail(this.params.id).then((res) => {
        res.data.crossroads.mapInfo = JsonParse(res.data.crossroads.mapInfo, {});
        this.detail = res.data.crossroads;
      });
    },
    getCrossroadsCorssStatsTable() {
      return crossroadsCorssStatsTable(this.params.id).then((res) => {
        this.tableList1 = res.data;
      });
    },
    handleClearDraw() {
      try {
        this._group.destroy();
        this._group = new Konva.Group({});
        this._layer.add(this._group);

        this._LineMap = {};
      } catch (error) {}
    },
    handleDraw() {
      this.handleClearDraw();
      const { center, width, height, rotation } = this.detail.mapInfo;

      const vcenter = new THREE.Vector2().fromArray(center);
      this._group.x(this.drawWidth / 2);
      this._group.y(this.drawHeight / 2);
      this._group.rotation(rotation);
      // 以1080p为基准，画布高度在css中设置
      const scale = 1080 / height;
      const scale2 = this.drawHeight / 1080;
      this._group.scale({ x: scale2, y: scale2 });

      const LINE_WIDTH = 10;

      for (const v of this.tableList1) {
        const startPoint = new THREE.Vector2()
          .fromArray(JsonParse(v.startPoint, [0, 0]))
          .sub(vcenter)
          .multiply(new THREE.Vector2(1, -1))
          .multiplyScalar(scale)
          .toArray();
        const startPointControl = new THREE.Vector2().fromArray(v.inLinkInfo.toxy).sub(vcenter).multiply(new THREE.Vector2(1, -1)).multiplyScalar(scale).toArray();
        const endPointControl = new THREE.Vector2().fromArray(v.outLinkInfo.fromxy).sub(vcenter).multiply(new THREE.Vector2(1, -1)).multiplyScalar(scale).toArray();
        const endPoint = new THREE.Vector2()
          .fromArray(JsonParse(v.endPoint, [0, 0]))
          .sub(vcenter)
          .multiply(new THREE.Vector2(1, -1))
          .multiplyScalar(scale)
          .toArray();
        const line = new Konva.Arrow({
          name: String(v.id),
          points: [startPoint, startPointControl, endPointControl, endPoint].flat(2),
          fill: "#409EFF",
          stroke: "#409EFF",
          strokeWidth: LINE_WIDTH,
          bezier: true,
          // lineCap: "round",
          // lineJoin: "round",
        });
        line.on("click", (e) => {
          this.handleSelectLine(e.target.name());
        });
        line.on("mouseenter", (e) => {
          this._stage.container().style.cursor = "pointer";
        });
        line.on("mouseleave", (e) => {
          this._stage.container().style.cursor = "default";
        });
        this._LineMap[String(v.id)] = line;
        this._group.add(line);

        // const lineName = new Konva.TextPath({
        //   text: `     ${v.name}`,
        //   fontSize: LINE_WIDTH * 0.8,
        //   fontFamily: "Calibri",
        //   fill: "#fff",
        //   data: `M${startPoint.join(" ")} C ${startPointControl.join(" ")}, ${endPointControl.join(" ")}, ${endPoint.join(" ")}`,
        // });
        // console.log(`M${startPoint.join(" ")} C ${startPointControl.join(" ")}, ${endPointControl.join(" ")}, ${endPoint.join(" ")}`);

        // lineGroup.add(lineName);
        // lineName.moveToTop();

        // this._LineMap[String(v.id)] = lineGroup;
        // this._group.add(lineGroup);
      }
      console.log(this.drawWidth, this.drawHeight, this.detail.mapInfo, this._LineMap);
    },
    handleTableRowClick(row, column, event) {
      this.handleSelectLine(row.id);
    },
    handleSelectLine(id) {
      this.selectLineId = id;
      for (const line of Object.values(this._LineMap)) {
        if (line.name() == id) {
          line.moveToTop();
          line.fill("#FF0000");
          line.stroke("#FF0000");
        } else {
          line.fill("#409EFF");
          line.stroke("#409EFF");
        }
      }
    },
    crossroadsAnalyzeVideo() {
      if (!this.params && !this.params.id) return;
      crossroadsAnalyzeVideo(this.params.id);
    },
    crossroadsTrackImage() {
      if (!this.params && !this.params.id) return;
      crossroadsTrackImage(this.params.id);
    },
    crossroadsExportCorssStatsTable() {
      if (!this.params && !this.params.id) return;
      crossroadsExportCorssStatsTable(this.params.id);
    },
    handleDelete(row, index) {
      this.$confirm(`是否确认删除线名为 ${row.name} 的记录?`, "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return crossroadsDeleteStats(row.id);
        })
        .then(() => {
          const line = this._LineMap[row.id];
          if (line) {
            line.destroy();
          }
          this.getCrossroadsCorssStatsTable();
          this.$message.success("删除成功");
        })
        .catch(() => {});
    },
    handleEdit(row) {
      this.form = JSON.parse(JSON.stringify(row));
      this.open = true;
    },
    handleSave() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          const form = JSON.parse(JSON.stringify(this.form));
          form.count = form.car + form.van + form.bus + form.truck;
          if (form.id != undefined) {
            crossroadsUpdateStats(form).then((response) => {
              this.$message.success("修改成功");
              this.open = false;
              this.getCrossroadsCorssStatsTable();
            });
          } else {
            crossroadsInsertStats(form).then((response) => {
              this.$message.success("新增成功");
              this.open = false;
              this.getCrossroadsCorssStatsTable();
            });
          }
        }
      });
    },
    tableRowClassName({ row, rowIndex }) {
      if (row.id == this.selectLineId) {
        console.log(row, this.selectLineId);
        return "success-row";
      }
      return "";
    },
  },
};
</script>
<style lang="scss">
.success-row {
  background: #b8f895 !important;
  .el-table__cell {
    background: #b8f895 !important;
  }
}
</style>

<style lang="scss">
.CrossroadsStatsEdit {
  .title {
    font-size: 14px;
    margin: 10px 0;
  }
  .CrossroadsStatsEdit_body {
    height: calc(100vh - 230px);
    overflow-y: auto;
    overflow-x: hidden;
  }
  .CrossroadsStatsEdit_pagination {
    position: relative;
    margin-top: 10px;
    left: -12px;
  }

  .canvas {
    border: 1px solid #00000011;
    position: relative;
    margin-bottom: 20px;
    height: 625px;
  }
}
</style>
