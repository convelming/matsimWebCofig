<!-- add -->
<template>
  <el-dialog :title="title" :visible.sync="s_visible" width="600px" @close="handleClose" append-to-body>
    <el-form :model="form" ref="formRef" :rules="rules" label-position="top" :inline="false" size="">
      <el-form-item label="标题：" prop="title">
        <el-input v-model="form.title"></el-input>
      </el-form-item>
      <el-form-item label="内容：" prop="content">
        <QuillEditor ref="QuillEditorRef" />
      </el-form-item>
      <el-form-item label="类型：" prop="type">
        <el-select v-model="form.type" placeholder="请选择类型">
          <el-option v-for="(label, value) in feedback_type" :label="label" :value="value" :key="value"></el-option>
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="封面：" prop="cover">
        <el-upload class="avatar-uploader" :show-file-list="false" v-model:file-list="form.cover" v-bind="uploadConfig2">
          <el-image v-if="form.cover && form.cover[0]" class="avatar" :src="VITE_APP_BASE_API + form.cover[0].response.data.url" fit="fill" :lazy="true"></el-image>
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
      </el-form-item>
      <el-form-item label="附件上传：" prop="annexs">
        <el-upload class="upload" v-model:file-list="form.annexs" v-bind="uploadConfig" drag multiple>
          <div class="upload__text">
            <el-icon size="30px" color="#30B690"><Plus /></el-icon>
            <span>点击上传文件</span>
          </div>
          <div class="upload__tip">支持pdf/word/ppt/excl格式，文件大小不超过10Mb</div>
        </el-upload>
      </el-form-item>
      <el-form-item label="时间：" prop="date">
        <el-date-picker v-model="form.date" type="datetime" placeholder="选择日期" value-format="YYYY-MM-DD HH:mm:ss"></el-date-picker>
      </el-form-item>
      <el-form-item label="作者：" prop="author">
        <el-input style="width: 220px" v-model="form.author"></el-input>
      </el-form-item> -->
      <el-form-item>
        <el-button type="primary" @click="onSubmit">提交</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>
import QuillEditor from "@/components/QuillEditor.vue";
import { addPosts } from "@/api/feedback";
import { Promise } from "core-js";
export const feedback_type = {
  0: "BUG",
  1: "建议",
};
export default {
  name: "add",
  props: {
    visible: Boolean,
    fbId: {
      type: [String, Number],
      default: -1,
    },
    type: [String, Number],
  },
  components: {
    QuillEditor,
  },
  computed: {
    title() {
      if (this.fbId == -1) {
        return "添加";
      } else {
        return "修改";
      }
    },
  },
  watch: {
    visible: {
      handler: function (val) {
        this.s_visible = val;
      },
      immediate: true,
    },
    s_visible: {
      handler: function (val) {
        if (val) {
          if (this.fbId == -1) {
            this.resetForm();
          } else {
            this.getDetail();
          }
        }
      },
    },
  },
  data() {
    return {
      feedback_type: feedback_type,
      s_visible: false,

      submiting: false,
      form: {
        title: "",
        content: "",
        cover: [],
        annexs: [],
        date: "",
        author: "",
      },
      rules: {
        title: [
          {
            required: true,
            message: "请输入标题",
            trigger: "blur",
          },
        ],
        content: [
          {
            required: true,
            message: "请输入内容",
            trigger: "blur",
          },
        ],
        cover: [
          {
            required: true,
            message: "请上传封面",
          },
        ],
      },
      uploadConfig: {
        action: import.meta.env.VITE_APP_BASE_API + "/newsAnnex",
        data: {
          type: 1,
        },
        accept: "",
        limit: 10,
        headers: {},
        disabled: false,
        autoUpload: true,
        method: "put",
      },
      uploadConfig2: {
        action: import.meta.env.VITE_APP_BASE_API + "/newsAnnex",
        data: {
          type: 1,
        },
        accept: "",
        limit: 10,
        headers: {},
        disabled: false,
        autoUpload: true,
        method: "put",
      },
    };
  },

  created() {},
  mounted() {},
  methods: {
    handleClose() {
      this.s_visible = false;
      this.$emit("update:visible", false);
      this.$emit("close");
    },
    resetForm() {
      this.form = {
        title: "",
        author: "",
        date: "",
        content: "",
        cover: [],
        annexs: [],
        type: this.type || "",
      };
      this.$refs.QuillEditorRef?.setHTML("");
      this.submiting = false;
      this.$refs.formRef?.resetFields();
    },
    getDetail() {
      getPosts(this.fbId).then((res) => {
        this.$refs.formRef.resetFields();
        const cover =
          res.data.annexs
            ?.filter((v) => v.type == 0)
            .map((v) => {
              return {
                name: v.name,
                url: v.url,
                response: {
                  data: v,
                },
              };
            }) || [];

        const annexs =
          res.data.annexs
            ?.filter((v) => v.type == 1)
            .map((v) => {
              return {
                name: v.name,
                url: v.url,
                response: {
                  data: v,
                },
              };
            }) || [];
        this.form = {
          title: res.data.title,
          author: res.data.author,
          date: res.data.date,
          content: res.data.content,
          cover: cover,
          annexs: annexs,
        };
        this.$refs.QuillEditorRef.setHTML(res.data.content);
      });
    },
    onSubmit() {
      this.submiting = true;
      this.form.content = this.$refs.QuillEditorRef.getHTML();
      this.$refs.formRef
        .validate()
        .then((value) => {
          if (value) {
            const _form = {
              title: this.form.title,
              content: this.form.content,
              annexs: [...this.form.annexs.map((v) => v.response.data), ...this.form.cover.map((v) => v.response.data)],
              date: this.form.date,
              author: this.form.author,
              type: this.form.type,
            };
            if (this.fbId == -1) {
              return addPosts(_form).then((res) => {
                this.$message.success("添加成功");
                handleClose();
                this.$emit("submited", _form.type);
              });
            } else {
              _form.id = this.fbId;
              return updatePosts(_form).then((res) => {
                this.$message.success("修改成功");
                handleClose();
                this.$emit("submited", _form.type);
              });
            }
          } else {
            return Promise.reject();
          }
        })
        .finally(() => {
          this.submiting = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.add {
  box-sizing: border-box;
  background-color: #fff;
  max-width: 1200px;
  min-height: 100vh;
  margin: 0 auto;
  padding: 40px 80px;
  display: flex;
  flex-direction: column;
  gap: 30px;
  .title {
    font-size: 20px;
    font-weight: 600;
  }
}
</style>
