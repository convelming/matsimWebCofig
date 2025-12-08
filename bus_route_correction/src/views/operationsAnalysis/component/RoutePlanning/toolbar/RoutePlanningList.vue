<!-- RoutePlanningList -->
<template>
  <div class="RoutePlanningList">
    <el-button type="primary" size="small" @click="handleOpenAddPoint">{{ $l("添加起降点") }}</el-button>
    <div>
      <el-table class="small" :data="pointList" border stripe height="250">
        <!-- <el-table-column type="selection" width="45" align="center" /> -->
        <el-table-column :label="$l('起降点名称')" prop="name"> </el-table-column>
        <el-table-column :label="$l('操作')" width="80">
          <template slot-scope="{ row }">
            <el-button type="danger" size="small" @click="handleRemovePoint(row)">{{ $l("删除") }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-button type="primary" size="small" @click="handleOpenAddRoute">{{ $l("添加航路划设") }}</el-button>
    <AutoSize class="flex-h">
      <template slot-scope="{ width, height }">
        <el-table class="small" :data="routeList" border stripe :height="height">
          <!-- <el-table-column type="selection" width="45" align="center" /> -->
          <el-table-column :label="$l('航路名称')" prop="name">
            <template slot-scope="{ row }"> {{ row.name }} ( {{ row.start.name }} - {{ row.end.name }}) </template>
          </el-table-column>
          <el-table-column :label="$l('操作')" width="80">
            <template slot-scope="{ row }">
              <el-button type="danger" size="small" @click="handleRemoveRoute(row)">{{ $l("删除") }}</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </AutoSize>

    <Dialog ref="dialog" :title="$l('添加起降点')" :visible="showAddPoint" @close="handleCloseAddPoint" left="340px" width="400px">
      <el-form :model="addPointForm" ref="addPointForm" :rules="addPointRules" label-width="100px" :inline="false" size="small">
        <el-form-item label="起降点名称" prop="name">
          <el-input v-model="addPointForm.name"></el-input>
        </el-form-item>
        <el-form-item label="起降点位置" prop="center">
          <div>{{ MercatorToWGS84(addPointForm.center) }}</div>
          <div>
            <span style="margin-right: 20px">调整位置</span>
            <el-switch v-model="pointSelectState" :active-value="POINT_SELECT_STATE_KEY.ENABLE" :inactive-value="POINT_SELECT_STATE_KEY.DISABLE" @change="handleChangeSelectState" />
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmitAddPoint">添加</el-button>
          <el-button @click="handleCloseAddPoint">取消</el-button>
        </el-form-item>
      </el-form>
    </Dialog>

    <Dialog ref="dialog" :title="$l('添加航路划设')" :visible="showAddRoute" @close="handleCloseAddRoute" left="340px" width="400px">
      <el-form :model="addRouteForm" ref="addRouteForm" :rules="addRouteRules" label-width="140px" :inline="false" size="small">
        <el-form-item label="航路名称" prop="name">
          <el-input v-model="addRouteForm.name"></el-input>
        </el-form-item>
        <el-form-item label="起点" prop="startId">
          <el-select v-model="addRouteForm.startId">
            <el-option v-for="item in pointList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="降点" prop="endId">
          <el-select v-model="addRouteForm.endId">
            <el-option v-for="item in pointList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="是否生成反向航路" prop="reversal">
          <el-switch v-model="addRouteForm.reversal" :active-value="true" :inactive-value="false" @change=""> </el-switch>
        </el-form-item>
        <el-form-item label="反向航路名称" prop="reversalName" v-if="addRouteForm.reversal">
          <el-input v-model="addRouteForm.reversalName"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmitAddRoute">添加</el-button>
          <el-button @click="handleCloseAddRoute">取消</el-button>
        </el-form-item>
      </el-form>
    </Dialog>
  </div>
</template>

<language>
{
  "添加起降点":{
    "zh-CN": "添加起降点",
    "en-US": "Route Planning"
  },
  "起降点名称":{
    "zh-CN": "起降点名称",
    "en-US": "Route Planning"
  },
  "添加航路划设":{
    "zh-CN": "添加航路划设",
    "en-US": "Route Planning"
  },
  "航路名称":{
    "zh-CN": "航路名称",
    "en-US": "Route Planning"
  },
  "起点":{
    "zh-CN": "起点",
    "en-US": "Route Planning"
  },
  "降点":{
    "zh-CN": "降点",
    "en-US": "Route Planning"
  },
}
</language>

<script>
import { addUam, deleteUam, listUam, genUamRoute, uamRouteList, deleteUamRoute } from "@/api/index.js";
import { MercatorToWGS84 } from "@/mymap/utils/LngLatUtils";
import { PointSelectLayer, POINT_SELECT_STATE_KEY, POINT_SELECT_EVENT } from "../layer/PointSelectLayer";
import { PointListLayer } from "../layer/PointListLayer2";
import { RouteListLayer } from "../layer/RouteListLayer";

export default {
  name: "RoutePlanningList",
  inject: ["rootVue"],
  props: {},
  components: {},
  computed: {
    _Map() {
      return this.rootVue._Map;
    },
  },
  watch: {},
  data() {
    return {
      POINT_SELECT_STATE_KEY: POINT_SELECT_STATE_KEY,
      pointSelectState: POINT_SELECT_STATE_KEY.DISABLE,

      pointList: [],
      showAddPoint: false,
      addPointForm: {
        name: "",
        center: [0, 0],
        // name: "邶萍",
        // wgs_lon: 0,
        // wgs_lat: 0,
        // SAMPLE_1: 0,
        // x: 0,
        // y: 0,
      },
      addPointRules: {
        name: [{ required: true, message: "起降点名称不能为空", trigger: "blur" }],
        center: [{ required: true, message: "起降点位置不能为空", trigger: "blur" }],
      },

      routeList: [],
      showAddRoute: false,
      addRouteForm: {
        startId: "",
        endId: "",
        name: "",
        reversalName: "",
        reversal: true,
      },
      addRouteRules: {
        startId: [{ required: true, message: "起点不能为空", trigger: "blur" }],
        endId: [{ required: true, message: "降点不能为空", trigger: "blur" }],
        name: [{ required: true, message: "航路名称不能为空", trigger: "blur" }],
        reversalName: [
          {
            required: true,
            trigger: "blur",
            validate: function (rule, value, callback) {
              if (this.addRouteForm.reversal && !this.addRouteForm.name) {
                callback("反向航路名称不能为空");
              } else {
                callback();
              }
            },
          },
        ],
      },
    };
  },
  created() {
    this.getUAMPoint();
    this.getUAMRoute();
    this._PointSelectLayer = new PointSelectLayer({
      zIndex: 120,
      color: "#ff0000",
      event: {
        [POINT_SELECT_EVENT.POINT_CHANGE]: (res) => {
          // this.showAddIntersection(res.data.point);
          this.addPointForm.center = res.data.point;
        },
        [POINT_SELECT_EVENT.STATE_CHANGE]: (res) => {
          this.pointSelectState = res.data.state;
        },
      },
    });

    this._PointListLayer = new PointListLayer({
      color: "red",
    });
    this._RouteListLayer = new RouteListLayer({
      color: "red",
    });
    this._options = {};
  },
  mounted() {
    this.$nextTick(() => {
      this._interval = setInterval(() => {
        if (!this._Map) return;
        clearInterval(this._interval);
        this.rootVue.$emit("RoutePlanning_Get_Options");
      }, 1000);
    });

    this.rootVue.$on("RoutePlanning_Options", this.updateByOption);
  },
  beforeDestroy() {
    this._PointSelectLayer.dispose();
    this._PointListLayer.dispose();
    this._RouteListLayer.dispose();
  },
  methods: {
    updateByOption(res) {
      this._options = res;

      this._PointListLayer.setSize(res.pointSize);
      this._PointListLayer.setColor(res.pointColor);
      console.log(this._Map, res.showPoint, res.showLayer);

      if (this._Map && res.showPoint && res.showLayer) {
        this._Map.addLayer(this._PointListLayer);
      } else {
        this._PointListLayer.removeFromParent();
      }

      if (this._Map && res.showRoute && res.showLayer) {
        this._Map.addLayer(this._RouteListLayer);
      } else {
        this._RouteListLayer.removeFromParent();
      }
    },
    MercatorToWGS84(array) {
      try {
        return MercatorToWGS84(array[0], array[1]).map((v) => Number(Number(v).toFixed(9)));
      } catch (error) {
        console.log(error);
      }
    },
    handleChangeSelectState(value) {
      if (this._PointSelectLayer) {
        this._PointSelectLayer.state = value;
      }
    },
    getUAMPoint() {
      listUam().then((res) => {
        this.pointList = res.data;
        this._PointListLayer.setPointList(res.data);
      });
    },

    handleOpenAddPoint() {
      this.addPointForm = { name: "", center: [0, 0] };
      this.showAddPoint = true;

      if (this._Map) {
        this._PointSelectLayer.state = POINT_SELECT_STATE_KEY.ENABLE;
        this._PointSelectLayer.point = [0, 0];
        this._Map.addLayer(this._PointSelectLayer);
      }
    },
    handleCloseAddPoint() {
      this.showAddPoint = false;
      this._PointSelectLayer.state = POINT_SELECT_STATE_KEY.DISABLE;
      this._PointSelectLayer.removeFromParent();
    },
    onSubmitAddPoint() {
      this.$refs.addPointForm.validate((valid) => {
        if (valid) {
          const form = {
            sample_1: 0,
            name: this.addPointForm.name,
            x: this.addPointForm.center[0],
            y: this.addPointForm.center[1],
          };
          const wsg = this.MercatorToWGS84(this.addPointForm.center);
          form.wsg_lat = wsg[0];
          form.wsg_lng = wsg[1];

          addUam(form)
            .then((res) => {
              this.$message.success("添加成功");
              this.getUAMPoint();
              this.handleCloseAddPoint();
            })
            .catch((err) => {});
        }
      });
    },
    handleRemovePoint(row) {
      this.$confirm(`是否删除起降点——${row.name}?`, "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return deleteUam(row.id);
        })
        .then((res) => {
          this.$message.success("删除成功");
          this.getUAMPoint();
        });
    },

    getUAMRoute() {
      uamRouteList().then((res) => {
        this.routeList = res.data;
        res.data.forEach((item) => {
          console.log(item);

          const nodes = [{ x: item.start.x, y: item.start.y, z: 0 }, item.links[0].fromCoord];
          const center = item.links[0].fromCoord;
          for (const link of item.links) {
            nodes.push(link.toCoord);
          }
          nodes.push({ x: item.end.x, y: item.end.y, z: 0 });
          item.nodes = nodes;
          item.center = center;
        });
        this._RouteListLayer.setPaths(res.data);
      });
    },
    handleOpenAddRoute() {
      this.addRouteForm = {
        startId: "",
        endId: "",
        name: "",
        reversal: true,
        reversalName: "",
      };
      this.showAddRoute = true;
    },
    handleCloseAddRoute() {
      this.showAddRoute = false;
    },
    onSubmitAddRoute() {
      this.$refs.addRouteForm.validate((valid) => {
        if (valid) {
          genUamRoute(this.addRouteForm)
            .then((res) => {
              this.$message.success("添加成功");
              this.handleCloseAddRoute();
              this.getUAMRoute();
            })
            .catch((err) => {});
        }
      });
    },
    handleRemoveRoute(row) {
      this.$confirm(`是否删除航路——${row.name}?`, "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return deleteUamRoute(row.id);
        })
        .then((res) => {
          this.$message.success("删除成功");
          this.getUAMRoute();
        })
        .catch((err) => {});
    },
  },
};
</script>

<style lang="scss" scoped>
.RoutePlanningList {
  height: 100%;
  box-sizing: border-box;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
