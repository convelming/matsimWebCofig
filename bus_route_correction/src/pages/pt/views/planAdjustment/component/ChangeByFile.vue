<!-- ChangeByFile -->
<template>
  <div class="ChangeByFile">
    <el-row :gutter="20" style="padding-bottom: 20px">
      <el-col :span="12">
        <el-button type="danger" size="small" @click="handleOpenGTFS" :loading="gtfsLoading">{{ $l("上传gtfs") }}</el-button>
      </el-col>
      <el-col :span="12">
        <el-button type="primary" size="small" @click="handleOpenSchedule" :loading="scheduleLoading">{{ $l("上传schedule") }}</el-button>
      </el-col>
    </el-row>
    <!-- <el-table class="small my_tabel" :data="list" border stripe height="calc(50vh - 160px)" v-loading="loading">
      <el-table-column :label="$l('路线名称')" prop="lineName" show-overflow-tooltip />
      <el-table-column width="80" :label="$l('操作')">
        <template slot-scope="{ row }">
          <el-button type="primary" size="mini" @click="handleEditRoute(row)">{{ $l("编辑") }}</el-button>
        </template>
      </el-table-column>
    </el-table> -->

    <el-dialog :title="$l('上传gtfs')" :visible.sync="gtfsShow" width="600px" append-to-body :close-on-click-modal="false" :close-on-press-escape="false" :show-close="false">
      <el-form :model="gtfsForm" ref="gtfsForm" :rules="gtfsRules" label-width="80px" :inline="false" size="small">
        <el-form-item :label="$l('gtfs')" prop="file">
          <el-button type="primary" size="small" @click="handleSelectFile('gtfsForm', 'file')">{{ $l("选择文件") }}</el-button>
          <div v-if="gtfsForm.file">{{ gtfsForm.file.name }}</div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="small" @click="handleSubmitGTFS" :loading="gtfsLoading">{{ $l("提交") }}</el-button>
          <el-button size="small" @click="gtfsShow = false" :loading="gtfsLoading">{{ $l("取消") }}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <el-dialog :title="$l('上传schedule')" :visible.sync="scheduleShow" width="600px" append-to-body :close-on-click-modal="false" :close-on-press-escape="false" :show-close="false">
      <el-form :model="scheduleForm" ref="scheduleForm" :rules="scheduleRules" label-width="80px" :inline="false" size="small">
        <el-form-item :label="$l('schedule')" prop="schedule">
          <el-button type="primary" size="small" @click="handleSelectFile('scheduleForm', 'schedule')">{{ $l("选择文件") }}</el-button>
          <div v-if="scheduleForm.schedule">{{ scheduleForm.schedule.name }}</div>
        </el-form-item>
        <el-form-item :label="$l('vehicle')" prop="vehicle">
          <el-button type="primary" size="small" @click="handleSelectFile('scheduleForm', 'vehicle')">{{ $l("选择文件") }}</el-button>
          <div v-if="scheduleForm.vehicle">{{ scheduleForm.vehicle.name }}</div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="small" @click="handleSubmitSchedule" :loading="scheduleLoading">{{ $l("提交") }}</el-button>
          <el-button size="small" @click="scheduleShow = false" :loading="scheduleLoading">{{ $l("取消") }}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<language>
{
  "上传gtfs": {
    "zh-CN":"上传gtfs",
    "en-US":"upload gtfs"
  },
  "上传schedule": {
    "zh-CN":"上传schedule",
    "en-US":"upload schedule"
  },
  "文件不能为空": {
    "zh-CN":"文件不能为空",
    "en-US":"The file cannot be empty"
  },
  "选择文件": {
    "zh-CN":"选择文件",
    "en-US":"Select file"
  },
  "gtfs": {
    "zh-CN":"gtfs",
    "en-US":"gtfs"
  },
  "schedule": {
    "zh-CN":"schedule",
    "en-US":"schedule"
  },
  "vehicle": {
    "zh-CN":"vehicle",
    "en-US":"vehicle"
  },
  "路线名称": {
    "zh-CN":"公交路线名称",
    "en-US":"Line Name"
  },
  "错误": {
    "zh-CN":"错误",
    "en-US":"Error"
  },
}
</language>

<script>
import { uploadGTFS, uploadSchedule, getUploadLines } from "@/api/index";
import { selectFile } from "@/utils/utils";

export default {
  name: "ChangeByFile",
  props: {},
  components: {},
  computed: {},
  watch: {},
  inject: ["rootVue"],
  data() {
    const fileNoNull = (rule, value, callback) => {
      if (!value) {
        callback(new Error(this.$l("文件不能为空")));
      } else {
        callback();
      }
    };
    return {
      gtfsLoading: false,
      gtfsForm: {
        file: null,
      },
      gtfsRules: {
        file: { validator: fileNoNull, trigger: "blur" },
      },
      gtfsShow: false,
      scheduleLoading: false,
      scheduleForm: {
        schedule: null,
        vehicle: null,
      },
      scheduleRules: {
        schedule: { validator: fileNoNull, trigger: "blur" },
        vehicle: { validator: fileNoNull, trigger: "blur" },
      },
      scheduleShow: false,

      list: [],
      loading: false,
    };
  },
  created() {
    // this.getList();
  },
  mounted() {},
  methods: {
    getList() {
      this.rootVue.getChangedList();
      // this.loading = true;
      // getUploadLines()
      //   .then((res) => {
      //     this.list = res.data;
      //     this.loading = false;
      //   })
      //   .catch((err) => {
      //     this.list = [];
      //     this.loading = false;
      //   });
    },
    handleEditRoute(row) {
      this.rootVue.handleEditRoute(row);
    },
    handleSelectFile(formName, paramName, accept = "*/*") {
      selectFile(accept).then((file) => {
        console.log(file);
        this.$set(this[formName], paramName, file);
      });
    },
    handleOpenGTFS() {
      this.gtfsForm = {
        file: null,
      };
      this.gtfsShow = true;
    },
    handleSubmitGTFS() {
      this.$refs.gtfsForm.validate((valid) => {
        if (valid) {
          this.gtfsLoading = true;
          uploadGTFS(this.gtfsForm.file)
            .then((res) => {
              this.gtfsShow = false;
              this.gtfsLoading = false;
              this.$message.success(this.$l("上传成功"));
              this.getList();
            })
            .catch((err) => {
              this.$confirm(err.message, this.$l("错误"), {
                dangerouslyUseHTMLString: true,
                confirmButtonText: this.$l("确定"),
                type: "error",
              });
              this.gtfsLoading = false;
            });
        }
      });
    },
    handleOpenSchedule() {
      this.scheduleForm = {
        schedule: null,
        vehicle: null,
      };
      this.scheduleShow = true;
    },
    handleSubmitSchedule() {
      this.$refs.scheduleForm.validate((valid) => {
        if (valid) {
          this.scheduleLoading = true;
          uploadSchedule(this.scheduleForm.schedule, this.scheduleForm.vehicle)
            .then((res) => {
              this.scheduleShow = false;
              this.scheduleLoading = false;
              this.$message.success(this.$l("上传成功"));
              this.getList();
            })
            .catch((err) => {
              this.$confirm(err.message, this.$l("错误"), {
                dangerouslyUseHTMLString: true,
                confirmButtonText: this.$l("确定"),
                type: "error",
              });
              this.scheduleLoading = false;
            });
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.ChangeByFile {
  .el-button {
    width: 100%;
  }
}
</style>
