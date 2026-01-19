<!-- detail -->
<template>
  <div class="detail" v-loading="loading">
    <div class="box1">
      <a href="#/">列表</a> > <span class="end">{{ feedback_type[detail.type] }}</span>
    </div>
    <div class="title_box">{{ detail.title }}</div>
    <div class="info_box">
      <span class="author"><i class="el-icon-user"></i> {{ detail.author || "匿名" }}</span>
      <span class="time"><i class="el-icon-time"></i> {{ $moment(detail.date).format("YYYY-MM-DD HH:mm") }}</span>
    </div>
    <div class="content_box ql-container ql-snow">
      <div class="ql-editor ql-snow" v-html="detail.content"></div>
    </div>

    <div class="comment_box">
      <div class="title">评论</div>

      <div class="comment_list">
        <div class="comment_item" v-for="value in 10">
          <div class="name">匿名</div>
          <div class="content">xxxxxx</div>
          <div class="info">
            <span class="hf"><i class="el-icon-chat-line-square"></i> 回复</span>
            <span class="time"><i class="el-icon-time"></i> {{ $moment(detail.date).format("YYYY-MM-DD HH:mm") }}</span>
          </div>

          <div class="children">
            <div class="c_item" v-for="value in 3">
              <div class="c_info">
                <span class="c_name"> 匿名</span>
                <span class="c_time"><i class="el-icon-time"></i> {{ $moment(detail.date).format("YYYY-MM-DD HH:mm") }}</span>
              </div>
              <div class="c_content">dasdasdasdasdasdasdasdasd</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { addPosts, commentPosts, listPostsComment, getPosts } from "@/api/feedback";
import { feedback_type } from "./add.vue";
export default {
  name: "detail",
  props: {},
  components: {},
  computed: {},
  watch: {},
  data() {
    return {
      detail: {
        type: 0,
        title: "标题111",
        author: null,
        date: "2026/1/19 20:30:59",
        content: `zjhwwww`,
      },
      feedback_type: feedback_type,
      loading: false,
    };
  },
  beforeRouteUpdate() {
    // this.getDetail();
  },
  created() {
    // this.getDetail();
  },
  mounted() {},
  methods: {
    getDetail() {
      this.loading = true;
      getPosts(this.$route.query.id)
        .then((res) => {
          console.log(res);
          this.detail = res.data;
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.detail {
  box-sizing: border-box;
  background-color: var(--color-white);
  max-width: 1200px;
  min-height: 100vh;
  margin: 0 auto;
  padding: 40px 80px;
  display: flex;
  flex-direction: column;
  gap: 30px;

  .box1 {
    font-size: 14px;
    padding-bottom: 10px;
    .end {
      color: var(--color-text-primary);
    }
    a {
      color: var(--color-text-regular);
      &:hover {
        color: var(--color-primary);
      }
    }
  }
  .title_box {
    font-size: 32px;
    line-height: 32px;
  }
  .info_box {
    font-size: 12px;
    color: var(--color-text-secondary);
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
  .content_box {
    img {
      max-width: 100%;
      border-radius: 8px;
    }
  }

  .comment_box {
    .title {
      font-size: 20px;
      font-weight: 500;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--border-color-base);
    }
    .comment_list {
      .comment_item {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 10px 0;
        border-bottom: 1px solid var(--border-color-base);
        .name {
          font-size: 16px;
        }
        .content {
          font-size: 14px;
        }
        .info {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
          color: var(--color-text-secondary);
          .hf {
            cursor: pointer;
          }
        }
        .children {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-left: 40px;
          padding: 10px 15px;
          border-radius: 10px;
          background-color: var(--background-color-light);
          .c_item {
            display: flex;
            flex-direction: column;
            gap: 5px;
            border-bottom: 1px solid var(--border-color-base);
            padding-bottom: 5px;
            .c_info {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 10px;
              font-size: 12px;
              color: var(--color-text-secondary);
              .c_name {
                // color: var(--color-text-primary);
              }
            }
            .c_content {
              font-size: 12px;
            }
          }
        }
      }
    }
  }
}
</style>
