<!-- ImageListDialog -->
<template>
  <Dialog class="ImageListDialog" title="图片列表" :top="20" :left="20" :width="showImageList ? '500px' : '900px'" hideMinimize :visible="visible" @close="handleClose">
    <div v-show="!showImageList">
      <el-form :model="queryparam" ref="form" label-width="auto" :inline="true" size="small">
        <el-form-item label="名称">
          <el-input style="width: 150px" v-model="queryparam.name"></el-input>
        </el-form-item>
        <el-form-item label="类型">
          <el-input style="width: 150px" v-model="queryparam.type"></el-input>
        </el-form-item>
        <el-form-item label="时间">
          <el-date-picker style="width: 250px" v-model="queryparam.time" type="daterange" value-format="yyyy-MM-dd" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getTree">搜索</el-button>
        </el-form-item>
      </el-form>
      <div style="height: calc(100vh - 300px); overflow-y: scroll">
        <el-tree
          ref="tree"
          :data="dirList"
          :props="{
            children: 'subdir',
            label: 'name',
          }"
          node-key="path"
          default-expand-all
          show-checkbox
          @check-change="handleCheckChange"
        >
          <span class="custom-tree-node" slot-scope="{ node, data }">
            <span class="col1">{{ data.name }}</span>
            <span class="col2">{{ data.type }}</span>
            <span class="col2">{{ data.createTime }}</span>
            <span class="col2" style="width: 150px; text-align: center">
              <el-button type="text" style="color: red" @click.stop="handleDeleteDir(data)">删除</el-button>
              <el-button type="text" @click.stop="handleRename(data)">重命名</el-button>
              <el-button v-if="data.pictures && data.pictures.length" type="text" @click.stop="handleShowImageList(data)">查看</el-button>
            </span>
          </span>
        </el-tree>
      </div>
      <!-- <el-table :data="dirList" style="width: 100%" height="calc(100vh - 300px)" row-key="path" border default-expand-all :tree-props="{ children: 'subdir' }">
        <el-table-column type="selection" width="55"> </el-table-column>
        <el-table-column label="名称" prop="name" />
        <el-table-column label="时间" prop="createTime" width="180" />
        <el-table-column label="操作" width="100">
          <template slot-scope="{ row }">
            <el-button type="text" size="mini" @click="handleDeleteDir(row)">删除</el-button>
            <el-button v-if="row.pictures && row.pictures.length" type="text" size="mini" @click="handleShowImageList(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table> -->
    </div>
    <div v-show="showImageList">
      <div class="image_title">
        <div class="path">{{ selectPath }}</div>
        <el-button icon="el-icon-arrow-left" type="primary" size="mini" @click="handleShowImageList(null)">返回</el-button>
      </div>
      <el-checkbox style="margin-top: 10px" v-model="selectAllImage" :indeterminate="false" @change="handleSelectAllImageList">全选</el-checkbox>
      <div class="image_list">
        <div class="flex_box">
          <div class="image_box upload el-icon-plus" @click="uploadOneImage"></div>
          <div class="image_box" v-for="(item, index) in imageList" :key="index">
            <el-image :src="item.url" :preview-src-list="previewSrcList" fit="fill" :lazy="true"></el-image>
            <div class="btn_list">
              <el-checkbox v-model="item.check" :indeterminate="false" @change="handleImageListCheckChange"></el-checkbox>
              <div class="el-icon-aim" @click.stop="handleSetCenter(item)"></div>
              <div class="el-icon-delete" @click.stop="handleDeleteImage(item)"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>
import { mappictureTreeList, mappictureDelete, mappictureDeleteByPath, mappictureRename } from "@/api/index";
import request from "@/utils/request";

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
        type: "",
        time: [],
      },
      dirList: [],
      showImageList: false,
      selectPath: "",
      imageList: [],
      selectAllImage: true,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {
    this.handleDisable();
  },
  methods: {
    handleCheckChange() {
      if (this.$refs.tree) {
        const pathList = this.$refs.tree.getCheckedNodes();
        const imageList = pathList.map((item) => item.pictures).flat(2);
        this.rootVue._ImageListLayer.setData(imageList);
        this.rootVue.showImageListLayer = true;
      }
    },
    handleSelectAllImageList(value) {
      console.log(value);
      this.selectAllImage = value;
      this.imageList.forEach((item) => {
        item.check = value;
      });
      this.handleImageListCheckChange();
    },
    handleImageListCheckChange() {
      const imageList = this.imageList.filter((item) => item.check);
      this.rootVue._ImageListLayer.setData(imageList);
      this.rootVue.showImageListLayer = true;
    },
    handleSetCenter(row) {
      if (row) {
        this.rootVue.handleSetHMash(row);
        this.rootVue._Map.setCenter([row.x, row.y]);
      } else {
        this.rootVue.handleSetHMash(null);
      }
    },
    getTree() {
      let selectTree = [];
      if (this.$refs.tree) selectTree = this.$refs.tree.getCheckedKeys();
      const { name, time, type } = this.queryparam;
      mappictureTreeList({
        type: type,
        name: name,
        beginTime: (time || [])[0] || "",
        endTime: (time || [])[1] || "",
      }).then((res) => {
        this.dirList = res.data;

        const list = [...res.data];
        let selectPath = null;
        while (list.length) {
          const item = list.shift();
          if (item.subdir && item.subdir.length) {
            list.push(...item.subdir);
          }
          if (item.path == this.selectPath) {
            selectPath = item;
            break;
          }
        }
        this.handleShowImageList(selectPath);
        this.$nextTick(() => {
          this.$refs.tree.setCheckedKeys(selectTree);
        });
      });
    },
    handleEnable() {
      this.getTree();
    },
    handleDisable() {
      this.handleShowImageList(null);
    },
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
      if (row) {
        this.selectPath = row.path;
        this.imageList = row.pictures.map((item) => ({ ...item, check: true }));
        this.showImageList = true;
        this.handleImageListCheckChange();
      } else {
        this.selectPath = null;
        this.imageList = [];
        this.showImageList = false;
        this.handleCheckChange();
        this.handleSetCenter(null);
      }
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
          this.getTree();
          this.$message.success("删除成功");
        })
        .catch(() => {});
    },
    uploadOneImage() {
      let input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.style = "position: fixed;left: -100vw;top: -100vh;";
      input.onchange = () => {
        let file = input.files[0];
        let data = new FormData();
        data.append("path", this.selectPath);
        data.append("file", file);
        let loading = this.$loading();
        request({
          url: `/mappicture/uploadimg`,
          method: "post",
          headers: {
            "Content-Type": "multipart/form-data",
          },
          data: data,
          // signal: this.controller.signal,
          // onUploadProgress: (progressEvent) => {
          //   // this.progress = progressEvent.loaded / progressEvent.total;
          //   this.progress = Math.floor(progressEvent.progress * 95);
          //   this.updoading = true;
          // },
        })
          .then((res) => {
            this.getTree();
            this.$message.success("上传成功");
          })
          .finally(() => {
            document.body.removeChild(input);
            // this.updoading = false;
            // this.progress = 0;
            loading.close();
          });
      };
      document.body.appendChild(input);
      input.click();
    },
    handleRename(data) {
      this.$prompt("请输入新名称", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
      }).then(({ value }) => {
        mappictureRename({
          path: data.path,
          name: value,
        })
          .then(() => {
            this.getTree();
            this.$message.success("修改成功");
          })
          .catch(() => {});
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.ImageListDialog {
  .image_title {
    display: flex;
    gap: 10px;
    .path {
      flex: 1;
    }
  }
  .image_list {
    height: calc(100vh - 300px);
    margin-top: 10px;
    overflow-x: hidden;
    overflow-y: auto;
    .flex_box {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      .image_box {
        position: relative;
        width: 140px;
        height: 140px;

        &.upload {
          border: 1px dashed #409eff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
          color: #409eff;
          cursor: pointer;
        }
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
          align-items: center;
          .el-icon-aim {
            color: #409eff;
            padding: 5px;
          }
          .el-icon-delete {
            color: #ff0000;
            padding: 5px;
          }

          .el-checkbox {
            padding: 5px;
          }
        }
      }
    }
  }

  .custom-tree-node {
    display: flex;
    align-items: center;
    width: 100%;
    gap: 10px;
    .col1 {
      flex: 1;
      width: 0;
    }
  }

  ::v-deep {
    .el-tree-node__content {
      height: 32px;
    }
  }
}
</style>
