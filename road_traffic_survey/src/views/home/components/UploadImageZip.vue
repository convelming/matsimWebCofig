<!-- UploadImageZip -->
<template>
  <div class="UploadImageZip">
    <div class="progress_box" v-if="updoading">
      <el-progress :percentage="progress"></el-progress>
      <i class="el-icon-circle-close" @click="controller.abort()"></i>
    </div>
    <el-button v-else type="primary" @click="handleSelectFile">选择Zip文件</el-button>
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
    };
  },
  created() {},
  mounted() {},
  methods: {
    handleSelectFile() {
      if (this.controller) this.controller.abort();
      this.controller = new AbortController();
      let input = document.createElement("input");
      input.type = "file";
      input.accept = ".zip";
      input.style = "position: fixed;left: -100vw;top: -100vh;";
      input.onchange = () => {
        let file = input.files[0];
        let data = new FormData();
        data.append("file", file);
        request({
          url: `/mappicture/uploadzip`,
          method: "post",
          headers: {
            "Content-Type": "multipart/form-data",
          },
          data: data,
          signal: this.controller.signal,
          onUploadProgress: (progressEvent) => {
            console.log(progressEvent);
            // this.progress = progressEvent.loaded / progressEvent.total;
            this.progress = Math.floor(progressEvent.progress * 95);
            this.updoading = true;
          },
        })
          .then((res) => {
            this.handleInput(res.data);
          })
          .finally(() => {
            document.body.removeChild(input);
            this.updoading = false;
            this.progress = 0;
          });
      };
      document.body.appendChild(input);
      input.click();
    },
  },
};
</script>

<style lang="scss" scoped>
.UploadImageZip {
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
    margin-top: 20px;
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 5px 15px;
    border-radius: 5px;
    border: 1px solid #409eff;
    color: #409eff;
    line-height: 30px;
    .file_name {
      width: 100%;
      flex-grow: 1;
    }
    .el-icon-delete {
      cursor: pointer;
      color: #f56c6c;
    }
  }
}
</style>
