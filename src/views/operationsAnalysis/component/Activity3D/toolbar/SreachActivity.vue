<template>
  <div class="SreachActivity">
    <el-select class="value_select" v-model="s_value" @change="handleChangeValue" filterable remote reserve-keyword :placeholder="$l('请输入PersonID')" :remote-method="remoteMethod" :loading="loading" size="small">
      <el-option v-for="item in options" :key="item" :label="item" :value="item"></el-option>
    </el-select>
  </div>
</template>

<language>
{
  "请输入PersonID": {
    "zh-CN":"请输入PersonID",
    "en-US":"Please enter person ID"
  },
}
</language>

<script>
import { getPersonList } from "@/api/index";
import { guid } from "@/utils/index";

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
      this.rootVue.handleShowActivityDetail({
        uuid: guid(),
        activityDetail: {
          personId: val,
          _form_type: "sreach",
        },
      });
    },
    remoteMethod(query) {
      this.query = query;
      if (query) {
        this.loading = true;
        getPersonList({
          personId: query,
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
.SreachActivity {
  position: relative;
  z-index: 20px;
  padding: 10px 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
  .el-select {
    width: 100%;
  }
}
</style>
