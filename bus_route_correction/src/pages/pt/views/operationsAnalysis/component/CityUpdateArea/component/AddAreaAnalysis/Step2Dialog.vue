<!-- Step2Dialog -->
<template>
  <div class="Step2Dialog">
    <Dialog class="Step2_Dialog" ref="dialog" :title="$l('限制路段确认')" hideMinimize :visible="s_visible" @close="handleClose" keepRight right="330" top="100" width="400px">
      <div class="Step2_box" v-loading="loading" element-loading-background="rgb(from var(--color-white) r g b / 0.8)">
        <div class="btn_box">
          <el-button type="primary" size="small" @click="handleOpenAddLine()">{{ $l("添加限制路段") }}</el-button>
        </div>
        <AutoSize style="height: 400px">
          <template slot-scope="{ width, height }">
            <el-table class="small" :data="list" border :height="height" @selection-change="handleSelectionChange">
              <el-table-column :label="$l('路段id')" prop="fid" />
              <el-table-column :label="$l('限制值')" prop="los" />
              <el-table-column :label="$l('限制时段')" prop="h" />
              <el-table-column :label="$l('操作')" width="70">
                <div slot-scope="{ row, $index }" class="cz_btn">
                  <!-- <el-button type="text" size="small" icon="el-icon-view" @click=""></el-button> -->
                  <el-button type="text" size="small" icon="el-icon-edit" @click="handleOpenAddLine(row)"></el-button>
                  <el-button type="text" size="small" icon="el-icon-delete" style="color: var(--color-danger)" @click="handleDeleteLine($index)"></el-button>
                </div>
              </el-table-column>
            </el-table>
          </template>
        </AutoSize>
        <div class="btn_box">
          <el-button type="primary" size="small" @click="handleNext">{{ $l("搜索最优方案") }}</el-button>
          <el-button type="info" size="small" @click="handlePrev">{{ $l("上一步") }}</el-button>
        </div>
      </div>
    </Dialog>
    <Dialog class="Step2_AddLine_Dialog" ref="dialog" :title="$l('添加限制路段')" hideMinimize :visible.sync="showAddLine" @close="handleCloseAddLine" keepRight right="330" top="100" width="450px">
      <el-scrollbar wrap-class="scroll_box">
        <el-form :model="addLineForm" ref="addLineForm" :rules="addLineRules" label-width="120px" :inline="false" size="small">
          <el-form-item :label="$l('选择路段')">
            <el-input v-model="addLineForm.fid" class="input-with-select" disabled>
              <el-button slot="append" type="primary" @click="canSelect = !canSelect">{{ canSelect ? $l("停止点选") : $l("开始点选") }}</el-button>
            </el-input>
          </el-form-item>
          <el-form-item label-width="0px" v-show="!!addLineForm.fid">
            <div ref="chart" class="chart"></div>
          </el-form-item>
          <el-form-item :label="$l('LOS限制值')">
            <el-input-number v-model="addLineForm.los" :controls="true" controls-position="both" />
          </el-form-item>
          <el-form-item :label="$l('LOS限制时段')">
            <el-input-number v-model="addLineForm.h" step-strictly :min="0" :max="23" :step="1" :controls="false" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSubmitAddLine">{{ $l("确定") }}</el-button>
            <el-button @click="handleCloseAddLine">{{ $l("取消") }}</el-button>
          </el-form-item>
        </el-form>
      </el-scrollbar>
    </Dialog>
  </div>
</template>

<script>
import * as echarts from "@/utils/echarts.utils";
import AreaFromItem from "../AreaFromItem.vue";
import { MAP_EVENT } from "@/mymap";
import { GeoJSONLayer, parserGeoJSON } from "../../../GeoJSON/layer/GeoJSONLayer2";
import { CUA_roadGeoJSONByYear } from "@/api/index";
import { boldToText } from "@/utils/index2";

export default {
  name: "Step2Dialog",
  inject: ["rootVue"],
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    year: {
      type: [Number, String],
      default: "",
    },
  },
  components: {
    AreaFromItem,
  },
  computed: {
    _Map() {
      return this.rootVue._Map;
    },
    s_visible() {
      return this.visible && !this.showAddLine;
    },
  },
  watch: {
    visible: {
      handler(val) {
        this.$nextTick(() => {
          this._interval = setInterval(() => {
            if (!this._Map) return;
            clearInterval(this._interval);
            if (this.visible) {
              this.handleEnable();
            } else {
              this.handleDisable();
            }
          }, 500);
        });
      },
      immediate: true,
    },
    uid: {
      handler(val) {
        this.init();
      },
      immediate: true,
    },
  },
  data() {
    return {
      loading: false,
      list: [],
      showAddLine: false,
      s_value: {},
      addLineForm: {},
      addLineRules: {},
      canSelect: false,
    };
  },
  created() {
    this._GeoJSONLayer_road = new GeoJSONLayer({
      lineAutoWidth: 2,
      event: {
        [MAP_EVENT.HANDLE_PICK_LEFT]: (e) => {
          console.log(e);
          if (!this.canSelect) return;
          this.addLineForm.fid = e.data.prop.fid;
          this.addLineForm.prop = e.data.prop;
          this.canSelect = false;
          this.updateChart();
        },
      },
    });
  },
  mounted() {
    this._chart = echarts.init(this.$refs.chart);
  },
  beforeDestroy() {
    this._GeoJSONLayer_road.dispose();
  },
  methods: {
    async init() {
      this.loading = true;
      try {
        if (this.year) {
          await CUA_roadGeoJSONByYear(this.year)
            .then((res) => {
              console.log(res);
              return res;
            })
            .then((res) => boldToText(res.data))
            .then((res) => parserGeoJSON(res))
            .then((res) => {
              this._GeoJSONLayer_road.setGeoJsonData(res);
            });
        }
        this.list = [];
      } catch (error) {
      } finally {
        this.loading = false;
      }
    },
    handleEnable() {
      this._Map.addLayer(this._GeoJSONLayer_road);
    },
    handleDisable() {
      this._GeoJSONLayer_road.removeFromParent();
    },
    handleClose() {
      this.$emit("update:visible", false);
      this.$emit("close");
    },
    handleNext() {
      this.$emit("next", this.list);
    },
    handlePrev() {
      this.$emit("prev");
    },
    handleSelectionChange() {},
    handleOpenAddLine(row) {
      if (row) {
        this.addLineForm = row;
        this.updateChart();
      } else {
        this.addLineForm = {
          fid: "",
          los: "",
          h: "",
          prop: {},
        };
      }
      this.showAddLine = true;
    },
    handleCloseAddLine() {
      this.showAddLine = false;
    },
    handleSubmitAddLine() {
      // 暂时只支持传一个限制路段
      // this.list.push(this.addLineForm);
      this.list = [this.addLineForm];
      this.addLineForm = {};
      this.showAddLine = false;
    },
    handleDeleteLine(index) {
      this.list.splice(index, 1);
    },
    updateChart() {
      if (this._chart) {
        this._chart.setOption(this.getChartOption(), true);
        this._chart.resize();
      }
    },
    getChartOption() {
      try {
        return {
          title: {
            text: "VC比",
            left: "center",
            top: 0,
          },
          tooltip: {
            trigger: "axis",
          },
          grid: {
            top: 40,
            left: 0,
            right: 0,
            bottom: 0,
            containLabel: true,
          },
          xAxis: {
            type: "category",
            data: Array.from({ length: 24 }, (_, i) => i + 1),
          },
          yAxis: {
            type: "value",
          },
          series: [
            {
              data: Array.from({ length: 24 }, (_, i) => Number(this.addLineForm.prop[`${i}_vc`] || 0)),
              type: "line",
              smooth: true,
            },
          ],
        };
      } catch (error) {
        return {};
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.Step2_Dialog {
  .el-scrollbar {
    height: 100%;
  }
  ::v-deep .scroll_box {
    overflow-x: hidden;
    overflow-y: auto;
  }

  .Step2_box {
    display: flex;
    flex-direction: column;
    gap: 10px;
    .title {
      font-size: 18px;
      font-weight: 500;
    }
    .item {
      padding: 0 10px;
    }

    .btn_box {
      display: flex;
      .el-button {
        flex: 1;
      }
    }
  }
}
.Step2_AddLine_Dialog {
  .chart {
    height: 300px;
    width: 400px;
  }
}
</style>
