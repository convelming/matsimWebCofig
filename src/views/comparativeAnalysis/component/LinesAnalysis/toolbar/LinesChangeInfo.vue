<template>
  <el-collapse-item class="BusRoutes" :name="name">
    <div class="collapse_item_title" slot="title">{{ $l("线路比对分析") }}</div>
    <div class="_bodyer">
      <div class="title">{{ $l("修改的线路") }}</div>
      <el-table class="small" :data="[123]" border stripe>
        <el-table-column :label="$l('Id')" prop="id" show-overflow-tooltip />
        <el-table-column :label="$l('Name')" prop="name" show-overflow-tooltip />
        <el-table-column width="50">
          <el-dropdown slot-scope="{ row }" trigger="click" @command="handleRouteMenu({ data: row, command: $event })">
            <span class="el-dropdown-link el-icon-arrow-down el-icon--right" />
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-for="v in route_menu1" :key="v.value" :command="v.value">{{ $l(v.label) }}</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-table-column>
      </el-table>
      <div class="title">{{ $l("受影响的线路") }}</div>
      <el-table class="small" :data="[123]" border stripe>
        <el-table-column :label="$l('Id')" prop="id" show-overflow-tooltip />
        <el-table-column :label="$l('Name')" prop="name" show-overflow-tooltip />
        <el-table-column width="50">
          <el-dropdown slot-scope="{ row }" trigger="click" @command="handleRouteMenu({ data: row, command: $event })">
            <span class="el-dropdown-link el-icon-arrow-down el-icon--right" />
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-for="v in route_menu2" :key="v.value" :command="v.value">{{ $l(v.label) }}</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-table-column>
      </el-table>
    </div>
  </el-collapse-item>
</template>

<language>
{
  "线路比对分析":{
    "zh-CN": "线路比对分析",
    "en-US": "线路比对分析"
  },
  "修改的线路":{
    "zh-CN": "修改的线路",
    "en-US": "修改的线路"
  },
  "受影响的线路":{
    "zh-CN": "受影响的线路",
    "en-US": "受影响的线路"
  },
  "Id":{
    "zh-CN": "编号",
    "en-US": "Id"
  },
  "Name":{
    "zh-CN": "名称",
    "en-US": "Name"
  },
  "线路变动信息":{
    "zh-CN": "线路变动信息",
    "en-US": "线路变动信息"
  },
  "站点变动信息":{
    "zh-CN": "站点变动信息",
    "en-US": "站点变动信息"
  },
  "时刻表信息变动":{
    "zh-CN": "时刻表信息变动",
    "en-US": "时刻表信息变动"
  },
  "Xml信息对比":{
    "zh-CN": "Xml信息对比",
    "en-US": "Xml信息对比"
  },
  "客流信息变化":{
    "zh-CN": "客流信息变化",
    "en-US": "客流信息变化"
  },
}
</language>

<script>
export default {
  name: "BusRoutes",
  inject: ["rootVue"],
  props: {
    name: {
      type: String,
    },
    show: {
      type: Boolean,
      default: false,
    },
  },
  components: {},
  computed: {},
  watch: {
    show: {
      handler(val) {
        if (val) {
          setTimeout(() => {
            this.rootVue.$emit("setSelectedBuild", this.buildDetail);
          }, 200);
        } else {
          this.rootVue.$emit("setSelectedBuild", {});
        }
      },
      immediate: true,
    },
  },
  data() {
    return {
      loading: true,
      route_menu1: [
        { value: "线路变动信息", label: "线路变动信息" },
        { value: "站点变动信息", label: "站点变动信息" },
        { value: "时刻表信息变动", label: "时刻表信息变动" },
        { value: "Xml信息对比", label: "Xml信息对比" },
        { value: "客流信息变化", label: "客流信息变化" },
      ],
      route_menu2: [{ value: "客流信息变化", label: "客流信息变化" }],
    };
  },
  created() {
    this.getDetail();
  },
  mounted() {},
  methods: {
    getDetail() {},
    handleRouteMenu({ data, command }) {
      switch (command) {
        case "线路变动信息":
          break;
        case "站点变动信息":
          break;
        case "时刻表信息变动":
          break;
        case "Xml信息对比":
          break;
        case "客流信息变化":
          break;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.BusRoutes {
  font-size: 13px;
  .collapse_item_title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0 20px;
  }
  ._bodyer {
    padding: 0 20px;
    .title {
      font-size: 18px;
      font-weight: bold;
      margin: 20px 0;
    }
    .form {
      width: 100%;

      .form_item {
        width: 100%;
        display: flex;
        & + .form_item {
          margin-top: 10px;
        }
        .form_label {
          flex-shrink: 0;
          padding-right: 10px;
        }
        .form_value {
          width: 100%;
        }
      }
    }
    .path {
      padding-top: 10px;
      svg {
        width: 100%;
        height: auto;
        max-height: 300px;
        margin: auto;
        transform: rotateX(180deg);
      }
    }
  }
}
</style>
