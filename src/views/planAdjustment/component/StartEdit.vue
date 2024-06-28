<template>
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
        <el-form-item :label="$l('时间间隔')" prop="spacesStr">
          <el-time-picker v-model="form.spacesStr" value-format="HH:mm:ss" format="HH:mm:ss" />
        </el-form-item>
        <el-form-item :label="$l('运营车型')" prop="model">
          <el-select v-model="form.model">
            <el-option v-for="item in modelOptions" :key="item.value" :label="$l(item.label)" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$l('备注')" prop="remark">
          <el-input v-model="form.remark" type="textarea" :placeholder="$l('请输入内容')"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">{{ $l("确定") }}</el-button>
        <el-button @click="cancel">{{ $l("取消") }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<language>
{
  "新增": {
    "zh-CN":"新增",
    "en-US":"add"
  },
  "删除": {
    "zh-CN":"删除",
    "en-US":"delete"
  },
  "类型": {
    "zh-CN":"类型",
    "en-US":"type"
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
    "en-US":"departure interval"
  },
  "车型": {
    "zh-CN":"车型",
    "en-US":"vehicle type"
  },
  "请输入关键词": {
    "zh-CN":"请输入关键词",
    "en-US":"Please enter keywords"
  },
  "备注": {
    "zh-CN":"备注",
    "en-US":"remark"
  },
  "操作": {
    "zh-CN":"操作",
    "en-US":"operate"
  },
  "修改": {
    "zh-CN":"修改",
    "en-US":"edit"
  },
  "删除": {
    "zh-CN":"删除",
    "en-US":"delete"
  },
  "确定": {
    "zh-CN":"确定",
    "en-US":"confirm"
  },
  "取消": {
    "zh-CN":"取消",
    "en-US":"cancel"
  },
  "运营类型": {
    "zh-CN":"运营类型",
    "en-US":"Operation Type"
  },
  "发班类型": {
    "zh-CN":"发班类型",
    "en-US":"Shift Type"
  },
  "开始时间": {
    "zh-CN":"开始时间",
    "en-US":"Start time"
  },
  "请选择开始时间": {
    "zh-CN":"请选择开始时间",
    "en-US":"Please select start time"
  },
  "请选择结束时间": {
    "zh-CN":"请选择结束时间",
    "en-US":"Please select end time"
  },
  "备注": {
    "zh-CN":"备注",
    "en-US":"remark"
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
    "en-US":"Edit dispatch info"
  },
  "是否确认删除发车信息？": {
    "zh-CN":"是否确认删除发车信息？",
    "en-US":"Do confirm the deletion of the dispatch info？"
  },
  "警告": {
    "zh-CN":"警告",
    "en-US":"warn"
  },
  "平峰(早晨)": {
    "zh-CN":"平峰(早晨)",
    "en-US":"morning_valley"
  },
  "早高峰": {
    "zh-CN":"早高峰",
    "en-US":"morning_peak"
  },
  "平峰(白天)": {
    "zh-CN":"平峰(白天)",
    "en-US":"daytime_valley"
  },
  "晚高峰": {
    "zh-CN":"晚高峰",
    "en-US":"evening_peak"
  },
  "平峰(夜间)": {
    "zh-CN":"平峰(夜间)",
    "en-US":"evening_valley"
  },
  "定点发车": {
    "zh-CN":"定点发车",
    "en-US":"fixed_point"
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
    "en-US":"Tues"
  },
  "周三": {
    "zh-CN":"周三",
    "en-US":"Wed"
  },
  "周四": {
    "zh-CN":"周四",
    "en-US":"Thurs"
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
}
</language>

<script>
import * as Bean from "@/utils/Bean";

export default {
  props: {
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
      form: {},
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
      modelOptions: [
        { label: "小型(4.5<L≤6)", value: "小型(4.5<L≤6)" },
        { label: "中型(6<L≤9)", value: "中型(6<L≤9)" },
        { label: "大型(9<L≤12)", value: "大型(9<L≤12)" },
        { label: "单层特大型(12<L≤16)", value: "单层特大型(12<L≤16)" },
        { label: "双层特大型(12≤L≤13.7)", value: "双层特大型(12≤L≤13.7)" },
        { label: "水上巴士", value: "水上巴士" },
        { label: "其它", value: "其它" },
      ],
    };
  },
  computed: {
    list() {
      return this.transitRoute.departureRules;
    },
    _linkLayer() {
      return this.rootVue._EditBusLinkLayer;
    },
    _stopLayer() {
      return this.rootVue._EditBusStopLayer;
    },
    _allStopLayer() {
      return this.rootVue._StopsLayer;
    },
  },
  watch: {
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
    this.transitRoute = new Bean.TransitRoute(this.transitRouteJSON);
    this.updateLayer();
  },
  methods: {
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
    updateLayer() {
      if (this._linkLayer) {
        this._linkLayer.setData(this.transitRoute);
      }
      if (this._stopLayer) {
        this._stopLayer.setData(this.transitRoute);
      }
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
          this.form.spacesStr = "00:20:00";
          this.form.pickerOption = {
            start: "05:00:00",
            end: "09:00:00",
          };
          break;
        case "morning_peak":
          this.form.beginTime = "07:00:00";
          this.form.endTime = "09:00:00";
          this.form.spacesStr = "00:10:00";
          this.form.pickerOption = {
            start: "06:00:00",
            end: "10:00:00",
          };
          break;

        case "daytime_valley":
          this.form.beginTime = "09:00:00";
          this.form.endTime = "17:00:00";
          this.form.spacesStr = "00:20:00";
          this.form.pickerOption = {
            start: "07:00:00",
            end: "19:00:00",
          };
          break;

        case "evening_peak":
          this.form.beginTime = "17:00:00";
          this.form.endTime = "19:00:00";
          this.form.spacesStr = "00:10:00";
          this.form.pickerOption = {
            start: "16:00:00",
            end: "20:00:00",
          };
          break;

        case "evening_valley":
          this.form.beginTime = "19:00:00";
          this.form.endTime = "22:00:00";
          this.form.spacesStr = "00:20:00";
          this.form.pickerOption = {
            start: "17:00:00",
            end: "05:00:00",
          };

        case "fixed_point":
          this.form.beginTime = "";
          this.form.endTime = "";
          this.form.spacesStr = "";
          this.form.pickerOption = {};
          break;

        case "other":
          this.form.beginTime = "";
          this.form.endTime = "";
          this.form.spacesStr = "";
          this.form.pickerOption = {};
          break;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
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
