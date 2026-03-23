<template>
  <Dialog class="VideoInputCrossroads" title="视频录入交叉口" :top="50" :left="100" width="600px" hideMinimize :visible="visible" @close="handleClose">
    <el-form :model="form" ref="form" :rules="rules" label-width="100px" size="small">
      <el-form-item label="调查时间" prop="date">
        <el-date-picker v-model="form.date" type="datetimerange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd HH:mm:ss"> </el-date-picker>
      </el-form-item>
      <el-form-item label="调查视频" prop="video">
        <UploadVideo v-model="form.video" />
      </el-form-item>
      <el-form-item label="视频角度" prop="videoType">
        <el-radio-group v-model="form.videoType">
          <el-radio v-for="item in videoType" :key="item.value" :label="item.value" :disabled="item.disabled"> {{ item.label }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="附件" prop="annex">
        <el-upload class="upload-demo" action="/file/upload" multiple :file-list="form.annex" :on-success="handleUploadAnnex">
          <el-button size="small" type="primary">点击上传</el-button>
        </el-upload>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input type="textarea" v-model="form.remark" :autosize="{ minRows: 2 }"> </el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleClose">取消</el-button>
        <el-button :loading="saving" type="primary" @click="handleSubmit">下一步</el-button>
      </el-form-item>
    </el-form>
  </Dialog>
</template>

<script>
import { crossroadsInsert, intersectionDetail } from "@/api/index";

export default {
  name: "VideoInputCrossroads",
  inject: ["rootVue"],
  props: {
    visible: {
      type: Boolean,
    },
    params: {
      type: Object,
    },
  },
  components: {},
  computed: {},
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
      upload: {
        loading: false,
        progress: 0,
        file: null,
      },
      saving: false,
      form: {
        date: [],
        video: "",
        remark: "",
        videoType: 1,
        annex: [],
      },
      rules: {
        date: [{ required: true, message: "调查时间不能为空", trigger: "blur" }],
        video: [{ required: true, message: "调查视频不能为空", trigger: "blur" }],
      },
      videoType: [
        { label: "俯视航拍", value: 1 },
        { label: "侧面路拍", value: 2, disabled: true },
        { label: "正斜角拍摄", value: 3, disabled: true },
      ],
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {
    this.handleDisable();
  },
  methods: {
    handleChangeSelectState(value) {
      if (this._PointSelectLayer) {
        this.rootVue._PointSelectLayer.state = value;
      }
    },
    // 组件显示事件
    handleEnable() {
      intersectionDetail(this.params.intersectionId).then((res) => {
        this.intersectionDetail = res.data;
        this.form = {
          date: [],
          video: "",
          remark: "",
          videoType: 1,
          annex: [],
        };
      });
    },
    // 组件隐藏事件
    handleDisable() {},
    handleClose() {
      this.$emit("update:visible", false);
      this.$emit("close");
    },
    handleUploadAnnex(response, file, fileList) {
      this.form.annex = fileList;
    },
    handleSubmit() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          const form = {
            intersectionId: this.intersectionDetail.id,
            beginTime: this.form.date[0], // 开始时间
            endTime: this.form.date[1], // 结束时间
            type: "2", // 类型
            video: this.form.video, // 视频路径
            videoType: this.form.videoType, // 视频路径
            annex: this.form.annex.map((v) => ({
              name: v.name,
              url: v.response.data,
            })), // 附件
            mapInfo: JSON.stringify({
              center: [this.intersectionDetail.x, this.intersectionDetail.y],
              zoom: 19,
              rotation: 0,
            }),
            remark: this.form.remark, // 备注
          };
          this.saving = true;
          crossroadsInsert(form)
            .then((res) => {
              this.$emit("submited", res.data);
              this.saving = false;
            })
            .catch((err) => {
              this.saving = false;
            });
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.VideoInputCrossroads {
}
</style>
