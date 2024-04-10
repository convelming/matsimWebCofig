<template>
  <el-select :value="s_value" @input="handleInput" filterable remote reserve-keyword :placeholder="$l('请输入关键词')" :remote-method="remoteMethod" :loading="loading">
    <el-option-group v-if="query && showCreate" :label="$l('新建线路')">
      <el-option :label="query" :value="-1"></el-option>
    </el-option-group>
    <el-option-group :label="$l('已有线路')">
      <el-option v-for="item in options" :key="item.lineId" :label="item.name" :value="item.lineId">
      </el-option>
    </el-option-group>
  </el-select>
</template>

<language>
{
  "请输入关键词": {
    "zh-CN":"请输入关键词",
    "en-US":"Please enter keyword"
  },
  "新建线路": {
    "zh-CN":"新建线路",
    "en-US":"Add line"
  },
  "已有线路": {
    "zh-CN":"已有线路",
    "en-US":"Existing lines"
  }
}
</language>

<script>
import { getByLineName } from "@/api/index";
export default {
  props: ["value", "label"],
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
      showCreate: false,
    };
  },
  mounted() {},
  methods: {
    handleInput(val) {
      if (val == -1) {
        this.$emit("input", -1);
        this.$emit("update:label", this.query);
        this.$emit("change", {
          value: -1,
          item: {
            lineId: -1,
            name: this.query,
          },
        });
      } else {
        let item = this.options.find((v) => v.lineId == val);
        this.s_value = item.lineId;
        this.$emit("input", item.lineId);
        this.$emit("update:label", item.name);
        this.$emit("change", { value: item.lineId, item: item });
      }
    },
    remoteMethod(query) {
      this.query = query;
      if (query !== "") {
        this.loading = true;
        getByLineName({
          name: query,
        }).then((res) => {
          this.loading = false;
          this.showCreate = !res.data.find((v) => v.name === query);
          this.options = res.data;
        });
      } else {
        this.options = [];
      }
    },
  },
};
</script>
