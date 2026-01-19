<!-- detail -->
<template>
  <div class="detail" v-loading="loading">
    <div class="box1">
      <a href="#/">列表</a> > <span class="end">{{ feedback_type[detail.type] }}</span>
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
      <el-button type="primary" size="small" @click="handleSubmitComment()">发送评论</el-button>
    </div>
    <div class="comment_box">
      <div class="title">评论</div>
      <div class="comment_list">
        <div class="comment_item" v-for="item1 in list">
          <div class="name">{{ item1.userName || "匿名" }}</div>
          <div class="content">{{ item1.content }}</div>
          <div class="info">
            <span class="hf" @click="huiFuId == item1.id ? (huiFuId = '') : (huiFuId = item1.id)"><i class="el-icon-chat-line-square"></i> 回复</span>
            <span class="time"><i class="el-icon-time"></i> {{ $moment(item1.dateTime).format("YYYY-MM-DD HH:mm") }}</span>
          </div>
          <div class="edit_box" v-if="huiFuId == item1.id">
            <el-input type="textarea" :rows="3" v-model="item1.huifu" placeholder="请输入回复内容"> </el-input>
            <el-button type="primary" size="small" @click="handleSubmitComment(item1)">发送回复</el-button>
          </div>
          <div class="children" v-if="item1.children.length">
            <template v-for="item2 in item1.children">
              <div class="c_item" v-for="item3 in item2">
                <div class="c_info">
                  <span class="c_name">{{ item3.userName || "匿名" }}</span>
                  <span class="c_time"><i class="el-icon-time"></i> {{ $moment(item3.dateTime).format("YYYY-MM-DD HH:mm") }}</span>
                </div>
                <div class="c_content">{{ item3.content }}</div>
              </div>
            </template>
            <div class="more" v-if="item1.hasMore" @click="nextCommentChildren(item1)">
              <i class="el-icon-arrow-down"></i>
              <span>查看更多</span>
            </div>
          </div>
        </div>
      </div>

      <el-pagination class="pagination" @size-change="getComments()" @current-change="getComments()" :current-page.sync="params.pageNum" :page-size="params.pageSize" layout="total,  prev, pager, next, jumper" :total="total" :pager-count="7" />
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
        res.records.forEach((res) => {
          res.huifu = "";
          res.total = 0;
          res.children = [];
          res.hasMore = false;
          res.params = {
            pageNum: 0,
            pageSize: 5,
            postsId: this.$route.query.id,
            replyId: res.id,
          };
          this.nextCommentChildren(res);
        });
        this.list = res.records;
        this.total = res.total;
      });
    },
    nextCommentChildren(item) {
      item.params.pageNum += 1;
      return listPostsComment(item.params).then((res) => {
        item.children[item.params.pageNum - 1] = res.records;
        this.$set(item, "children", item.children)
        item.hasMore = res.total > item.params.pageNum * item.params.pageSize;
        item.total = res.total;
      });
    },
    handleSubmitComment(item) {
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
        if (!item) {
          this.detail.huifu = "";
          this.getComments();
        } else {
          this.huiFuId = -1;
          let pageNum = item.params.pageNum;
          item.params.pageNum = 0;
          for (let index = 0; index < pageNum; index++) {
            this.nextCommentChildren(item);
          }
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
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 10px 0;
        border-bottom: 1px solid var(--border-color-base);
        .name {
          font-size: 14px;
          color: var(--color-primary);
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

        .edit_box {
          margin-left: 40px;
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
          .more {
            cursor: pointer;
            display: flex;
            gap: 5px;
            justify-content: center;
            align-items: center;
            text-align: center;
            color: var(--color-primary);
            font-size: 12px;
          }
        }
      }
    }
    .pagination {
      margin-top: 20px;
      text-align: center;
    }
  }
}
</style>
