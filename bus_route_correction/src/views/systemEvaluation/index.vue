<template>
  <div class="index" v-loading="loading">
    <template v-if="!loading">
      <div class="grid_root">
        <div class="Drawer_row">
          <Drawer show direction="left" :size="400">
            <el-collapse v-model="activeNames">
              <Accessibility :showLayer.sync="showLayerAccessibility" name="Accessibility" />
              <el-collapse-item name="居住人口">
                <div class="el-collapse-item__title" slot="title">
                  <el-checkbox>{{ $l("居住人口") }}</el-checkbox>
                </div>
              </el-collapse-item>
              <el-collapse-item name="就业人口">
                <div class="el-collapse-item__title" slot="title">
                  <el-checkbox>{{ $l("就业人口") }}</el-checkbox>
                </div>
              </el-collapse-item>
              <el-collapse-item name="出行OD">
                <div class="el-collapse-item__title" slot="title">
                  <el-checkbox>{{ $l("出行OD") }}</el-checkbox>
                </div>
              </el-collapse-item>
              <el-collapse-item name="站点数量">
                <div class="el-collapse-item__title" slot="title">
                  <el-checkbox>{{ $l("站点数量") }}</el-checkbox>
                </div>
              </el-collapse-item>
              <el-collapse-item name="站点客流">
                <div class="el-collapse-item__title" slot="title">
                  <el-checkbox>{{ $l("站点客流") }}</el-checkbox>
                </div>
              </el-collapse-item>
              <el-collapse-item name="客流廊道">
                <div class="el-collapse-item__title" slot="title">
                  <el-checkbox>{{ $l("客流廊道") }}</el-checkbox>
                </div>
              </el-collapse-item>
              <el-collapse-item name="覆盖范围">
                <div class="el-collapse-item__title" slot="title">
                  <el-checkbox>{{ $l("覆盖范围") }}</el-checkbox>
                </div>
              </el-collapse-item>
            </el-collapse>
          </Drawer>
          <div id="mapRoot"></div>
        </div>
      </div>
      <HelpDialog />
    </template>
  </div>
</template>

<language>
{
  "居住人口": {
    "zh-CN": "居住人口",
    "en-US": "Population"
  },
  "就业人口": {
    "zh-CN": "就业人口",
    "en-US": "Employed"
  },
  "出行OD": {
    "zh-CN": "出行OD",
    "en-US": "Travel OD"
  },
  "站点数量": {
    "zh-CN": "站点数量",
    "en-US": "Number of Stop"
  },
  "站点客流": {
    "zh-CN": "站点客流",
    "en-US": "Stop Passengers"
  },
  "客流廊道": {
    "zh-CN": "客流廊道",
    "en-US": "Passenger corridor"
  },
  "覆盖范围": {
    "zh-CN": "覆盖范围",
    "en-US": "Range"
  },
}
</language>

<script>
import { MyMap, MapLayer, MAP_LAYER_STYLE, DEFAULT_MAP_LAYER_STYLE } from "@/mymap/index.js";
import HelpDialog from "./component/HelpDialog/index.vue";
import Accessibility from "./component/Accessibility/index.vue";

export default {
  components: {
    HelpDialog,
    Accessibility,
  },
  data() {
    return {
      loading: false,
      _Map: null,
      _MapLayer: null,
      activeNames: ["Accessibility"],

      showLayerAccessibility: true,

      showStopToolbar: false,
    };
  },
  watch: {
    showLayerAccessibility(val) {
      this.handleChangeMapCameraControls();
    },
  },
  provide() {
    return {
      rootVue: this,
    };
  },
  created() {
    const { database, datasource } = this.$route.params;
    this.$store.dispatch("setDataBase", database);
    this.$store.dispatch("setDataSource", database + "/" + datasource);
  },
  mounted() {
    this.initLayer();
    this.initMap();
    this.handleChangeMapCameraControls();
  },
  beforeDestroy() {
    this._Map.dispose();
  },
  methods: {
    handleChangeMapCameraControls() {
      let enableRotate = false;
      enableRotate = enableRotate || this.showLayerAccessibility;
      if (enableRotate) {
        this._Map.enableRotate = true;
      } else {
        this._Map.enableRotate = false;
        this._Map.setPitchAndRotation(90, 0);
      }
    },
    initMap() {
      this._Map = new MyMap({
        rootId: "mapRoot",
        center: [12632323, 2651517],
        zoom: 12,
      });
      this._Map.addLayer(this._MapLayer);
      window._Map = this._Map;
    },
    initLayer() {
      this._MapLayer = new MapLayer({ tileClass: DEFAULT_MAP_LAYER_STYLE, zIndex: -1 });
    },
  },
};
</script>

<style lang="scss" scoped>
.index {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  .grid_root {
    width: 100vw;
    height: 100vh;
  }
  .map_box {
    position: relative;
    z-index: 20;
  }

  .HelpDialog {
    bottom: 20px;
    left: 20px;
    position: absolute;
    z-index: 20;
  }

  .el-collapse-item__title {
    padding-left: 10px;
  }
}
</style>
