<template>
  <left v-if="direction == 'left'" v-bind="$attrs" v-on="$listeners">
    <slot></slot>
  </left>
  <right v-else-if="direction == 'right'" v-bind="$attrs" v-on="$listeners">
    <slot></slot>
  </right>
  <bottom v-else-if="direction == 'bottom'" v-bind="$attrs" v-on="$listeners">
    <slot></slot>
  </bottom>
  <top v-else-if="direction == 'top'" v-bind="$attrs" v-on="$listeners">
    <slot></slot>
  </top>
</template>

<script>
import left from "./left.vue";
import right from "./right.vue";
import bottom from "./bottom.vue";
import top from "./top.vue";

export default {
  components: {
    left,
    right,
    bottom,
    top,
  },
  props: {
    direction: {
      type: String,
      default: "left",
    },
  },
};
</script>

<style lang="scss">
.Drawer_row {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-rows: 100%;
}
.Drawer_col {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 100%;
  grid-auto-rows: auto 1fr auto;
}
</style>

<style lang="scss">
.Drawer {
  position: relative;
  box-sizing: border-box;
  .content {
    &::-webkit-scrollbar {
      display: none;
    }
    overflow-y: auto;
    overflow-x: hidden;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
    box-sizing: border-box;
  }
  .bar {
    position: absolute;
    z-index: 20;
    background-color: #e0e0e0;
    display: flex;
    align-items: center;
    justify-content: center;
    .show_btn {
      position: relative;
      cursor: pointer;
      display: block;
      height: 40px;
      width: var(--bar-size);
      flex-shrink: 0;
      background: #fff;
      border-radius: calc(var(--bar-size) / 4);
      &::before {
        position: absolute;
        box-sizing: border-box;
        top: 50%;
        left: 67%;
        content: "";
        display: block;
        border-left: 2px solid #000;
        border-bottom: 2px solid #000;
        width: calc(var(--bar-size) - 2px);
        height: calc(var(--bar-size) - 2px);
        transform-origin: center;
        transform: translate(-50%, -50%) rotate(45deg);
      }
    }
  }
}
</style>
