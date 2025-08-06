<!-- Sector -->
<template>
  <svg class="Sector" :width="size" :height="size">
    <defs>
      <slot name="defs"></slot>
    </defs>
    <circle :cx="size / 2" :cy="size / 2" :r="size / 4" fill-opacity="0" :stroke="color" :stroke-width="size / 2" :stroke-dasharray="strokeDasharray" />
  </svg>
</template>

<script>
export default {
  name: "Sector",
  props: {
    size: { type: Number, default: 100 },
    number: { type: Number, default: 0.5 },
    color: { type: String, default: "red" },
  },
  components: {},
  computed: {
    strokeDasharray() {
      let s = (this.number * Math.PI * 2 * this.size) / 4;
      let e = ((Math.PI * this.size) / 4) * 2;
      return `${s} ${e}`;
    },
  },
  watch: {},
  data() {
    return {};
  },
  created() {
    console.log(this.$slots);
  },
  mounted() {},
  methods: {},
};
</script>

<style lang="scss" scoped>
.Sector {
  transform: rotate(-90deg);
}
</style>
