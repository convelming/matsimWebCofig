<!-- AreaList 研究区域 -->
<template>
  <div class="AreaList">
    <el-button class="add_button" type="primary" size="small" icon="el-icon-plus" @click="handleOpenAddForm()">{{ $l("新增区域") }}</el-button>
    <AutoSize class="flex-h">
      <template slot-scope="{ width, height }">
        <el-table class="small" :data="list" border :height="height">
          <el-table-column :label="$l('名称')" prop="name"> </el-table-column>
          <el-table-column width="50">
            <template>
              <el-button type="text" size="small" icon="el-icon-edit" @click=""></el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </AutoSize>
    <Dialog class="AreaList_Dialog" ref="dialog" :title="$l('')" hideMinimize :visible="showAddForm" @close="handleCloseAddForm" keepRight right="330" top="100" width="500px">
      <el-form :model="addForm" ref="addForm" :rules="addRules" label-width="120px" :inline="false" size="small">
        <el-form-item :label="$l('区域选定方式')">
          <el-radio-group v-model="addForm.type" @change="">
            <el-radio-button label="1">{{ $l("地图圈定") }}</el-radio-button>
            <el-radio-button label="2">{{ $l("上传GeoJSON") }}</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$l('地图圈定')" v-show="addForm.type == '1'">
          <template v-if="selectState == POLYGON_SELECT_STATE_KEY.NOT_STARTED">
            <el-button v-if="!addForm.xyarr || !addForm.xyarr.length" type="primary" size="mini" @click="handlePlayPolygonSelect()">{{ $l("开始圈定") }}</el-button>
            <el-button v-else type="primary" size="mini" @click="handleReplayPolygonSelect()">{{ $l("重新圈定") }}</el-button>
          </template>

          <template v-if="selectState != POLYGON_SELECT_STATE_KEY.NOT_STARTED">
            <el-button type="primary" size="mini" @click="handleReplayPolygonSelect()">{{ $l("重新圈定") }}</el-button>
            <el-button type="primary" size="mini" @click="handleStopPolygonSelect()">{{ $l("结束圈定") }}</el-button>
          </template>
          <el-table class="small" v-if="addForm.xyarr && addForm.xyarr.length" :data="addForm.xyarr" border stripe>
            <el-table-column type="index" width="50"></el-table-column>
            <el-table-column>
              <span slot-scope="{ row }">{{ row }}</span>
            </el-table-column>
            <el-table-column width="50">
              <el-button slot-scope="{ row, $index }" v-if="addForm.xyarr.length - 1 > $index" type="text" size="small" icon="el-icon-delete" style="color: var(--color-danger); padding: 0" @click="handleRemoveXY($index)"></el-button>
            </el-table-column>
          </el-table>
        </el-form-item>
        <el-form-item :label="$l('上传GeoJSON')" v-show="addForm.type == '2'">
          <el-button type="primary" @click="handleSelectFile">{{ $l("选择文件") }}</el-button>
          <div class="file" v-if="addForm.file">
            <div class="file_name">{{ addForm.file.name }}</div>
            <el-button type="text" @click="addForm.file = null" icon="el-icon-close"></el-button>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit">{{ $l("立即创建") }}</el-button>
          <el-button @click="handleCloseAddForm">{{ $l("取消") }}</el-button>
        </el-form-item>
      </el-form>
    </Dialog>
  </div>
</template>

<script>
import { PolygonSelectLayer, POLYGON_SELECT_STATE_KEY, POLYGON_SELECT_EVENT } from "../layer/PolygonSelectLayer";
import { selectFile } from "@/utils/utils";

export default {
  name: "AreaList",
  inject: ["rootVue"],
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  components: {},
  computed: {
    _Map() {
      return this.rootVue._Map;
    },
  },
  watch: {
    show: {
      handler(val) {
        this.$nextTick(() => {
          this._interval = setInterval(() => {
            if (!this._Map) return;
            clearInterval(this._interval);
            if (this.show) {
              this.handleEnable();
            } else {
              this.handleDisable();
            }
          }, 500);
        });
      },
      immediate: true,
    },
  },
  data() {
    return {
      selectState: POLYGON_SELECT_STATE_KEY.NOT_STARTED,
      POLYGON_SELECT_EVENT,
      POLYGON_SELECT_STATE_KEY,
      list: [
        {
          name: "区域1",
        },
        {
          name: "区域2",
        },
        {
          name: "区域3",
        },
      ],

      showAddForm: false,
      addForm: {},
      addRules: {},
    };
  },
  created() {
    this._PolygonSelectLayer = new PolygonSelectLayer({
      zIndex: 200,
      event: {
        [POLYGON_SELECT_EVENT.STATE_CHANGE]: (res) => {
          this.selectState = res.data.state;
          if (this.selectState === POLYGON_SELECT_STATE_KEY.ENDED) {
            const path = res.data.path;
            path[path.length] = [...path[0]];
            this.handleStopPolygonSelect();
            this.addForm.xyarr = path.map((v) => [Number(Number(v[0]).toFixed(2)), Number(Number(v[1]).toFixed(2))]);
          }
        },
      },
    });
  },
  mounted() {},
  beforeDestroy() {
    this._PolygonSelectLayer.dispose();
  },
  methods: {
    handleEnable() {
      this._Map.addLayer(this._PolygonSelectLayer);
    },
    handleDisable() {
      this._Map.removeLayer(this._PolygonSelectLayer);
    },
    // ****************************** 区域框选 -- start
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
        if (reset === true) {
          this.xyarr = [];
          this._PolygonSelectLayer.reset();
        }
        this._PolygonSelectLayer.stop();
        this.selectState = this._PolygonSelectLayer.state;
      }
    },
    // ****************************** 区域框选 -- end
    async handleOpenAddForm(id) {
      this.showAddForm = true;
      if (id) {
      } else {
        this.addForm = {
          type: "1",
          xyarr: null,
          file: null,
        };
      }
      this.handleStopPolygonSelect(true);
    },
    handleCloseAddForm() {
      this.showAddForm = false;
      this.handleStopPolygonSelect(true);
    },
    async handleSelectFile() {
      this.addForm.file = await selectFile(".geojson");
    },
    handleSubmit() {},
    handleRemoveXY(index) {
      if (this.addForm.xyarr.length <= 4) {
        return this.$message.error("至少保留3个点");
      }
      this.addForm.xyarr.splice(index, 1);
      
      if(index === 0){
       const start = this.addForm.xyarr[0];
       const end = this.addForm.xyarr[this.addForm.xyarr.length - 1];
       end[0] = start[0]; 
       end[1] = start[1]; 
      }
      this._PolygonSelectLayer.setPath(this.addForm.xyarr);
    },
  },
};
</script>

<style lang="scss" scoped>
.AreaList {
  display: flex;
  flex-direction: column;
  padding: 10px;
  gap: 10px;
  .add_button {
    display: block;
    width: 100%;
    margin: 0;
  }
  .flex-h {
    height: 0;
    flex: 1;
  }
}
.AreaList_Dialog {
  .file {
    display: flex;
    .file_name {
      width: 0;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
