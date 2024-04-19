<template>
  <div>
    <Dialog :title="$l('Passengers At Stop')" visible @close="$emit('close')" left="center" width="900px">
      <div class="TransitLinesOnLink__bodyer"></div>
    </Dialog>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
.TransitLinesOnLink__bodyer {
  font-size: 14px;
  color: #606266;
  .row {
    line-height: 35px;
    display: flex;
    margin-bottom: 10px;
    .el-radio {
      line-height: 35px;
      display: block;
    }
    .button {
      background: #409eff;
      flex-shrink: 1;
      width: 30px;
      height: 32px;
    }
  }
}
</style>
