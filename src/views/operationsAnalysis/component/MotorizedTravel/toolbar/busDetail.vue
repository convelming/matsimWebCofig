<template>
  <el-collapse-item class="toolbar_item" :name="name">
    <div class="toolbar_item_header" slot="title">
      <div class="title">{{ $l("车辆详情") }}</div>
      <div class="subtitle" :title="busDetail.id.split(')')[0] + ')'">{{ busDetail.id.split(")")[0] + ")" }}</div>
    </div>
    <div class="toolbar_item_bodyer" v-loading="loading">
      <div class="form" v-if="departure">
        <!-- <div class="form_item">
          <div class="form_label">{{ $l("路线：") }}</div>
          <div class="form_value">
            {{ departure.id ? departure.id.split(")")[0] + ")" : "" }}
          </div>
        </div> -->
        <div class="form_item">
          <div class="form_label">{{ $l("车辆信息：") }}</div>
          <div class="form_value">{{ departure.info }}</div>
        </div>
        <div class="form_item">
          <div class="form_label">{{ $l("运行速度：") }}</div>
          <div class="form_value">{{ Number(departure.speed * 3.6).toFixed(2) }} {{ $l("km/h") }}</div>
        </div>
        <div class="form_item">
          <div class="form_label">{{ $l("总里程：") }}</div>
          <div class="form_value">{{ Number(path.totalDistance / 1000).toFixed(2) }}{{ $l("km") }}</div>
        </div>
        <div class="form_item">
          <div class="form_label">{{ $l("行驶里程：") }}</div>
          <div class="form_value">{{ Number(traveledDistance / 1000).toFixed(2) }}{{ $l("km") }}</div>
        </div>
        <template v-if="prevStop">
          <div class="form_item">
            <div class="form_label">{{ $l("当前载客量：") }}</div>
            <div class="form_value">{{ prevStop.passengers }}{{ $l("人") }}</div>
          </div>
          <div class="form_item">
            <div class="form_label">{{ $l("上一个停靠站点：") }}</div>
            <div class="form_value">{{ prevStop.name }}</div>
          </div>
          <div class="form_item">
            <div class="form_label">{{ $l("上一个站点上客量：") }}</div>
            <div class="form_value">{{ prevStop.entering }}{{ $l("人") }}</div>
          </div>
          <div class="form_item">
            <div class="form_label">{{ $l("上一个站点下客量：") }}</div>
            <div class="form_value">{{ prevStop.leaving }}{{ $l("人") }}</div>
          </div>
        </template>
        <div class="form_item" v-if="nextStop">
          <div class="form_label">{{ $l("下一个停靠站点：") }}</div>
          <div class="form_value">{{ nextStop.name }}</div>
        </div>
      </div>
      <div class="path" v-if="svgParams">
        <svg xmlns="http://www.w3.org/2000/svg" :viewBox="svgParams.viewBox">
          <path v-bind="pathSvgParams"></path>
          <circle v-for="(v, i) in stopsSvgParams" :key="i" v-bind="v">
            <title>{{ v.title }}</title>
          </circle>
          <circle v-bind="visibleSvgParams"></circle>
        </svg>
      </div>
    </div>
  </el-collapse-item>
</template>

<language>
{
  "车辆详情":{
    "zh-CN": "车辆详情",
    "en-US": "Vehicle Detail"
  },
  "车辆信息：":{
    "zh-CN": "车辆信息：",
    "en-US": "Vehicle Info："
  },
  "运行速度：":{
    "zh-CN": "运行速度：",
    "en-US": "running speed："
  },
  "km/h":{
    "zh-CN": "km/h",
    "en-US": "km/h"
  },
  "总里程：":{
    "zh-CN": "总里程：",
    "en-US": "total mileage："
  },
  "km":{
    "zh-CN": "km",
    "en-US": "km"
  },
  "行驶里程：":{
    "zh-CN": "行驶里程：",
    "en-US": "mileage："
  },
  "当前载客量：":{
    "zh-CN": "当前载客量：",
    "en-US": "Current capacity："
  },
  "人":{
    "zh-CN": "人",
    "en-US": "man"
  },
  "上一个停靠站点：":{
    "zh-CN": "上一个停靠站点：",
    "en-US": "Previous stop："
  },
  "上一个站点上客量：":{
    "zh-CN": "上一个站点上客量：",
    "en-US": "Previous site loading："
  },
  "上一个站点下客量：":{
    "zh-CN": "上一个站点下客量：",
    "en-US": "Previous site drop-offs："
  },
  "下一个停靠站点：":{
    "zh-CN": "下一个停靠站点：",
    "en-US": "Next stop："
  },
}
</language>

<script>
import { BusMotionPath, BusMotionPoint } from "../utils.js";
import { queryVehicle } from "@/api/index";
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
    busDetail: {
      type: Object,
      default: () => ({}),
    },
  },
  watch: {
    show: {
      handler(val) {
        if (val) {
          setTimeout(() => {
            this.rootVue.$emit("MotorizedTravel_setSelectedBus", this.busDetail);
            this.rootVue.$on("timeChange", this.handleBusDetailTimeChange);
          }, 200);
        } else {
          this.rootVue.$emit("MotorizedTravel_setSelectedBus", {});
          this.rootVue.$off("timeChange", this.handleBusDetailTimeChange);
        }
      },
      immediate: true,
    },
  },
  data() {
    return {
      loading: true,

      svgParams: null,
      pathSvgParams: null,
      stopsSvgParams: null,
      visibleSvgParams: null,

      prevStop: null,
      nextStop: null,
      departure: null,
      path: null,
      traveledDistance: 0,
    };
  },
  created() {
    this.getDetail();
  },
  methods: {
    handleBusDetailTimeChange(time) {
      if (!this.show) return;
      if (this.loading) return;
      let traveledDistance = (time - this.departure.departureTime) * this.departure.speed;
      if (traveledDistance < 0) {
        traveledDistance = 0;
      } else if (traveledDistance > this.path.totalDistance) {
        traveledDistance = this.path.totalDistance;
      }
      this.traveledDistance = traveledDistance;
      let index = this.departure.stops.findIndex((v) => v.distance > this.traveledDistance);

      this.prevStop = this.departure.stops[index - 1] || null;
      this.nextStop = this.departure.stops[index] || null;

      // 伪造站点上下客流量
      if (this.prevStop && this._stop != this.prevStop.name) {
        this._stop = this.prevStop.name;
        // 上客量
        this._entering = Math.floor(Math.random() * 10 + 10);
        // 下客量
        this._leaving = Math.floor(Math.random() * (this._passengers || 0));
        // 当前载客量
        this._passengers = (this._passengers || 0) - this._leaving + this._entering;
        if (this._passengers >= 40) {
          this._entering = this._passengers - 40;
          this._passengers = 40;
        }

        this.prevStop.entering = this._entering;
        this.prevStop.leaving = this._leaving;
        this.prevStop.passengers = this._passengers;
      }
      // 伪造站点上下客流量

      this.updateVisibleSvg();
    },
    getDetail() {
      if (!this.busDetail) return;
      queryVehicle({ departureId: this.busDetail.id }).then((res) => {
        const {
          departures: [departure],
          path,
        } = res.data;
        // 创建路径SVG
        this.departure = departure;
        this.path = new BusMotionPath(path);
        this.initSVG();
        this.loading = false;
      });
    },
    initSVG() {
      const { originPoint, resultPoint, startPoint } = this.path;
      const box = resultPoint.offset(originPoint);
      const padding = Math.max(box.x, box.y) * 0.02;
      const paddingPoint = new BusMotionPoint([padding, padding]);
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
      this.updateStopsSvg();
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
        this.pathSvgParams = undefined;
      }
    },
    updateStopsSvg() {
      try {
        const stops = this.departure.stops;
        const { originPoint, resultPoint, startPoint, box, padding, paddingPoint } = this.svgParams;

        // 创建站点SVG
        const stopList = [];
        for (const v of stops) {
          const point = new BusMotionPoint([v.coord.x, v.coord.y]);
          const { x, y } = point.offset(originPoint).unOffset(paddingPoint, false);
          stopList.push({
            cx: x,
            cy: y,
            r: padding * 0.75,
            style: "stroke: #cd435f; fill: #cd435f",
            title: v.name,
          });
        }
        this.stopsSvgParams = stopList;
      } catch (error) {
        this.stopsSvgParams = undefined;
      }
    },
    updateVisibleSvg() {
      try {
        const traveledDistance = this.traveledDistance;
        const path = this.path;
        const { originPoint, resultPoint, startPoint, box, padding, paddingPoint } = this.svgParams;
        const { start } = path.getPointByDistance(traveledDistance);
        const visiblePoint = start.offset(originPoint).unOffset(paddingPoint, false);

        this.visibleSvgParams = {
          cx: visiblePoint.x,
          cy: visiblePoint.y,
          r: padding,
          style: "stroke: #cd435f; fill: #000000;pointer-events: none;",
        };
      } catch (error) {
        this.visibleSvgParams = undefined;
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
