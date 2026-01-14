<!-- detail -->
<template>
  <div class="detail">
    <div class="box1">
      反馈 > <span class="end">{{ detail.type }}</span>
    </div>
    <div class="title">{{ detail.title }}</div>
    <div class="info">
      <span class="author"><i class="el-icon-user"></i> {{ detail.author || "匿名" }}</span>
      <span class="time"><i class="el-icon-time"></i> {{ $moment(detail.date).format("YYYY-MM-DD HH:mm") }}</span>
    </div>
    <div class="content ql-container ql-snow">
      <div class="ql-editor ql-snow" v-html="detail.content"></div>
    </div>
  </div>
</template>

<script>
import { addPosts, commentPosts, listPostsComment,getPosts } from "@/api/feedback";
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
  box-sizing: border-box;
  background-color: #fff;
  max-width: 1200px;
  min-height: 100vh;
  margin: 0 auto;
  padding: 40px 80px;
  display: flex;
  flex-direction: column;
  gap: 30px;

  .box1 {
    font-size: 14px;
    color: #999;
    padding-bottom: 10px;
    .end {
      color: #2c3e50;
    }
  }
  .title {
    font-size: 32px;
    line-height: 32px;
  }
  .info {
    font-size: 12px;
    color: #999999;
    line-height: 12px;
    display: flex;
    gap: 30px;
  }
  .ql-container,
  .ql-editor {
    padding: 0;
    border: 0;
    margin: 0;
  }
  .content {
    img {
      max-width: 100%;
      border-radius: 8px;
    }
  }
}
</style>
