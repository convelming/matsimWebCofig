<!-- index -->
<template>
  <div class="index">
    <Step1Dialog :visible="visible && step == 1" @close="handleClose" @next="step = 2" @prev="handleClose" />
    <Step2Dialog :visible="visible && step == 2" @close="handleClose" @next="step = 3" @prev="step = 1" />
    <Step3Dialog :visible="visible && step == 3" @close="handleClose" @next="handleClose" @prev="step = 2" />
  </div>
</template>

<script>
import Step1Dialog from "./Step1Dialog.vue";
import Step2Dialog from "./Step2Dialog.vue";
import Step3Dialog from "./Step3Dialog.vue";
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
    value: {
      type: Object,
      default: () => {
        return {};
      },
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
          this.s_value = JSON.parse(JSON.stringify(this.value));
        }
      },
      immediate: true,
    },
  },
  data() {
    return {
      s_step: 0,
      s_value: {},
    };
  },
  created() {},
  mounted() {},
  methods: {
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
