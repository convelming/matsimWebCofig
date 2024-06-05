<template>
  <!-- bidirectional data binding（双向数据绑定） -->
  <div class="Config_editer">
    <codemirror ref="myCm" v-model="code" :options="cmOptions"></codemirror>
  </div>
</template>

<script>
// require component
import codemirror from "@/components/vue-codemirror/index.vue";
// require styles
import "codemirror/lib/codemirror.css";

// require more codemirror resource...

export default {
  components: {
    codemirror,
  },
  data() {
    return {
      code: "",
      cmOptions: {
        // codemirror options
        tabSize: 2,
        mode: "xml",
        theme: "default",
        lineNumbers: true,
        line: true,
        //快捷键
        extraKeys: {
          F7: function autoFormat(editor) {
            var totalLines = editor.lineCount();
            editor.autoFormatRange({ line: 0, ch: 0 }, { line: totalLines });
          }, //代码格式化
        },
      },
    };
  },
  methods: {
    setXml(val) {
      this.code = val;
      this.$nextTick(() => {
        var totalLines = this.codemirror.lineCount();
        this.codemirror.autoFormatRange({ line: 0, ch: 0 }, { line: totalLines });
      });
    },
    getXml() {
      return this.code;
    },
  },
  computed: {
    codemirror() {
      return this.$refs.myCm.codemirror;
    },
  },
  mounted() {
    console.log("this is current codemirror object", this.codemirror);
    console.log(this.$refs.myCm);
    // you can use this.codemirror to do something...
  },
};
</script>

<style lang="scss" scoped>
::v-deep {
  .CodeMirror {
    height: calc(100vh - 170px);
  }
}
</style>
