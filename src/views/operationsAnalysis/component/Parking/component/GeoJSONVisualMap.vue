<template>
  <div class="GeoJSONVisualMap">
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
  computed: {},
  watch: {
    colors: {
      handler(val) {
        this.handleUpdate();
      },
      deep: true,
      immediate: true,
    },
    max: {
      handler(val) {
        this.handleUpdate();
      },
      deep: true,
      immediate: true,
    },
    min: {
      handler(val) {
        this.handleUpdate();
      },
      deep: true,
      immediate: true,
    },
  },
  data() {
    return {
      list: [],
    };
  },
  created() {},
  mounted() {},
  methods: {
    handleUpdate() {
      if (!this.colors) return;
      const d = this.max - this.min;
      const obj = {};
      ColorBar2D.getDrowColors(this.colors).forEach(({ key, color }, i, l) => {
        console.log(l);
        if (!obj[color]) {
          obj[color] = { min: key * d + this.min, color: color, max: this.min };
        } else {
          obj[color].max = key * d + this.min;
        }
      });
      const list = Object.values(obj).sort((a, b) => a.min - b.min);
      this.list = list;
      console.log(list);
    },
  },
};
</script>

<style lang="scss" scoped>
.GeoJSONVisualMap {
  z-index: 9999;
  position: fixed;
  padding: 20px;
  background-color: rgba($color: #000000, $alpha: 0.5);
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
