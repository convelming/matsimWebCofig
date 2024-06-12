<template>
  <el-select :value="s_value" @input="handleInput" filterable remote reserve-keyword :placeholder="$l('请输入关键词')" :remote-method="remoteMethod" :loading="loading">
    <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
  </el-select>
</template>

<language>
{
  "请输入关键词": {
    "zh-CN":"请输入关键词",
    "en-US":"Please enter keyword"
  },
}
</language>

<script>
export default {
  props: ["value"],
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
      list: [],
      loading: false,
    };
  },
  methods: {
    handleInput(val) {
      this.s_value = val;
      this.$emit("input", val);
      this.$emit("change", val);
    },
    remoteMethod(query) {
      if (query !== "") {
        this.loading = true;
        setTimeout(() => {
          this.loading = false;
          this.options = this.list.filter((item) => {
            return item.label.toLowerCase().indexOf(query.toLowerCase()) > -1;
          });
        }, 200);
      } else {
        this.options = [];
      }
    },
  },
};
</script>
