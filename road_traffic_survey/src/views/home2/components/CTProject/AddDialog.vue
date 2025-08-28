<!-- AddDialog -->
<template>
  <Dialog class="AddDialog" title="新建项目" :top="20" :left="20" width="500px" hideMinimize :visible="visible" @close="handleClose">
    <el-form :model="form" ref="form" :rules="rules" label-width="100px" :inline="false" size="mini">
      <el-form-item label="项目名：" prop="name">
        <el-input v-model="form.name" placeholder="" size="mini" clearable @change=""></el-input>
      </el-form-item>
      <el-form-item label="创建人：" prop="creator">
        <el-input v-model="form.creator" placeholder="" size="mini" clearable @change=""></el-input>
      </el-form-item>
      <el-form-item label="项目时间：" prop="projectTime">
        <el-date-picker v-model="form.projectTime" type="month" size="mini" placeholder="选择日期时间" value-format="yyyy-MM"> </el-date-picker>
      </el-form-item>
      <el-form-item label="项目范围：" :prop="{ 1: 'xyarr', 2: 'file' }[form.xyarrType]">
        <el-radio-group v-model="form.xyarrType" size="mini">
          <el-radio-button :label="1">地图框选</el-radio-button>
          <el-radio-button :label="2">上传shp</el-radio-button>
        </el-radio-group>
        <template v-if="form.xyarrType == 1">
          <div style="margin-top: 10px">
            <el-button v-if="selectState == POLYGON_SELECT_STATE_KEY.NOT_STARTED" type="primary" size="mini" @click="handlePlayPolygonSelect()">开始圈定</el-button>
            <template v-if="selectState != POLYGON_SELECT_STATE_KEY.NOT_STARTED">
              <el-button type="primary" size="mini" @click="handleReplayPolygonSelect()">重新圈定</el-button>
              <el-button type="primary" size="mini" @click="handleStopPolygonSelect()">结束圈定</el-button>
            </template>
          </div>
          <div v-if="form.xyarr" style="margin-top: 10px">{{ form.xyarr }}</div>
        </template>
        <template v-if="form.xyarrType == 2">
          <div style="margin-top: 10px">
            <el-button type="primary" size="mini" @click="handleSelectFile">上传shp</el-button>
          </div>
          <div v-if="form.file" style="margin-top: 10px">{{ form.file.name }}</div>
        </template>
      </el-form-item>
      <el-form-item label="注：">该范围仅供参考，可框选大概位置。</el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSubmit">立即创建</el-button>
        <el-button @click="handleClose">取消</el-button>
      </el-form-item>
    </el-form>
  </Dialog>
</template>

<script>
import { PolygonSelectLayer, POLYGON_SELECT_STATE_KEY, POLYGON_SELECT_EVENT } from "../../layer/PolygonSelectLayer";
import { projectList, projectInsert, projectDelete, projectAddSample, projectQuerySample } from "@/api/index";
import { selectFile } from "@/utils/index";
export default {
  name: "AddDialog",
  inject: ["rootVue"],
  props: {
    visible: {
      type: Boolean,
    },
  },
  components: {},
  computed: {
    _Map() {
      return this.rootVue._Map;
    },
  },
  watch: {
    visible: {
      handler(val) {
        this.s_visible = val;
        if (val) {
          this.handleEnable();
        } else {
          this.handleDisable();
        }
      },
    },
  },
  data() {
    return {
      POLYGON_SELECT_STATE_KEY,
      s_visible: false,
      form: {
        name: "",
        creator: "",
        projectTime: "",
        file: null,
        xyarr: null,
        xyarrType: 1,
      },
      rules: {
        name: [{ required: true, message: "项目名不能为空", trigger: "blur" }],
        creator: [{ required: true, message: "创建人不能为空", trigger: "blur" }],
        projectTime: [{ required: true, message: "项目时间不能为空", trigger: "blur" }],
        xyarr: [{ required: true, message: "项目范围不能为空", trigger: "blur" }],
        file: [{ required: true, message: "项目范围不能为空", trigger: "blur" }],
      },
      selectState: POLYGON_SELECT_STATE_KEY.NOT_STARTED,
    };
  },
  created() {
    this.s_visible = this.visible;
    this._PolygonSelectLayer = new PolygonSelectLayer({
      zIndex: 200,
      event: {
        [POLYGON_SELECT_EVENT.STATE_CHANGE]: (res) => {
          this.selectState = res.data.state;
          if (this.selectState === POLYGON_SELECT_STATE_KEY.ENDED) {
            const path = res.data.path;
            path[path.length] = [...path[0]];
            this.handleStopPolygonSelect();
            this.form.xyarr = path;
          }
        },
      },
    });
  },
  mounted() {
    this._interval = setInterval(() => {
      if (!this._Map) return;
      clearInterval(this._interval);
      if (this.s_visible) {
        this.handleEnable();
      }
    }, 1000);
  },
  beforeDestroy() {
    this.handleDisable();
  },
  methods: {
    handleEnable() {
      this._Map.addLayer(this._PolygonSelectLayer);
    },
    handleDisable() {
      this.handleStopPolygonSelect(true);
      this._Map.removeLayer(this._PolygonSelectLayer);
    },
    handleClose() {
      this.addForm = {
        name: "",
        creator: "",
        projectTime: "",
        file: "",
        xyarr: "",
        xyarrType: 1,
      };
      this.$emit("update:visible", false);
      this.$emit("close");
    },
    handleSubmit() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          const form = {
            name: this.form.name,
            creator: this.form.creator,
            projectTime: this.form.projectTime,
            xyarrType: 1,
          };
          if (this.form.xyarrType == 1) form.xyarr = JSON.stringify(this.form.xyarr);
          if (this.form.xyarrType == 2) form.file = this.form.file;
          projectInsert(form).then((response) => {
            this.$message.success("新建项目成功");
            this.$emit("success", response.data.id);
          });
        }
      });
    },
    // ****************************** 数据筛选 -- 区域框选 -- start
    handlePlayPolygonSelect() {
      if (this._PolygonSelectLayer) {
        this._PolygonSelectLayer.reset();
        this._PolygonSelectLayer.play();
        this.selectState = this._PolygonSelectLayer.state;
      }
    },
    handleReplayPolygonSelect() {
      if (this._PolygonSelectLayer) {
        this._PolygonSelectLayer.reset();
        this._PolygonSelectLayer.play();
        this.selectState = this._PolygonSelectLayer.state;
      }
    },
    handleStopPolygonSelect(reset) {
      if (this._PolygonSelectLayer) {
        if (reset) this._PolygonSelectLayer.reset();
        this._PolygonSelectLayer.stop();
        this.selectState = this._PolygonSelectLayer.state;
      }
    },
    // ****************************** 数据筛选 -- 区域框选 -- end
    handleSelectFile() {
      selectFile(".shp").then((file) => (this.form.file = file));
    },
  },
};
</script>

<style lang="scss" scoped>
.AddDialog {
}
</style>
