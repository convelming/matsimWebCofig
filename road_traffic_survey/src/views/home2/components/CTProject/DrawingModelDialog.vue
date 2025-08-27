<!-- DrawingModelDialog -->
<template>
  <div class="DrawingModelDialog">
    <Dialog title="出图模式" class="DrawingModelDialog1" :top="20" :left="20" width="600px" hideMinimize :visible="showMainDialog" @close="handleClose">
      <el-collapse style="user-select: none" v-model="activeNames" accordion>
        <el-collapse-item title="基础信息" name="0">
          <el-form v-if="editForm" :model="form" ref="form" :rules="rules" label-width="100px" :inline="false" size="mini">
            <el-form-item label="项目名：" prop="name">{{ form.name }}</el-form-item>
            <el-form-item label="创建人：" prop="creator">{{ form.creator }}</el-form-item>
            <el-form-item label="项目时间：" prop="projectTime">{{ form.projectTime.slice(0, 7) }}</el-form-item>
            <el-form-item label="项目范围：" :prop="{ 1: 'xyarr', 2: 'file' }[form.xyarrType]">
              <el-radio-group v-model="form.xyarrType" size="mini" @change="handleStopPolygonSelect(true)">
                <el-radio-button :label="1">地图框选</el-radio-button>
                <el-radio-button :label="2">上传shp</el-radio-button>
              </el-radio-group>
              <template v-if="form.xyarrType == 1">
                <div style="margin-top: 10px">
                  <el-button v-if="selectState == POLYGON_SELECT_STATE_KEY.NOT_STARTED" type="primary" size="mini" @click="handlePlayPolygonSelect('changeDetail')">开始圈定</el-button>
                  <template v-if="selectState != POLYGON_SELECT_STATE_KEY.NOT_STARTED">
                    <el-button type="primary" size="mini" @click="handleReplayPolygonSelect('changeDetail')">重新圈定</el-button>
                    <el-button type="primary" size="mini" @click="handleStopPolygonSelect('changeDetail')">结束圈定</el-button>
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
              <el-button type="primary" @click="handleSubmit">保存修改</el-button>
              <el-button @click="editForm = false">取消</el-button>
            </el-form-item>
          </el-form>
          <el-form v-else :model="detail" ref="form" :rules="rules" label-width="100px" :inline="false" size="mini">
            <el-form-item label="项目名：">{{ detail.name }}</el-form-item>
            <el-form-item label="创建人：">{{ detail.creator }}</el-form-item>
            <el-form-item label="项目时间：">{{ detail.projectTime.slice(0, 7) }}</el-form-item>
            <el-form-item label="项目范围：">
              <el-switch v-model="showDetailXyArr" :active-value="true" :inactive-value="false" @change=""> </el-switch>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" size="mini" @click="handleEdit">修改</el-button>
            </el-form-item>
          </el-form>
        </el-collapse-item>
        <el-collapse-item title="框选批量赋值：饱和度&服务水平" name="1">
          <div>
            <el-button v-if="selectState == POLYGON_SELECT_STATE_KEY.NOT_STARTED" type="primary" size="mini" @click="handlePlayPolygonSelect('changeLinksData')">开始圈定</el-button>
            <template v-if="selectState != POLYGON_SELECT_STATE_KEY.NOT_STARTED">
              <el-button type="primary" size="mini" @click="handleReplayPolygonSelect('changeLinksData')">重新圈定</el-button>
              <el-button type="primary" size="mini" @click="handleStopPolygonSelect('changeLinksData')">结束圈定</el-button>
            </template>
          </div>
        </el-collapse-item>
        <el-collapse-item title="数据复用" name="2">
          <el-form :model="queryParams" ref="queryForm" label-width="auto" :inline="true" size="mini">
            <el-form-item label="项目名">
              <el-input v-model="queryParams.name"></el-input>
            </el-form-item>
            <el-form-item label="创建人">
              <el-input v-model="queryParams.creator"></el-input>
            </el-form-item>
            <el-form-item label="时间">
              <el-date-picker v-model="dataRange" type="monthrange" range-separator="至" start-placeholder="开始月份" end-placeholder="结束月份" value-format="yyyy-MM"> </el-date-picker>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
              <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
          <div class="tree-box" v-loading="loading">
            <el-tree ref="tree" :data="list" node-key="id" :props="{ children: 'children', label: 'name' }" show-checkbox @check-change="handleTreeChange"></el-tree>
          </div>
        </el-collapse-item>
        <el-collapse-item title="样式调整" name="3">
          <el-form :model="styleForm" ref="styleForm" label-width="120px" size="mini">
            <el-form-item>
              <template slot="label">
                <div>线条宽度</div>
                <div>（饱和度）</div>
              </template>
              <el-slider v-model="styleForm.linkWidth" range show-stops :min="0" :max="20"> </el-slider>
            </el-form-item>
            <el-form-item>
              <template slot="label">
                <div>线条偏移</div>
              </template>
              <el-slider v-model="styleForm.linkOffset" :min="0" :max="20"> </el-slider>
            </el-form-item>
            <el-form-item>
              <template slot="label">
                <div>线条颜色</div>
                <div>（服务水平）</div>
              </template>
              <div style="display: flex; flex-direction: column; gap: 10px">
                <div v-for="item in styleForm.colorList" style="display: flex; align-items: center; gap: 10px">
                  <span>{{ item.label }}</span>
                  <el-color-picker v-model="item.color" show-alpha></el-color-picker>
                </div>
              </div>
            </el-form-item>
          </el-form>
        </el-collapse-item>
      </el-collapse>
      <el-button style="display: block; margin-top: 10px; width: 100%" type="primary" size="default" @click="drawing">出图</el-button>
    </Dialog>

    <Dialog title="框选批量赋值：饱和度&服务水平" class="DrawingModelDialog1" :top="20" :left="20" width="300px" hideMinimize :visible="showChangeLinksDialog" @close="handleCloseChangeLinksDialog">
      <el-form :model="changeLinksForm" ref="changeLinksForm" :rules="changeLinksRules" label-width="100px" :inline="false" size="mini">
        <el-form-item label="饱和度：" prop="saturation">
          <el-input-number v-model="changeLinksForm.saturation" :min="0" :step="0.01" :controls="true" />
        </el-form-item>
        <el-form-item label="服务水平：" prop="service">
          <el-select v-model="changeLinksForm.service">
            <el-option v-for="item in 'ABCDEF'" :key="item" :label="item" :value="item"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleChangeLinksSubmit">保存修改</el-button>
          <el-button @click="handleCloseChangeLinksDialog">取消</el-button>
        </el-form-item>
      </el-form>
    </Dialog>
  </div>
</template>

<script>
import { PolygonSelectLayer, POLYGON_SELECT_STATE_KEY, POLYGON_SELECT_EVENT } from "../../layer/PolygonSelectLayer";
import { PolygonsLayer } from "../../layer/PolygonsLayer";
import { LinksLayer } from "../../layer/LinksLayer";
import { projectDetail, projectList, projectUpdate, projectInsert, projectDelete, projectAddSample, projectQuerySample } from "@/api/index";
export default {
  name: "DrawingModelDialog",
  inject: ["rootVue"],
  props: {
    visible: {
      type: Boolean,
    },
    proId: {
      type: [String, Number],
      default: 0,
    },
  },
  components: {},
  computed: {
    _Map() {
      return this.rootVue._Map;
    },
    dataRange: {
      set() {
        if (val && val[0] && val[1]) {
          this.queryParams.startTime = val[0];
          this.queryParams.endTime = val[1];
        } else {
          this.queryParams.startTime = null;
          this.queryParams.endTime = null;
        }
      },
      get() {
        if (this.queryParams.startTime && this.queryParams.endTime) {
          return [this.queryParams.startTime, this.queryParams.endTime];
        }
        return [];
      },
    },
    showMainDialog() {
      return !this.showChangeLinksDialog && this.visible;
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
    showDetailXyArr(val) {
      if (val) {
        this._Map.addLayer(this._PolygonsLayer);
      } else {
        this._Map.removeLayer(this._PolygonsLayer);
      }
    },
    // styleForm: {
    //   handler(val) {
    //     console.log(val);
    //     if (this._LinksLayer) {
    //       this._LinksLayer.setColorList(val.colorList);
    //       this._LinksLayer.setLinkOffset(val.linkOffset);
    //       this._LinksLayer.setLinkWidth(val.linkWidth);
    //     }
    //   },
    //   deep: true,
    // },
  },
  data() {
    return {
      POLYGON_SELECT_STATE_KEY,
      selectState: POLYGON_SELECT_STATE_KEY.NOT_STARTED,
      polygonSelectType: "", // changeDetail 修改详情 changeLinksData 框选批量赋值
      xyarr: [],
      s_visible: false,
      activeNames: "0",

      loading: false,
      list: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: "",
        creator: "",
        startTime: null,
        endTime: null,
      },
      total: 0,

      editForm: false,
      showDetailXyArr: true,
      detail: {
        projectTime: "",
      },
      form: {
        id: null,
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
        xyarr: [
          {
            required: true,
            validate: (rule, value, callback) => {
              if (!this.xyarr && this.xyarr.length < 3) {
                callback(new Error("项目范围不能为空"));
              } else {
                callback();
              }
            },
          },
        ],
        file: [{ required: true, message: "项目范围不能为空", trigger: "blur" }],
      },

      showChangeLinksDialog: false,
      changeLinksForm: {
        saturation: 0,
        service: "A",
        style: "",
      },
      changeLinksRules: {},

      fyProId: [0],

      styleForm: {
        linkWidth: [5, 10],
        linkOffset: 8,
        colorList: [
          { min: 0, max: 0.4, range: [0, 1.1], color: "#025d02", label: "A", use: true },
          { min: 0.4, max: 0.6, range: [0, 1.1], color: "#4a7d18", label: "B", use: true },
          { min: 0.6, max: 0.75, range: [0, 1.1], color: "#9ba505", label: "C", use: true },
          { min: 0.75, max: 0.85, range: [0, 1.1], color: "#bea600", label: "D", use: true },
          { min: 0.85, max: 0.95, range: [0, 1.1], color: "#c86201", label: "E", use: true },
          { min: 0.95, max: 1.1, range: [0, 1.1], color: "#d10202", label: "F", use: true },
        ],
      },
    };
  },
  created() {
    this.s_visible = this.visible;
    this._PolygonsLayer = new PolygonsLayer({
      color: "orange",
    });
    this._PolygonSelectLayer = new PolygonSelectLayer({
      zIndex: 200,
      event: {
        [POLYGON_SELECT_EVENT.STATE_CHANGE]: (res) => {
          this.selectState = res.data.state;
          if (this.selectState === POLYGON_SELECT_STATE_KEY.ENDED) {
            const path = res.data.path;
            path[path.length] = [...path[0]];
            this.handleStopPolygonSelect();
            this.xyarr = path;

            if (this.polygonSelectType == "changeLinksData") {
              this.showChangeLinksDialog = true;
              this.changeLinksForm = {
                saturation: 0,
                service: "A",
                style: "",
              };
            }
          }
        },
      },
    });
    this._LinksLayer = new LinksLayer({
      zIndex: 100,
      linkWidth: this.styleForm.linkWidth,
      linkOffset: this.styleForm.linkOffset,
      colorList: this.styleForm.colorList,
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
      this.getDetail();
      this.getList();
      this._Map.addLayer(this._PolygonSelectLayer);
      if (this.showDetailXyArr) this._Map.addLayer(this._PolygonsLayer);
      this._Map.addLayer(this._LinksLayer);
      this.drawing();
    },
    handleDisable() {
      this.handleStopPolygonSelect(true);
      this._Map.removeLayer(this._PolygonSelectLayer);
      this._Map.removeLayer(this._PolygonsLayer);
      this._Map.removeLayer(this._LinksLayer);
    },
    handleClose() {
      this.$emit("update:visible", false);
      this.$emit("close");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        name: "",
        creator: "",
        startTime: null,
        endTime: null,
      };
      this.handleQuery();
    },
    getDetail() {
      projectDetail(this.proId).then((res) => {
        this.detail = res.data;
        this._PolygonsLayer.setPaths(JSON.parse(res.data.geomStr));
      });
    },
    handleEdit() {
      const form = {
        id: this.detail.id,
        name: this.detail.name,
        creator: this.detail.creator,
        projectTime: this.detail.projectTime,
        xyarr: null,
        file: null,
        xyarrType: 1,
      };
      form.xyarrType = 1;
      this.form = form;
      this.editForm = true;
    },
    handleCloseEdit() {
      this.editForm = false;
      this.xyarr = [];
      this.handleStopPolygonSelect(true);
    },
    handleSubmit() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          const form = {
            id: this.form.id,
            name: this.form.name,
            creator: this.form.creator,
            projectTime: this.form.projectTime,
          };
          if (this.form.xyarrType == 1) form.xyarr = JSON.stringify(this.xyarr);
          if (this.form.xyarrType == 2) form.file = this.form.file;
          projectUpdate(form).then((response) => {
            this.$message.success("新建项目成功");
            this.getDetail();
            this.getList();
            this.handleCloseEdit();
          });
        }
      });
    },
    getList() {
      this.loading = true;
      let fyProId = this.fyProId;
      projectList(this.queryParams)
        .then((res) => {
          const list = [
            {
              id: 0,
              name: "基础数据",
            },
            ...res.data.data.filter((v) => v.id != this.proId),
          ];

          this.list = list;
          this.loading = false;
          this.$nextTick(() => {
            this.$refs.tree.setCheckedKeys(fyProId);
            this.$nextTick(() => {
              this.handleTreeChange();
            });
          });
        })
        .catch((err) => {
          console.log(err);
          this.loading = false;
        });
    },
    handleTreeChange() {
      const keys = this.$refs.tree.getCheckedKeys();
      console.log(keys);
      this.fyProId = keys;
    },
    // ****************************** 数据筛选 -- 区域框选 -- start
    handlePlayPolygonSelect(polygonSelectType) {
      this.polygonSelectType = polygonSelectType;
      if (this._PolygonSelectLayer) {
        this._PolygonSelectLayer.reset();
        this._PolygonSelectLayer.play();
        this.selectState = this._PolygonSelectLayer.state;
      }
    },
    handleReplayPolygonSelect(polygonSelectType) {
      this.polygonSelectType = polygonSelectType;
      if (this._PolygonSelectLayer) {
        this._PolygonSelectLayer.reset();
        this._PolygonSelectLayer.play();
        this.selectState = this._PolygonSelectLayer.state;
      }
    },
    handleStopPolygonSelect(reset) {
      if (this._PolygonSelectLayer) {
        if (reset === true) {
          this.xyarr = [];
          this._PolygonSelectLayer.reset();
        }
        this._PolygonSelectLayer.stop();
        this.selectState = this._PolygonSelectLayer.state;
      }
    },
    // ****************************** 数据筛选 -- 区域框选 -- end
    handleCloseChangeLinksDialog() {
      this.showChangeLinksDialog = false;
      this.changeLinksForm = {
        saturation: 0,
        service: "A",
        style: "",
      };
      this.handleStopPolygonSelect(true);
    },
    handleChangeLinksSubmit() {
      let form = {
        xyarr: this.xyarr,
        projectId: this.proId,
        saturation: this.changeLinksForm.saturation,
        service: this.changeLinksForm.service,
        style: this.changeLinksForm.style,
      };
      projectAddSample(form).then((res) => {
        this.$message.success("修改成功");
        this.handleCloseChangeLinksDialog();
      });
    },
    drawing() {
      projectQuerySample({
        areaProjectId: this.proId,
        projectId: [this.proId, ...this.fyProId],
      }).then((res) => {
        this._LinksLayer.setColorList(this.styleForm.colorList);
        this._LinksLayer.setLinkOffset(this.styleForm.linkOffset);
        this._LinksLayer.setLinkWidth(this.styleForm.linkWidth);
        this._LinksLayer.setData(res.data, this.styleForm);
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.DrawingModelDialog {
}
.tree-box {
  max-height: calc(50vh);
  min-height: 200px;
  overflow-y: scroll;
}
.el-input {
  width: 200px;
}
</style>
