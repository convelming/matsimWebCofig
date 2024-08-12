<template>
  <div class="SreachStopRoute">
    <div class="select_box">
      <el-select class="type_select" v-model="sreachType" size="small" @change="handleChangeType">
        <el-option :label="$l('stop')" value="stop"> </el-option>
        <el-option :label="$l('route')" value="route"> </el-option>
      </el-select>
      <el-select class="value_select" v-model="s_value" @change="handleChangeValue" filterable remote reserve-keyword :placeholder="$l('请输入关键词')" :remote-method="remoteMethod" :loading="loading" size="small">
        <template v-if="this.sreachType == 'stop'">
          <el-option v-for="item in options" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </template>
        <template v-if="this.sreachType == 'route'">
          <el-option v-for="item in options" :key="item.routeId" :label="item.routeId" :value="item.routeId"></el-option>
        </template>
      </el-select>
    </div>
  </div>
</template>

<language>
{
  "请输入关键词": {
    "zh-CN":"请输入关键词",
    "en-US":"Please enter keyword"
  },
  "stop": {
    "zh-CN":"站点",
    "en-US":"stop"
  },
  "route": {
    "zh-CN":"线路",
    "en-US":"route"
  },
}
</language>

<script>
import { getStopByName, getRouteByName } from "@/api/index";
export default {
  props: ["value", "label"],
  inject: ["rootVue"],
  watch: {
    value: {
      handler(val) {
        if (val !== this.s_value) {
          this.s_value = val;
        }
      },
      immediate: true,
    },
  },
  data() {
    return {
      options: [],
      s_value: null,
      loading: false,
      query: "",
      sreachType: "stop",
    };
  },
  mounted() {},
  methods: {
    handleChangeValue(val) {
      if (this.sreachType == "stop") {
        let item = this.options.find((v) => v.id == val);
        this.rootVue.handleShowStopDetailByStopData(item);
      } else if (this.sreachType == "route") {
        let item = this.options.find((v) => v.routeId == val);
        this.rootVue.handleShowRouteDetail(item.routeId);
      }
    },
    handleChangeType() {
      this.options = [];
      this.s_value = "";
      this.query = "";
    },
    remoteMethod(query) {
      this.query = query;
      if (query) {
        this.loading = true;
        if (this.sreachType == "stop") {
          getStopByName({
            name: query,
          }).then((res) => {
            this.loading = false;
            this.options = res.data;
          });
        } else if (this.sreachType == "route") {
          getRouteByName({
            name: query,
          }).then((res) => {
            this.loading = false;
            this.options = res.data;
          });
        }
      } else {
        this.options = [];
      }
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep {
  .el-select {
    .el-input__inner {
      border: 0;
      border-radius: 0;
    }
  }
}
.SreachStopRoute {
  position: relative;
  z-index: 20px;
  padding: 10px 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);

  .select_box {
    overflow: hidden;
    display: flex;
    align-items: center;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
    .type_select {
      width: 80px;
    }
    .value_select {
      width: calc(100% - 80px);
    }
  }
}
</style>
