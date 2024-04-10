<template>
  <div class="Config_editer"></div>
</template>

<script>
import { basicSetup, EditorView } from "codemirror";
import { defaultKeymap } from "@codemirror/commands";
import { keymap } from "@codemirror/view";
import { Transaction, EditorState } from "@codemirror/state";

export default {
  mounted() {
    let startState = EditorState.create({
      doc: this.value,
      extensions: [basicSetup, keymap.of(defaultKeymap)],
    });
    this._myView = new EditorView({
      state: startState,
      parent: this.$el,
    });
  },
  destroyed() {
    this._myView.destroy();
  },
  methods: {
    setXml(val) {
      if (this._myView) {
        this._myView.dispatch({
          changes: { from: 0, to: this._myView.state.doc.length, insert: val },
        });
      }
    },
    getXml() {
      return this._myView.state.doc.toString();
    },
  },
};
</script>

<style lang="scss" scoped>
.Config_editer {
  background: #fff;
}
</style>
