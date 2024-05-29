<template>
  <div>
    <Dialog class="StopsEditDialog" :title="$l('站点列表')" :visible.sync="visible" @close="$emit('close')" :width="width" :left="left" resize="500px">
      <div class="StopsEdit">
        <div class="box1">
          <div class="stop_title">{{ transitRoute.routeId }}</div>
          <div class="stop_subtitle">
            <div>{{ $l("沿线公交站点") }}</div>
            <el-button type="text" size="small" icon="el-icon-plus" @click="handleAdd">{{ $l("添加站点") }}</el-button>
          </div>
        </div>
        <div class="box2">
          <div class="stop_list">
            <div class="stop_item" v-for="(v, $index) in transitRoute.stops" :key="$index">
              <div class="index">{{ $index + 1 }}</div>
              <div class="name">{{ v.name }}</div>
              <div class="btn_box">
                <div class="edit_btn el-icon-edit" @click="handleEdit($index)"></div>
                <div class="delete_btn el-icon-delete" @click="handleDelete($index)"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="box3">
          <el-button type="primary" size="small" @click="$emit('change', _transitRouteCopy)">{{ $l("确定") }}</el-button>
        </div>
      </div>
    </Dialog>

    <Dialog :title="title" :visible.sync="open" width="500px" @close="handleCancel">
      <el-form v-if="open" :model="form" ref="form" :rules="rules" label-width="80px" :inline="false" size="small" label-position="left">
        <el-form-item :label="$l('站点排序')">
          <el-input-number v-model="form.index" />
        </el-form-item>
        <el-form-item :label="$l('站点名称')">
          <template v-if="selectStop">
            <el-form-item :label="$l('鼠标左键选择站点')" label-width="9em">
              <el-button type="text" @click="handleCloseSelectStop">{{
                $l("取消")
              }}</el-button>
            </el-form-item>
          </template>
          <el-input v-else v-model="form.name">
            <el-button slot="append" icon="el-icon-place" @click="handleSelectStop"></el-button>
          </el-input>
        </el-form-item>
        <el-form-item :label="$l('站点路段Id')">
          <template v-if="selectLink">
            <el-form-item :label="$l('鼠标左键选择路段')" label-width="9em">
              <el-button type="text" @click="handleCloseSelectLink">{{
                $l("取消")
              }}</el-button>
            </el-form-item>
            <el-form-item :label="$l('路段线宽')">
              <el-slider class="lineWidth" :min="1" v-model="lineWidth" @change="handleChangeLineWidth" />
            </el-form-item>
            <el-form-item :label="$l('路段偏移')">
              <el-slider class="lineOffset" v-model="lineOffset" @change="handleChangeLineOffset" />
            </el-form-item>
          </template>
          <el-input v-else v-model="form.linkId" disabled>
            <el-button slot="append" icon="el-icon-place" @click="handleSelectLink"></el-button>
          </el-input>
        </el-form-item>
        <el-form-item :label="$l('站点坐标')">
          <template v-if="selectAddress">
            <el-form-item :label="$l('鼠标左键点击地图确定坐标')" label-width="13em">
              <el-button type="text" @click="handleCloseSelectAddress">{{
                $l("取消")
              }}</el-button>
            </el-form-item>
          </template>
          <el-input v-else :value="`${form.coord.lng},${form.coord.lat}`" disabled>
            <el-button slot="append" icon="el-icon-place" @click="handleSelectAddress"></el-button>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSave">{{
            $l("确定")
          }}</el-button>
          <el-button @click="handleCancel">{{ $l("取消") }}</el-button>
        </el-form-item>
      </el-form>
    </Dialog>
  </div>
</template>

<language>
{
  "站点列表": {
    "zh-CN":"站点列表",
    "en-US":"站点列表"
  },
  "沿线公交站点": {
    "zh-CN":"沿线公交站点",
    "en-US":"沿线公交站点"
  },
  "添加站点": {
    "zh-CN":"添加站点",
    "en-US":"添加站点"
  },
  "站点排序": {
    "zh-CN":"站点排序",
    "en-US":"站点排序"
  },
  "站点名称": {
    "zh-CN":"站点名称",
    "en-US":"站点名称"
  },
  "鼠标左键选择站点": {
    "zh-CN":"鼠标左键选择站点",
    "en-US":"鼠标左键选择站点"
  },
  "站点路段Id": {
    "zh-CN":"站点路段Id",
    "en-US":"站点路段Id"
  },
  "鼠标左键选择路段": {
    "zh-CN":"鼠标左键选择路段",
    "en-US":"鼠标左键选择路段"
  },
  "确定": {
    "zh-CN":"确定",
    "en-US":"确定"
  },
  "取消": {
    "zh-CN":"取消",
    "en-US":"取消"
  },
  "路段线宽": {
    "zh-CN":"路段线宽",
    "en-US":"路段线宽"
  },
  "路段偏移": {
    "zh-CN":"路段偏移",
    "en-US":"路段偏移"
  },
  "站点坐标": {
    "zh-CN":"站点坐标",
    "en-US":"站点坐标"
  },
  "鼠标左键点击地图确定坐标": {
    "zh-CN":"鼠标左键点击地图确定坐标",
    "en-US":"鼠标左键点击地图确定坐标"
  },
  "站点编辑": {
    "zh-CN":"站点编辑",
    "en-US":"站点编辑"
  },
  "添加站点": {
    "zh-CN":"添加站点",
    "en-US":"添加站点"
  },
  "站点位置距离线路超过200米，是否需要进行调整？": {
    "zh-CN":"站点位置距离线路超过200米，是否需要进行调整？",
    "en-US":"站点位置距离线路超过200米，是否需要进行调整？"
  },
  "提示": {
    "zh-CN":"提示",
    "en-US":"提示"
  },
  "继续保存": {
    "zh-CN":"继续保存",
    "en-US":"继续保存"
  },
  "需要调整": {
    "zh-CN":"需要调整",
    "en-US":"需要调整"
  },
}
</language>

<script>
import * as Bean from "@/utils/Bean";

import { MAP_EVENT } from "@/mymap/index.js";
import * as THREE from "three";

export default {
  components: {},
  props: {
    width: {
      type: String,
      default: "300px",
    },
    left: {
      type: Number,
      default: 20,
    },
    transitRouteJSON: {
      type: Object,
      default: () => new Bean.TransitRoute().toJSON(),
    },
  },
  inject: ["rootVue"],
  data() {
    return {
      visible: false,
      title: "",
      open: false,
      form: null,
      rules: {},
      editIndex: -1,
      transitRoute: new Bean.TransitRoute(),
      _transitRouteCopy: null,
      selectAddress: false,
      selectLink: false,
      selectStop: false,
      lineOffset: 6,
      lineWidth: 4,
    };
  },
  computed: {
    _map() {
      return this.rootVue._map;
    },
    _networkLayer() {
      return this.rootVue._NetworkLayer2;
    },
    _networkLineLayer() {
      return this.rootVue._NetworkLineLayer;
    },
    _linkLayer() {
      return this.rootVue._EditBusLinkLayer;
    },
    _stopLayer() {
      return this.rootVue._EditBusStopLayer;
    },
    _allStopLayer() {
      return this.rootVue._StopsLayer;
    },
  },
  created() {
    let transitRoute = new Bean.TransitRoute(this.transitRouteJSON);
    this._transitRouteCopy = transitRoute.toJSON();
    this.transitRoute = transitRoute;
    this.updateLayer();
  },
  mounted() {
    this.visible = true;
  },
  beforeDestroy() {
    this.handleCancel();
  },
  methods: {
    handleChangeLineWidth() {
      if (this._networkLayer) {
        this._networkLayer.setValues({
          lineWidth: this.lineWidth,
        });
      }
      if (this._networkLineLayer) {
        this._networkLineLayer.setValues({
          lineWidth: this.lineWidth,
        });
      }
    },
    handleChangeLineOffset() {
      if (this._networkLayer) {
        this._networkLayer.setValues({
          lineOffset: this.lineOffset,
        });
      }
      if (this._networkLineLayer) {
        this._networkLineLayer.setValues({
          lineOffset: this.lineOffset,
        });
      }
    },
    handleChangeCenter(type) {
      const startPoint = this.transitRoute.startStop.coord;
      const endPoint = this.transitRoute.endStop.coord;
      let list = [startPoint.toList(), endPoint.toList()];
      const res2 = this.rootVue._map.getFitZoomAndCenterPoints(list);
      this.rootVue.handleCenterAndZoom({
        center: res2.center,
        zoom: res2.zoom,
      });
    },
    handleCloseSelectLink() {
      if (this._networkLayer) {
        this._networkLayer.hide();
        this._networkLayer.removeEventListener(MAP_EVENT.HANDLE_PICK_LEFT);
      }
      if (this._networkLineLayer) {
        this._networkLineLayer.hide();
        this._networkLineLayer.removeEventListener(MAP_EVENT.HANDLE_PICK_LEFT);
      }
      this.selectLink = false;
    },
    handleSelectLink() {
      if (this._networkLayer && this._networkLineLayer) {
        this._networkLayer.show();
        this._networkLayer.addEventListener(
          MAP_EVENT.HANDLE_PICK_LEFT,
          (res) => {
            this._networkLineLayer.setData(res.data.id);
          }
        );
        this._networkLineLayer.show();
        this._networkLineLayer.setData(null);
        this._networkLineLayer.addEventListener(
          MAP_EVENT.HANDLE_PICK_LEFT,
          (res) => {
            this.form.linkId = res.data.id;
            this.transitRoute.addLinkMap(new Bean.RouteLinkItem(res.data));
            this.updateLayer();
            this.handleCloseSelectLink();
          }
        );
        this.selectLink = true;
      }
    },
    handleCloseSelectAddress() {
      if (this._map) {
        this._map.removeEventListener(
          MAP_EVENT.HANDLE_CLICK_LEFT,
          this._mapEventId
        );
        this._mapEventId = null;
        this.selectAddress = false;
      }
    },
    handleSelectAddress() {
      if (this._map) {
        this.selectAddress = true;
        this._mapEventId = this._map.addEventListener(
          MAP_EVENT.HANDLE_CLICK_LEFT,
          (res) => {
            this.form.coord = new Bean.Coord({
              x: res.data.webMercatorXY[0],
              y: res.data.webMercatorXY[1],
            });
            this.updateLayer();
            this.handleCloseSelectAddress();
          }
        );
      }
    },
    handleCloseSelectStop() {
      if (this._allStopLayer) {
        this._allStopLayer.hide();
        this._allStopLayer.removeEventListener(
          MAP_EVENT.HANDLE_PICK_LEFT,
          this._allStopLayerEventId
        );
        this._allStopLayerEventId = null;
        this.selectStop = false;
      }
    },
    handleSelectStop() {
      if (this._allStopLayer) {
        this.selectStop = true;
        this._allStopLayerEventId = this._allStopLayer.addEventListener(
          MAP_EVENT.HANDLE_PICK_LEFT,
          (res) => {
            let stop = new Bean.Stops(res.data);
            stop.index = this.form.index;
            stop.id = null;
            this.form = stop;
            this.transitRoute.changeStop(stop, this.editIndex);
            this.updateLayer();
            this.handleCloseSelectStop();
          }
        );
        this._allStopLayer.show();
      }
    },
    handleEdit(index) {
      if (this.editIndex != -1) this.handleCancel();
      this.$nextTick(() => {
        this._transitRouteCopy = this.transitRoute.toJSON();
        let form = this.transitRoute.stops[index];
        form.index = index + 1;
        form.id = "";
        this.form = form;
        this.editIndex = index;
        this.rootVue.handleCenterAndZoom({
          center: form.coord.toList(),
          zoom: 16.8,
        });

        this.title = this.$l("站点编辑");
        this.visible = false;
        this.open = true;
        this.updateLayer();
      });
    },
    handleAdd() {
      if (this.editIndex != -1) this.handleCancel();
      this.$nextTick(() => {
        this._transitRouteCopy = this.transitRoute.toJSON();
        let index = 0;
        let form = new Bean.Stops();
        form.index = index + 1;
        this.form = form;
        this.editIndex = index;
        this.transitRoute.addStop(form);

        this.title = this.$l("添加站点");
        this.visible = false;
        this.open = true;
        this.updateLayer();
      });
    },
    async handleSave() {
      if (this.editIndex == -1) {
        this.handleCancel();
        return;
      } else {
        const valid = await this.$refs["form"].validate();
        if (valid) {
          const line = this.transitRoute.getLinkMap(this.form.linkId);
          const lineStartPoint = new THREE.Vector3(
            line.fromCoord.x,
            line.fromCoord.y,
            0
          );
          const lineEndPoint = new THREE.Vector3(
            line.toCoord.x,
            line.toCoord.y,
            0
          );
          const line3 = new THREE.Line3(lineStartPoint, lineEndPoint);
          const stopPoint = new THREE.Vector3(
            this.form.coord.x,
            this.form.coord.y,
            0
          );

          const closestPoint = new THREE.Vector3();
          line3.closestPointToPoint(stopPoint, true, closestPoint);
          const distance = stopPoint.distanceTo(closestPoint);
          if (distance > 200) {
            await this.$confirm(
              this.$l("站点位置距离线路超过200米，是否需要进行调整？"),
              this.$l("提示"),
              {
                confirmButtonText: this.$l("继续保存"),
                cancelButtonText: this.$l("需要调整"),
                type: "warning",
              }
            );
          }
          let formIndex = this.form.index;
          let stop = new Bean.Stops(this.form.toJSON());

          this.transitRoute.removeStop(this.editIndex);
          this.transitRoute.addStop(stop, formIndex - 1);
          this._transitRouteCopy = this.transitRoute.toJSON();

          this.handleCancel();
        }
      }
    },
    handleDelete(index) {
      this.transitRoute.removeStop(index);
      this._transitRouteCopy = this.transitRoute.toJSON();
      this.handleCancel();
    },
    handleCancel() {
      this.$nextTick(() => {
        this.transitRoute = new Bean.TransitRoute(this._transitRouteCopy);
        this.editIndex = -1;
        this.form = null;
        this.handleCloseSelectAddress();
        this.handleCloseSelectLink();
        this.handleCloseSelectStop();
        this.handleChangeCenter();
        this.updateLayer();
        this.open = false;
        this.visible = true;
      });
    },
    updateLayer() {
      if (this._linkLayer) {
        this._linkLayer.setData(this.transitRoute);
      }
      if (this._stopLayer) {
        this._stopLayer.setData(
          this.transitRoute,
          this.form ? this.form.uuid : null
        );
      }
    },
  },
};
</script>

<style lang="scss" scoped>
// .StopsEditDialog {
//   ::v-deep {
//     .header {
//       padding: 20px 10px 0 10px;
//     }
//     .bodyer {
//       padding: 10px 10px 20px 10px;
//     }
//   }
// }
.StopsEdit {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  line-height: 20px;
  .box1 {
    .stop_title {
      color: #409eff;
      font-size: 12px;
      font-weight: bold;
    }
    .stop_subtitle {
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  }
  .box2 {
    flex-grow: 1;
    overflow-y: auto;
    overflow-x: hidden;
    .stop_item {
      display: flex;
      font-size: 12px;
      .index {
        flex-shrink: 0;
        width: 2.5em;
      }
      .name {
        width: 100%;
      }
      .btn_box {
        flex-shrink: 0;
        padding: 0 10px;
        .edit_btn {
          cursor: pointer;
          color: #409eff;
        }
        .delete_btn {
          cursor: pointer;
          margin-left: 10px;
          color: #f56c6c;
        }
      }
    }
  }
  .box3 {
    text-align: right;
    height: 32px;
    margin-top: 10px;
  }
}
</style>
