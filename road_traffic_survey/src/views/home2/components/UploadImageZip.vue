<!-- UploadImageZip -->
<template>
  <div class="UploadImageZip">
    <el-button type="primary" @click="handleOpenDialog">上传图片</el-button>
    <el-dialog title="上传图片" :visible.sync="open" width="500px" append-to-body @close="handleClose">
      <el-form :model="form" ref="form" :rules="rules" label-width="80px" :inline="false" size="small">
        <el-form-item label="名称" prop="projectName">
          <el-input v-model="form.projectName"></el-input>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-input v-model="form.type"></el-input>
        </el-form-item>
        <el-form-item label="文件" prop="file">
          <div class="file_box" v-if="form.file">
            <div class="file_name">{{ form.file.name }}</div>
            <i class="el-icon-circle-close" @click="form.file = null"></i>
          </div>
          <el-button v-else type="primary" size="small" @click="handleSelectFile">选择文件</el-button>
        </el-form-item>
        <el-form-item>
          <div class="progress_box" v-if="updoading">
            <el-progress :percentage="progress"></el-progress>
            <i class="el-icon-circle-close" @click="controller.abort()"></i>
          </div>
          <template v-else>
            <el-button type="primary" size="small" @click="handleSubmit">立即上传</el-button>
            <el-button size="small" @click="open = false">取消</el-button>
          </template>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import request from "@/utils/request";

export default {
  name: "UploadImageZip",
  props: {},
  components: {},
  computed: {},
  watch: {},
  data() {
    return {
      controller: null,
      progress: 0,
      updoading: false,
      open: false,
      form: {
        name: "",
        type: "",
        file: null,
      },
      rules: {
        file: [
          {
            trigger: "blur",
            validator: (rule, value, callback) => {
              if (!this.form.file) {
                callback(new Error("请选择文件"));
              } else {
                callback();
              }
            },
          },
        ],
      },
    };
  },
  created() {},
  mounted() {},
  methods: {
    handleOpenDialog() {
      this.form = { projectName: "", type: "", file: null };
      this.open = true;
    },
    handleSelectFile() {
      if (this._input) {
        document.body.removeChild(this._input);
        this._input = null;
      }
      this._input = document.createElement("input");
      this._input.type = "file";
      this._input.accept = ".zip";
      this._input.style = "position: fixed;left: -100vw;top: -100vh;";
      this._input.onchange = () => {
        let file = this._input.files[0];
        if (file) {
          this.form.fileName = file.name;
          this.form.file = file;
        }
        document.body.removeChild(this._input);
        this._input = null;
      };
      document.body.appendChild(this._input);
      this._input.click();
    },
    handleSubmit() {
      this.$refs.form.validate(async (valid) => {
        if (!valid) return;
        if (this.controller) this.controller.abort();
        this.controller = new AbortController();
        let data = new FormData();
        data.append("file", this.form.file);
        data.append("projectName", this.form.projectName);
        data.append("type", this.form.type);
        request({
          url: `/mappicture/uploadzip`,
          method: "post",
          headers: {
            "Content-Type": "multipart/form-data",
          },
          data: data,
          signal: this.controller.signal,
          onUploadProgress: (progressEvent) => {
            this.progress = Math.floor(progressEvent.progress * 95);
            this.updoading = true;
          },
        })
          .then((res) => {
            this.open = false;
            this.$message.success("上传成功");
          })
          .finally(() => {
            this.controller = null;
            this.updoading = false;
            this.progress = 0;
          });
      });
    },
    handleClose() {
      if (this.controller) this.controller.abort();
    },
  },
};
</script>

<style lang="scss" scoped>
.progress_box {
  display: flex;
  align-items: center;
  height: 40px;
  .el-progress {
    width: 100%;
  }
  .el-icon-circle-close {
    cursor: pointer;
    margin-left: 10px;
  }
}

.file_box {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 0px 15px;
  border-radius: 5px;
  border: 1px solid #409eff;
  color: #409eff;
  line-height: 28px;
  .file_name {
    width: 100%;
    flex-grow: 1;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
  .el-icon-circle-close {
    cursor: pointer;
    color: #f56c6c;
  }
}
</style>
