<template>
  <Dialog class="XmlComparisonDialog" ref="dialog" :title="$l('Xml信息对比')" :visible="true" @close="$emit('close')" left="center" width="1300px">
    <div class="XmlComparisonDialog__bodyer">
      <!-- <div class="row">
          <div class="col">
            <div class="_title">{{ $l("基础方案") }}</div>
            <textarea class="_content" v-model="oldXml" disabled></textarea>
          </div>
          <div class="col">
            <div class="_title">{{ $l("对比方案") }}</div>
            <textarea class="_content" v-model="newXml" disabled></textarea>
          </div>
        </div> -->
      <code-diff class="code-diff" :old-string="oldXml" :new-string="newXml" :context="10" output-format="side-by-side" language="xml" />
    </div>
  </Dialog>
</template>

<language>
{
  "Xml信息对比":{
    "zh-CN": "Xml信息对比",
    "en-US": "Xml Comparison"
  },
  "基础方案":{
    "zh-CN": "基础方案",
    "en-US": "基础方案"
  },
  "对比方案":{
    "zh-CN": "对比方案",
    "en-US": "对比方案"
  },
}
</language>

<script>
import { changeInfoXml } from "@/api/contrast";
import CodeDiff from "vue-code-diff";
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
  components: { CodeDiff },
  computed: {},
  data() {
    return {
      s_form: {},
      oldXml: "",
      newXml: "",
    };
  },
  created() {
    this.init();
  },
  mounted() {
    this.$nextTick(() => {
      this.$refs.dialog.offset(this.offset, this.offset);
    });
  },
  destroyed() {},
  methods: {
    init() {
      this.loading1 = true;
      const { database1, datasource1, database2, datasource2 } = this.$route.params;
      changeInfoXml({
        name1: database1 + "/" + datasource1,
        name2: database2 + "/" + datasource2,
        routeId: this.form.routeId,
      }).then((res) => {
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
::v-deep {
  .code-diff {
    width: 100% !important;
    height: calc(100vh - 250px) !important;
    overflow: auto !important;
  }
}
.XmlComparisonDialog__bodyer {
  .row {
    display: flex;
    justify-content: space-between;
    .col {
      box-sizing: border-box;
      padding: 10px;
      border-radius: 5px;
      width: calc(50% - 10px);
      background-color: #eee;
    }
  }
  ._title {
    font-size: 16px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 20px;
  }
  ._content {
    width: 100%;
    height: calc(100vh - 250px);
    font-size: 14px;
    overflow-y: scroll;
  }
}
</style>
