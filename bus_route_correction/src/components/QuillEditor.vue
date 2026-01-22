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
  props: {
    placeholder: String,
  },
  components: {},
  computed: {},
  watch: {},
  data() {
    return {};
  },
  mounted() {
    this._quillEl = document.createElement("div");
    this._quill = new Quill(this._quillEl, {
      // debug: "info",
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          [{ size: ["small", false, "large", "huge"] }], // custom dropdown
          [{ font: [] }],

          ["bold", "italic", "underline", "strike"], // toggled buttons
          [{ align: [] }],
          ["blockquote", "code-block"],

          [{ list: "ordered" }, { list: "bullet" }],
          [{ script: "sub" }, { script: "super" }], // superscript/subscript
          [{ indent: "-1" }, { indent: "+1" }], // outdent/indent

          [{ color: [] }, { background: [] }], // dropdown with defaults from theme

          ["clean"],
        ],
      },
      placeholder: this.placeholder,
      theme: "snow",
    });
    this._toolbarEl = this._quill.getModule("toolbar")?.container;
    this.$el.appendChild(this._toolbarEl);
    this.$el.appendChild(this._quillEl);
  },
  beforeDestroy() {
    this.$el.innerHTML = "";
    this._toolbarEl = null;
    this._quillEl = null;
    this._quill = null;
  },
  methods: {
    getHTML() {
      const html = this._quill?.root.innerHTML || "";
      const htmlStr = html.replace(/<[^>]+>/g, "").replace(/&[^&]+;/g, "");
      if (!htmlStr) {
        return "";
      } else {
        return html;
      }
    },
    setHTML(html) {
      if (this._quill) this._quill.root.innerHTML = html;
    },
  },
};
</script>

<style lang="scss">
.QuillEditor {
  line-height: 1;
  .ql-container {
    height: 180px;
  }
}
</style>
