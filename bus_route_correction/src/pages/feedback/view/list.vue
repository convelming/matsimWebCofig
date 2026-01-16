<!-- list -->
<template>
  <div class="list">
    <div class="tab_header">
      <template v-for="(item1, index1) in tabList">
        <div class="item" :class="{ active: activeName == item1.name }" @click="handleTabClick(item1)">{{ item1.label }}</div>
      </template>
      <el-button class="add" type="primary" icon="el-icon-plus" size="mini" @click="handleAdd">添加</el-button>
    </div>
    <template v-for="(item1, index1) in tabList">
      <div class="tab_body" v-show="activeName == item1.name" :data-key="item1.name + '_body'">
        <a class="item" v-for="item2 in item1.list" :href="`#/detail?id=${item2.id}`">
          <div class="title">{{ item2.title }}</div>
          <div class="info">
            <!-- <div class="text1"><i class="el-icon-warning-outline"></i> 待办</div> -->
            <div class="text1"><i class="el-icon-user"></i> {{ item2.userName }}</div>
            <div class="text1"><i class="el-icon-chat-line-square"></i> {{ item2.msgNum }}</div>
            <div class="text1 time"><i class="el-icon-time"></i> {{ $moment(item2.date).format("YYYY-MM-DD HH:mm") }}</div>
          </div>
        </a>
      </div>
      <el-pagination
        :data-key="item1.name + '_page'"
        v-show="activeName == item1.name"
        @size-change="getList(index1)"
        @current-change="getList(index1)"
        :current-page.sync="item1.params.pageNum"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="item1.params.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="item1.total"
        :pager-count="7"
      />
    </template>
    <AddFeedback :visible.sync="showAdd" v-bind="addProps" @submited="getList" />

    <BeiAnBox style="--color-white: var(--color-text-primary)" />
  </div>
</template>

<script>
import AddFeedback from "./add.vue";
import { listPosts } from "@/api/feedback";
import { feedback_type } from "./add.vue";
export default {
  name: "list",
  props: {},
  components: {
    AddFeedback,
  },
  computed: {},
  watch: {},
  data() {
    return {
      showAdd: false,
      addProps: {},
      activeName: Object.keys(feedback_type)[0] || "",
      tabList: Object.entries(feedback_type).map(([type, label]) => ({
        name: type,
        label: label,
        params: {
          pageNum: 1,
          pageSize: 10,
          type: type,
        },
        list: [],
        total: 0,
        loading: false,
      })),
    };
  },
  created() {
    for (const index in this.tabList) {
      this.getList(index);
    }
  },
  mounted() {},
  methods: {
    getListByType(type) {
      const item = this.tabList.find((v) => v.name == type);
    },
    getList(index) {
      const item = this.tabList[index];
      if (item.loading) return;
      this.$set(item, "loading", true);
      const params = {
        ...item.params,
      };
      listPosts(params)
        .then((res) => {
          this.$set(item, "list", res.records);
          this.$set(item, "total", res.total);
        })
        .finally(() => {
          this.$set(item, "loading", false);
        });
    },
    handleTabClick(item) {
      this.activeName = item.name;
    },
    handleAdd() {
      this.showAdd = true;
      this.addProps = {
        type: this.activeName,
        fbId: -1,
      };
    },
  },
};
</script>

<style lang="scss" scoped>
.list {
  box-sizing: border-box;
  background-color: var(--color-white);
  max-width: 1200px;
  min-height: 100vh;
  margin: 0 auto;
  padding: 30px 40px 10px 40px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  .tab_header {
    display: flex;
    gap: 20px;
    border-bottom: 2px solid var(--border-color-base);
    align-items: center;
    .item {
      cursor: pointer;
      font-size: 16px;
      font-weight: 600;
      line-height: 40px;
      position: relative;
      &.active {
        color: var(--color-primary);
      }
      &.active::after {
        background-color: var(--color-primary);
      }

      &::after {
        content: "";
        display: block;
        height: 2px;
        position: absolute;
        bottom: -2px;
        left: 0;
        right: 0;
        background-color: transparent;
        transition: background-color 0.5s;
      }
      &:hover {
        color: var(--color-primary);
      }
    }

    .add {
      margin-left: auto;
      font-weight: normal;
      font-size: 14px;
    }
  }

  .tab_body {
    height: 0;
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    .item {
      cursor: pointer;
      display: flex;
      flex-direction: column;
      padding: 20px 5px;
      border-bottom: 1px solid var(--border-color-base);
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
        background-color: rgb(from var(--color-primary) r g b / 0.1);
      }
    }
  }
}
</style>
