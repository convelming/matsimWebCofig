<!-- menu -->
<template>
  <div class="menu">
    <template v-for="item in demoPage">
      <a class="button" :href="`#${item.path}`" target="_blank">{{ item.name }} —— {{ item.title }}</a>
    </template>
    <a class="button" :href="`http://192.168.60.234:8088/`" target="_blank">OSM 地图样式配置</a>
    <a class="button" :href="`http://192.168.60.234:8081/`" target="_blank">OSM TileServer</a>
    <a class="button" :href="`http://192.168.60.231:23105/pt.html#/operationsAnalysis/%E5%B9%BF%E5%B7%9E/nscard0920`" target="_blank">matsim 航路自动划设</a>
  </div>
</template>

<script>
import { demoPage } from "@/router";
export default {
  name: "menu",
  props: {},
  components: {},
  computed: {},
  watch: {},
  data() {
    return {
      demoPage,
    };
  },
  created() {},
  mounted() {},
  methods: {},
};
</script>

<style lang="scss" scoped>
.menu {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  .button {
    text-align: center;
    text-decoration: none;
    color: #000;
    border-radius: 5px;
    border: 1px solid #ccc;
    padding: 10px 20px;
    cursor: pointer;
    &:hover {
      background-color: #eee;
    }
  }
}
</style>
