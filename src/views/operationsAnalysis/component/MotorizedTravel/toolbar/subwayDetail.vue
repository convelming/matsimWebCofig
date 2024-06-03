<template>
  <el-collapse-item class="SubwayDetail" :name="name">
    <div class="collapse_item_title" slot="title">
      {{ subwayDetail.id.split(")")[0] + ")" }}
    </div>
    <div class="_bodyer" v-loading="loading">
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
  "车辆信息：":{
    "zh-CN": "车辆信息：",
    "en-US": "车辆信息："
  },
  "运行速度：":{
    "zh-CN": "运行速度：",
    "en-US": "运行速度："
  },
  "km/h":{
    "zh-CN": "km/h",
    "en-US": "km/h"
  },
  "总里程：":{
    "zh-CN": "总里程：",
    "en-US": "总里程："
  },
  "km":{
    "zh-CN": "km",
    "en-US": "km"
  },
  "行驶里程：":{
    "zh-CN": "行驶里程：",
    "en-US": "行驶里程："
  },
  "当前载客量：":{
    "zh-CN": "当前载客量：",
    "en-US": "当前载客量："
  },
  "人":{
    "zh-CN": "人",
    "en-US": "人"
  },
  "上一个停靠站点：":{
    "zh-CN": "上一个停靠站点：",
    "en-US": "上一个停靠站点："
  },
  "上一个站点上客量：":{
    "zh-CN": "上一个站点上客量：",
    "en-US": "上一个站点上客量："
  },
  "上一个站点下客量：":{
    "zh-CN": "上一个站点下客量：",
    "en-US": "上一个站点下客量："
  },
  "下一个停靠站点：":{
    "zh-CN": "下一个停靠站点：",
    "en-US": "下一个停靠站点："
  },
}
</language>

<script>
import { SubwayMotionPath, SubwayMotionPoint } from "../utils.js";
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
    subwayDetail: {
      type: Object,
      default: () => ({}),
    },
  },
  watch: {
    show: {
      handler(val) {
        if (val) {
          setTimeout(() => {
            this.rootVue.$emit("setSelectedSubway", this.subwayDetail);
            this.rootVue.$on("timeChange", this.handleSubwayDetailTimeChange);
          }, 200);
        } else {
          this.rootVue.$emit("setSelectedSubway", {});
          this.rootVue.$off("timeChange", this.handleSubwayDetailTimeChange);
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
    handleSubwayDetailTimeChange(time) {
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

        console.log("上客量：" + this._entering, "下客量：" + this._leaving, "当前载客量：" + this._passengers);
      }
      // 伪造站点上下客流量

      this.updateVisibleSvg();
    },
    getDetail() {
      if (!this.subwayDetail) return;
      queryVehicle({ departureId: this.subwayDetail.id }).then((res) => {
        const {
          departures: [departure],
          path,
        } = res.data;
        // 创建路径SVG
        departure.speed = 13.88888888888889
        this.departure = departure;
        this.path = new SubwayMotionPath(path);
        this.initSVG();
        this.loading = false;
      });
    },
    initSVG() {
      const { originPoint, resultPoint, startPoint } = this.path;
      const box = resultPoint.offset(originPoint);
      const padding = Math.max(box.x, box.y) * 0.02;
      const paddingPoint = new SubwayMotionPoint([padding, padding]);
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
          const point = new SubwayMotionPoint([v.coord.x, v.coord.y]);
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
.SubwayDetail {
  font-size: 13px;
  .collapse_item_title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0 20px;
  }
  ._bodyer {
    padding: 0 20px;
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
