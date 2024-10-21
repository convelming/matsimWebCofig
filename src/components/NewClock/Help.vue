<template>
  <div class="Help">
    <img class="icon" src="./images/question_icon.png" />
    <span class="text">{{ $l("帮助") }}</span>
  </div>
</template>


<language>
{
  "帮助":{
    "zh-CN": "帮助",
    "en-US": "Help"
  },
}
</language>


<script>
export default {
  name: "Help",
  props: {},
  components: {},
  computed: {},
  watch: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  methods: {},
};
</script>

<style lang="scss" scoped>
.Help {
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
</style>
