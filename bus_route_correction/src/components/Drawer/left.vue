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
};
</script>

<style lang="scss" scoped>
.Drawer {
  width: var(--drawer-size);
  margin-right: var(--bar-size);
  .content {
    // margin-right: var(--bar-size);
  }
  .bar {
    right: calc(-1 * var(--bar-size));
    top: 0;
    height: 100%;
    width: var(--bar-size);
    cursor: ew-resize;

    .show_btn {
      transform: rotate(0deg);
      &.hide {
        transform: rotate(180deg);
      }
    }
  }
}
</style>
