<template>
  <el-pagination
    :background="background"
    v-model:currentPage="currentPage"
    v-model:page-size="pageSize"
    :layout="layout"
    :page-sizes="pageSizes"
    :pager-count="pagerCount"
    :total="total"
    :small="small"
    v-bind="$attrs"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
  />
</template>

<script>
// import { scrollTo } from "@/utils/scroll-to";

export default {
  name: 'Pagination',
  emits: ['update:page', 'update:limit', 'pagination'],
  props: {
    small: {
      type: Boolean,
    },
    total: {
      required: true,
      type: Number,
    },
    page: {
      type: Number,
      default: 1,
    },
    limit: {
      type: Number,
      default: 20,
    },
    pageSizes: {
      type: Array,
      default() {
        return [10, 50, 100, 500, 1000, 5000]
      },
    },
    // 移动端页码按钮的数量端默认值5
    pagerCount: {
      type: Number,
      default: 7,
    },
    layout: {
      type: String,
      default: 'total, sizes, prev, pager, next, jumper',
    },
    background: {
      type: Boolean,
      default: true,
    },
    autoScroll: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    currentPage: {
      get() {
        return this.page
      },
      set(val) {
        this.$emit('update:page', val)
      },
    },
    pageSize: {
      get() {
        return this.limit
      },
      set(val) {
        this.$emit('update:limit', val)
      },
    },
  },
  methods: {
    handleSizeChange(val) {
      this.$emit('pagination', { page: this.currentPage, limit: val })
      // if (this.autoScroll) {
      //   scrollTo(0, 800);
      // }
    },
    handleCurrentChange(val) {
      this.$emit('pagination', { page: val, limit: this.pageSize })
      // if (this.autoScroll) {
      //   scrollTo(0, 800);
      // }
    },
  },
}
</script>
