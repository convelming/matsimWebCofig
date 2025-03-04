import * as THREE from "three";
import { WGS84ToMercator } from "@/mymap/utils/LngLatUtils"


function calculatePosition(path, time) {
  const route_startTime = path[0];
  const route_endTime = path[path.length - 7];
  if (time <= route_startTime) {
    const startX = path[4];
    const startY = path[5];
    const endX = path[6];
    const endY = path[7];
    return { start: [startX, startY], end: [endX, endY], isRunning: false };
  } else if (time >= route_endTime) {
    const endX = path[path.length - 2];
    const endY = path[path.length - 1];
    return { start: [endX, endY], end: [endX, endY], isRunning: false };
  }
  for (let i = 0; i < path.length; i += 8) {
    const line_startTime = path[i];
    const line_endTime = path[i + 1];
    if (line_startTime <= time && time < line_endTime) {
      const line_start = [path[i + 4], path[i + 5]];
      const line_end = [path[i + 6], path[i + 7]];
      let percentage = (time - line_startTime) / (line_endTime - line_startTime);

      let _i = i;
      while (line_start[0] == line_end[0] && line_start[1] == line_end[1] && _i < path.length) {
        _i += 8;
        line_end[0] = path[_i + 6];
        line_end[1] = path[_i + 7];
        percentage = 0;
      }
      _i = i;
      while (line_start[0] == line_end[0] && line_start[1] == line_end[1] && _i >= 0) {
        _i -= 8;
        line_end[0] = path[_i + 6];
        line_end[1] = path[_i + 7];
        percentage = 0;
      }
      if (_i < i) {
        line_end[0] = line_end[0] * 2 - line_start[0];
        line_end[1] = line_end[1] * 2 - line_start[1];
      }

      return {
        start: pointMove(line_start, line_end, percentage),
        end: line_end,
        isRunning: true,
      };
    }
  }
}
function pointMove(start, end, percentage) {
  let x = start[0] + (end[0] - start[0]) * percentage;
  let y = start[1] + (end[1] - start[1]) * percentage;
  return [x, y]
}

class WorkerClass {
  loading = false;
  timeObj = new Map();
  carMap = new Map();
  center = [0, 0];
  timeSpeed = 60 * 1;

  render(array) {
    const time = array[0];
    const maxCarNum = array[1];
    const selectCarIndex = array[2];
    const maxX = array[3];
    const minX = array[4];
    const maxY = array[5];
    const minY = array[6];

    const timeKey = Math.ceil(time / this.timeSpeed);
    const _carKeys = this.timeObj.get(timeKey) || [];

    const runCarList = [];
    for (const carKey of _carKeys) {
      const v1 = this.carMap.get(carKey);
      if (v1 && (runCarList.length < maxCarNum || v1.id == selectCarIndex) && time >= v1.startTime && time <= v1.endTime) {
        const { path, id } = v1;
        const { start, end } = calculatePosition(path, time);

        const [x0, y0] = start;
        const [x1, y1] = end;
        const position = new THREE.Vector3(x0, y0, 0);
        const target = new THREE.Vector3(x1, y1, 0); // 你的目标点
        // const direction = new THREE.Vector3().subVectors(target, position).normalize();
        // const m4 = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
        // m4.multiply(new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), Math.atan2(direction.y, direction.x) + Math.PI / 2));
        // const rotation = new THREE.Euler();
        // rotation.setFromRotationMatrix(m4);
        // const rotationOrderMap = { "XYZ": 1, "YXZ": 2, "ZXY": 3, "ZYX": 4, "YZX": 5, "XZY": 6 };
        // runCarList.push(id, x0, y0, rotation.x, rotation.y, rotation.z, rotationOrderMap[rotation.order]);

        const m4 = new THREE.Matrix4().lookAt(position, target, new THREE.Vector3(0, 0, 1));
        m4.multiply(new THREE.Matrix4().makeRotationY(Math.PI));
        const q = new THREE.Quaternion().setFromRotationMatrix(m4);
        runCarList.push(id, x0, y0, q.x, q.y, q.z, q.w); // length = 7
      }
    }
    return new Float64Array(runCarList);
  }

  setData(a1) {
    const data = JSON.parse(new TextDecoder().decode(a1));
    const array = [];
    const idList = [];
    {
      let index = 0;
      for (const [id, value] of Object.entries(data)) {
        let carData = [];
        let perv = null;
        let dispose = 0;
        for (const [time, x, y] of value.track) {
          const [x2, y2] = WGS84ToMercator(x, y);
          if (!array[0]) {
            array[0] = x2;
            array[1] = y2;
          }
          if (perv) {
            const d1 = Math.sqrt(Math.pow(x2 - perv[1], 2) + Math.pow(y2 - perv[2], 2));
            dispose += d1;
            const speed = d1 / (time - perv[0]);
            carData.push(perv[0], time, speed, dispose, perv[1] - array[0], perv[2] - array[1], x2 - array[0], y2 - array[1])
          }
          perv = [time, x2, y2]
        }
        if (carData.length > 0) {
          array.push(carData.length + 1, index, ...carData);
          idList.push(id);
          index++
        }
      }
    }
    console.log(idList);

    // return new Float64Array([0, 0])


    this.carMap.clear();
    this.timeObj.forEach((v) => (v.length = 0));
    this.timeObj.clear();

    const timeSpeed = this.timeSpeed;
    const timeObj = this.timeObj;
    const carMap = this.carMap;

    const cx = array[0];
    const cy = array[1];
    for (let i = 2, dataLength = array[2]; i < array.length; i += dataLength + 1, dataLength = array[i]) {
      const id = array[i + 1];
      const path = array.slice(i + 2, i + 1 + dataLength);
      // path = [startTime, endTime, speed, distance, startX, startY, endX, endY .....]
      const startTime = path[0];
      const endTime = path[path.length - 7];
      const carId = Symbol(id);
      const car = {
        id: id,

        startTime: startTime,
        endTime: endTime,

        path: path,
      };
      carMap.set(carId, car);

      for (let j = startTime; j < endTime + timeSpeed; j += timeSpeed) {
        const key = Math.ceil(j / timeSpeed);
        if (!timeObj.has(key)) timeObj.set(key, new Array());
        const arr = timeObj.get(key);
        arr[arr.length] = carId;
      }
    }

    console.log(carMap);


    return { center: [cx, cy], idList: idList }
  }
}

const worker = new WorkerClass();

onmessage = function (e) {
  const { type, postTime } = e.data;
  const data = e.data.array;

  switch (type) {
    case 1: {
      //"setData":
      // console.log("car:setData", new Date().getTime() - postTime);
      const workerData = worker.setData(data);
      this.postMessage({
        type: type,
        postTime: postTime,
        callTime: new Date().getTime(),
        center: workerData.center,
        idList: workerData.idList
      });
      break;
    }
    case 2: {
      //"render":
      // console.log("car:render", new Date().getTime() - callTime);
      const workerData = worker.render(data);
      this.postMessage({
        type: type,
        postTime: postTime,
        callTime: new Date().getTime(),
        array: workerData
      }, [workerData.buffer]);
      break;
    }
  }
};
