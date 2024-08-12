<template>
  <el-collapse-item class="toolbar_item" :name="name">
    <div class="toolbar_item_header" slot="title">
      <div class="title">{{ `${$l("私家车详情")}` }}</div>
      <div class="subtitle" :title="carDetail.id">{{ carDetail.id }}</div>
    </div>
    <div class="toolbar_item_bodyer" v-loading="loading">
      <div class="form" v-if="departure">
        <div class="form_item">
          <div class="form_label">{{ $l("行程ID：") }}</div>
          <div class="form_value">{{ departure.id }}</div>
        </div>
        <div class="form_item">
          <div class="form_label">{{ $l("车辆ID：") }}</div>
          <div class="form_value">{{ departure.vehicleId }}</div>
        </div>
        <div class="form_item">
          <div class="form_label">{{ $l("人员：") }}</div>
          <div class="form_value">{{ departure.persons && departure.persons.join(",") }}</div>
        </div>
        <div class="form_item">
          <div class="form_label">{{ $l("行程总里程：") }}</div>
          <div class="form_value">{{ Number(departure.distance / 1000).toFixed(2) }}{{ $l("km") }}</div>
        </div>
        <div class="form_item">
          <div class="form_label">{{ $l("行程开始时间：") }}</div>
          <div class="form_value">
            {{ formatHour(departure.startTime) }}
          </div>
        </div>
        <div class="form_item">
          <div class="form_label">{{ $l("行程结束时间：") }}</div>
          <div class="form_value">
            {{ formatHour(departure.endTime) }}
          </div>
        </div>
      </div>
      <div class="path" v-if="svgParams">
        <svg xmlns="http://www.w3.org/2000/svg" :viewBox="svgParams.viewBox">
          <path v-bind="pathSvgParams"></path>
          <circle v-bind="visibleSvgParams"></circle>
        </svg>
      </div>
    </div>
  </el-collapse-item>
</template>

<language>
{
  "私家车详情":{
    "zh-CN": "私家车详情",
    "en-US": "Car travel details"
  },
  "行程ID：":{
    "zh-CN": "行程ID：",
    "en-US": "Person ID："
  },
  "车辆ID：":{
    "zh-CN": "车辆ID：",
    "en-US": "Vehicle ID："
  },
  "人员：":{
    "zh-CN": "人员：",
    "en-US": "NumberOfPassengers："
  },
  "行程总里程：":{
    "zh-CN": "行程总里程：",
    "en-US": "Trip distance："
  },
  "km":{
    "zh-CN": "km",
    "en-US": "km"
  },
  "行程开始时间：":{
    "zh-CN": "行程开始时间：",
    "en-US": "Start time："
  },
  "行程结束时间：":{
    "zh-CN": "行程结束时间：",
    "en-US": "End time："
  },
}
</language>

<script>
import { CarMotionPath, CarMotionPoint } from "../utils.js";
import { getCarInfo } from "@/api/index";
import { formatHour } from "@/utils/utils";
export default {
  inject: ["rootVue"],
  props: {
    name: {
      type: String,
    },
    show: {
      type: Boolean,
      default: false,
    },
    carDetail: {
      type: Object,
      default: () => ({}),
    },
  },
  watch: {
    show: {
      handler(val) {
        if (val) {
          setTimeout(() => {
            this.rootVue.$emit("MotorizedTravel_setSelectedCar", this.carDetail);
            this.rootVue.$on("timeChange", this.updateVisibleSvg);
          }, 200);
        } else {
          this.rootVue.$emit("MotorizedTravel_setSelectedCar", {});
          this.rootVue.$off("timeChange", this.updateVisibleSvg);
        }
      },
      immediate: true,
    },
  },
  data() {
    return {
      loading: true,

      svgParams: null,
      pathSvgParams: {},
      visibleSvgParams: {},

      prevStop: null,
      nextStop: null,
      departure: null,
      path: null,
    };
  },
  created() {
    this.getDetail();
  },
  methods: {
    getDetail() {
      if (!this.carDetail) return;
      getCarInfo({
        id: this.carDetail.id,
        vehicleId: this.carDetail.vehicleId,
      }).then((res) => {
        const { paths, ...departure } = res.data;
        // 创建路径SVG
        this.departure = departure;
        this.path = new CarMotionPath(paths);
        this.initSVG();
        this.loading = false;
      });
    },
    initSVG() {
      const { originPoint, resultPoint, startPoint } = this.path;
      const box = resultPoint.offset(originPoint);
      const padding = Math.max(box.x, box.y) * 0.02;
      const paddingPoint = new CarMotionPoint([padding, padding]);
      this.svgParams = {
        originPoint: originPoint.clone(),
        resultPoint: resultPoint.clone(),
        startPoint: startPoint.clone(),
        box: box,
        padding: padding,
        paddingPoint: paddingPoint,
        viewBox: `0 0 ${box.x + padding * 2} ${box.y + padding * 2}`,
      };
      this.updatePathSvg();
      this.updateVisibleSvg();
    },
    updatePathSvg() {
      try {
        const path = this.path;
        const { originPoint, resultPoint, startPoint, box, padding, paddingPoint } = this.svgParams;
        const pathList = [];
        const _startPoint = startPoint.offset(originPoint).unOffset(paddingPoint, false);
        pathList.push(`M${_startPoint.x},${_startPoint.y}`);
        for (const { end } of path.lineList) {
          const _point = end.offset(originPoint).unOffset(paddingPoint, false);
          pathList.push(`L${_point.x},${_point.y}`);
        }

        this.pathSvgParams = {
          d: pathList.join(" "),
          style: `stroke: #00c4ff; stroke-width: ${padding / 2}; fill: none`,
        };
      } catch (error) {
        this.pathSvgParams = {};
      }
    },
    updateVisibleSvg(time) {
      try {
        if (time === undefined || time === null) return;
        if (Math.abs(time - this._updateTime) < 0.005) return;
        this._updateTime = Number(Number(time).toFixed(3));
        const path = this.path;
        const { originPoint, resultPoint, startPoint, box, padding, paddingPoint } = this.svgParams;
        const { start } = path.getPointByTime(this._updateTime);
        const visiblePoint = start.offset(originPoint).unOffset(paddingPoint, false);

        this.visibleSvgParams = {
          cx: visiblePoint.x,
          cy: visiblePoint.y,
          r: padding,
          style: "stroke: #cd435f; fill: #000000;pointer-events: none;",
        };
      } catch (error) {
        this.visibleSvgParams = {};
      }
    },
    formatHour(val) {
      return formatHour(val).slice(0, 5);
    },
  },
};
</script>

<style lang="scss" scoped>
.toolbar_item {
  font-size: 13px;
  .toolbar_item_bodyer {
    .form {
      width: 100%;

      .form_item {
        width: 100%;
        display: flex;
        & + .form_item {
          margin-top: 10px;
        }
        .form_label {
          flex-shrink: 0;
          padding-right: 10px;
        }
        .form_value {
          width: 100%;
        }
      }
    }
    .path {
      padding-top: 10px;
      svg {
        width: 100%;
        height: auto;
        max-height: 300px;
        margin: auto;
        transform: rotateX(180deg);
      }
    }
  }
}
</style>
