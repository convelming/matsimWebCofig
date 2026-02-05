<!-- index -->
<template>
  <div class="index">
    <Step1Dialog :visible="visible && s_step == 1" :uid="uid" :resultJsonPath="detail?.resultJsonPath" @close="handleClose" @next="handleSuccessStep1" @prev="handleClose" />
    <Step2Dialog :visible="visible && s_step == 2" :uid="uid" :year="year" @close="handleClose" @next="handleSuccessStep2" @prev="s_step = 1" />
    <Step3Dialog :visible="visible && s_step == 3" @close="handleClose" @next="handleClose" @prev="s_step = 2" />
  </div>
</template>

<script>
import Step1Dialog from "./Step1Dialog.vue";
import Step2Dialog from "./Step2Dialog.vue";
import Step3Dialog from "./Step3Dialog.vue";
import { guid } from "@/utils/index2";
import { CUA_searchBestPlan } from "@/api/index";

export default {
  name: "index",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    step: {
      type: Number,
      default: 1,
    },
    detail: {
      type: Object,
    },
    year: {
      type: [Number, String],
    },
  },
  components: {
    Step1Dialog,
    Step2Dialog,
    Step3Dialog,
  },
  computed: {},
  watch: {
    visible: {
      handler(val) {
        if (val) {
          this.s_step = this.step;
          this.uid = guid();
        }
      },
      immediate: true,
    },
  },
  data() {
    return {
      s_step: 1,
      areaParam: [],
      roadList: [],
      uid: "",
    };
  },
  created() {},
  mounted() {},
  methods: {
    handleSuccessStep1(value) {
      this.areaParam = value;
      this.s_step = 2;
    },
    handleSuccessStep2(value) {
      this.roadList = value;
      const query = {
        // parentId: "",
        areaAnalyzeId: this.detail.id,
        name: "",
        args: JSON.stringify({
          // params: this.areaParam,
          links: this.roadList.map((v) => ({ fid: v.fid, h: v.h, los: v.los })),
        }),
      };

      const loading = this.$loading({
        lock: true,
        text: "搜索中...",
        spinner: "el-icon-loading",
        background: "rgb(from var(--color-white) r g b / 0.8)",
      });
      CUA_searchBestPlan(query)
        .then((res) => {})
        .finally(() => loading.close());
    },
    handleClose() {
      this.$emit("update:visible", false);
      this.$emit("close");
    },
  },
};
</script>

<style lang="scss" scoped>
.index {
}
</style>
