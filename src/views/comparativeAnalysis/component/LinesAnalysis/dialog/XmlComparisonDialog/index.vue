<template>
  <div class="XmlComparisonDialog">
    <Dialog ref="dialog" :title="$l('Xml信息对比')" :visible="true" @close="$emit('close')" left="center" width="1300px">
      <div class="XmlComparisonDialog__bodyer">
        <div class="row">
          <div class="col">
            <div class="_title">oldXml</div>
            <div class="_content">{{ oldXml }}</div>
          </div>
          <div class="col">
            <div class="_title">newXml</div>
            <div class="_content">{{ newXml }}</div>
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<language>
{
  "Xml信息对比":{
    "zh-CN": "Xml信息对比",
    "en-US": "Xml Comparison"
  },
}
</language>

<script>
import { number } from "echarts";

export default {
  props: {
    form: {
      type: Object,
      default: () => ({}),
    },
    offset: {
      type: Number,
      default: 0,
    },
  },
  inject: ["rootVue"],
  components: {},
  computed: {},
  data() {
    return {
      s_form: {},
      oldXml: "",
      newXml: "",
    };
  },
  created() {
    console.log(this.rootVue);
    this.init();
  },
  mounted() {
    this.$nextTick(() => {
      this.$refs.dialog.offset(this.offset, this.offset);
    });
  },
  destroyed() {},
  methods: {
    init() {},
  },
};
</script>

<style lang="scss" scoped>
.XmlComparisonDialog__bodyer {
  .row {
    height: calc(100vh - 200px);
    overflow-y: scroll;
    display: flex;
    justify-content: space-between;
    .col {
      box-sizing: border-box;
      padding: 10px;
      border-radius: 5px;
      width: calc(50% - 10px);
      background-color: #eee;
      ._title {
        font-size: 16px;
        font-weight: bold;
        text-align: center;
        margin-bottom: 20px;
      }
      ._content {
        font-size: 14px;
      }
    }
  }
}
</style>
