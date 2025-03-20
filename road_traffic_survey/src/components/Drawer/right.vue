<template>
  <div class="Drawer" :style="s_style">
    <div class="content">
      <slot></slot>
    </div>
    <div class="bar" @mousedown="startMove">
      <div class="show_btn" :class="{ hide: !s_show }" @click.stop="handleShow(!s_show)" @mousedown.stop></div>
    </div>
  </div>
</template>

<script>
import mixins from "./mixins";
export default {
  mixins: [mixins],
  methods: {
    getMsize() {
      return this._startEvent.pageX - this._moveEvent.pageX;
    },
  },
};
</script>

<style lang="scss" scoped>
.Drawer {
  width: var(--drawer-size);
  margin-left: var(--bar-size);
  .content {
    // margin-left: var(--bar-size);
  }
  .bar {
    left: calc(-1 * var(--bar-size));
    bottom: 0;
    height: 100%;
    width: var(--bar-size);
    cursor: ew-resize;
    .show_btn {
      transform: rotate(180deg);
      &.hide {
        transform: rotate(0deg);
      }
    }
  }
}
</style>
