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
        <el-table class="small" :data="routeList" border stripe :height="height" @row-click="handleTableRowClick">
          <!-- <el-table-column type="selection" width="45" align="center" /> -->
          <el-table-column :label="$l('航路')" prop="name">
            <template slot-scope="{ row }">
              {{ row.name }} ({{ row.start.name }} - {{ row.end.name }}) <br />
              ({{ formatHour(row.startTime) }} - {{ formatHour(row.endTime) }})</template
            >
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
      <el-form v-if="showAddPoint" :model="addPointForm" ref="addPointForm" :rules="addPointRules" label-width="100px" :inline="false" size="small">
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
      <el-form v-if="showAddRoute" :model="addRouteForm" ref="addRouteForm" :rules="addRouteRules" label-width="140px" :inline="false" size="small" v-loading="addRouteLoading">
        <el-form-item label="航路名称" prop="name">
          <el-input v-model="addRouteForm.name"></el-input>
        </el-form-item>
        <el-form-item label="出发时间" prop="departureTime">
          <el-time-picker v-model="addRouteForm.departureTime" placeholder="出发时间" value-format="HH:mm:ss"></el-time-picker>
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
        <el-form-item label="巡航高度" prop="startHeight">
          <el-input-number v-model="addRouteForm.startHeight" :min="0" :step="0.1" :controls="true"> </el-input-number>
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

    <div ref="page2" class="page2" v-show="showUAVPage && playDetail">
      <div id="mapRoot2" ref="mapRoot2"></div>
      <div class="back"></div>
      <img src="../images/img_line_top_left@2x.png" alt="" class="back1" />
      <img src="../images/img_line_top_middle@2x.png" alt="" class="back2" />
      <img src="../images/img_line_top_right@2x.png" alt="" class="back3" />
      <img src="../images/img_line_down_left@2x.png" alt="" class="back4" />
      <img src="../images/img_line_down_right@2x.png" alt="" class="back5" />
      <div class="back_btn" @click="handleCloseUAVPage">
        <img src="../images/icon_back@2x.png" alt="" class="icon" />
        <span>返回</span>
      </div>
      <template v-if="playDetail">
        <div class="p9_lc">
          <div class="p9_text">路程：{{ playDetail.dis }} / {{ playDetail.tDis }}</div>
          <div class="p9_progress">
            <div class="p9_value" :style="`width: ${(playDetail.dis / playDetail.tDis) * 100}%`"></div>
          </div>
          <!-- <div class="p9_text">终点</div> -->
        </div>

        <div class="p9_gd">
          <div class="p9_progress">
            <div class="p9_line">300</div>
            <div class="p9_line" style="top: 50%">150</div>
            <div class="p9_line" style="top: 100%">0</div>
            <div class="p9_value" :style="`height: ${(playDetail.point.z / 300) * 100}%;max-height:100%`"></div>
          </div>
          <div class="p9_title">{{ Number(playDetail.point.z).toFixed(2) }}m</div>
          <div class="p9_title">高度 m</div>
        </div>

        <div class="p9_sd">
          <div class="p9_progress_list">
            <div class="p9_progress_box">
              <div class="p9_progress">
                <div class="p9_line">50</div>
                <div class="p9_line" style="top: 50%">25</div>
                <div class="p9_line" style="top: 100%">0</div>
                <div class="p9_value" :style="`height: ${(playDetail.speedX / 50) * 100}%;max-height:100%`"></div>
              </div>
              <div class="p9_title">X轴</div>
              <div class="p9_title">{{ playDetail.speedX }}m/s</div>
            </div>
            <div class="p9_progress_box">
              <div class="p9_progress">
                <div class="p9_line">50</div>
                <div class="p9_line" style="top: 50%">25</div>
                <div class="p9_line" style="top: 100%">0</div>
                <div class="p9_value" :style="`height: ${(playDetail.speedY / 50) * 100}%;max-height:100%`"></div>
              </div>
              <div class="p9_title">Y轴</div>
              <div class="p9_title">{{ playDetail.speedY }}m/s</div>
            </div>
            <div class="p9_progress_box">
              <div class="p9_progress">
                <div class="p9_line">50</div>
                <div class="p9_line" style="top: 50%">25</div>
                <div class="p9_line" style="top: 100%">0</div>
                <div class="p9_value" :style="`height: ${(playDetail.speedZ / 50) * 100}%;max-height:100%`"></div>
              </div>
              <div class="p9_title">Z轴</div>
              <div class="p9_title">{{ playDetail.speedZ }}m/s</div>
            </div>
          </div>
          <div class="p9_title">速度 m/s</div>
        </div>
      </template>
    </div>
  </div>
</template>

<language>
{
  "添加起降点":{
    "zh-CN": "添加起降点",
    "en-US": "添加起降点"
  },
  "起降点名称":{
    "zh-CN": "起降点名称",
    "en-US": "起降点名称"
  },
  "添加航路划设":{
    "zh-CN": "添加航路划设",
    "en-US": "添加航路划设"
  },
  "航路名称":{
    "zh-CN": "航路名称",
    "en-US": "航路名称"
  },
  "航路":{
    "zh-CN": "航路",
    "en-US": "航路"
  },
  "起点":{
    "zh-CN": "起点",
    "en-US": "起点"
  },
  "降点":{
    "zh-CN": "降点",
    "en-US": "降点"
  },
}
</language>

<script>
import * as THREE from "three";
import { addUam, deleteUam, listUam, genUamRoute, uamRouteList, deleteUamRoute, allTrack } from "@/api/index.js";
import { MercatorToWGS84 } from "@/mymap/utils/LngLatUtils";
import { PointSelectLayer, POINT_SELECT_STATE_KEY, POINT_SELECT_EVENT } from "../layer/PointSelectLayer";
import { PointListLayer } from "../layer/PointListLayer";
import { RouteListLayer } from "../layer/RouteListLayer";
import { UAVListLayer } from "../layer/UAVListLayer";

import { formatHour } from "@/utils/utils";

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
  watch: {
    showUAVPage(val) {
      this._UAVListLayer.setSmallView(val);
    },
  },
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
      addRouteLoading: false,
      addRouteForm: {
        startId: "",
        startHeight: 0,
        endId: "",
        endHeight: 0,
        name: "",
        reversalName: "",
        reversal: true,
        departureTime: "00:00:00",
      },
      addRouteRules: {
        departureTime: [{ required: true, message: "出发时间不能为空", trigger: "blur" }],
        startHeight: [{ required: true, message: "起点出发高度不能为空", trigger: "blur" }],
        startId: [{ required: true, message: "起点不能为空", trigger: "blur" }],
        endHeight: [{ required: true, message: "降点出发高度不能为空", trigger: "blur" }],
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

      showUAVPage: false,
      playDetail: null,
    };
  },
  created() {
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

    this.rootVue.$on("timeChange", this.handleTimeChange);

    this._UAVListLayer = new UAVListLayer({
      zIndex: 300,

      linkWidth: 10,
      selectLinkWidth: 10.1,
      linkColor: "#409BFC",
      selectLinkColor: "#409BFC",

      // nodeSize: 5,
      // selectNodeSize: 10,
      // nodeColor: "#D8D8D8",
      // selectNodeColor: "#FF7B00",

      time: 0,
      lockSelect: true,
      uavColor: "#72B6FF",
      selectUavColor: "#FF6161",

      rootDoc: this.$refs.mapRoot2,
      event: {
        select: (res) => {
          this.showUAVPage = res.data.flag;
          this.rootVue.$emit("RoutePlanning_Get_Options", {
            showUAVPage: this.showUAVPage,
          });
        },
        playing: (res) => {
          if (this._playTimeout) return;
          this.playDetail = res.data.playDetail;
          if (this._options.lockUAV && res.data.playDetail && !res.data.playDetail.isEnd) {
            const center = this._UAVListLayer.center;
            const point = new THREE.Vector3().copy(res.data.playDetail.point);
            const step = new THREE.Vector3().copy(res.data.playDetail.dir).setLength(100);
            point.add(step);
            this._Map.setCenter([point.x + center[0], point.y + center[1]]);
            this._Map.setCameraHeight(point.z + 100, false);
          }
          this._playTimeout = setTimeout(() => {
            this._playTimeout = null;
          }, 1000 / 60);

          // this.rootVue.$emit("RoutePlanning_Get_Options", {
          //   showUAVPage: this.showUAVPage,
          // });
        },
      },
    });

    document.body.append(this.$refs.page2);
  },
  beforeDestroy() {
    this._PointSelectLayer.dispose();
    this._PointListLayer.dispose();
    this._RouteListLayer.dispose();
    this._UAVListLayer.dispose();
    document.body.removeChild(this.$refs.page2);
  },
  methods: {
    formatHour: formatHour,
    handleTableRowClick(row, column, event) {
      if (!this._options.showLayer) return;
      const path = this._UAVListLayer.setSelectPathById(row.id);
      const center = path.center;
      const node1 = path.nodes[0];

      this._Map.setCenter([center.x + node1.v.x, center.y + node1.v.y]);
    },
    handleCloseUAVPage() {
      this.showUAVPage = false;
      // this._UAVListLayer.setSelectPath(-1);
      // this.playDetail = null;

      this.rootVue.$emit("RoutePlanning_Get_Options", {
        showUAVPage: this.showUAVPage,
      });
    },
    handleTimeChange(time) {
      this._UAVListLayer.setTime(time);
    },
    updateByOption(res) {
      this._options = res;

      this.showUAVPage = res.showUAVPage;

      this._PointListLayer.setSize(res.pointSize);
      this._PointListLayer.setColor(res.pointColor);

      this._UAVListLayer.setLinkColor(res.routeColor);
      this._UAVListLayer.setLinkWidth(res.routeSize);
      this._UAVListLayer.setUavSize(res.uavSize);

      if (this._Map && res.showPoint && res.showLayer) {
        this._Map.addLayer(this._PointListLayer);
      } else {
        this._PointListLayer.removeFromParent();
      }

      if (this._Map && res.showRoute && res.showLayer) {
        // this._Map.addLayer(this._RouteListLayer);
        this._Map.addLayer(this._UAVListLayer);
      } else {
        // this._RouteListLayer.removeFromParent();
        this._UAVListLayer.removeFromParent();
      }

      this.getUAMPoint();
      this.getUAMRoute();
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
        const list = res.data.filter((v) => !!v);
        this.pointList = list;
        this._PointListLayer.setPointList(list);
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
      Promise.all([uamRouteList(), allTrack()]).then(([res, res2]) => {
        res.data.forEach((item) => {
          item.nodes = res2.data[item.id];
          item.center = item.nodes[0];
          // const nodes = [{ x: item.start.x, y: item.start.y, z: 0 }, item.links[0].fromCoord];
          // const center = item.links[0].fromCoord;
          // for (const link of item.links) {
          //   nodes.push(link.toCoord);
          // }
          // nodes.push({ x: item.end.x, y: item.end.y, z: 0 });
          // item.nodes = nodes;
          // item.center = center;
        });

        this.routeList = res.data;
        // this._RouteListLayer.setPaths(res.data);
        this._UAVListLayer.setPaths(res.data, "CubicBezierPath");
      });
    },
    handleOpenAddRoute() {
      this.addRouteForm = {
        startId: "",
        startHeight: 0,
        endId: "",
        endHeight: 0,
        name: "",
        reversalName: "",
        reversal: true,
        departureTime: "00:00:00",
      };
      this.showAddRoute = true;
    },
    handleCloseAddRoute() {
      this.showAddRoute = false;
    },
    onSubmitAddRoute() {
      this.$refs.addRouteForm.validate((valid) => {
        if (valid) {
          this.addRouteLoading = true;
          const form = JSON.parse(JSON.stringify(this.addRouteForm));
          const l = form.departureTime.split(":").map((v) => Number(v));
          const departureTime = l[0] * 3600 + l[1] * 60 + l[2];
          form.departureTime = departureTime;
          form.endHeight = form.startHeight;
          genUamRoute(form)
            .then((res) => {
              this.$message.success("添加成功");
              this.handleCloseAddRoute();
              this.getUAMRoute();
            })
            .catch((err) => {})
            .finally(() => {
              this.addRouteLoading = false;
            });
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

.page2 {
  position: fixed;
  z-index: 10000;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  #mapRoot2 {
    position: absolute;
    z-index: 20;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  .back {
    box-shadow: inset 0 50px 150px 120px rgba($color: #0d111b, $alpha: 1);
    position: absolute;
    z-index: 50;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
  .back1 {
    position: absolute;
    z-index: 100;
    width: 704px;
    height: 284px;
    top: 43px;
    left: 43px;
    pointer-events: none;
  }
  .back2 {
    position: absolute;
    z-index: 100;
    width: 420px;
    height: 40px;
    top: 43px;
    left: 50%;
    transform: translateX(-50%);
    pointer-events: none;
  }

  .back3 {
    position: absolute;
    z-index: 100;
    width: 704px;
    height: 284px;
    top: 43px;
    right: 43px;
    pointer-events: none;
  }

  .back4 {
    position: absolute;
    z-index: 100;
    width: 704px;
    height: 284px;
    bottom: 27px;
    left: 43px;
    pointer-events: none;
  }

  .back5 {
    position: absolute;
    z-index: 100;
    width: 704px;
    height: 284px;
    bottom: 27px;
    right: 43px;
    pointer-events: none;
  }
  .back_btn {
    position: absolute;
    z-index: 200;
    top: 160px;
    left: 112px;
    display: flex;
    align-items: center;
    gap: 4px;
    .icon {
      display: block;
      width: 24px;
      height: 24px;
    }
    font-size: 24px;
    color: #00f7ff;
    cursor: pointer;
  }

  .p9_title {
    text-align: center;
    color: #00f7ff;
    margin-bottom: 10px;
    font-size: 14px;
  }

  .p9_progress {
    position: relative;
    border-left: 1px solid #00f7ff;
    .p9_value {
      z-index: 10;
      position: absolute;
      bottom: 0;
      left: 0;
      width: 10px;
      height: 100%;
      background-color: transparent;
      transition: height 0.1s;
      &::before {
        position: absolute;
        left: 0;
        top: 0;
        transform: translateY(-50%);
        content: "";
        width: 16px;
        height: 16px;
        background-image: url("../images/icon_arrow_left@2x.png");
        background-size: cover;
      }
    }
    .p9_line {
      z-index: 20;
      position: absolute;
      z-index: 20px;
      display: flex;
      padding-left: 16px;
      transform: translateY(-50%);
      color: #00f7ff;
      font-size: 14px;
      &::before {
        position: absolute;
        left: 0;
        top: 50%;
        content: "";
        width: 8px;
        height: 1px;
        background-color: #00f7ff;
      }
    }
  }

  .p9_lc {
    z-index: 50;
    position: absolute;
    top: 200px;
    left: 50%;
    width: 1000px;
    transform: translateX(-50%);
    display: flex;
    justify-items: center;
    align-items: center;
    gap: 10px;
    .p9_text {
      color: #fff;
    }
    .p9_progress {
      flex-grow: 1;
      width: 0;
      height: 6px;
      border-radius: 3px;
      overflow: hidden;
      background-color: rgba($color: #fff, $alpha: 0.2);
      .p9_value {
        width: 100%;
        height: 100%;
        background-color: rgba($color: #00f7ff, $alpha: 1);
      }
    }
  }

  .p9_gd {
    z-index: 50;
    position: absolute;
    left: 44px;
    top: 360px;

    .p9_progress {
      margin-bottom: 30px;
      height: 224px;
    }
  }

  .p9_sd {
    z-index: 50;
    position: absolute;
    top: 360px;
    right: 44px;
    .p9_progress_list {
      display: flex;
      gap: 25px;
      margin-bottom: 10px;
      .p9_progress {
        margin-bottom: 30px;
        height: 224px;
      }
    }
  }
}
</style>
