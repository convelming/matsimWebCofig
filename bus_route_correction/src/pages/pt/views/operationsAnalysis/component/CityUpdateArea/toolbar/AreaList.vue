<!-- AreaList 研究区域 -->
<template>
  <div class="AreaList">
    <el-button class="block" type="primary" size="small" icon="el-icon-plus" @click="handleOpenAddForm()">{{ $l("新增区域") }}</el-button>
    <AutoSize style="height: 30%">
      <template slot-scope="{ width, height }">
        <el-table ref="table" class="small" :data="list" border :height="height" @select="handleSelectionChange">
          <el-table-column type="selection" width="40" />
          <el-table-column :label="$l('名称')" prop="name" />
          <el-table-column width="50">
            <template slot-scope="{ row }">
              <el-button style="color: red" type="text" size="small" icon="el-icon-delete" @click="handleDelete(row)"></el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </AutoSize>

    <Pagination @pagination="getList" :page.sync="pageNum" :limit="pageSize" :total="total" :pager-count="5" layout="total, prev, pager, next"> </Pagination>
    <AutoSize class="flex-h" v-if="detailDialogDetail">
      <template slot-scope="{ width, height }">
        <el-scrollbar :style="{ height: height + 'px' }" wrap-style="overflow-x: hidden;">
          <div class="form">
            <el-button class="block" type="primary" :disabled="!detailDialogDetail.currentGraphs" size="small" @click="handleShowDetailDialog">{{ $l("点击查看区域现状") }}</el-button>
            <el-button class="block" :type="showLayer_odTarget ? 'info' : 'primary'" :disabled="!detailDialogDetail.odTarget" size="small" @click="showLayer_odTarget = !showLayer_odTarget">{{
              showLayer_odTarget ? $l("隐藏起点分布") : $l("显示起点分布")
            }}</el-button>
            <el-button class="block" :type="showLayer_odSource ? 'info' : 'primary'" :disabled="!detailDialogDetail.odSource" size="small" @click="showLayer_odSource = !showLayer_odSource">{{
              showLayer_odSource ? $l("隐藏讫点分布") : $l("显示讫点分布")
            }}</el-button>
            <el-button class="block" :type="showLayer_landuse ? 'info' : 'primary'" :disabled="!detailDialogDetail.landuse" size="small" @click="showLayer_landuse = !showLayer_landuse">{{
              showLayer_landuse ? $l("隐藏现状用地") : $l("显示现状用地")
            }}</el-button>
            <div class="form_item">
              <div class="form_item_header">
                <el-button v-if="!showLayer_odTarget" class="show_btn" type="primary" size="small" @click="showLayer_odTarget = true">{{ $l("显示起点分布") }}</el-button>
                <el-button v-else class="show_btn" type="info" size="small" @click="showLayer_odTarget = false">{{ $l("隐藏起点分布") }}</el-button>
                <el-button class="open_btn" :icon="openSetting_odTarget ? 'el-icon-caret-top' : 'el-icon-caret-bottom'" type="info" size="small" @click="openSetting_odTarget = !openSetting_odTarget"></el-button>
              </div>
              <div class="setting_box" v-if="openSetting_odTarget">
                <div class="setting_item">
                  <div class="setting_item_label">{{ $l("大小") }}</div>
                  <div class="setting_item_value">
                    <el-input-number v-model="size_odTarget" :min="GRID_STEP" :step="GRID_STEP" step-strictly size="mini" />
                  </div>
                </div>
                <div class="setting_item">
                  <div class="setting_item_label">{{ $l("设置") }}</div>
                  <div class="setting_item_value">
                    <el-button type="primary" icon="el-icon-setting" @click="showOriginConfig = true" size="mini"></el-button>
                    <GeoJSONSetting ref="originConfig" :visible.sync="showOriginConfig" :form="originConfigForm" :layout="originConfigLayout" @confirm="handleOriginConfigConfirm" />
                  </div>
                </div>
                <div class="setting_item">
                  <div class="setting_item_label">{{ $l("Visual map") }}</div>
                  <div class="setting_item_value">
                    <el-switch v-model="showOriginVisualMap" :active-value="true" />
                    <GeoJSONVisualMap v-show="showOriginVisualMap && showOriginLayer" :list="originConfigForm.colorBar.data" />
                  </div>
                </div>
                <div class="setting_item">
                  <div class="setting_item_label">{{ $l("按时段显示") }}</div>
                  <div class="setting_item_value">
                    <el-switch v-model="originUseTimeRange" :active-value="true" :inactive-value="false" @change="" />
                  </div>
                </div>
                <div class="setting_item" v-if="originUseTimeRange">
                  <TimeRangeSlider v-model="originTimeRange" />
                </div>
              </div>
            </div>
          </div>
        </el-scrollbar>
      </template>
    </AutoSize>

    <DialogRight class="AreaList_Dialog" ref="dialog" :title="$l('')" hideMinimize :visible="showAddForm" @close="handleCloseAddForm" keepRight right="330" top="100" width="500px">
      <el-form :model="addForm" ref="addForm" :rules="addRules" label-width="120px" :inline="false" size="small">
        <el-form-item :label="$l('区域名称')">
          <el-input v-model="addForm.name"></el-input>
        </el-form-item>
        <el-form-item :label="$l('区域选定方式')">
          <el-radio-group v-model="addForm.type" @change="">
            <el-radio-button label="1">{{ $l("地图圈定") }}</el-radio-button>
            <el-radio-button label="2">{{ $l("上传GeoJSON") }}</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$l('地图圈定')" v-show="addForm.type == '1'">
          <template v-if="selectState == POLYGON_SELECT_STATE_KEY.NOT_STARTED">
            <el-button v-if="!addForm.xyarr || !addForm.xyarr.length" type="primary" size="mini" @click="handlePlayPolygonSelect()">{{ $l("开始圈定") }}</el-button>
            <el-button v-else type="primary" size="mini" @click="handleReplayPolygonSelect()">{{ $l("重新圈定") }}</el-button>
          </template>
          <template v-if="selectState != POLYGON_SELECT_STATE_KEY.NOT_STARTED">
            <el-button type="primary" size="mini" @click="handleReplayPolygonSelect()">{{ $l("重新圈定") }}</el-button>
            <el-button type="primary" size="mini" @click="handleStopPolygonSelect()">{{ $l("结束圈定") }}</el-button>
          </template>
          <el-table class="small" v-if="addForm.xyarr && addForm.xyarr.length" :data="addForm.xyarr" border stripe>
            <el-table-column type="index" width="50"></el-table-column>
            <el-table-column>
              <span slot-scope="{ row }">{{ row }}</span>
            </el-table-column>
            <el-table-column width="50">
              <el-button slot-scope="{ row, $index }" v-if="addForm.xyarr.length - 1 > $index" type="text" size="small" icon="el-icon-delete" style="color: var(--color-danger); padding: 0" @click="handleRemoveXY($index)"></el-button>
            </el-table-column>
          </el-table>
        </el-form-item>
        <el-form-item :label="$l('上传GeoJSON')" v-show="addForm.type == '2'">
          <el-button type="primary" @click="handleSelectFile">{{ $l("选择文件") }}</el-button>
          <el-table class="small" v-if="addForm.xyarr && addForm.xyarr.length" :data="addForm.xyarr" border stripe>
            <el-table-column type="index" width="50"></el-table-column>
            <el-table-column>
              <span slot-scope="{ row }">{{ row }}</span>
            </el-table-column>
            <el-table-column width="50">
              <el-button slot-scope="{ row, $index }" v-if="addForm.xyarr.length - 1 > $index" type="text" size="small" icon="el-icon-delete" style="color: var(--color-danger); padding: 0" @click="handleRemoveXY($index)"></el-button>
            </el-table-column>
          </el-table>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="addLoading">{{ $l("立即创建") }}</el-button>
          <el-button @click="handleCloseAddForm" :loading="addLoading">{{ $l("取消") }}</el-button>
        </el-form-item>
      </el-form>
    </DialogRight>

    <DialogRight class="AreaList_Dialog2" ref="dialog" title="区域现状" hideMinimize :visible.sync="showDetailDialog" @close="handleCloseDialog" keepRight right="330" top="100" width="450px">
      <div class="AreaList_Dialog2_box">
        <el-scrollbar wrap-class="scroll_box" v-if="detailDialogParam">
          <el-collapse v-model="activeNames" style="width: 100%">
            <el-collapse-item class="my_collapse_item" :name="item.label" v-for="(item, key) in detailDialogParam" :key="key">
              <div class="el-collapse-item__title" slot="title">
                <span class="item_title" style="margin-left: 20px">{{ item.label }}</span>
              </div>
              <div class="my_collapse_item_body">
                <div v-if="item.label == '业态开发强度'" style="text-align: right">合计：{{ computedTotal(item) }}</div>
                <template v-for="(item2, key2) in item.children">
                  <AreaFromItem :label="$l(item2.label)" v-bind="item2" @update:value="item2.value = $event" @update:check="item2.check = $event" />
                </template>
              </div>
            </el-collapse-item>
          </el-collapse>
        </el-scrollbar>
      </div>
    </DialogRight>
  </div>
</template>

<script>
import MySlider from "../component/MySlider.vue";
import AreaFromItem from "../component/AreaFromItem.vue";

import GeoJSONVisualMap from "../../GeoJSON/component/GeoJSONVisualMap2.vue";
import GeoJSONSetting from "../../GeoJSON/component/GeoJSONSetting.vue";

import { PolygonSelectLayer, POLYGON_SELECT_STATE_KEY, POLYGON_SELECT_EVENT } from "../layer/PolygonSelectLayer";
import { selectFile } from "@/utils/utils";

import { CUA_addArea, CUA_areaList, CUA_deleteArea, CUA_downloadGeojson, CUA_landuse } from "@/api/index";
import { GeoJSONLayer, parserGeoJSON, LINE_STYLE } from "../../GeoJSON/layer/GeoJSONLayer2";
import { getColorBarByPropertie } from "../../GeoJSON/layer/ColorBar2DUtil.js";
import { guid, boldToText } from "@/utils/index2";

const defaultConfig = {
  check: false,
  disabled: true,
  inputNumber: false,
  input: false,
  checkBox: false,
  slider: false,
};
const dialogList = [
  {
    label: "总体情况",
    children: [
      { type: "item", label: "总开发强度（m²）", key: "总开发强度", start: 0, end: -1, step: 0.001 },
      { type: "item", label: "平均容积率", key: "平均容积率", start: 0, end: -1, step: 0.001 },
    ],
  },
  {
    label: "业态开发强度",
    children: [
      { type: "item", label: "居住开发强度（m²）", key: "居住开发强度", start: 0, end: -1, step: 0.001, ...defaultConfig },
      { type: "item", label: "办公开发强度（m²）", key: "办公开发强度", start: 0, end: -1, step: 0.001, ...defaultConfig },
      { type: "item", label: "商业开发强度（m²）", key: "商业开发强度", start: 0, end: -1, step: 0.001, ...defaultConfig },
      { type: "item", label: "工业开发强度（m²）", key: "工业开发强度", start: 0, end: -1, step: 0.001, ...defaultConfig },
    ],
  },
  {
    label: "出行结构",
    children: [
      { type: "item", label: "小汽车占比（%）", key: "小汽车占比", start: 0, end: 100, step: 0.001, ...defaultConfig },
      { type: "item", label: "轨道交通占比（%）", key: "轨道交通占比", start: 0, end: 100, step: 0.001, ...defaultConfig },
      { type: "item", label: "公交占比（%）", key: "公交占比", start: 0, end: 100, step: 0.001, ...defaultConfig },
      { type: "item", label: "慢行占比（%）", key: "慢行占比", start: 0, end: 100, step: 0.001, ...defaultConfig },
    ],
  },
  {
    label: "用地面积",
    children: [
      { type: "item", label: "居住用地（m²）", key: "居住用地", start: 0, end: -1, ...defaultConfig },
      { type: "item", label: "工业用地（m²）", key: "工业用地", start: 0, end: -1, ...defaultConfig },
      { type: "item", label: "商业服务用地（m²）", key: "商业服务用地", start: 0, end: -1, ...defaultConfig },
      { type: "item", label: "商务办公用地（m²）", key: "商务办公用地", start: 0, end: -1, ...defaultConfig },
      { type: "item", label: "交通用地（m²）", key: "交通用地", start: 0, end: -1, ...defaultConfig },
      { type: "item", label: "公共管理和服务用地（m²）", key: "公共管理和服务用地", start: 0, end: -1, ...defaultConfig },
    ],
  },
  {
    label: "交通设施",
    children: [
      { type: "item", label: "地铁站点数（个）", key: "地铁站点数", start: 0, end: -1, step: 1, ...defaultConfig },
      { type: "item", label: "公交站点数（个）", key: "公交站点数", start: 0, end: -1, step: 1, ...defaultConfig },
    ],
  },
  {
    label: "特殊地点",
    children: [
      { type: "item", label: "医疗机构（个）", key: "医疗机构", start: 0, end: -1, step: 1, ...defaultConfig },
      { type: "item", label: "商业设施（个）", key: "商业设施", start: 0, end: -1, step: 1, ...defaultConfig },
      { type: "item", label: "教育（个）", key: "教育", start: 0, end: -1, step: 1, ...defaultConfig },
      { type: "item", label: "政府及管理机构（个）", key: "政府及管理机构", start: 0, end: -1, step: 1, ...defaultConfig },
      { type: "item", label: "运动场馆（个）", key: "运动场馆", start: 0, end: -1, step: 1, ...defaultConfig },
      { type: "item", label: "风景名胜（个）", key: "风景名胜", start: 0, end: -1, step: 1, ...defaultConfig },
      { type: "item", label: "大型园区（个）", key: "大型园区", start: 0, end: -1, step: 1, ...defaultConfig },
      { type: "item", label: "社会保障机构（个）", key: "社会保障机构", start: 0, end: -1, step: 1, ...defaultConfig },
      { type: "item", label: "科研机构（个）", key: "科研机构", start: 0, end: -1, step: 1, ...defaultConfig },
      { type: "item", label: "文化、媒体（个）", key: "文化、媒体", start: 0, end: -1, step: 1, ...defaultConfig },
      { type: "item", label: "公安机关（个）", key: "公安机关", start: 0, end: -1, step: 1, ...defaultConfig },
      { type: "item", label: "宗教（个）", key: "宗教", start: 0, end: -1, step: 1, ...defaultConfig },
      { type: "item", label: "休闲度假（个）", key: "休闲度假", start: 0, end: -1, step: 1, ...defaultConfig },
    ],
  },
];

export default {
  name: "AreaList",
  inject: ["rootVue"],
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    MySlider,
    AreaFromItem,
  },
  computed: {
    _Map() {
      return this.rootVue._Map;
    },
  },
  watch: {
    show: {
      handler(val) {
        this.$nextTick(() => {
          this._interval = setInterval(() => {
            if (!this._Map) return;
            clearInterval(this._interval);
            if (this.show) {
              this.handleEnable();
            } else {
              this.handleDisable();
            }
          }, 500);
        });
      },
      immediate: true,
    },
    showLayer_currentGraphs: {
      handler(val) {
        if (val && this._Map) {
          this._Map.addLayer(this._GeoJSONLayer_currentGraphs);
        } else {
          this._GeoJSONLayer_currentGraphs.removeFromParent();
        }
      },
    },
    showLayer_odTarget: {
      handler(val) {
        if (val && this._Map) {
          this._Map.addLayer(this._GeoJSONLayer_odTarget);
        } else {
          this._GeoJSONLayer_odTarget.removeFromParent();
        }
      },
    },
    showLayer_odSource: {
      handler(val) {
        if (val && this._Map) {
          this._Map.addLayer(this._GeoJSONLayer_odSource);
        } else {
          this._GeoJSONLayer_odSource.removeFromParent();
        }
      },
    },
    showLayer_landuse: {
      handler(val) {
        if (val && this._Map) {
          this._Map.addLayer(this._GeoJSONLayer_landuse);
        } else {
          this._GeoJSONLayer_landuse.removeFromParent();
        }
      },
    },
    showDetailDialog: {
      handler(val) {
        if (val && this._Map) {
          this._Map.addLayer(this._PolygonSelectLayer_area);
        } else {
          this._PolygonSelectLayer_area.removeFromParent();
        }
      },
    },
  },
  data() {
    return {
      selectState: POLYGON_SELECT_STATE_KEY.NOT_STARTED,
      POLYGON_SELECT_EVENT,
      POLYGON_SELECT_STATE_KEY,
      list: [],
      pageSize: 20,
      pageNum: 1,
      total: 0,

      showAddForm: false,
      addForm: {
        name: "",
        xyarr: null,
      },
      addRules: {},
      addLoading: false,

      showDetailDialog: false,
      detailDialogTitle: "",
      detailDialogDetail: null,
      detailDialogParam: null,

      showLayer_currentGraphs: false,
      showLayer_odTarget: false,
      showLayer_odSource: false,
      showLayer_landuse: false,

      activeNames: ["基本信息", "总体情况", "业态开发强度", "出行结构", "交通设施", "特殊地点"],
    };
  },
  created() {
    this._PolygonSelectLayer = new PolygonSelectLayer({
      zIndex: 200,
      event: {
        [POLYGON_SELECT_EVENT.STATE_CHANGE]: (res) => {
          this.selectState = res.data.state;
          if (this.selectState === POLYGON_SELECT_STATE_KEY.ENDED) {
            const path = res.data.path;
            path[path.length] = [...path[0]];
            this.handleStopPolygonSelect();
            this.addForm.xyarr = path.map((v) => [Number(Number(v[0]).toFixed(2)), Number(Number(v[1]).toFixed(2))]);
          }
        },
      },
    });

    this._PolygonSelectLayer_area = new PolygonSelectLayer({
      zIndex: 400,
    });

    this._GeoJSONLayer_landuse = new GeoJSONLayer({ zIndex: 310 });
    this._GeoJSONLayer_odSource = new GeoJSONLayer({ zIndex: 320, pointColor: "#91cc75" });
    this._GeoJSONLayer_odTarget = new GeoJSONLayer({ zIndex: 330, pointColor: "#fac858" });
    this._GeoJSONLayer_currentGraphs = new GeoJSONLayer({ zIndex: 340, polygonColor: "#ee6666" });
  },
  mounted() {},
  beforeDestroy() {
    this._PolygonSelectLayer.dispose();
    this._PolygonSelectLayer_area.dispose();
    this._GeoJSONLayer_landuse.dispose();
    this._GeoJSONLayer_odSource.dispose();
    this._GeoJSONLayer_odTarget.dispose();
    this._GeoJSONLayer_currentGraphs.dispose();
  },
  methods: {
    getList() {
      CUA_areaList({
        pageSize: this.pageSize,
        pageNum: this.pageNum,
      }).then((res) => {
        this.list = res.records;
        this.total = res.total;
      });
    },
    handleEnable() {
      this.getList();
      this._Map.addLayer(this._PolygonSelectLayer);
      if (this._PolygonSelectLayer_area) this._Map.addLayer(this._PolygonSelectLayer_area);
      if (this.showLayer_currentGraphs) this._Map.addLayer(this._GeoJSONLayer_currentGraphs);
      if (this.showLayer_odTarget) this._Map.addLayer(this._GeoJSONLayer_odTarget);
      if (this.showLayer_odSource) this._Map.addLayer(this._GeoJSONLayer_odSource);
      if (this.showLayer_landuse) this._Map.addLayer(this._GeoJSONLayer_landuse);
    },
    handleDisable() {
      this._PolygonSelectLayer.removeFromParent();
      this._PolygonSelectLayer_area.removeFromParent();
      this._GeoJSONLayer_currentGraphs.removeFromParent();
      this._GeoJSONLayer_odTarget.removeFromParent();
      this._GeoJSONLayer_odSource.removeFromParent();
      this._GeoJSONLayer_landuse.removeFromParent();
    },
    // ****************************** 区域框选 -- start
    handlePlayPolygonSelect() {
      if (this._PolygonSelectLayer) {
        this._PolygonSelectLayer.reset();
        this._PolygonSelectLayer.play();
        this.selectState = this._PolygonSelectLayer.state;
      }
    },
    handleReplayPolygonSelect() {
      if (this._PolygonSelectLayer) {
        this._PolygonSelectLayer.reset();
        this._PolygonSelectLayer.play();
        this.selectState = this._PolygonSelectLayer.state;
      }
    },
    handleStopPolygonSelect(reset) {
      if (this._PolygonSelectLayer) {
        if (reset === true) {
          this.xyarr = [];
          this._PolygonSelectLayer.reset();
        }
        this._PolygonSelectLayer.stop();
        this.selectState = this._PolygonSelectLayer.state;
      }
    },
    // ****************************** 区域框选 -- end
    async handleOpenAddForm(id) {
      this.showAddForm = true;
      this.addLoading = false;
      if (id) {
      } else {
        this.addForm = {
          type: "1",
          xyarr: null,
          file: null,
        };
      }
      this.handleStopPolygonSelect(true);
    },
    handleCloseAddForm() {
      this.showAddForm = false;
      this.handleStopPolygonSelect(true);
    },
    async handleSelectFile() {
      const file = await selectFile(".geojson");
      let reader = new FileReader();
      reader.readAsText(this.GeoJSON._file);

      reader.onload = () => {
        parserGeoJSON(reader.result, { noProperties: true, noGeomList: true }).then((geojson) => {
          const { polygonArray } = geojson;
          let shape = [];
          for (let index = 0, l = polygonArray.length, num = 0, dataSize = polygonArray[0]; index < l; index += 1 + dataSize, dataSize = polygonArray[index]) {
            const array = polygonArray.slice(index + 1, index + 1 + dataSize);
            const value = array[0];
            const shapeArray = array.slice(1);

            for (let j = 0, l = shapeArray.length, size = shapeArray[0]; j < l; j += 1 + size, size = shapeArray[j]) {
              const v = shapeArray.slice(j + 1, j + 1 + size);
              const points = [];
              for (let k = 0, l3 = v.length / 2; k < l3; k++) {
                points[points.length] = [v[k * 2 + 0], v[k * 2 + 1]];
              }
              shape.push(points);
            }
            break;
          }
          const path = shape[0];
          if (path && path.length > 2) {
            const start = shape[0];
            const end = shape[shape.length - 1];
            if (start[0] != end[0] || start[1] != end[1]) {
              path[path.length] = [...end];
            }
            this.addForm.xyarr = path;
            this._PolygonSelectLayer.setPath(this.addForm.xyarr);
          } else {
            if (path.length < 3) return this.$message.error("区域范围节点不能少于3个");
            this.addForm.xyarr = [];
            this._PolygonSelectLayer.setPath(this.addForm.xyarr);
          }
        });
      };
    },
    handleSubmit() {
      if (this.addLoading) return;
      this.addLoading = true;
      CUA_addArea({
        name: this.addForm.name,
        area: JSON.stringify(this.addForm.xyarr),
      })
        .then((res) => {
          this.handleCloseAddForm();
          this.handleStopPolygonSelect(true);
          this.getList();
        })
        .finally(() => {
          this.addLoading = false;
        });
    },
    handleDelete(row) {
      this.$confirm(this.$l("是否确认删除区域：") + row.name + "?", this.$l("警告"), {
        confirmButtonText: this.$l("确定"),
        cancelButtonText: this.$l("取消"),
        type: "warning",
      })
        .then(function () {
          return CUA_deleteArea(row.id);
        })
        .then(() => {
          this.getList();
          this.$message.success("删除成功");
        })
        .catch(() => {});
    },
    handleRemoveXY(index) {
      if (this.addForm.xyarr.length <= 4) {
        return this.$message.error("至少保留3个点");
      }
      this.addForm.xyarr.splice(index, 1);

      if (index === 0) {
        const start = this.addForm.xyarr[0];
        const end = this.addForm.xyarr[this.addForm.xyarr.length - 1];
        end[0] = start[0];
        end[1] = start[1];
      }
      this._PolygonSelectLayer.setPath(this.addForm.xyarr);
    },
    // ****************************** 区域详情 -- start

    handleSelectionChange(selection, row) {
      console.log(selection, row);
      const oldArea = this.detailDialogDetail;
      // this.handleInitLike();
      this.$refs.table.clearSelection();
      if (oldArea?.id != row.id) {
        this.$refs.table.toggleRowSelection(row, true);
        this.detailDialogDetail = JSON.parse(JSON.stringify(row));
        this._PolygonSelectLayer_area.setPath(JSON.parse(row.area || "[]"));

        // 获取现状json
        (async () => {
          try {
            if (!this.detailDialogDetail.currentGraphs) throw new Error("没有currentGraphs");
            const res = await CUA_downloadGeojson({ path: this.detailDialogDetail.currentGraphs })
              .then((res) => boldToText(res.data))
              .then((res) => parserGeoJSON(res));
            const [cx, cy] = res.center;
            const areaParam = JSON.parse(JSON.stringify(dialogList));
            const children = areaParam.map((v) => v.children).flat();
            const areaData = res.propertiesList[1];
            children.forEach((item) => {
              if (item.type == "item") {
                item.value = Number(Number(areaData[item.key]).toFixed(4));
              }
            });
            this.detailDialogParam = areaParam;
            this._GeoJSONLayer_currentGraphs.setGeoJsonData(res);
          } catch (error) {
            console.log(error);
            this.showLayer_currentGraphs = false;
            this.detailDialogDetail.currentGraphs = null;
            this.detailDialogParam = null;
            this._GeoJSONLayer_currentGraphs.clearScene();
          }
        })();
        // 获取起点json
        (async () => {
          try {
            if (!this.detailDialogDetail.odSource) throw new Error("没有odSource");
            const res = await CUA_downloadGeojson({ path: this.detailDialogDetail.odSource })
              .then((res) => boldToText(res.data))
              .then((res) => parserGeoJSON(res));
            this._GeoJSONLayer_odSource.setGeoJsonData(res);
          } catch (error) {
            console.log(error);
            this.showLayer_odSource = false;
            this.detailDialogDetail.odSource = null;
            this._GeoJSONLayer_odSource.clearScene();
          }
        })();
        // 获取讫点json
        (async () => {
          try {
            if (!this.detailDialogDetail.odTarget) throw new Error("没有odTarget");
            const res = await CUA_downloadGeojson({ path: this.detailDialogDetail.odTarget })
              .then((res) => boldToText(res.data))
              .then((res) => parserGeoJSON(res));
            this._GeoJSONLayer_odTarget.setGeoJsonData(res);
          } catch (error) {
            console.log(error);
            this.showLayer_odTarget = false;
            this.detailDialogDetail.odTarget = null;
            this._GeoJSONLayer_odTarget.clearScene();
          }
        })();
        // 获取landuse
        (async () => {
          try {
            this.detailDialogDetail.landuse = "1";
            // if (!this.detailDialogDetail.landuse) throw new Error("没有获取landuse");
            const res = await CUA_landuse({ id: this.detailDialogDetail.id })
              .then((res) => boldToText(res.data))
              .then((res) => parserGeoJSON(res));
            // this._GeoJSONLayer_landuse.setGeoJsonData(res);
          } catch (error) {
            console.log(error);
            this.showLayer_landuse = false;
            this.detailDialogDetail.landuse = null;
            this._GeoJSONLayer_landuse.clearScene();
          }
        })();
      } else {
        this.detailDialogDetail = null;
        this.detailDialogParam = null;
        this.showDetailDialog = false;
        this.showLayer_currentGraphs = false;
        this.showLayer_odTarget = false;
        this.showLayer_odSource = false;
        this.showLayer_landuse = false;
        this._PolygonSelectLayer_area.setPath([]);

        this._GeoJSONLayer_currentGraphs.clearScene();
        this._GeoJSONLayer_odTarget.clearScene();
        this._GeoJSONLayer_odSource.clearScene();
        this._GeoJSONLayer_landuse.clearScene();
      }
    },

    handleShowDetailDialog() {
      this.showDetailDialog = true;
    },
    handleCloseDialog() {
      this.showDetailDialog = false;
    },
    computedTotal(item) {
      return item.children.filter((v) => v.check).reduce((a, c) => a + c.value, 0);
    },
    // ****************************** 区域详情 -- end
  },
};
</script>

<style lang="scss" scoped>
.AreaList {
  display: flex;
  flex-direction: column;
  padding: 10px;
  gap: 10px;

  .block {
    display: block;
    width: 100%;
    margin: 0;
  }
  .flex-h {
    height: 0;
    flex: 1;
  }

  ::v-deep th.el-table-column--selection .el-checkbox {
    display: none;
  }

  .AreaList2 {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
}
.AreaList_Dialog {
  .file {
    display: flex;
    .file_name {
      width: 0;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.AreaList_Dialog2 {
  height: calc(100vh - 130px);
  .AreaList_Dialog2_box {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;
    :deep .my_collapse_item .el-collapse-item__content {
      border: 0;
      padding: 0;
    }
    ::v-deep .scroll_box {
      overflow-x: hidden;
      overflow-y: auto;
    }
    .my_collapse_item {
      padding: 0;
    }
    .my_collapse_item_title {
      padding-left: 15px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .my_collapse_item_body {
      padding: 10px;
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
    }
    .btn_box {
      display: flex;
      .el-button {
        flex: 1;
      }
    }
  }
}

.form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;

  .form_item {
    width: 100%;
    & + .form_item {
      margin-top: 10px;
    }
  }
  .form_item_header {
    display: flex;
    margin-bottom: 10px;
    .open_btn {
      width: 44px;
    }
    .show_btn {
      width: 100%;
    }
  }

  .setting_box {
    width: 100%;

    .setting_item {
      display: flex;
      align-items: center;
      width: 100%;
      & + .setting_item {
        margin-top: 10px;
      }
      &_label {
        white-space: nowrap;
        flex: 1;
      }
    }
  }
}
</style>
