<!-- CrossroadsInstall -->
<template>
  <Dialog class="CrossroadsInstallDialog" title="交叉口-数据录入" :top="20" :left="20" width="600px" hideMinimize :visible="visible" @close="handleClose">
    <div class="CrossroadsInstall">
      <el-form ref="form" label-width="100px" label-position="left" :inline="false" size="mini">
        <el-form-item label="新建交叉口">
          <el-button v-if="state == POINT_SELECT_STATE_KEY.DISABLE" type="primary" @click="$emit('add')">开始点选</el-button>
          <el-button v-else-if="state == POINT_SELECT_STATE_KEY.ENABLE" type="primary" @click="$emit('stop')">停止点选</el-button>
        </el-form-item>
        <el-form-item label="已建交叉口">
          <el-select v-model="intersectionId" @change="handleSreachCrossroadsList" @clear="handleGetIntersectionList('')" :remote-method="handleGetIntersectionList" filterable remote clearable placeholder="请输入关键词">
            <el-option v-for="item in intersectionList.data" :key="item.id + item.name" :label="item.name" :value="item.id"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="mini" @click="handleClose">返回</el-button>
        </el-form-item>
      </el-form>
    </div>
  </Dialog>
</template>

<script>
import { intersectionList, intersectionDetail, intersectionInsert, intersectionDelete, intersectionUpdate, crossroadsList, crossroadsDetail, crossroadsDelete, crossroadsRunVehicleCounts } from "@/api/index";
import { PointSelectLayer, POINT_SELECT_STATE_KEY, POINT_SELECT_EVENT } from "../layer/PointSelectLayer";
export default {
  name: "CrossroadsInstall",
  inject: ["rootVue"],
  props: {
    state: {
      type: Number,
    },
    visible: {
      type: Boolean,
    },
  },
  components: {},
  computed: {},
  watch: {},
  data() {
    return {
      POINT_SELECT_STATE_KEY,
      POINT_SELECT_EVENT,
      intersectionId: "",
      intersectionList: {
        data: [],
        loading: false,

        name: "",
        pageNum: 1,
        pageSize: 100,
        total: 0,
      },
    };
  },
  computed: {},
  created() {},
  mounted() {
    this.handleGetIntersectionList("");
  },
  methods: {
    handleSreachCrossroadsList(id) {
      let item = this.intersectionList.data.find((item) => item.id == id);
      this.$emit("search", item);
    },
    handleGetIntersectionList(query) {
      this.intersectionList.loading = true;
      this.intersectionList.name = query;
      intersectionList({
        name: this.intersectionList.name,
        pageSize: this.intersectionList.pageSize,
        pageNum: this.intersectionList.pageNum,
      })
        .then((res) => {
          const { data, pageSize, pageNum, total } = res.data;
          this.intersectionList.data = data;
          this.intersectionList.pageSize = pageSize;
          this.intersectionList.pageNum = pageNum;
          this.intersectionList.loading = false;
        })
        .catch((err) => {
          this.intersectionList.loading = false;
        });
    },
    handleClose() {
      this.$emit("update:visible", false);
      this.$emit("close");
    },
  },
};
</script>

<style lang="scss" scoped>
.CrossroadsInstall {
}
</style>
