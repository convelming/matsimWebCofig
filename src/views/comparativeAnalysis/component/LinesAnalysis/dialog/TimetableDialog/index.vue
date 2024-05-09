<template>
  <div class="TimetableDialog">
    <Dialog ref="dialog" :title="$l('时刻表信息变动')" :visible="true" @close="$emit('close')" left="center" width="1300px">
      <div class="TimetableDialog__bodyer">
        <div class="row">
          <div class="col">
            <div class="_title">{{ $l("基础方案") }}</div>
            <div class="_content">
              <el-table v-loading="loading1" :data="oldList" height="calc(100vh - 250px)">
                <el-table-column :label="$l('vehicleId')" width="150" prop="vehicleId" />
                <el-table-column :label="$l('id')" prop="id" />
                <el-table-column :label="$l('departureTime')" width="180" prop="departureTime" :formatter="timeFormatter" />
              </el-table>
            </div>
          </div>
          <div class="col">
            <div class="_title">{{ $l("对比方案") }}</div>
            <div class="_content">
              <el-table v-loading="loading1" :data="newList" height="calc(100vh - 250px)">
                <el-table-column :label="$l('vehicleId')" width="150" prop="vehicleId" />
                <el-table-column :label="$l('id')" prop="id" />
                <el-table-column :label="$l('departureTime')" width="180" prop="departureTime" :formatter="timeFormatter" />
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
  "基础方案":{
    "zh-CN": "基础方案",
    "en-US": "基础方案"
  },
  "对比方案":{
    "zh-CN": "对比方案",
    "en-US": "对比方案"
  },
  "vehicleId":{
    "zh-CN": "vehicleId",
    "en-US": "vehicleId"
  },
  "id":{
    "zh-CN": "id",
    "en-US": "id"
  },
  "departureTime":{
    "zh-CN": "departureTime",
    "en-US": "departureTime"
  },
}
</language>

<script>
import { formatHour } from "@/utils/utils";
import { departureChangeInfo } from "@/api/contrast";

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
      loading1: false,
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
    timeFormatter(row) {
      return formatHour(row.departureTime);
    },
    init() {
      this.loading1 = true;
      const { database1, datasource1, database2, datasource2 } = this.$route.params;
      departureChangeInfo({
        name1: database1 + "/" + datasource1,
        name2: database2 + "/" + datasource2,
        routeId: this.form.routeId,
      }).then((res) => {
        this.oldList = res.data.before;
        this.newList = res.data.after;
        this.loading1 = false;
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.TimetableDialog__bodyer {
  .row {
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
