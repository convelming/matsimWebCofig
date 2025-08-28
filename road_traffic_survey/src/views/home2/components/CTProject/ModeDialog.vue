<!-- ModeDialog -->
<template>
  <Dialog title="项目名称" class="ModeDialog" :top="20" :left="20" width="500px" hideMinimize :visible="visible" @close="handleClose">
    <el-form label-width="70px" :inline="false" size="mini">
      <el-form-item label="">
        <!-- 输入模式直接弹窗 LineFlow -->
        <el-button type="primary" size="mini" @click="$emit('inputMode')">输入模式</el-button>
        <el-button type="primary" size="mini" @click="$emit('drawingMode')">出图模式</el-button>
      </el-form-item>
      <el-form-item label="注：">
        <div><span style="color: red">输入模式</span>为录入交评重点路段的数据，<span style="color: red">请确保数据准确性。</span></div>
        <div><span style="color: red">出图模式</span>中的数据仅为保证出图效果，<span style="color: red">仅在本项目中使用。</span></div>
      </el-form-item>
    </el-form>
  </Dialog>
</template>

<script>
import { PolygonSelectLayer, POLYGON_SELECT_STATE_KEY, POLYGON_SELECT_EVENT } from "../../layer/PolygonSelectLayer";
import { projectList, projectInsert, projectDelete, projectAddSample, projectQuerySample } from "@/api/index";
import { selectFile } from "@/utils/index";
export default {
  name: "AddDialog",
  inject: ["rootVue"],
  props: {
    visible: {
      type: Boolean,
    },
  },
  components: {},
  computed: {
    _Map() {
      return this.rootVue._Map;
    },
  },
  watch: {
    visible: {
      handler(val) {
        this.s_visible = val;
        if (val) {
          this.handleEnable();
        } else {
          this.handleDisable();
        }
      },
    },
  },
  data() {
    return {
      s_visible: false,
    };
  },
  created() {
    this.s_visible = this.visible;
  },
  mounted() {
    this._interval = setInterval(() => {
      if (!this._Map) return;
      clearInterval(this._interval);
      if (this.s_visible) {
        this.handleEnable();
      }
    }, 1000);
  },
  methods: {
    handleEnable() {},
    handleDisable() {},
    handleClose() {
      this.$emit("update:visible", false);
      this.$emit("close");
    },
  },
};
</script>

<style lang="scss" scoped>
.ModeDialog {
}
</style>
