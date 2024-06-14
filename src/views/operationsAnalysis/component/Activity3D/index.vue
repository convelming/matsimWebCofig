<template>
  <el-collapse-item class="BusStopForm" :name="name" :class="[s_showLayer ? 'showLayer' : '']">
    <div class="el-collapse-item__title" slot="title">
      <el-checkbox class="checkbox flex-align-center" :value="s_showLayer" @change="handleChangeShowLayer">
        <div class=" flex-align-center">
          <img class="item_icon" v-show="s_showLayer" src="@/assets/image/Activity3D_icon_a.png" />
          <img class="item_icon" v-show="!s_showLayer" src="@/assets/image/Activity3D_icon.png" />
          <span>{{ $l("活动") }}</span>
          <span v-if="loading" class="el-icon-loading" style="margin-left: 10px"></span>
        </div>
      </el-checkbox>
    </div>
    <div class="form">
      <div class="form_item">
        <div class="form_label">{{ $l("最多显示人数：") }}</div>
        <div class="form_value">
          <el-input-number class="input-number" style="width: 100%" :disabled="!s_showLayer" size="small"
            v-model="maxNum" :min="0" :step="1" step-strictly> </el-input-number>
        </div>
      </div>
      <div class="form_item">
        <div class="form_label">{{ $l("颜色：") }}</div>
        <div class="form_value">
          <div class="color_item" v-for="(v, i) in activityTypeList" :key="i">
            <div class="color_title">{{ v.name }}</div>
            <div class="color-picker  flex-align-center">
              <el-color-picker :disabled="!s_showLayer" size="mini" :predefine="predefineColors" v-model="v.color" />
              <el-input size="small " style="margin-left: 10px;" :disabled="!s_showLayer" v-model="v.color"></el-input>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-collapse-item>
</template>

<language>
{
  "活动":{
    "zh-CN": "活动",
    "en-US": "Activity3D"
  },
  "最多显示人数：":{
    "zh-CN": "最多显示人数：",
    "en-US": "Max People Number："
  },
  "颜色：":{
    "zh-CN": "颜色：",
    "en-US": "Color："
  },
}
</language>

<script>
import { MAP_EVENT } from "@/mymap";
import { Activity3DLayer } from "./layer/Activity3DLayer";
import { getAllActivity, getAllActivityType } from "@/api/index";

export default {
  props: ["name", "showLayer"],
  inject: ["rootVue"],
  components: {},
  computed: {
    _Map() {
      return this.rootVue._Map;
    },
  },
  watch: {
    showLayer: {
      handler(val) {
        this.s_showLayer = val;
        if (val) {
          this.handleEnable();
        } else {
          this.handleDisable();
        }
      },
    },
    activityTypeList: {
      handler(val) {
        if (this._Activity3DLayer) {
          this._Activity3DLayer.setColors(val);
        }
      },
      deep: true,
    },
    scale(val) {
      if (this._Activity3DLayer) {
        this._Activity3DLayer.setScale(val);
      }
    },
    maxNum() {
      if (this._Activity3DLayer) {
        this._Activity3DLayer.setMaxNum(val);
      }
    },
  },
  data() {
    return {
      predefineColors: ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc"],
      s_showLayer: true,
      color: "#5470c6",
      scale: 1,
      maxNum: 10000,

      _Activity3DLayer: null,

      activityTypeList: [],

      loading: false,
    };
  },
  created() {
    this.s_showLayer = this.showLayer;
    this._Activity3DLayer = new Activity3DLayer({
      zIndex: 20,
      colors: this.activityTypeList,
      scale: this.scale,
      maxNum: this.maxNum,
      event: {
        [MAP_EVENT.HANDLE_PICK_LEFT]: ({ data }) => {
          console.log(data);
          this.rootVue.handleShowActivityDetail({
            uuid: data.pickColor,
            activityDetail: data,
          });
        },
      },
    });

    getAllActivityType().then((res) => {
      this.activityTypeList = res.data.map((v, i) => ({ name: v, color: this.predefineColors[i % this.predefineColors.length] }));
    });
  },
  mounted() {
    this._interval = setInterval(() => {
      if (!this._Map) return;
      clearInterval(this._interval);
      if (this.s_showLayer) {
        this.handleEnable();
      }
    }, 1000);
  },
  beforeDestroy() {
    this.handleDisable();
    this._Activity3DLayer.dispose();
  },
  methods: {
    getData() {
      if (this.loading) return;
      this.loading = true;
      let list = [];
      if (!this._ActivityLoaded) list.push(this.getAllActivity({ number: 1000000 }));
      Promise.all(list).finally(() => {
        this.loading = false;
      });
    },
    async getAllActivity() {
      try {
        const res = await getAllActivity();
        this._Activity3DLayer.setData(res.data);
        this._ActivityLoaded = true;
      } catch (error) { }
    },
    handleChangeShowLayer(value) {
      this.s_showLayer = value;
      this.$emit("update:showLayer", value);
    },
    // 组件初始化事件
    handleEnable() {
      this.getData();
      this._Map.addLayer(this._Activity3DLayer);
      this.rootVue.$on("timeChange", this.handleTimeChange);
    },
    // 组件卸载事件
    handleDisable() {
      this._Map.removeLayer(this._Activity3DLayer);
      this.rootVue.$off("timeChange", this.handleTimeChange);
    },
    handleTimeChange(time) {
      if (this._Activity3DLayer) this._Activity3DLayer.setTime(time);
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep {
  .el-slider__marks-text {
    white-space: nowrap;
  }
}

.BusStopForm {
  padding: 0 12px;
  padding-top: 12px;

  ::v-deep .el-collapse-item__header {
    border-color: transparent;
  }

  .el-collapse-item__title {

    .checkbox {
      display: flex;
      align-items: center;

      ::v-deep .el-checkbox__input {
        padding-left: 10px;
      }

      ::v-deep .el-checkbox__label {
        font-size: 16px;
        font-weight: 500;

        .item_icon {
          width: 18px;
          height: 18px;
          margin-right: 7px;
        }
      }
    }

  }

  .form {
    box-sizing: border-box;
    width: 100%;
    padding-top: 10px;

    .form_item {
      width: 100%;
      display: flex;
      line-height: 40px;

      &+.form_item {
        margin-top: 12px;
      }

      .form_label {
        flex-shrink: 0;
        padding-right: 10px;
      }

      .form_value {
        width: 100%;
        text-align: right;
      }
    }
  }

  .icon_button {
    cursor: pointer;
    flex-shrink: 0;
    margin-left: 10px;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #e6e6e6;
    border-radius: 4px;

    &.active {
      background-color: rgba($color: #409eff, $alpha: 1);
      color: #ffffff;
    }

    &.disabled {
      cursor: no-drop;
    }

    &.icon_stop {
      .img {
        width: 20px;
        height: 20px;
        display: block;
        object-fit: cover;
        padding: 4px;
      }
    }
  }

  .color_item {
    display: flex;
    align-items: center;
    justify-content: space-between;

    &+.color_item {
      margin-top: 10px;
    }
  }
}

::v-deep .is-active {
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 6px;
}

.showLayer {
  ::v-deep .is-active {
    background-color: #D2D6E5;
    border-radius: 6px;
  }
  ::v-deep .el-collapse-item__arrow{
    &::after{
      background-image:url('@/assets/image/right_icon_a.png')
    }
  }
}

.color-picker {
  background: rgba(0, 0, 0, 0.05);
  padding: 0 8px;
  border-radius: 6px;
  width: 120px;
}

::v-deep .input-number {

  .el-input-number__decrease,
  .el-input-number__increase {
    border: none;
    background-color: transparent;
  }

  .el-input__inner {
    border: none;
    background: rgba(0, 0, 0, 0.05);
    padding: 0;
    margin: 0 39px;
    width: calc(100% - 78px);
  }

  .el-icon-minus,
  .el-icon-plus {
    width: 30px;
    height: 30px;

    &::before {
      display: none;
    }
    &::after {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 30px;
      height: 30px;
      background: url('@/assets/image/minus_icon.png') no-repeat center center;
      background-size: 100% 100%;
    }
    &:hover {
      &::after {
        background-image: url('@/assets/image/minus_icon_a.png');
      }
    }
  }

  .el-icon-plus {
    &::after {
      background-image: url('@/assets/image/push_icon.png');
    }
    &:hover {
      &::after {
        background-image: url('@/assets/image/push_icon_a.png');
      }
    }
  }
}
::v-deep .el-collapse-item__arrow{
  position: relative;
  width: 16px;
  height: 16px;
  background-color: transparent;
  &::before{
    display: none;
  }
  &::after{
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 16px;
    height: 16px;
    background:url('@/assets/image/right_icon.png') no-repeat center center;
    background-size: 100% 100%; 
  }
}
.flex-align-center {
  display: flex;
  align-items: center;
}
</style>
