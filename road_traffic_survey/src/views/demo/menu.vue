<!-- menu -->
<template>
  <div class="menu">
    <template v-for="item in demoPage">
      <a class="button" :href="`#${item.path}`" target="_blank">{{ item.name }} —— {{ item.title }}</a>
    </template>
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
