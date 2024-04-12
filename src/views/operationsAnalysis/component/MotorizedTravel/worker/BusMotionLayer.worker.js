import * as THREE from "three";
import { BusMotionPath, BusMotionPoint, guid } from "../utils.js";

class BusMotionWorker {
  timeObj = new Map();
  busMap = new Map();
  pathMap = new Map();
  timeSpeed = 60 * 1;

  getBusByUuid({ uuid }) {
    console.log(uuid);
    for (const { pathId, busId, ...busDetail } of this.busMap.values()) {
      if (uuid == busDetail.uuid) {
        const path = this.pathMap.get(pathId);
        return { busDetail, path: path.toJSON() };
      }
    }
    return null;
  }

  getBusByColor({ pickColor }) {
    console.log(pickColor);
    for (const { pathId, busId, ...busDetail } of this.busMap.values()) {
      if (pickColor > 0 && pickColor == busDetail.pickColor) {
        const path = this.pathMap.get(pathId);
        return { busDetail, path: path.toJSON() };
      }
    }
    return null;
  }

  render({ time, maxBusNum, center }) {
    const _center = new BusMotionPoint(center);
    const timeKey = Math.ceil(time / this.timeSpeed);
    const _busKeys = this.timeObj.get(timeKey) || [];

    const runBusList = [];
    for (const busKey of _busKeys) {
      const v1 = this.busMap.get(busKey);
      if (v1 && time >= v1.startTime && time <= v1.endTime) {
        const { pathId, busId, ...busDetail } = v1;
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

        runBusList.push({
          runDetail: {
            worldPosition: start.toJSON(),
            position: [x0, y0],
            rotation: rotation.toArray(),
          },
          busDetail: busDetail,
        });
      }
      if (runBusList.length >= maxBusNum) break;
    }
    return {
      time: time,
      list: runBusList,
      center: center,
      maxBusNum: maxBusNum,
    };
  }

  setData(data) {
    this.pathMap.clear();
    this.busMap.clear();
    this.timeObj.forEach((v) => (v.length = 0));
    this.timeObj.clear();

    const timeSpeed = this.timeSpeed;
    const timeObj = this.timeObj;
    const busMap = this.busMap;
    const pathMap = this.pathMap;

    let pickColorNum = 1;
    for (const v1 of data) {
      const pathId = Symbol();
      const path = new BusMotionPath(v1.path);
      for (const v2 of v1.departures) {
        const busId = Symbol(v2.id);
        const bus = {
          busId: busId,
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
        };
        const { startTime, endTime } = bus;
        for (let index = startTime; index < endTime + timeSpeed; index += timeSpeed) {
          const key = Math.ceil(index / timeSpeed);
          if (!timeObj.has(key)) timeObj.set(key, new Array());
          const arr = timeObj.get(key);
          arr[arr.length] = busId;
        }
        busMap.set(busId, bus);
      }
      pathMap.set(pathId, path);
    }
  }
}

const worker = new BusMotionWorker();

onmessage = function (e) {
  const { key, data } = e.data;
  switch (key) {
    case "setData":
      this.postMessage({ key: key, data: worker.setData(data) });
      break;
    case "render":
      this.postMessage({ key: key, data: worker.render(data) });
      break;
    case "getBusByColor":
      this.postMessage({ key: key, data: worker.getBusByColor(data) });
      break;
    case "getBusByUuid":
      console.log(key, data);
      this.postMessage({ key: key, data: worker.getBusByUuid(data) });
      break;
  }
};
