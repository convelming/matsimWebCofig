<template>
  <Dialog class="AddIntersection" title="新建交叉口" :top="50" :left="100" width="600px" hideMinimize :visible="visible" @close="handleClose">
    <el-form :model="form" ref="form" :rules="rules" label-width="100px" size="small">
      <el-form-item label="交叉口位置" prop="center">
        <div>{{ MercatorToWGS84(form.center) }}</div>
        <div>
          <span style="margin-right: 20px">调整位置</span>
          <el-switch v-model="selectState" :active-value="POINT_SELECT_STATE_KEY.ENABLE" :inactive-value="POINT_SELECT_STATE_KEY.DISABLE" @change="handleChangeSelectState" />
        </div>
      </el-form-item>
      <el-form-item label="交叉口名称" prop="name">
        <el-input type="textarea" v-model="form.name" :autosize="{ minRows: 2 }"> </el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleClose">取消</el-button>
        <el-button :loading="saving" type="primary" @click="handleSubmit">下一步</el-button>
      </el-form-item>
    </el-form>
  </Dialog>
</template>

<script>
import { POINT_SELECT_STATE_KEY, POINT_SELECT_EVENT } from "../layer/PointSelectLayer";
import { MercatorToWGS84 } from "@/mymap/utils/LngLatUtils";
import { intersectionInsert } from "@/api/index";

export default {
  name: "AddIntersection",
  inject: ["rootVue"],
  props: {
    visible: {
      type: Boolean,
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
      POINT_SELECT_STATE_KEY: POINT_SELECT_STATE_KEY,
      selectState: POINT_SELECT_STATE_KEY.DISABLE,
      saving: false,
      form: {
        center: [0, 0],
        name: "",
      },
      rules: {
        center: [{ required: true, message: "交叉口位置不能为空", trigger: "blur" }],
        name: [{ required: true, message: "交叉口名称不能为空", trigger: "blur" }],
      },
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {
    this.handleDisable();
  },
  methods: {
    MercatorToWGS84(array) {
      try {
        return MercatorToWGS84(array[0], array[1]).map((v) => Number(Number(v).toFixed(9)));
      } catch (error) {
        console.log(error);
      }
    },
    handleChangeSelectState(value) {
      if (this._PointSelectLayer) {
        this.rootVue._PointSelectLayer.state = value;
      }
    },
    // 组件显示事件
    handleEnable() {
      this._PointSelectLayer = this.rootVue._PointSelectLayer;
      if (this._PointSelectLayer) {
        this._eventId1 = this._PointSelectLayer.addEventListener(POINT_SELECT_EVENT.STATE_CHANGE, (res) => {
          this.selectState = res.data.state;
        });
        this._eventId2 = this._PointSelectLayer.addEventListener(POINT_SELECT_EVENT.POINT_CHANGE, (res) => {
          if (res.data.point[0] && res.data.point[1]) {
            this.form.center = res.data.point;
          } else {
            this.form.center = null;
          }
        });
        this.selectState = this.rootVue._PointSelectLayer.state;
        if (this.rootVue._PointSelectLayer.point[0] && this.rootVue._PointSelectLayer.point[1]) {
          this.form.center = this.rootVue._PointSelectLayer.point;
        } else {
          this.form.center = null;
        }
      }
    },
    // 组件隐藏事件
    handleDisable() {
      this.form = {
        center: [0, 0],
        name: "",
      };
      this.selectState = POINT_SELECT_STATE_KEY.DISABLE;
      if (this._PointSelectLayer) {
        this._PointSelectLayer.removeEventListener(POINT_SELECT_EVENT.STATE_CHANGE, this._eventId1);
        this._PointSelectLayer.removeEventListener(POINT_SELECT_EVENT.POINT_CHANGE, this._eventId2);
        this._PointSelectLayer = null;
      }
    },
    handleClose() {
      this.$emit("update:visible", false);
      this.$emit("close");
    },
    handleSubmit() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          const form = {
            x: this.form.center[0], // 开始时间
            y: this.form.center[1], // 结束时间
            name: this.form.name, // 备注
          };
          this.saving = true;
          intersectionInsert(form)
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
.AddIntersection {
}
</style>
