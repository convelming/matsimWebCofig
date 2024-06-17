<template>
  <el-dropdown class="Language" @command="changeLanguage" placement="top-start" trigger="click">
    <div class="locale_btn">
      <img class="icon" src="@/assets/image/locale_icon.png" /> <span class="text">{{ page_language }}</span>
    </div>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item command="zh-CN" :disabled="page_language == 'zh-CN'">中文（简体）</el-dropdown-item>
      <!-- <el-dropdown-item command="zh_MO" :disabled="page_language == 'zh-MO'">中文（繁體）</el-dropdown-item> -->
      <el-dropdown-item command="en-US" :disabled="page_language == 'en-US'">English</el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
export default {
  name: "Language",
  props: {},
  components: {},
  computed: {},
  watch: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  methods: {
    changeLanguage(lan) {
      this.$setLanguage(lan);
    },
  },
};
</script>

<style lang="scss" scoped>
.Language {
  .locale_btn {
    cursor: pointer;
    height: 32px;
    border: 1px solid #e5e5e5;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4px;

    .icon {
      width: 24px;
      height: 24px;
      margin-right: 5px;
    }

    .text {
      font-weight: 400;
      font-size: 14px;
      color: #434343;
      line-height: 20px;
    }
  }
}
</style>
