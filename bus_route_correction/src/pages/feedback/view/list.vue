<!-- list -->
<template>
  <div class="list">
    <el-tabs v-model="activeName" @tab-click="handleTabClick">
      <el-tab-pane v-for="(item1, index1) in tabList" :label="item1.label" :name="item1.name" :key="item1.name">
        <div class="tab_body">
          <div class="scroll" v-loading="item1.loading">
            <a class="item" v-for="item2 in item1.list" :href="`#/detail?id=${item.id}`">
              <div class="title">{{ item2.title }}</div>
              <div class="info">
                <!-- <div class="text1"><i class="el-icon-warning-outline"></i> 待办</div> -->
                <div class="text1"><i class="el-icon-user"></i> {{ item2.user }}</div>
                <div class="text1"><i class="el-icon-chat-line-square"></i> {{ item2.msgNum }}</div>
                <div class="text1 time"><i class="el-icon-time"></i> {{ $moment(item2.date).format("YYYY-MM-DD HH:mm") }}</div>
              </div>
            </a>
          </div>
          <el-pagination
            @size-change="getList(index1)"
            @current-change="getList(index1)"
            :current-page.sync="item1.params.pageNum"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="item1.params.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="item1.total"
            :pager-count="7"
          />
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { listPosts } from "@/api/feedback";
export default {
  name: "list",
  props: {},
  components: {},
  computed: {},
  watch: {},
  data() {
    return {
      activeName: "反馈",
      tabList: [
        {
          name: "反馈",
          label: "反馈",
          params: {
            pageNum: 1,
            pageSize: 10,
            type: 1,
          },
          list: [],
          total: 0,
          loading: false,
        },
      ],
    };
  },
  created() {
    for (const index in this.tabList) {
      this.getList(index);
    }
  },
  mounted() {},
  methods: {
    getList(index) {
      const item = this.tabList[index];
      if (item.loading) return;
      item.loading = true;
      const params = {
        ...item.params,
      };
      listPosts(params)
        .then((res) => {
          console.log(res);
        })
        .finally(() => {
          item.loading = false;
        });
    },
    handleTabClick(res) {
      console.log(res);
    },
  },
};
</script>

<style lang="scss" scoped>
.list {
  box-sizing: border-box;
  background-color: #fff;
  max-width: 1200px;
  min-height: 100vh;
  margin: 0 auto;
  padding: 40px 80px;
  display: flex;
  flex-direction: column;
  gap: 30px;

  .tab_body {
    .scroll {
    }
    .item {
      cursor: pointer;
      display: flex;
      flex-direction: column;
      padding: 20px 5px;
      border-bottom: 1px solid #eee;
      gap: 10px;
      .title {
        font-size: 16px;
      }
      .info {
        display: flex;
        gap: 20px;
        .text1 {
          display: flex;
          gap: 5px;
          align-items: center;
          font-size: 12px;
        }
        .time {
          margin-left: auto;
        }
      }
      &:hover {
        background-color: rgb(236, 245, 255);
      }
    }
  }
}
</style>
