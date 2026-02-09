<!-- index -->
<template>
  <div class="index">
    <Step1Dialog :visible="visible && step == 1" :uid="uid" :resultJsonPath="detail?.resultJsonPath" @close="handleClose" @next="handleSuccessStep1" @prev="handleClose" />
    <Step2Dialog :visible="visible && step == 2" :uid="uid" :year="year" @close="handleClose" @next="handleSuccessStep2" @prev="step = 1" />
  </div>
</template>

<script>
import Step1Dialog from "./Step1Dialog.vue";
import Step2Dialog from "./Step2Dialog.vue";
import { guid } from "@/utils/index2";
import { CUA_searchBestPlan } from "@/api/index";

export default {
  name: "index",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    detail: {
      type: Object,
    },
    analysis: {
      type: Object,
    },
    year: {
      type: [Number, String],
    },
  },
  components: {
    Step1Dialog,
    Step2Dialog,
  },
  computed: {},
  watch: {
    visible: {
      handler(val) {
        if (val) {
          this.step = 1;
          this.uid = guid();
        }
      },
      immediate: true,
    },
  },
  data() {
    return {
      step: 1,
      name: "",
      areaParam: [],
      roadList: [],
      uid: "",
    };
  },
  created() {},
  mounted() {},
  methods: {
    handleSuccessStep1(value) {
      this.name = value.find((v) => v.key == "方案名称")?.value || "";
      this.areaParam = value;
      this.step = 2;
    },
    handleSuccessStep2(value) {
      this.roadList = value;
      const query = {
        // parentId: "",
        areaAnalyzeId: this.detail.id,
        name: this.name,
        args: JSON.stringify({
          params: this.areaParam,
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
        .then((res) => {
          console.log(res);

          this.$emit("success", res.data);
        })
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
