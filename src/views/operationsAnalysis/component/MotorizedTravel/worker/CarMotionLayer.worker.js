import * as THREE from "three";
import { CarMotionPath, CarMotionPoint, guid } from "../utils.js";

class CarMotionWorker {
  loading = false;
  timeObj = new Map();
  carMap = new Map();
  timeSpeed = 60 * 1;

  getPickCar({ pickColor }) {
    console.log(pickColor);
    for (const { carId, path, ...carDetail } of this.carMap.values()) {
      if (pickColor > 0 && pickColor == carDetail.pickColor) {
        return carDetail;
      }
    }
    return null;
  }

  render({ time, maxCarNum, center }) {
    const _center = new CarMotionPoint(center);
    const timeKey = Math.ceil(time / this.timeSpeed);
    const _carKeys = this.timeObj.get(timeKey) || [];

    const runCarList = [];
    for (const carKey of _carKeys) {
      const v1 = this.carMap.get(carKey);
      if (v1 && time >= v1.startTime && time <= v1.endTime) {
        const { carId, path, ...carDetail } = v1;
        const { start, end, running } = path.getPointByTime(time);

        const { x: x0, y: y0 } = start.offset(_center);
        const { x: x1, y: y1 } = end.offset(_center);
        const position = new THREE.Vector3(x0, y0, 0);
        const target = new THREE.Vector3(x1, y1, 0); // 你的目标点
        const direction = new THREE.Vector3()
          .subVectors(target, position)
          .normalize();
        const m4 = new THREE.Matrix4().makeRotationAxis(
          new THREE.Vector3(1, 0, 0),
          Math.PI / 2
        );
        m4.multiply(
          new THREE.Matrix4().makeRotationAxis(
            new THREE.Vector3(0, 1, 0),
            Math.atan2(direction.y, direction.x) + Math.PI / 2
          )
        );
        const rotation = new THREE.Euler();
        rotation.setFromRotationMatrix(m4);

        runCarList.push({
          runDetail: {
            worldPosition: start.toJSON(),
            position: [x0, y0],
            rotation: rotation.toArray(),
          },
          carDetail: carDetail,
        });
      }
      if (runCarList.length >= maxCarNum) break;
    }
    return {
      time: time,
      list: runCarList,
      center: center,
      maxCarNum: maxCarNum,
    };
  }

  setData(data) {
    this.carMap.clear();
    this.timeObj.forEach((v) => (v.length = 0));
    this.timeObj.clear();

    const timeSpeed = this.timeSpeed;
    const timeObj = this.timeObj;
    const carMap = this.carMap;
    let pickColorNum = 1;

    for (const v1 of data) {
      const carId = Symbol(v1.id);
      const car = {
        carId: carId,
        id: v1.id,
        vehicleId: v1.vehicleId,
        uuid: guid(),

        speed: v1.speed,
        distance: v1.distance,
        startTime: v1.startTime,
        endTime: v1.endTime,
        persons: v1.persons,
        mode: v1.mode,

        isShow: false,
        model: null,
        modelName: "SUV",
        path: new CarMotionPath(v1.paths),
        pickColor: pickColorNum++,
      };
      carMap.set(carId, car);

      const { startTime, endTime } = car;
      for (
        let index = startTime;
        index < endTime + timeSpeed;
        index += timeSpeed
      ) {
        const key = Math.ceil(index / timeSpeed);
        if (!timeObj.has(key)) timeObj.set(key, new Array());
        const arr = timeObj.get(key);
        arr[arr.length] = carId;
      }
    }
  }
}

const worker = new CarMotionWorker();

onmessage = function (e) {
  const { key, data } = e.data;
  switch (key) {
    case "setData":
      this.postMessage({ key: key, data: worker.setData(data) });
      break;
    case "render":
      this.postMessage({ key: key, data: worker.render(data) });
      break;
    case "getPickCar":
      this.postMessage({ key: key, data: worker.getPickCar(data) });
      break;
  }
};
