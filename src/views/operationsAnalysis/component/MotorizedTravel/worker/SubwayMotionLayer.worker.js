import * as THREE from "three";
import { SubwayMotionPath, SubwayMotionPoint, guid } from "../utils.js";

class SubwayMotionWorker {
  timeObj = new Map();
  subwayMap = new Map();
  pathMap = new Map();
  timeSpeed = 60 * 1;

  getSubwayByUuid({ uuid }) {
    for (const { pathId, subwayId, ...subwayDetail } of this.subwayMap.values()) {
      if (uuid == subwayDetail.uuid) {
        const path = this.pathMap.get(pathId);
        return { subwayDetail, path: path.toJSON() };
      }
    }
    return null;
  }

  getSubwayByColor({ pickColor }) {
    for (const { pathId, subwayId, ...subwayDetail } of this.subwayMap.values()) {
      if (pickColor > 0 && pickColor == subwayDetail.pickColor) {
        const path = this.pathMap.get(pathId);
        return { subwayDetail, path: path.toJSON() };
      }
    }
    return null;
  }

  render({ time, maxSubwayNum, center }) {
    const _center = new SubwayMotionPoint(center);
    const timeKey = Math.ceil(time / this.timeSpeed);
    const _subwayKeys = this.timeObj.get(timeKey) || [];

    const runSubwayList = [];
    for (const subwayKey of _subwayKeys) {
      const v1 = this.subwayMap.get(subwayKey);
      if (v1 && time >= v1.startTime && time <= v1.endTime) {
        const { pathId, subwayId, ...subwayDetail } = v1;
        // 汽车当前时间已经行驶的距离
        const traveledDistance = (time - v1.startTime) * v1.desireSpeed;
        // 汽车没有走到终点
        // 计算汽车当前行驶到那个路段
        const path = this.pathMap.get(pathId);
        const { start, end, isRunning } = path.getPointByDistance(traveledDistance);

        const { x: x0, y: y0 } = start.offset(_center);
        const { x: x1, y: y1 } = end.offset(_center);
        const position = new THREE.Vector3(x0, y0, 0);
        const target = new THREE.Vector3(x1, y1, 0); // 你的目标点
        const direction = new THREE.Vector3().subVectors(target, position).normalize();
        const m4 = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
        m4.multiply(new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), Math.atan2(direction.y, direction.x) + Math.PI / 2));
        const rotation = new THREE.Euler();
        rotation.setFromRotationMatrix(m4);

        runSubwayList.push({
          runDetail: {
            worldPosition: start.toJSON(),
            position: [x0, y0],
            rotation: rotation.toArray(),
            modelName: v1.modelName
          },
          subwayDetail: subwayDetail,
        });
      }
      if (runSubwayList.length >= maxSubwayNum) break;
    }
    return {
      time: time,
      list: runSubwayList,
      center: center,
      maxSubwayNum: maxSubwayNum,
    };
  }

  setData(data) {
    this.pathMap.clear();
    this.subwayMap.clear();
    this.timeObj.forEach((v) => (v.length = 0));
    this.timeObj.clear();

    const timeSpeed = this.timeSpeed;
    const timeObj = this.timeObj;
    const subwayMap = this.subwayMap;
    const pathMap = this.pathMap;

    let pickColorNum = 1;
    for (const v1 of data) {
      const pathId = Symbol();
      const path = new SubwayMotionPath(v1.path);
      for (const v2 of v1.departures) {
        const subwayId = Symbol(v2.id);
        const subway = {
          subwayId: subwayId,
          // 线路id
          pathId: pathId,

          uuid: guid(),
          // 班次id
          id: v2.id,
          // 速度
          desireSpeed: v2.speed,
          // 出发时间
          startTime: v2.departureTime,
          // 到达时间
          endTime: path.totalDistance / v2.speed + v2.departureTime,
          // 出发点
          // startPoint: path.startPoint,
          // 终点
          // endPoint: path.endPoint,
          // 总路程
          totalDistance: path.totalDistance,
          // 拾取颜色
          pickColor: pickColorNum++,

          modelName: v1.mode || "subway"
        };
        const { startTime, endTime } = subway;
        for (let index = startTime; index < endTime + timeSpeed; index += timeSpeed) {
          const key = Math.ceil(index / timeSpeed);
          if (!timeObj.has(key)) timeObj.set(key, new Array());
          const arr = timeObj.get(key);
          arr[arr.length] = subwayId;
        }
        subwayMap.set(subwayId, subway);
      }
      pathMap.set(pathId, path);
    }
  }
}

const worker = new SubwayMotionWorker();

onmessage = function (e) {
  const { key, data } = e.data;
  switch (key) {
    case "setData":
      this.postMessage({ key: key, data: worker.setData(data) });
      break;
    case "render":
      this.postMessage({ key: key, data: worker.render(data) });
      break;
    case "getSubwayByColor":
      this.postMessage({ key: key, data: worker.getSubwayByColor(data) });
      break;
    case "getSubwayByUuid":
      this.postMessage({ key: key, data: worker.getSubwayByUuid(data) });
      break;
  }
};
