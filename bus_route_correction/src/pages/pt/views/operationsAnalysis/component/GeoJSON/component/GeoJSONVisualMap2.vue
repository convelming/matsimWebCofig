<template>
  <div class="GeoJSONVisualMap" @mousedown="startMove" :style="s_style">
    <template v-for="(item, index) in list">
      <div class="item" :key="index" v-if="item.use">
        <div class="text">{{ item.label }}</div>
        <div class="color" :style="{ backgroundColor: item.color }"></div>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: "GeoJSONVisualMap",
  props: {
    list: {
      type: Array,
      default: () => [],
    },
  },
  components: {},
  computed: {
    s_style() {
      let style = "";
      style += `top:calc(${this.s_top}px + ${this.moveObj.top || 0}px);`;
      style += `left:calc(${this.s_left}px + ${this.moveObj.left || 0}px);`;
      return style;
    },
  },
  data() {
    return {
      s_top: 0,
      s_left: 0,

      moveObj: {
        s_top: 0,
        s_left: 0,
        top: 0,
        left: 0,
      },
    };
  },
  created() {},
  mounted() {
    document.body.appendChild(this.$el);
  },
  destroyed() {
    if (this.$el && this.$el.parentNode) {
      this.$el.parentNode.removeChild(this.$el);
    }
  },
  methods: {
    toFixed(data, size) {
      let a = Math.pow(10, size);
      let res = Math.round(Number(data) * a) / a;
      return res;
    },
    startMove(event) {
      this.moveObj = {
        s_top: event.pageY,
        s_left: event.pageX,
        top: 0,
        left: 0,
      };
      document.body.addEventListener("mousemove", this.moveing);
      document.body.addEventListener("mouseup", this.endMove);
      document.body.addEventListener("mouseleave", this.endMove);
    },
    moveing(event) {
      this.moveObj.top = event.pageY - this.moveObj.s_top;
      this.moveObj.left = event.pageX - this.moveObj.s_left;
    },
    endMove(event) {
      this.s_top += this.moveObj.top;
      this.s_left += this.moveObj.left;
      this.moveObj = {
        s_top: 0,
        s_left: 0,
        top: 0,
        left: 0,
      };
      document.body.removeEventListener("mousemove", this.moveing);
      document.body.removeEventListener("mouseleave", this.endMove);
    },
  },
};
</script>

<style lang="scss" scoped>
.GeoJSONVisualMap {
  cursor: move;
  user-select: none;
  z-index: 9999;
  position: fixed;
  top: 0;
  left: 0;
  padding: 5px 10px;
  background-color: rgb(from var(--color-black) r g b / 0.8);
  border-radius: 5px;
  .item {
    line-height: 30px;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    .text {
      color: var(--color-white);
      margin-right: 10px;
    }
    .color {
      width: 20px;
      height: 15px;
    }
  }
}
</style>
