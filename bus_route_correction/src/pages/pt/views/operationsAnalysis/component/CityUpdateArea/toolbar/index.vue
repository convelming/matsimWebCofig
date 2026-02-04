<!-- CUAToolbar -->
<template>
  <div class="CUAToolbar">
    <div class="tabs">
      <div class="item" :class="{ active: activeName == '研究区域' }" @click="$emit('update:activeName', '研究区域')">{{ $l("研究区域") }}</div>
      <div class="item" :class="{ active: activeName == '相似片区搜索' }" @click="$emit('update:activeName', '相似片区搜索')">{{ $l("相似片区搜索") }}</div>
      <div class="item" :class="{ active: activeName == '片区承载力分析' }" @click="$emit('update:activeName', '片区承载力分析')">{{ $l("片区承载力分析") }}</div>
      <div class="item" :class="{ active: activeName == '地块承载力分析' }" @click="$emit('update:activeName', '地块承载力分析')">{{ $l("地块承载力分析") }}</div>
    </div>
    <AreaList class="tabs_body" v-show="activeName == '研究区域'" :show="show && activeName == '研究区域'" />
    <AreaSreach class="tabs_body" v-show="activeName == '相似片区搜索'"  :show="show && activeName == '相似片区搜索'" />
    <AreaAnalysis class="tabs_body" v-show="activeName == '片区承载力分析'"  :show="show && activeName == '片区承载力分析'" />
    <PlotAnalysis class="tabs_body" v-show="activeName == '地块承载力分析'"  :show="show && activeName == '地块承载力分析'" />
  </div>
</template>

<script>
import AreaList from "./AreaList.vue";
import AreaSreach from "./AreaSreach.vue";
import AreaAnalysis from "./AreaAnalysis.vue";
import PlotAnalysis from "./PlotAnalysis.vue";

export default {
  name: "CUAToolbar",
  props: {
    show:{
      type: Boolean,
      default: false,
    },
    activeName: {
      type: String,
      default: "相似片区搜索",
    },
  },
  components: {
    AreaList,
    AreaSreach,
    AreaAnalysis,
    PlotAnalysis,
  },
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
.CUAToolbar {
  display: flex;
  flex-direction: column;
  height: 100%;
  .tabs {
    display: flex;
    flex-wrap: wrap;
  }
  .item {
    cursor: pointer;
    box-sizing: border-box;
    width: 50%;
    height: 40px;
    line-height: 40px;
    font-size: 12px;
    text-align: center;
    border-bottom: 1px solid var(--border-color-base);
    &.active {
      border-bottom: 1px solid var(--color-primary);
      color: var(--color-primary);
    }
  }

  .tabs_body {
    height: 0;
    flex: 1;
  }
}
</style>
