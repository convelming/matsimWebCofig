<!-- detail -->
<template>
  <div class="detail" v-loading="loading">
    <div class="box1">
      <div>
        <a href="#/">列表</a> > <span class="end">{{ feedback_type[detail.type] }}</span>
      </div>
      <div class="btn_list">
        <el-button type="warning" size="small" @click="">状态</el-button>
        <el-button type="primary" size="small" @click="">编辑</el-button>
        <el-button type="danger" size="small" @click="">删除</el-button>
      </div>
    </div>
    <div class="title_box">{{ detail.title }}</div>
    <div class="info_box">
      <span class="author"><i class="el-icon-user"></i> {{ detail.userName || "匿名" }}</span>
      <span class="time"><i class="el-icon-time"></i> {{ $moment(detail.dateTime).format("YYYY-MM-DD HH:mm") }}</span>
    </div>
    <div class="content_box ql-container ql-snow">
      <div class="ql-editor ql-snow" v-html="detail.content"></div>
    </div>
    <div class="edit_box">
      <el-input type="textarea" :rows="5" v-model="detail.huifu" placeholder="请输入评论内容"> </el-input>
      <el-button type="primary" @click="handleSubmitComment(-1)">发送评论</el-button>
    </div>
    <div class="comment_box">
      <div class="title">评论</div>
      <div class="comment_list">
        <CommentItem v-for="(item1, index1) in list" :key="item1.id" :detail="item1" :postsId="$route.query.id" :replyId="item1.id"></CommentItem>
      </div>

      <el-pagination class="pagination" @size-change="getComments()" @current-change="getComments()" :current-page.sync="params.pageNum" :page-size="params.pageSize" layout="total,  prev, pager, next, jumper" :total="total" :pager-count="7" />
    </div>
  </div>
</template>

<script>
import { addPosts, commentPosts, listPostsComment, getPosts } from "@/api/feedback";
import { feedback_type } from "./add.vue";
import CommentItem from "../components/CommentItem.vue";
export default {
  name: "detail",
  props: {},
  components: {
    CommentItem,
  },
  computed: {},
  watch: {},
  data() {
    return {
      detail: {
        // type: 0,
        // title: "标题111",
        // author: null,
        // date: "2026/1/19 20:30:59",
        // content: `zjhwwww`,
      },
      feedback_type: feedback_type,
      loading: false,

      huiFuId: -1,
      params: {
        pageNum: 1,
        pageSize: 10,
      },
      list: [],
      total: 0,
      loading: false,
    };
  },
  beforeRouteUpdate() {
    this.getDetail();
    this.getComments();
  },
  created() {
    this.getDetail();
    this.getComments();
  },
  mounted() {},
  methods: {
    getDetail() {
      this.loading = true;
      return getPosts(this.$route.query.id)
        .then((res) => {
          res.data.huifu = "";
          this.detail = res.data;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    getComments() {
      return listPostsComment({
        postsId: this.$route.query.id,
        ...this.params,
      }).then((res) => {
        res.records.forEach((v, i) => {
          v.huifu = "";
          v.total = 0;
          v.children = [];
          v.hasMore = false;
          v.params = {
            pageNum: 0,
            pageSize: 5,
            postsId: this.$route.query.id,
            replyId: v.id,
          };
        });
        this.list = res.records;
        this.total = res.total;
      });
    },
    nextCommentChildren(i) {
      const item = this.list[i];
      item.params.pageNum += 1;
      return listPostsComment(item.params).then((res) => {
        item.children.push(res.records);
        this.$set(item, "children", item.children);
        item.hasMore = res.total > item.params.pageNum * item.params.pageSize;
        item.total = res.total;
      });
    },
    handleSubmitComment(i) {
      const item = this.list[i];
      const params = {
        postsId: this.$route.query.id,
      };
      if (item) {
        params.replyId = item.id;
        params.content = item.huifu;
      } else {
        params.content = this.detail.huifu;
      }
      return commentPosts(params).then((res) => {
        if (item) {
          this.huiFuId = -1;
          let pageNum = item.params.pageNum;
          item.params.pageNum = 0;
          this.$set(item, "children", []);
          for (let index = 0; index < pageNum; index++) {
            this.nextCommentChildren(item);
          }
        } else {
          this.detail.huifu = "";
          this.getComments();
        }
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
    display: flex;
    align-items: center;
    justify-content: space-between;
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
    .btn_list {
    }
  }
  .title_box {
    font-size: 32px;
    line-height: 32px;
    font-weight: bold;
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

  .edit_box {
    ::v-deep .el-textarea__inner {
      border-radius: 4px 4px 0 0 !important;
      border-bottom: 0;
    }
    .el-button {
      display: block;
      border-radius: 0 0 4px 4px;
      width: 100%;
    }
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
      }
    }
    .pagination {
      margin-top: 20px;
      text-align: center;
    }
  }
}
</style>
