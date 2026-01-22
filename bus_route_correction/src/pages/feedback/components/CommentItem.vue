<!-- CommentItem -->
<template>
  <div class="CommentItem">
    <div class="name">{{ detail.userName || "匿名" }}</div>
    <div class="content">{{ detail.content }}</div>
    <div class="info">
      <span class="hf" @click="showHuifu = true"><i class="el-icon-chat-line-square"></i> 回复</span>
      <span class="time"><i class="el-icon-time"></i> {{ $moment(detail.dateTime).format("YYYY-MM-DD HH:mm") }}</span>
    </div>
    <div class="edit_box" v-show="showHuifu">
      <el-input type="textarea" :rows="3" v-model="content" placeholder="请输入回复内容"> </el-input>
      <el-button type="primary" size="small" @click="handleSubmitComment(index1)">发送回复</el-button>
    </div>
    <div class="children" v-show="list.length">
      <div class="c_item" v-for="item in list" :key="item.id">
        <div class="c_info">
          <span class="c_name">{{ item.userName || "匿名" }}</span>
          <span class="c_time"><i class="el-icon-time"></i> {{ $moment(item.dateTime).format("YYYY-MM-DD HH:mm") }}</span>
        </div>
        <div class="c_content">{{ item.content }}</div>
      </div>
      <div class="more" v-show="hasMore" @click="nextCommentChildren()">
        <i class="el-icon-arrow-down"></i>
        <span>查看更多</span>
      </div>
    </div>
  </div>
</template>

<script>
import { addPosts, commentPosts, listPostsComment, getPosts } from "@/api/feedback";
export default {
  name: "CommentItem",
  props: {
    detail: {
      type: Object,
      default: () => {
        return {};
      },
    },
    postsId: {
      type: [String, Number],
      default: -1,
    },
    replyId: {
      type: [String, Number],
      default: -1,
    },
  },
  components: {},
  computed: {},
  watch: {},
  data() {
    return {
      showHuifu: false,
      content: "",
      list: [],
      total: 0,
      hasMore: false,

      pageNum: 1,
      pageSize: 2,
    };
  },
  created() {
    this.getComments();
  },
  mounted() {},
  methods: {
    nextCommentChildren() {
      this.pageSize += 10;
      this.getComments();
    },
    async getComments() {
      const res = await listPostsComment({
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        postsId: this.postsId,
        replyId: this.replyId,
      });
      this.list = res.records;
      this.total = res.total;
      this.hasMore = res.total > this.pageNum * this.pageSize;
    },
    async handleSubmitComment(i) {
      const params = {
        postsId: this.postsId,
        replyId: this.replyId,
        content: this.content,
      };
      await commentPosts(params);
      this.showHuifu = false;
      if (!this.hasMore) {
        await this.getComments();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.CommentItem {
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
</style>
