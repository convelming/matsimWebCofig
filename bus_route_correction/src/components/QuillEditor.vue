<!-- QuillEditor -->
<template>
  <div class="QuillEditor"></div>
</template>

<script>
import Quill from "quill";

import "quill/dist/quill.core.css"; // 核心样式
// import "quill/dist/quill.bubble.css"; // 气泡式布局
import "quill/dist/quill.snow.css"; // 类似于雪地或者高对比度的视觉风格

export default {
  name: "QuillEditor",
  props: {},
  components: {},
  computed: {},
  watch: {},
  data() {
    return {};
  },
  created() {
    this._quillEL = document.createElement("div");
    this._quill = new Quill(_quillEL, {
      // debug: "info",
      modules: {
        // toolbar: true,
      },
      placeholder: "Compose an epic...",
      theme: "snow",
    });
  },
  mounted() {
    console.log(this._quill);
  },
  beforeDestroy() {
    console.log("beforeDestroy", this._quill);
    this._quill = null;
    this.$el.removeChild();
  },
  methods: {},
};
</script>

<style lang="scss" scoped>
.QuillEditor {
  line-height: 1;
}
</style>
