<template>
  <el-dropdown class="PageConfig" @command="$emit($event)" placement="top-start" trigger="click">
    <div class="locale_btn"><img class="icon" src="" /> <span class="text">配置</span></div>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item command="import">导入</el-dropdown-item>
      <el-dropdown-item command="export">导出</el-dropdown-item>
      <el-dropdown-item command="save">保存到云端</el-dropdown-item>
      <el-dropdown-item command="load">从云端加载</el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
export default {
  name: "PageConfig",
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
