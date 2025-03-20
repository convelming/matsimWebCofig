<template>
  <div class="BinningColors">
    <div class="BinningColors_item" v-for="(v, i) in list" :key="i">
      <div class="BinningColors_color" :style="`background:${v.color}`"></div>
      <div class="BinningColors_text">{{ v.value }}</div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      colors: [],
      minValue: 0,
      maxValue: 0,
    };
  },
  computed: {
    list() {
      const list = [];
      const { minValue, maxValue } = this;
      const step = (maxValue - minValue) / this.colors.length;
      for (let i = 0, l = this.colors.length; i < l; i++) {
        const _minValue = Number(minValue + i * step).toFixed(3);
        const _maxValue = Number(minValue + (i + 1) * step).toFixed(3);
        let value = `${_minValue} ~ ${_maxValue}`;
        if (i >= l - 1) {
          value = `${_minValue} <`;
        }
        list.push({
          value: value,
          color: this.colors[i],
        });
      }
      return list;
    },
  },
};
</script>

<style lang="scss" scoped>
.BinningColors {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 20;
  padding: 10px;
  border-radius: 8px;
  background: #000000a6;
  box-shadow: 0 0px 15px rgba(255, 255, 255, 0.8);
  .BinningColors_item {
    display: flex;
    align-items: center;
    & + .BinningColors_item {
      margin-top: 5px;
    }
    .BinningColors_color {
      width: 30px;
      height: 20px;
      border-radius: 4px;
    }
    .BinningColors_text {
      padding-left: 10px;
      white-space: nowrap;
      font-size: 14px;
      color: #fff;
    }
  }
}
</style>
