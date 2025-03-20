<template>
  <Dialog width="900px" :title="$l('发车信息编辑')" :visible="show" left="center" @close="$emit('close')">
    <div class="StartEdit">
      <div class="toolbar">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd">{{ $l("新增") }}</el-button>
        <el-button type="danger" plain icon="el-icon-delete" size="mini" @click="handleDelete()">{{ $l("删除") }}</el-button>
      </div>
      <el-table v-loading="loading" :data="list" @selection-change="handleSelectionChange" max-height="500">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column :label="$l('类型')" align="center" prop="type" :formatter="typeFormatter" />
        <el-table-column :label="$l('开始时间')" align="center" prop="beginTime" />
        <el-table-column :label="$l('结束时间')" align="center" prop="endTime" />
        <el-table-column :label="$l('发车间隔')" align="center" prop="spacesStr" />
        <el-table-column :label="$l('车型')" align="center" prop="model" :formatter="modelFormatter" />
        <el-table-column :label="$l('备注')" align="center" prop="remark" />
        <el-table-column :label="$l('操作')" fixed="right" min-width="150" align="center" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">{{ $l("修改") }}</el-button>
            <el-button size="mini" type="text" icon="el-icon-delete" style="color: #f56c6c" @click="handleDelete(scope.row)">{{ $l("删除") }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="footer">
        <el-button type="primary" size="small" @click="$emit('change', transitRoute.toJSON())">{{ $l("确定") }}</el-button>
      </div>

      <!-- 添加或修改对话框 -->
      <el-dialog :title="title" :visible.sync="open" width="550px" append-to-body>
        <el-form ref="form" :model="form" :rules="rules" label-width="80px" size="small">
          <el-form-item :label="$l('运营类型')" prop="type">
            <el-select v-model="form.type" @change="handleChangeType">
              <el-option v-for="item in typeOptions" :key="item.value" :label="$l(item.label)" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$l('')" prop="startDays">
            <el-checkbox-group v-model="form.startDays">
              <el-checkbox-button v-for="item in startDaysOptions" :label="item.value" :key="item.value" :disabled="!!item.disabled">{{ item.label }}</el-checkbox-button>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item :label="$l('发班类型')" prop="startType">
            <el-select v-model="form.startType" @change="handleChangeStartType">
              <el-option v-for="item in startTypeOptions" :key="item.value" :label="$l(item.label)" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$l('开始时间')" prop="beginTime">
            <el-time-picker v-model="form.beginTime" value-format="HH:mm:ss" :placeholder="$l('请选择开始时间')" />
          </el-form-item>
          <el-form-item :label="$l('结束时间')" prop="endTime">
            <el-time-picker v-model="form.endTime" value-format="HH:mm:ss" :placeholder="$l('请选择结束时间')" />
          </el-form-item>
          <el-form-item :label="$l('时间间隔')" prop="spacesNum">
            <!-- <el-time-picker v-model="form.spacesStr" value-format="HH:mm:ss" format="HH:mm:ss" /> -->
            <el-input-number v-model="form.spacesNum" label="" :step="1" :controls="true" controls-position="both" />&nbsp;&nbsp;{{ $l("分钟") }}
          </el-form-item>
          <el-form-item :label="$l('运营车型')" prop="model">
            <el-select v-model="form.model" @change="handleChangeModel">
              <el-option v-for="item in modelOptions" :key="item.value" :label="$l(item.label)" :value="item.value" />
            </el-select>
          </el-form-item>
          <template v-show="form.model">
            <el-form-item :label="$l('车辆长度')" prop="modelJson.length">
              <el-input-number v-model="form.modelJson.length" :min="0" :step="0.01" step-strictly> </el-input-number>
            </el-form-item>
            <el-form-item :label="$l('车辆宽度')" prop="modelJson.width">
              <el-input-number v-model="form.modelJson.width" :min="0" :step="0.01" step-strictly> </el-input-number>
            </el-form-item>
            <el-form-item :label="$l('总定员')" prop="modelJson.total">
              <el-input-number v-model="form.modelJson.total" :min="0" :step="0.01" step-strictly> </el-input-number>
            </el-form-item>
            <el-form-item :label="$l('座席')" prop="modelJson.seat">
              <el-input-number v-model="form.modelJson.seat" :min="0" :step="0.01" step-strictly> </el-input-number>
            </el-form-item>
            <el-form-item v-if="this.transitRoute.transportMode == 'subway' || this.transitRoute.transportMode == 'tram'" :label="$l('车厢数量')" prop="modelJson.coach">
              <el-input-number v-model="form.modelJson.coach" :min="0" :step="0.01" step-strictly> </el-input-number>
            </el-form-item>
          </template>

          <el-form-item :label="$l('备注')" prop="remark">
            <el-input v-model="form.remark" type="textarea" :placeholder="$l('请输入内容')"></el-input>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="submitForm">{{ $l("确定") }}</el-button>
            <el-button @click="cancel">{{ $l("取消") }}</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
    </div>
  </Dialog>
</template>

<language>
{
  "发车信息编辑": {
    "zh-CN":"发车信息编辑",
    "en-US":"Time Table Edit"
  },
  "新增": {
    "zh-CN":"新增",
    "en-US":"Add"
  },
  "删除": {
    "zh-CN":"删除",
    "en-US":"Delete"
  },
  "类型": {
    "zh-CN":"类型",
    "en-US":"Type"
  },
  "开始时间": {
    "zh-CN":"开始时间",
    "en-US":"Start time"
  },
  "结束时间": {
    "zh-CN":"结束时间",
    "en-US":"End time"
  },
  "发车间隔": {
    "zh-CN":"发车间隔",
    "en-US":"Headway"
  },
  "车型": {
    "zh-CN":"车型",
    "en-US":"Vehicle type"
  },
  "请输入关键词": {
    "zh-CN":"请输入关键词",
    "en-US":"Please enter keywords"
  },
  "备注": {
    "zh-CN":"备注",
    "en-US":"Description"
  },
  "操作": {
    "zh-CN":"操作",
    "en-US":"Operate"
  },
  "修改": {
    "zh-CN":"修改",
    "en-US":"Edit"
  },
  "删除": {
    "zh-CN":"删除",
    "en-US":"Delete"
  },
  "确定": {
    "zh-CN":"确定",
    "en-US":"Confirm"
  },
  "取消": {
    "zh-CN":"取消",
    "en-US":"Cancel"
  },
  "运营类型": {
    "zh-CN":"运营类型",
    "en-US":"Operation Type"
  },
  "发班类型": {
    "zh-CN":"发班类型",
    "en-US":"Schedule Type"
  },
  "开始时间": {
    "zh-CN":"开始时间",
    "en-US":"Start Time"
  },
  "请选择开始时间": {
    "zh-CN":"请选择开始时间",
    "en-US":"Please Select Start Time"
  },
  "请选择结束时间": {
    "zh-CN":"请选择结束时间",
    "en-US":"Please Select End Time"
  },
  "时间间隔": {
    "zh-CN":"时间间隔",
    "en-US":"Time Interval"
  },
  "运营车型": {
    "zh-CN":"运营车型",
    "en-US":"Vehicle Type"
  },
  "车厢数量": {
    "zh-CN":"车厢数量",
    "en-US":"Number of Carriages"
  },
  "车辆长度": {
    "zh-CN":"车辆长度",
    "en-US":"Vehicle Length"
  },
  "车辆宽度": {
    "zh-CN":"车辆宽度",
    "en-US":"Vehicle Width"
  },
  "总定员": {
    "zh-CN":"总定员",
    "en-US":"Total Passengers"
  },
  "座席": {
    "zh-CN":"座席",
    "en-US":"Seats"
  },
  "备注": {
    "zh-CN":"备注",
    "en-US":"Remark"
  },
  "请输入内容": {
    "zh-CN":"请输入内容",
    "en-US":"Please enter content"
  },
  "类型不能为空": {
    "zh-CN":"类型不能为空",
    "en-US":"Type cannot be null"
  },
  "开始时间不能为空": {
    "zh-CN":"开始时间不能为空",
    "en-US":"The start time cannot be null"
  },
  "结束时间不能为空": {
    "zh-CN":"结束时间不能为空",
    "en-US":"The end time cannot be null"
  },
  "时间间隔不能为空": {
    "zh-CN":"时间间隔不能为空",
    "en-US":"The time interval cannot be null"
  },
  "车型不能为空": {
    "zh-CN":"车型不能为空",
    "en-US":"Model cannot be null"
  },
  "添加发车信息": {
    "zh-CN":"添加发车信息",
    "en-US":"Add departure info"
  },
  "编辑发车信息": {
    "zh-CN":"编辑发车信息",
    "en-US":"Edit departure info"
  },
  "是否确认删除发车信息？": {
    "zh-CN":"是否确认删除发车信息？",
    "en-US":"Delete the departure info？"
  },
  "警告": {
    "zh-CN":"警告",
    "en-US":"Warning"
  },
  "平峰(早晨)": {
    "zh-CN":"平峰(早晨)",
    "en-US":"Off-peak hour(morning)"
  },
  "早高峰": {
    "zh-CN":"早高峰",
    "en-US":"Peak hour(morning)"
  },
  "平峰(白天)": {
    "zh-CN":"平峰(白天)",
    "en-US":"Off-peak hour(daytime)"
  },
  "晚高峰": {
    "zh-CN":"晚高峰",
    "en-US":"Peak hour(evening)"
  },
  "平峰(夜间)": {
    "zh-CN":"平峰(夜间)",
    "en-US":"Off-peak hour(evening)"
  },
  "定点发车": {
    "zh-CN":"定点发车",
    "en-US":"time table oriented"
  },
  "其它": {
    "zh-CN":"其它",
    "en-US":"other"
  },
  "周一": {
    "zh-CN":"周一",
    "en-US":"Mon"
  },
  "周二": {
    "zh-CN":"周二",
    "en-US":"Tue"
  },
  "周三": {
    "zh-CN":"周三",
    "en-US":"Wed"
  },
  "周四": {
    "zh-CN":"周四",
    "en-US":"Thu"
  },
  "周五": {
    "zh-CN":"周五",
    "en-US":"Fri"
  },
  "周六": {
    "zh-CN":"周六",
    "en-US":"Sat"
  },
  "周日": {
    "zh-CN":"周日",
    "en-US":"Sun"
  },
  "全天": {
    "zh-CN":"全天",
    "en-US":"all-day"
  },
  "工作日": {
    "zh-CN":"工作日",
    "en-US":"weekday"
  },
  "周末": {
    "zh-CN":"周末",
    "en-US":"weekend"
  },
  "节假日": {
    "zh-CN":"节假日",
    "en-US":"holiday"
  },
  "其它": {
    "zh-CN":"其它",
    "en-US":"other"
  },
  "小型(4.5<L≤6)": {
    "zh-CN":"小型(4.5<L≤6)",
    "en-US":"mini(4.5<L≤6)"
  },
  "中型(6<L≤9)": {
    "zh-CN":"中型(6<L≤9)",
    "en-US":"medium(6<L≤9)"
  },
  "大型(9<L≤12)": {
    "zh-CN":"大型(9<L≤12)",
    "en-US":"large(9<L≤12)"
  },
  "单层特大型(12<L≤16)": {
    "zh-CN":"单层特大型(12<L≤16)",
    "en-US":"Single layer extra large(9<L≤12)"
  },
  "双层特大型(12≤L≤13.7)": {
    "zh-CN":"双层特大型(12≤L≤13.7)",
    "en-US":"Double layer extra large size(12≤L≤13.7)"
  },
  "水上巴士": {
    "zh-CN":"水上巴士",
    "en-US":"Water buses"
  },
  "其它": {
    "zh-CN":"其它",
    "en-US":"other"
  },
  "分钟": {
    "zh-CN":"分钟",
    "en-US":"min"
  },
}
</language>

<script>
import * as Bean from "@/utils/Bean";

import { BusLinkLayer } from "../layer/BusLinkLayer";
import { BusStopLayer } from "../layer/BusStopLayer";
import { StopsLayer } from "../layer/StopsLayer";
import { NetworkLayer } from "../layer/NetworkLayer";
import { NetworkLineLayer } from "../layer/NetworkLineLayer";
import { BusRouteLinkLayer } from "../layer/BusRouteLinkLayer";

export default {
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    transitRouteJSON: {
      type: Object,
      default: () => new Bean.TransitRoute().toJSON(),
    },
  },
  inject: ["rootVue"],
  data() {
    return {
      // 遮罩层
      loading: false,
      // 导出遮罩层
      exportLoading: false,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 表单参数
      form: new Bean.DepartureRule(),
      // 表单校验
      rules: {},

      transitRoute: new Bean.TransitRoute(),
      editIndex: -1,
      startTypeOptions: [
        { label: "平峰(早晨)", value: "morning_valley" },
        { label: "早高峰", value: "morning_peak" },
        { label: "平峰(白天)", value: "daytime_valley" },
        { label: "晚高峰", value: "evening_peak" },
        { label: "平峰(夜间)", value: "evening_valley" },
        { label: "定点发车", value: "fixed_point" },
        { label: "其它", value: "other" },
      ],
      startDaysOptions: [
        { label: "周一", value: "1" },
        { label: "周二", value: "2" },
        { label: "周三", value: "3" },
        { label: "周四", value: "4" },
        { label: "周五", value: "5" },
        { label: "周六", value: "6" },
        { label: "周日", value: "7" },
      ],
      typeOptions: [
        { label: "全天", value: "all-day" },
        { label: "工作日", value: "weekday" },
        { label: "周末", value: "weekend" },
        { label: "节假日", value: "holiday" },
        { label: "其它", value: "other" },
      ],
      // 车辆类型	车辆长度	车辆宽度	总定员	座席
      // 小型车(4.5≤L≤6)	6.00	2.13	30	11
      // 中型车(6≤L≤9)	8.49	2.42	55	13
      // 大型(9<L≤12)	12.00	2.55	78	19
      // 单层特大型(12<L≤16)	17.98	2.54	130	31
      // 双层特大型(12≤L≤13.7)	12.00	2.55	112	66
      // 水上巴士	-	-	100	100
      // 其它	-	-	-	-
      busModelOptions: [
        { label: "小型(4.5<L≤6)", value: "小型(4.5<L≤6)", json: { model: "小型(4.5<L≤6)", length: 6.0, width: 2.13, total: 30, seat: 11, coach: 1 } },
        { label: "中型(6<L≤9)", value: "中型(6<L≤9)", json: { model: "小型(4.5<L≤6)", length: 8.49, width: 2.42, total: 55, seat: 13, coach: 1 } },
        { label: "大型(9<L≤12)", value: "大型(9<L≤12)", json: { model: "大型(9<L≤12)", length: 12.0, width: 2.55, total: 78, seat: 19, coach: 1 } },
        { label: "单层特大型(12<L≤16)", value: "单层特大型(12<L≤16)", json: { model: "单层特大型(12<L≤16)", length: 17.98, width: 2.54, total: 130, seat: 31, coach: 1 } },
        { label: "双层特大型(12≤L≤13.7)", value: "双层特大型(12≤L≤13.7)", json: { model: "双层特大型(12≤L≤13.7)", length: 12.0, width: 2.55, total: 112, seat: 66, coach: 1 } },
        { label: "水上巴士", value: "水上巴士", json: { model: "水上巴士", length: 0, width: 0, total: 100, seat: 100, coach: 1 } },
        { label: "其它", value: "其它", json: { model: "其它", length: 0, width: 0, total: 0, seat: 0, coach: 1 } },
      ],
      // 车厢类型	车厢长度	车厢宽度	总定员	座席
      // A型车	22.8	3.0	310	56
      // B型车	19.0	2.8	250	46
      // C型车	19.0	2.6	220	40
      // D型车	22.8	2.6	238	66
      // L型车	16.0	2.8	242	32
      subwayModelOptions: [
        { label: "A型车", value: "A型车", json: { model: "A型车", length: 22.8, width: 3.0, total: 310, seat: 56, coach: 1 } },
        { label: "B型车", value: "B型车", json: { model: "B型车", length: 19.0, width: 2.8, total: 250, seat: 46, coach: 1 } },
        { label: "C型车", value: "C型车", json: { model: "C型车", length: 19.0, width: 2.6, total: 220, seat: 40, coach: 1 } },
        { label: "D型车", value: "D型车", json: { model: "D型车", length: 22.8, width: 2.6, total: 238, seat: 66, coach: 1 } },
        { label: "L型车", value: "L型车", json: { model: "L型车", length: 16.0, width: 2.8, total: 242, seat: 32, coach: 1 } },
      ],
    };
  },
  computed: {
    list() {
      return this.transitRoute.departureRules.sort((a, b) => (a.beginTime > b.beginTime ? 1 : -1));
    },
    modelOptions() {
      return (
        {
          bus: this.busModelOptions,
          ferry: this.busModelOptions,
          subway: this.subwayModelOptions,
          tram: this.subwayModelOptions,
        }[this.transitRoute.transportMode] || this.busModelOptions
      );
    },
    _Map() {
      return this.rootVue._map;
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
    page_language: {
      handler(val) {
        this.rules = {
          type: {
            required: true,
            message: this.$l("类型不能为空"),
            trigger: "blur",
          },
          beginTime: {
            required: true,
            message: this.$l("开始时间不能为空"),
            trigger: "blur",
          },
          endTime: {
            required: true,
            message: this.$l("结束时间不能为空"),
            trigger: "blur",
          },
          spaces: {
            required: true,
            message: this.$l("时间间隔不能为空"),
            trigger: "blur",
          },
          model: {
            required: true,
            message: this.$l("车型不能为空"),
            trigger: "blur",
          },
        };
      },
      immediate: true,
    },
  },
  created() {
    this._linkLayer = new BusLinkLayer({
      zIndex: 6,
      color: 0xf56c6c,
      visible: true,
    });
    this._stopLayer = new BusStopLayer({
      zIndex: 8,
      color: 0x67c23a,
      visible: true,
    });
  },
  methods: {
    handleEnable() {
      this.transitRoute = new Bean.TransitRoute(this.transitRouteJSON);
      if (this._linkLayer) {
        this._linkLayer.setData(this.transitRoute);
      }
      if (this._stopLayer) {
        this._stopLayer.setData(this.transitRoute);
      }
      this._Map.addLayer(this._linkLayer);
      this._Map.addLayer(this._stopLayer);
    },
    handleDisable() {
      this._Map.removeLayer(this._linkLayer);
      this._Map.removeLayer(this._stopLayer);
    },
    typeFormatter(row, column) {
      let item = this.typeOptions.find((v) => v.value == row.type);
      return item ? item.label : "";
    },
    modelFormatter(row, column) {
      let item = this.modelOptions.find((v) => v.value == row.model);
      return item ? item.label : "";
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.form = new Bean.DepartureRule();
      this.title = "";
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.form = new Bean.DepartureRule();
      this.handleChangeType(this.form.type);
      this.handleChangeStartType(this.form.startType);
      this.title = this.$l("添加发车信息");
      this.open = true;
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.uuid);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    /** 修改按钮操作 */
    handleUpdate(row, index) {
      this.editIndex = index;
      this.form = new Bean.DepartureRule(row.toJSON());
      this.handleChangeType(this.form.type);
      this.title = this.$l("编辑发车信息");
      this.open = true;
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          this.transitRoute.addOrChangeDepartureRule(this.form);
          this.open = false;
          this.form = new Bean.DepartureRule();
          this.editIndex = -1;
          this.title = "";
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row ? [row.uuid] : this.ids;
      this.$confirm(this.$l("是否确认删除发车信息？"), this.$l("警告"), {
        confirmButtonText: this.$l("确定"),
        cancelButtonText: this.$l("取消"),
        type: "warning",
      }).then(() => {
        for (const uuid of ids) {
          this.transitRoute.removeDepartureRule(uuid);
        }
      });
    },
    handleChangeType(value) {
      let startDaysOptions = [
        { label: "周一", value: "1", disabled: false },
        { label: "周二", value: "2", disabled: false },
        { label: "周三", value: "3", disabled: false },
        { label: "周四", value: "4", disabled: false },
        { label: "周五", value: "5", disabled: false },
        { label: "周六", value: "6", disabled: false },
        { label: "周日", value: "7", disabled: false },
      ];
      switch (value) {
        case "all-day":
          startDaysOptions.forEach((v) => {
            v.disabled = false;
          });
          this.form.startDays = startDaysOptions.filter((v) => !v.disabled).map((v) => v.value);
          break;
        case "weekday":
          startDaysOptions.forEach((v) => {
            v.disabled = v.label == "周六" || v.label == "周日";
          });
          this.form.startDays = startDaysOptions.filter((v) => !v.disabled).map((v) => v.value);
          break;
        case "weekend":
          startDaysOptions.forEach((v) => {
            v.disabled = v.label != "周六" && v.label != "周日";
          });
          this.form.startDays = startDaysOptions.filter((v) => !v.disabled).map((v) => v.value);
          break;
        case "holiday":
          startDaysOptions.forEach((v) => {
            v.disabled = true;
          });
          this.form.startDays = startDaysOptions.filter((v) => !v.disabled).map((v) => v.value);
          break;
        case "other":
          startDaysOptions.forEach((v) => {
            v.disabled = false;
          });
          this.form.startDays = [];
          break;
      }
      this.startDaysOptions = startDaysOptions;
    },
    handleChangeStartType(value) {
      // { label: "平峰(早晨)", value: "morning_valley" },
      // { label: "早高峰", value: "morning_peak" },
      // { label: "平峰(白天)", value: "daytime_valley" },
      // { label: "晚高峰", value: "evening_peak" },
      // { label: "平峰(夜间)", value: "evening_valley" },
      // { label: "定点发车", value: "fixed_point" },
      // { label: "其它", value: "other" },
      switch (value) {
        case "morning_valley":
          this.form.beginTime = "06:00:00";
          this.form.endTime = "07:00:00";
          // this.form.spacesStr = "00:20:00";
          this.form.spacesNum = 20;
          this.form.pickerOption = {
            start: "05:00:00",
            end: "09:00:00",
          };
          break;
        case "morning_peak":
          this.form.beginTime = "07:00:00";
          this.form.endTime = "09:00:00";
          // this.form.spacesStr = "00:10:00";
          this.form.spacesNum = 10;
          this.form.pickerOption = {
            start: "06:00:00",
            end: "10:00:00",
          };
          break;

        case "daytime_valley":
          this.form.beginTime = "09:00:00";
          this.form.endTime = "17:00:00";
          // this.form.spacesStr = "00:20:00";
          this.form.spacesNum = 20;
          this.form.pickerOption = {
            start: "07:00:00",
            end: "19:00:00",
          };
          break;

        case "evening_peak":
          this.form.beginTime = "17:00:00";
          this.form.endTime = "19:00:00";
          // this.form.spacesStr = "00:10:00";
          this.form.spacesNum = 10;
          this.form.pickerOption = {
            start: "16:00:00",
            end: "20:00:00",
          };
          break;

        case "evening_valley":
          this.form.beginTime = "19:00:00";
          this.form.endTime = "22:00:00";
          // this.form.spacesStr = "00:20:00";
          this.form.spacesNum = 20;
          this.form.pickerOption = {
            start: "17:00:00",
            end: "05:00:00",
          };

        case "fixed_point":
          this.form.beginTime = "";
          this.form.endTime = "";
          // this.form.spacesStr = "";
          this.form.spacesNum = 0;
          this.form.pickerOption = {};
          break;

        case "other":
          this.form.beginTime = "";
          this.form.endTime = "";
          // this.form.spacesStr = "";
          this.form.spacesNum = 0;
          this.form.pickerOption = {};
          break;
      }
    },
    handleChangeModel(value) {
      const item = this.modelOptions.find((v) => v.value == value);
      console.log(item);
      if (item) {
        this.form.modelJson = JSON.parse(JSON.stringify(item.json));
      }
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep {
  .el-dialog {
    margin-top: 50px !important;
  }
  .el-input-number {
    width: 220px;
  }
  .el-select {
    width: 220px;
  }
}
.StartEdit {
  .toolbar {
    padding-bottom: 10px;
    text-align: right;
  }
  .footer {
    padding-top: 10px;
    text-align: right;
  }
}
</style>
