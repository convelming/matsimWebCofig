<!-- ImageListDialog -->
<template>
  <Dialog class="ImageListDialog" title="图片列表" :top="50" :left="100" width="900px" hideMinimize :visible="visible" @close="handleClose">
    <div v-if="!showImageList">
      <el-form :model="queryparam" ref="form" label-width="auto" :inline="true" size="small">
        <el-form-item label="名称">
          <el-input v-model="queryparam.name"></el-input>
        </el-form-item>
        <el-form-item label="时间">
          <el-date-picker v-model="queryparam.time" type="daterange" value-format="yyyy-MM-dd" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getTree">搜索</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="dirList" style="width: 100%" height="calc(100vh - 300px)" row-key="path" border default-expand-all :tree-props="{ children: 'subdir' }">
        <el-table-column label="名称" prop="name" />
        <el-table-column label="时间" prop="createTime" width="180" />
        <el-table-column label="操作" width="100">
          <template slot-scope="{ row }">
            <el-button type="text" size="mini" @click="handleDeleteDir(row)">删除</el-button>
            <el-button v-if="row.pictures && row.pictures.length" type="text" size="mini" @click="handleShowImageList(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div v-else>
      <div class="image_title">
        <div class="path">{{ selectPath }}</div>
        <el-button icon="el-icon-arrow-left" type="primary" size="mini" @click="showImageList = false">返回</el-button>
      </div>
      <div class="image_list">
        <div class="image_box" v-for="(item, index) in imageList" :key="index">
          <el-image :src="item.url" :preview-src-list="previewSrcList" fit="fill" :lazy="true"></el-image>
          <div class="btn_list">
            <div class="el-icon-aim" @click.stop="handleSetCenter(item)"></div>
            <div class="el-icon-delete" @click.stop="handleDeleteImage(item)"></div>
          </div>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>
import { mappictureTreeList, mappictureDelete, mappictureDeleteByPath } from "@/api/index";

export default {
  name: "ImageListDialog",
  inject: ["rootVue"],
  props: {
    visible: {
      type: Boolean,
    },
  },
  components: {},
  computed: {
    previewSrcList() {
      return this.imageList.map((item) => item.url);
    },
  },
  watch: {
    visible: {
      handler(val) {
        if (val) {
          this.handleEnable();
        } else {
          this.handleDisable();
        }
      },
      immediate: true,
      deep: true,
    },
  },
  data() {
    return {
      queryparam: {
        name: "",
        time: [],
      },
      dirList: [],
      showImageList: false,
      selectPath: "",
      imageList: [],
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {
    this.handleDisable();
  },
  methods: {
    handleSetCenter(row) {
      this.rootVue.handleSetHMash(row);
      this.rootVue._Map.setCenter([row.x, row.y]);
    },
    getTree() {
      const { name, time } = this.queryparam;
      mappictureTreeList({
        name: name,
        beginTime: (time || [])[0] || "",
        endTime: (time || [])[1] || "",
      }).then((res) => {
        this.dirList = res.data;
        const item = this.dirList.find((item) => item.path == this.selectPath);
        if (item) {
          this.imageList = item.pictures;
        } else {
          this.imageList = [];
          this.showImageList = false;
        }
      });
    },
    handleEnable() {
      this.getTree();
    },
    handleDisable() {},
    handleClose() {
      this.$emit("update:visible", false);
      this.$emit("close");
    },
    handleDeleteDir(row) {
      this.$confirm(`是否确认删除${row.path}下全部图片?`, "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return mappictureDeleteByPath({
            path: row.path,
          });
        })
        .then(() => {
          this.getTree();
          this.$message.success("删除成功");
        })
        .catch(() => {});
    },
    handleShowImageList(row) {
      this.selectPath = row.path;
      this.imageList = row.pictures;
      this.showImageList = true;
    },
    handleDeleteImage(row) {
      this.$confirm(`是否确认删除当前图片?`, "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return mappictureDelete(row.id);
        })
        .then(() => {
          this.imageDialog = {
            visible: false,
            data: null,
          };
          this.getTree();
          this.$message.success("删除成功");
        })
        .catch(() => {});
    },
  },
};
</script>

<style lang="scss" scoped>
.ImageListDialog {
  .image_title {
    display: flex;
    .path {
      flex: 1;
    }
  }
  .image_list {
    height: calc(100vh - 300px);
    margin-top: 20px;
    overflow-x: hidden;
    overflow-y: auto;
    .image_box {
      position: relative;
      display: inline-block;
      margin: 10px;
      width: 140px;
      height: 140px;
      .el-image {
        width: 100%;
        height: 100%;
      }
      .btn_list {
        cursor: pointer;
        background-color: #ffffff99;
        position: absolute;
        top: 0;
        right: 0;
        font-size: 16px;
        border-radius: 0 0 0 5px;
        display: flex;
        .el-icon-aim {
          color: #409eff;
          padding: 5px;
        }
        .el-icon-delete {
          color: #ff0000;
          padding: 5px;
        }
      }
    }
  }
}
</style>
