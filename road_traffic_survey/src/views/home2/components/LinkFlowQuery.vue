<!-- LinkFlowQuery -->
<template>
  <Dialog class="LinkFlowQueryDialog" title="道路路段-数据查询" :top="20" :left="20" width="300px" hideMinimize :visible="visible" @close="handleClose">
    <div class="LinkFlowQuery">
      <el-form ref="form" label-width="100px" label-position="left" :inline="false" size="mini">
        <el-form-item label="单路段查询">
          <el-button type="primary" size="mini" @click="$emit('clickSelect')">开始点选</el-button>
        </el-form-item>
        <el-form-item label="区域查询">
          <el-button type="primary" size="mini" @click="$emit('FrameSelect')">开始框选</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="mini" @click="handleClose">返回</el-button>
        </el-form-item>
      </el-form>
    </div>
  </Dialog>
</template>

<script>
export default {
  name: "LinkFlowQuery",
  props: {
    visible: {
      type: Boolean,
    },
  },
  components: {},
  computed: {},
  watch: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  methods: {
    handleClose() {
      this.$emit("update:visible", false);
      this.$emit("close");
    },
  },
};
</script>

<style lang="scss" scoped>
.LinkFlowQuery {
}
</style>
