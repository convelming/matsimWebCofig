<template>
  <div class="Drawer" :class="{ animation: !!animation }" :style="s_style">
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
      return this._moveEvent.pageY - this._startEvent.pageY;
    },
  },
};
</script>

<style lang="scss" scoped>
.Drawer {
  height: var(--drawer-size);
  margin-bottom: var(--bar-size);
  .content {
    // margin-bottom: var(--bar-size);
  }
  .bar {
    left: calc(-1 * var(--bar-size));
    bottom: 0;
    width: 100%;
    height: var(--bar-size);
    cursor: ns-resize;

    .show_btn {
      transform: rotate(90deg);
      &.hide {
        transform: rotate(-90deg);
      }
    }
  }
}
.animation {
  transition: height 0.3s;
}
</style>
