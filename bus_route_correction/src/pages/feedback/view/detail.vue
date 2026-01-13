<!-- detail -->
<template>
  <div class="detail">
    <div class="NewsDetail">
      <div class="box1">首页 > 新闻管理 > 新闻动态 > <span class="end">院内新闻</span></div>
      <div class="title">{{ detail.title }}</div>
      <div class="info">
        <div class="time">{{ $moment(detail.date).format("YYYY-MM-DD HH:mm") }}</div>
        <span class="author">作者：{{ detail.author }}</span>
      </div>
      <div class="content ql-container ql-snow">
        <div class="ql-editor ql-snow" v-html="detail.content"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "detail",
  props: {},
  components: {},
  computed: {},
  watch: {},
  data() {
    return {
      detail: {},
    };
  },
  created() {},
  mounted() {},
  methods: {},
};
</script>

<style lang="scss" scoped>
.detail {
}
</style>
