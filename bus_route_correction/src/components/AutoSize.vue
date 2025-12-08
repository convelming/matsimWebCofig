<!-- AutoSize -->
<template>
  <div ref="AutoSize" class="AutoSize">
    <slot :width="width" :height="height"></slot>
  </div>
</template>

<script>
export default {
  name: "AutoSize",
  props: {},
  components: {},
  computed: {},
  watch: {},
  data() {
    return {
      width: 0,
      height: 0,
    };
  },
  created() {},
  mounted() {
    const el = this.$refs.AutoSize;
    this._resize = new ResizeObserver((entries) => {
      // 节流
      if (this._setSizeTimeout) return;
      this._setSizeTimeout = setTimeout(() => {
        this.width = el.clientWidth;
        this.height = el.clientHeight;
        this._setSizeTimeout = null;
      }, 1000 / 120);
    }).observe(el);
  },
  destroyed() {
    if (this._resize) this._resize.disconnect();
  },
};
</script>

<style lang="scss" scoped>
.AutoSize.flex-w {
  flex: 1;
  width: 0;
}
.AutoSize.flex-h {
  flex: 1;
  height: 0;
}
</style>
