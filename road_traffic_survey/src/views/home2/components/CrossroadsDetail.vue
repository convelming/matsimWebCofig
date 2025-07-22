<template>
  <Dialog class="CrossroadsDetail" :title="{ 1: '人工录入交叉口', 2: '视频录入交叉口' }[detail.type]" :top="20" left="center" width="80vw" hideMinimize :visible="visible" @close="handleClose">
    <div class="CrossroadsDetail_body" v-loading="loading">
      <h3 style="margin-top: 0">交叉口流量表</h3>
      <el-form label-width="auto" size="small" inline>
        <el-form-item label="调查时间" prop="date">
          <el-date-picker :disabled="!changeCrossroadsData" v-model="crossroadsData" type="datetimerange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd HH:mm:ss"> </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button v-if="!changeCrossroadsData" type="primary" @click="changeCrossroadsData = true">修改调查时间</el-button>
          <template v-if="changeCrossroadsData">
            <el-button :loading="saving" type="primary" @click="handleSubmit">保存</el-button>
            <el-button :loading="saving" type="primary" @click="handleQx">取消</el-button>
          </template>
        </el-form-item>
      </el-form>
      <div style="margin-bottom: 18px" v-if="detail.type == 2">
        <el-button type="primary" size="mini" @click="handleDownload(detail.video)">下载原视频</el-button>
        <el-button type="primary" size="mini" @click="crossroadsExportCorssStatsTable">导出交叉口流量表</el-button>
        <el-button type="primary" size="mini" @click="crossroadsAnalyzeVideo">导出识别视频</el-button>
        <el-button type="primary" size="mini" @click="crossroadsTrackImage">导出轨迹图片</el-button>
      </div>
      <div style="margin-bottom: 18px" v-else-if="detail.type == 1">
        <el-button type="primary" size="mini" @click="crossroadsExportCorssStatsTable">导出交叉口流量表</el-button>
      </div>
      <el-table class="small" :data="tableList1" border stripe max-height="300px">
        <el-table-column label="编号" prop="id" />
        <el-table-column label="线名" prop="name" />
        <el-table-column label="初始线" prop="inLink" />
        <el-table-column label="终点线" prop="outLink" />
        <el-table-column label="PCU/H" prop="pcuH" />
        <el-table-column label="小型客车" prop="car" />
        <el-table-column label="小型货车" prop="van" />
        <el-table-column label="大型客车" prop="bus" />
        <el-table-column label="大型货车" prop="truck" />
        <el-table-column label="合计" prop="count" />
        <el-table-column label="操作" width="150">
          <template slot-scope="{ row }">
            <el-button type="text" size="mini" @click="handleEdit(row)">修改</el-button>
            <el-button type="text" size="mini" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>      <h3>附件</h3>
      <div style="margin-bottom: 18px">
        <el-button type="primary" size="mini" @click="addAnnex" :loading="updoading || saving">上传附件</el-button>
      </div>
      <el-table class="small" style="margin-bottom: 18px" :data="detail.annex" border stripe max-height="300px">
        <el-table-column label="附件名称" prop="name"></el-table-column>
        <el-table-column label="操作" width="150">
          <template slot-scope="{ row, $index }">
            <el-button type="text" size="mini" @click="handleDownload(row.url)">下载</el-button>
            <el-button type="text" size="mini" @click="deleteAnnex($index)" :loading="saving">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <h3>交叉口流向图</h3>
      <div style="margin-bottom: 18px">
        <el-button type="primary" size="mini" @click="handleChartToDataUrl">导出</el-button>
      </div>
      <div class="canvas" id="CrossroadsDetail_canvas" :style="{ height: drawHeight }"></div>
    </div>
    <!-- 添加或修改参数配置对话框 -->
    <el-dialog title="修改交叉口流量" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px" size="mini">
        <el-form-item label="线名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="初始线" prop="inLink" v-if="!form.id">
          <el-select v-model="form.inLink">
            <el-option v-for="(item, index) in inLinkList" :key="index" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="终点线" prop="outLink" v-if="!form.id">
          <el-select v-model="form.outLink">
            <el-option v-for="(item, index) in outLinkList" :key="index" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="PCU/H" prop="pcuH">
          <el-input-number v-model="form.pcuH" :step="0.01" />
        </el-form-item>
        <el-form-item label="小型客车" prop="car">
          <el-input-number v-model="form.car" :step="0.01" />
        </el-form-item>
        <el-form-item label="小型货车" prop="van">
          <el-input-number v-model="form.van" :step="0.01" />
        </el-form-item>
        <el-form-item label="大型客车" prop="bus">
          <el-input-number v-model="form.bus" :step="0.01" />
        </el-form-item>
        <el-form-item label="大型货车" prop="truck">
          <el-input-number v-model="form.truck" :step="0.01" />
        </el-form-item>
        <el-form-item label="合计" prop="count">
          {{ form.car + form.van + form.bus + form.truck }}
          <!-- <el-input-number v-model="pcuH" :step="0.01" /> -->
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
import {
  crossroadsUpdate,
  crossroadsCorssStatsTable,
  crossroadsDeleteStats,
  crossroadsUpdateStats,
  crossroadsInsertStats,
  crossroadsInoutlink,
  crossroadsAnalyzeVideo,
  crossroadsTrackImage,
  crossroadsExportCorssStatsTable,
  crossroadsDetail,
} from "@/api/index";
import { JsonParse } from "@/utils";
import * as THREE from "three";
import * as echarts from "echarts";
import request from "@/utils/request";

// THREE.Vector2.prototype.angleTo = function (v) {
//   const denominator = Math.sqrt(this.lengthSq() * v.lengthSq());
//   if (denominator === 0) return Math.PI / 2;
//   const theta = this.dot(v) / denominator;
//   // clamp, to handle numerical problems
//   return Math.acos(THREE.MathUtils.clamp(theta, -1, 1));
// };

const ColorList = ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc"];

export default {
  name: "CrossroadsDetail",
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
          Promise.all([this.getCrossroadsDetail(), this.getCrossroadsCorssStatsTable()]).then((res) => {
            this.handleDraw();
          });
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
      changeCrossroadsData: false,
      crossroadsData: [],
      saving: false,
      rules: {
        center: [{ required: true, message: "交叉口位置不能为空", trigger: "blur" }],
      },
      open: false,

      drawWidth: 1200,
      drawHeight: 675,
      detail: {
        annex: [],
      },

      updoading: false,
    };
  },
  created() {},
  mounted() {
    this._stage = new Konva.Stage({
      container: "CrossroadsDetail_canvas",
      draggable: true,
    });
    this._layer = new Konva.Layer({
      width: 2048,
      height: 2048,
    });
    this._stage.add(this._layer);
    this._group = new Konva.Group({});
    this._layer.add(this._group);

    this._stage.on("wheel", (e) => {
      const scale = this._group.scale().x + (e.evt.wheelDelta > 0 ? 0.2 : -0.2);
      this._group.scale({ x: scale, y: scale });
      e.evt.preventDefault();
    });

    this._resizeObserver = new ResizeObserver((entries) => {
      // 节流
      if (this._setSizeTimeout) return;
      this._setSizeTimeout = setTimeout(() => {
        this.handleChartResize();
        this._setSizeTimeout = null;
      }, 1000 / 120);
    });
    this._resizeObserver.observe(document.getElementById("CrossroadsDetail_canvas"));
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
    handleDownload(url) {
      const a = document.createElement("a");
      a.download = url.split("/").pop();
      a.href = process.env.VUE_APP_BASE_API + "/file/download?url=" + url;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
    handleChartResize() {
      if (this.detail.mapInfo) {
        const { width, height, rotation } = this.detail.mapInfo;
        this.drawWidth = document.getElementById("CrossroadsDetail_canvas").clientWidth;
        this.drawHeight = (this.drawWidth * height) / width;
        this._stage.width(this.drawWidth);
        this._stage.height(this.drawHeight);
        if (this._group) {
          this._group.x(this.drawWidth / 2);
          this._group.y(this.drawHeight / 2);
          this._group.rotation(rotation);
          const scale = (this.drawWidth / width) * 0.75;
          this._group.scale({ x: scale, y: scale });
        }
      }
    },
    getChart(center, data) {
      const _group = new Konva.Group({});
      const vcenter = new THREE.Vector2().fromArray(center);
      const TEXT_SIZE = 3;
      const LINE_WIDTH = 3;
      const inTree = {};
      const outTree = {};
      const _LineTextMap = {};
      const _LineMap = {};
      const _LineNameMap = {};
      const _inTextMap = {};
      const _outTextMap = {};

      let maxValue = Number.MIN_SAFE_INTEGER;
      let minValue = Number.MAX_SAFE_INTEGER;
      let inIndex = 0;

      for (const index in data) {
        const v = data[index];
        const item = {
          id: v.id,
          value: Number(v.pcuH),
          name: v.name,

          inLink: v.inLink,
          outLink: v.outLink,

          sort: 0,
        };

        const startPoint = new THREE.Vector2()
          .fromArray(JsonParse(v.startPoint, [0, 0]))
          .sub(vcenter)
          .multiply(new THREE.Vector2(1, -1));
        const startPointControl = new THREE.Vector2().fromArray(v.inLinkInfo.toxy).sub(vcenter).multiply(new THREE.Vector2(1, -1));
        const endPointControl = new THREE.Vector2().fromArray(v.outLinkInfo.fromxy).sub(vcenter).multiply(new THREE.Vector2(1, -1));
        const endPoint = new THREE.Vector2()
          .fromArray(JsonParse(v.endPoint, [0, 0]))
          .sub(vcenter)
          .multiply(new THREE.Vector2(1, -1));

        item.startPoint = startPoint;
        item.startPointControl = startPointControl;
        // .sub(startPoint)
        // .setLength(LINE_WIDTH * 10)
        // .add(startPoint);
        item.endPointControl = endPointControl;
        // .sub(endPoint)
        // .setLength(LINE_WIDTH * 10)
        // .add(endPoint);
        item.endPoint = endPoint;

        if (item.value > maxValue) maxValue = item.value;
        if (item.value < minValue) minValue = item.value;

        const vec1 = item.startPointControl.clone().sub(item.startPoint).negate();
        const vec2 = item.endPoint.clone().sub(item.startPoint);
        const vec3 = item.endPointControl.clone().sub(item.endPoint);
        const angle1 = vec1.angle();
        const angle2 = vec2.angle();
        const angle3 = vec3.angle();
        item.sort = angle2 > angle1 ? angle2 - angle1 : 2 * Math.PI + (angle2 - angle1);
        item.inNormal = new THREE.Vector2(vec1.y, -vec1.x);
        item.outNormal = new THREE.Vector2(vec3.y, -vec3.x);

        let inItem = inTree[item.inLink];
        if (!inItem) {
          inItem = { id: item.inLink, name: v.inLine, color: ColorList[inIndex], list: [], count: 0, max: Number.MIN_SAFE_INTEGER, point: item.startPoint.clone(), dir: vec1.clone(), normal: item.inNormal.clone(), angle: angle1 };
          inTree[item.inLink] = inItem;
          inIndex += 1;
        }
        if (item.value > inItem.max) inItem.max = item.value;
        inItem.count += item.value;
        inItem.list.push(item);

        let outItem = outTree[item.outLink];
        if (!outItem) {
          outItem = { id: item.outLink, name: v.outLine, color: ColorList[inIndex], list: [], count: 0, max: Number.MIN_SAFE_INTEGER, point: item.endPoint.clone(), dir: vec3.clone(), normal: item.outNormal.clone(), angle: angle3 };
          outTree[item.outLink] = outItem;
        }
        if (item.value > outItem.max) outItem.max = item.value;
        outItem.count += item.value;
        outItem.list.push(item);
      }

      for (const inLine of Object.values(inTree)) {
        // { color, list, max, point, count, angle, normal }
        inLine.list.sort((a, b) => a.sort - b.sort);

        const textOffset = TEXT_SIZE / 2;
        let totalOffset = 0;
        let maxTextWidth = 0;
        for (const [i, v] of inLine.list.entries()) {
          let lineWidth = (1 + ((v.value - minValue) / (maxValue - minValue) || 0)) * LINE_WIDTH;
          let inOffset = 0;
          if (i == 0) {
            inOffset = totalOffset;
            totalOffset += lineWidth / 2 + LINE_WIDTH * 0.2;
          } else {
            totalOffset += lineWidth / 2;
            inOffset = totalOffset;
            totalOffset += lineWidth / 2 + LINE_WIDTH * 0.2;
          }

          const lineText = new Konva.Text({
            text: v.value,
            fontSize: TEXT_SIZE,
            fontFamily: "Calibri",
            fill: "black",
            rotation: (inLine.angle * 180) / Math.PI,
          });
          _LineTextMap[String(v.id)] = lineText;
          _group.add(lineText);
          const textWdith = lineText.width();
          if (textWdith > maxTextWidth) maxTextWidth = textWdith;

          const lineTextPoint = v.startPoint.clone();
          lineTextPoint.add(inLine.dir.setLength(textOffset + lineText.width())).add(v.inNormal.setLength(textOffset + inOffset - lineText.height()));
          lineText.x(lineTextPoint.x);
          lineText.y(lineTextPoint.y);
          lineText.scale({ x: -1, y: -1 });

          const startPoint = v.startPoint.clone().add(v.inNormal.setLength(inOffset)).toArray();
          const startPointControl = v.startPointControl.clone().add(v.inNormal.setLength(inOffset)).toArray();
          const endPointControl = v.endPointControl.toArray();
          const endPoint = v.endPoint.toArray();

          const line = new Konva.Arrow({
            name: String(v.id),
            points: [startPoint, startPointControl, endPointControl, endPoint].flat(2),
            fill: inLine.color,
            stroke: inLine.color,
            strokeWidth: lineWidth,
            pointerWidth: lineWidth,
            pointerLength: lineWidth,
            bezier: true,
            // lineCap: "round",
            // lineJoin: "round",
          });
          _LineMap[String(v.id)] = line;
          _group.add(line);

          const lineName = new Konva.TextPath({
            text: `     ${v.name}`,
            fontSize: LINE_WIDTH * 0.8,
            fontFamily: "Calibri",
            fill: "#fff",
            data: `M${startPoint.join(" ")} C ${startPointControl.join(" ")}, ${endPointControl.join(" ")}, ${endPoint.join(" ")}`,
          });

          _LineNameMap[String(v.id)] = lineName;
          _group.add(lineName);
          // lineName.moveToTop();

          line.on("click", (e) => {
            const id = e.target.name();
            _LineTextMap[id].moveToTop();
            _LineMap[id].moveToTop();
            _LineNameMap[id].moveToTop();
          });
          line.on("mouseenter", (e) => {
            // this._stage.container().style.cursor = "pointer";
          });
          line.on("mouseleave", (e) => {
            // this._stage.container().style.cursor = "default";
          });
        }

        const inText = new Konva.Text({
          text: `${inLine.name}：${inLine.count}`,
          fontSize: TEXT_SIZE * 2,
          fontFamily: "Calibri",
          fill: "black",
          rotation: (inLine.angle * 180) / Math.PI,
          // stroke: "#ffffff",
          // strokeWidth: 1,
        });
        _inTextMap[String(inLine.id)] = inText;
        _group.add(inText);

        const inTextPoint = inLine.point.clone();
        inTextPoint.add(inLine.dir.setLength(maxTextWidth + TEXT_SIZE * 2 + inText.width())).add(inLine.normal.setLength((totalOffset - inText.height()) / 2));
        inText.x(inTextPoint.x);
        inText.y(inTextPoint.y);
        inText.scale({ x: -1, y: -1 });
      }

      for (const outLine of Object.values(outTree)) {
        let lineWidth = (1 + ((outLine.max - minValue) / (maxValue - minValue) || 0)) * LINE_WIDTH;
        const outTextPoint = outLine.point.clone();
        const outText = new Konva.Text({
          text: `${outLine.name}：${outLine.count}`,
          fontSize: TEXT_SIZE * 2,
          fontFamily: "Calibri",
          fill: "black",
          rotation: (outLine.angle * 180) / Math.PI,
          // stroke: "#ffffff",
          // strokeWidth: 1,
        });
        _outTextMap[String(outLine.id)] = outText;
        _group.add(outText);

        outTextPoint.sub(outLine.dir.setLength(outText.width() + lineWidth * 2));
        outTextPoint.add(outLine.normal.setLength(outText.height() / 2));
        outText.x(outTextPoint.x);
        outText.y(outTextPoint.y);
      }

      return {
        _group,
        _LineMap,
        _LineTextMap,
        _LineNameMap,
        _inTextMap,
        _outTextMap,
      };
    },
    handleDraw() {
      const { center = [0, 0] } = this.detail.mapInfo;
      const { _group, _LineMap, _LineTextMap, _LineNameMap, _inTextMap, _outTextMap } = this.getChart(center, this.tableList1);

      if (this._group) this._group.destroy();
      this._group = _group;
      this._layer.add(this._group);
      this.handleChartResize();

      this._LineMap = _LineMap;
      this._LineTextMap = _LineTextMap;
      this._LineNameMap = _LineNameMap;

      this._inTextMap = _inTextMap;
      this._outTextMap = _outTextMap;
    },
    handleClose() {
      this.$emit("update:visible", false);
      this.$emit("close");
    },
    getCrossroadsDetail() {
      return crossroadsDetail(this.params.id).then((res) => {
        res.data.crossroads.mapInfo = JsonParse(res.data.crossroads.mapInfo, {});
        res.data.crossroads.annex = JsonParse(res.data.crossroads.annex, []);
        this.detail = res.data.crossroads;
        this.crossroadsData = [this.detail.beginTime, this.detail.endTime];
      });
    },
    getCrossroadsCorssStatsTable() {
      this.loading = true;
      return crossroadsCorssStatsTable(this.params.id).then((res) => {
        this.tableList1 = res.data;
        this.loading = false;
      });
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
          this.$message.success("删除成功");
          return this.getCrossroadsCorssStatsTable();
        })
        .then(() => {
          this.handleDraw();
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
            crossroadsUpdateStats(form)
              .then((response) => {
                this.$message.success("修改成功");
                this.open = false;
                return this.getCrossroadsCorssStatsTable();
              })
              .then(() => {
                this.handleDraw();
              });
          } else {
            crossroadsInsertStats(form)
              .then((response) => {
                this.$message.success("新增成功");
                this.open = false;
                return this.getCrossroadsCorssStatsTable();
              })
              .then(() => {
                this.handleDraw();
              });
          }
        }
      });
    },
    handleChartToDataUrl() {
      this.handleChartResize();
      const a = document.createElement("a");
      a.download = "chart.png";
      a.href = this._layer.toDataURL();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },

    handleSubmit() {
      const form = JSON.parse(JSON.stringify(this.detail));
      form.mapInfo = JSON.stringify(form.mapInfo);
      form.annex = JSON.stringify(form.annex);
      form.beginTime = this.crossroadsData[0];
      form.endTime = this.crossroadsData[1];
      this.saving = true;
      crossroadsUpdate(form)
        .then((res) => {
          this.changeCrossroadsData = false;
          this.saving = false;
          this.$message.success("修改成功");
          Promise.all([this.getCrossroadsDetail(), this.getCrossroadsCorssStatsTable()]).then((res) => {
            this.handleDraw();
          });
        })
        .catch((err) => {
          this.saving = false;
        });
    },
    addAnnex() {
      let input = document.createElement("input");
      input.type = "file";
      input.accept = "video/*";
      input.style = "position: fixed;left: -100vw;top: -100vh;";
      input.onchange = () => {
        let file = input.files[0];
        if (file) {
          this.updoading = true;
          let data = new FormData();
          data.append("file", file);
          request({
            url: `/file/upload`,
            method: "post",
            headers: {
              "Content-Type": "multipart/form-data",
            },
            data: data,
          })
            .then((res) => {
              this.detail.annex.push({
                name: file.name,
                url: res.data,
              });
              this.handleSubmit();
            })
            .finally(() => {
              document.body.removeChild(input);
              this.updoading = false;
            });
        } else {
          document.body.removeChild(input);
        }
      };
      document.body.appendChild(input);
      input.click();
    },
    deleteAnnex(index) {
      this.detail.annex.splice(index, 1);
      this.handleSubmit();
    },
    handleQx() {
      this.changeCrossroadsData = false;
      this.crossroadsData = [this.detail.beginTime, this.detail.endTime];
    },
  },
};
</script>

<style lang="scss" scoped>
.CrossroadsDetail {
  .title {
    font-size: 14px;
    margin: 10px 0;
  }
  .CrossroadsDetail_body {
    height: calc(100vh - 130px);
    overflow-y: auto;
    overflow-x: hidden;
  }
  .CrossroadsDetail_pagination {
    position: relative;
    margin-top: 10px;
    left: -12px;
  }
}
.canvas {
  border: 1px solid #00000011;
  position: relative;
  margin-bottom: 20px;
  width: 100%;
}
</style>
