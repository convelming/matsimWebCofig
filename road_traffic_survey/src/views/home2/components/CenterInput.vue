<template>
  <el-input
    style="width: 100%"
    v-model="center"
    size="small"
    placeholder="经纬度"
    @change="handleInput"
  >
    <el-select
      style="width: 90px"
      v-model="centerType"
      slot="prepend"
      placeholder="请选择"
      @change="handleChangeCenter"
    >
      <el-option label="经纬度" :value="1"></el-option>
      <el-option label="墨卡托" :value="2"></el-option>
    </el-select>
  </el-input>
</template>

<script>
import { WGS84ToMercator, MercatorToWGS84 } from "@/mymap/utils/LngLatUtils";
export default {
  props: {
    value: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      center: "",
      centerType: 1,
    };
  },
  computed: {
    s_value() {
      let list = this.center.split(",").map((v) => Number(v));
      if (this.centerType == 1) {
        return WGS84ToMercator(...list);
      } else if (this.centerType == 2) {
        return list;
      }
    },
  },
  watch: {
    value: {
      handler() {
        this.handleChangeCenter();
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    handleInput() {
      this.$emit("input", this.s_value);
      this.$emit("change", this.s_value);
    },
    handleChangeCenter() {
      let list = this.value;
      if (this.centerType == 1) {
        list = MercatorToWGS84(...this.value);
        list = list.map((v) => Math.ceil(v * 100000) / 100000);
      }else if (this.centerType == 2) {
        list = list.map((v) => Math.ceil(v * 100) / 100);
      }
      this.center = list.join(",");
    },
  },
};
</script>

<style>
</style>