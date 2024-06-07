<template>
  <code-diff class="code-diff" :old-string="oldXml" :new-string="newXml" :context="10" output-format="side-by-side" language="xml" />
</template>

<script>
import { changeInfoXml } from "@/api/contrast";
import CodeDiff from "vue-code-diff";

export default {
  name: "ComponentName",
  props: {},
  components: { CodeDiff },
  computed: {},
  watch: {},
  data() {
    return {
      oldXml: "",
      newXml: "",
    };
  },
  created() {
    this.$store.dispatch("setDataBase", "guangzhou");
    this.$store.dispatch("setDataSource", "guangzhou/base");
    this.init();
  },
  mounted() {},
  methods: {
    init() {
      this.loading1 = true;
      changeInfoXml({ name1: "guangzhou/base", name2: "guangzhou/xxxx6", routeId: "223路(白云花园总站--白云路总站)[all-day 16:15]" }).then((res) => {
        this.oldXml = res.data.before;
        this.newXml = res.data.after;
        this.loading1 = false;
        this.$nextTick(() => {
          const doc = new Mergely("#compare", {
            lhs: res.data.before,
            rhs: res.data.after,
          });
        });
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.ComponentName {
}
</style>
