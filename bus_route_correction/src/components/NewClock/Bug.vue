<template>
  <div class="Bug">
    <a :href="href" target="_blank">
      <img class="img" src="./images/bug_icon.png" />
    </a>
  </div>
</template>

<script>
export default {
  name: "Bug",
  props: {
    href: {
      type: String,
    },
  },
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
.Bug {
  flex-shrink: 0;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border: 1px solid var(--border-color-base);
  border-radius: 4px;

  a {
    width: 24px;
    height: 24px;
    display: block;
    padding: 4px;
  }

  .img {
    width: 24px;
    height: 24px;
  }
}
</style>
