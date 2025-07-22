<template>
  <el-select
    :value="s_value"
    @input="handleInput"
    filterable
    remote
    reserve-keyword
    placeholder="请输入关键词"
    :remote-method="remoteMethod"
    :loading="loading"
    :size="size"
  >
    <el-option
      v-for="item in options"
      :key="item.id"
      :label="item.name"
      :value="item.id"
    >
    </el-option>
  </el-select>
</template>

<script>
import { getLinkById } from "@/api/index";
export default {
  props: ["value", "label", "size"],
  watch: {
    value: {
      handler(val) {
        if (val !== this.s_value) {
          this.s_value = val;
        }
      },
    },
  },
  data() {
    return {
      options: [],
      s_value: null,
      loading: false,
    };
  },
  mounted() {},
  methods: {
    handleInput(val) {
      let item = this.options.find((v) => v.id == val);
      this.s_value = item.id;
      this.$emit("input", item.id);
      this.$emit("update:label", item.name);
      this.$emit("change", { value: item.id, item: item });
    },
    remoteMethod(query) {
      if (query !== "") {
        this.loading = true;
        getLinkById({
          id: query,
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