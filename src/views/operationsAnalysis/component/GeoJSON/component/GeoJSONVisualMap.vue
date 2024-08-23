<template>
  <div class="GeoJSONVisualMap" @mousedown="startMove" :style="s_style">
    <div class="item" v-for="(item, index) in list" :key="index">
      <div class="text">{{ Number(Number(item.min).toFixed(4)) }} ~~ {{ Number(Number(item.max).toFixed(4)) }}</div>
      <div class="color" :style="{ backgroundColor: item.color }"></div>
    </div>
  </div>
</template>

<script>
import { ColorBar2D } from "@/mymap/utils/ColorBar2D";

export default {
  name: "GeoJSONVisualMap",
  props: {
    colors: {
      type: [Object, Array],
      // default: () => ["#313695", "#74add1", "#e0f3f8", "#ffffbf", "#fdae61", "#f46d43", "#a50026"],
      default: () => ({
        "#313695": [0, 0.4],
        "#74add1": [0.4, 0.6],
        "#e0f3f8": [0.6, 0.75],
        "#ffffbf": [0.75, 0.85],
        "#fdae61": [0.85, 0.95],
        "#f46d43": [0.95, 1.0],
      }),
    },
    max: {
      type: Number,
      default: 100,
    },
    min: {
      type: Number,
      default: 0,
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
  watch: {
    colors: {
      handler(val) {
        this.handleUpdate();
      },
      deep: true,
    },
    max: {
      handler(val) {
        this.handleUpdate();
      },
      deep: true,
    },
    min: {
      handler(val) {
        this.handleUpdate();
      },
      deep: true,
    },
  },
  data() {
    return {
      list: [],
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
  created() {
    this.handleUpdate();
  },
  mounted() {
    document.body.appendChild(this.$el);
  },
  destroyed() {
    if (this.$el && this.$el.parentNode) {
      this.$el.parentNode.removeChild(this.$el);
    }
  },
  methods: {
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
    handleUpdate() {
      if (!this.colors) return;
      const d = this.max - this.min;
      const obj = {};
      ColorBar2D.getDrowColors(this.colors).forEach(({ key, color }, i, l) => {
        if (!obj[color]) {
          obj[color] = { min: key * d + this.min, color: color, max: this.min };
        } else {
          obj[color].max = key * d + this.min;
        }
      });
      const list = Object.values(obj).sort((a, b) => a.min - b.min);
      this.list = list;
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
  background-color: rgba($color: #000000, $alpha: 0.8);
  border-radius: 5px;
  .item {
    line-height: 30px;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    .text {
      color: #fff;
      margin-right: 10px;
    }
    .color {
      width: 20px;
      height: 15px;
    }
  }
}
</style>
