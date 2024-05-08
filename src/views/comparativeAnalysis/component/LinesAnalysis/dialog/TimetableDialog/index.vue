<template>
  <div class="TimetableDialog">
    <Dialog ref="dialog" :title="$l('时刻表信息变动')" :visible="true" @close="$emit('close')" left="center" width="1300px">
      <div class="TimetableDialog__bodyer">
        <div class="row">
          <div class="col">
            <div class="_title">oldXml</div>
            <div class="_content">
              <el-table v-loading="loading" :data="oldList">
                <el-table-column type="selection" width="55" align="center" />
                <el-table-column :label="$l('类型')" align="center" prop="type" :formatter="typeFormatter" />
                <el-table-column :label="$l('开始时间')" align="center" prop="beginTime" />
                <el-table-column :label="$l('结束时间')" align="center" prop="endTime" />
                <el-table-column :label="$l('发车间隔')" align="center" prop="spacesStr" />
                <el-table-column :label="$l('车型')" align="center" prop="model" :formatter="modelFormatter" />
                <el-table-column :label="$l('备注')" align="center" prop="remark" />
              </el-table>
            </div>
          </div>
          <div class="col">
            <div class="_title">newXml</div>
            <div class="_content">
              <el-table v-loading="loading" :data="newList">
                <el-table-column type="selection" width="55" align="center" />
                <el-table-column :label="$l('类型')" align="center" prop="type" :formatter="typeFormatter" />
                <el-table-column :label="$l('开始时间')" align="center" prop="beginTime" />
                <el-table-column :label="$l('结束时间')" align="center" prop="endTime" />
                <el-table-column :label="$l('发车间隔')" align="center" prop="spacesStr" />
                <el-table-column :label="$l('车型')" align="center" prop="model" :formatter="modelFormatter" />
                <el-table-column :label="$l('备注')" align="center" prop="remark" />
              </el-table>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<language>
{
  "时刻表信息变动":{
    "zh-CN": "时刻表信息变动",
    "en-US": "Timetable changes"
  },
}
</language>

<script>
import { number } from "echarts";

export default {
  props: {
    form: {
      type: Object,
      default: () => ({}),
    },
    offset: {
      type: Number,
      default: 0,
    },
  },
  inject: ["rootVue"],
  components: {},
  computed: {},
  data() {
    return {
      s_form: {},
      oldList: [],
      newList: [],
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
  created() {
    console.log(this.rootVue);
    this.init();
  },
  mounted() {
    this.$nextTick(() => {
      this.$refs.dialog.offset(this.offset, this.offset);
    });
  },
  destroyed() {},
  methods: {
    typeFormatter(row, column) {
      let item = this.typeOptions.find((v) => v.value == row.type);
      return item ? item.label : "";
    },
    modelFormatter(row, column) {
      let item = this.modelOptions.find((v) => v.value == row.model);
      return item ? item.label : "";
    },
    init() {},
  },
};
</script>

<style lang="scss" scoped>
.TimetableDialog__bodyer {
  .row {
    height: calc(100vh - 200px);
    overflow-y: scroll;
    display: flex;
    justify-content: space-between;
    .col {
      box-sizing: border-box;
      padding: 10px;
      border-radius: 5px;
      width: calc(50% - 10px);
      background-color: #eee;
      ._title {
        font-size: 16px;
        font-weight: bold;
        text-align: center;
        margin-bottom: 20px;
      }
      ._content {
        font-size: 14px;
      }
    }
  }
}
</style>
