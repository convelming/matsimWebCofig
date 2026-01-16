<!-- BeiAnBox -->
<template>
  <div class="BeiAnBox">
    <!-- <a id="sb_MMAIS" target="_blank" href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=11010802022657" h="ID=SERP,5070.1">京公网安备11010802022657号</a> -->
    <a href="http://beian.miit.gov.cn/" target="_blank">粤ICP备2026005836号</a>
  </div>
</template>

<script>
export default {
  name: "BeiAnBox",
  props: {},
  components: {},
  computed: {},
  watch: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  methods: {},
};
</script>

<style lang="scss" scoped>
.BeiAnBox {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 40px;
  gap: 15px;
  a {
    text-decoration: underline;
    color: var(--color-white);
    font-size: 14px;
  }
}
</style>
