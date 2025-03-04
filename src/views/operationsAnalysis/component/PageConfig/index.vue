<template>
  <el-dropdown class="PageConfig" @command="changePageConfig" placement="top-start" trigger="click">
    <div class="locale_btn"><img class="icon" src="" /> <span class="text">配置</span></div>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item command="导入">导入</el-dropdown-item>
      <el-dropdown-item command="导出">导出</el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
export default {
  name: "PageConfig",
  props: {},
  components: {},
  computed: {},
  watch: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  methods: {
    changePageConfig(command) {
      if (command === "导入") {
        this.$emit("import");
      } else if (command === "导出") {
        this.$emit("export");
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.PageConfig {
  .locale_btn {
    flex-shrink: 0;
    width: 70px;
    cursor: pointer;
    height: 32px;
    border: 1px solid #e5e5e5;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 4px;

    .icon {
      width: 24px;
      height: 24px;
      margin-right: 5px;
    }

    .text {
      font-weight: 400;
      font-size: 14px;
      color: #434343;
      line-height: 20px;
    }
  }
}
</style>
