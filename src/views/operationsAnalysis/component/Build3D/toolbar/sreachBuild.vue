<template>
  <div class="SreachBuild">
    <el-select class="value_select" v-model="s_value" @change="handleChangeValue" filterable remote reserve-keyword :placeholder="$l('请输入关键词')" :remote-method="remoteMethod" :loading="loading" size="small">
      <el-option v-for="item in options" :key="item.id" :label="item.name" :value="item.id"></el-option>
    </el-select>
  </div>
</template>

<language>
{
  "请输入关键词": {
    "zh-CN":"请输入关键词",
    "en-US":"Please enter facility ID"
  },
}
</language>

<script>
import { getFacilitiesByName } from "@/api/index";
import { guid } from "@/utils/utils";
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
      let item = this.options.find((v) => v.id == val);
      this.rootVue.handleShowBuildDetail({
        uuid: guid(),
        buildDetail: item,
      });
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
        getFacilitiesByName({
          name: query,
        }).then((res) => {
          this.loading = false;
          this.options = res.data;
        });
      } else {
        this.options = [];
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.SreachBuild {
  position: relative;
  z-index: 20px;
  padding: 10px 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
  .el-select {
    width: 100%;
  }
}
</style>
