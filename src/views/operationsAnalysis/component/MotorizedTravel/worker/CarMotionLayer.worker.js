import * as THREE from "three";
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
  // 使用二分法找到目标点


  for (let i = 0; i < path.length; i += 8) {
    const line_startTime = path[i];
    const line_endTime = path[i + 1];
    if (line_startTime <= time && time < line_endTime) {
      const line_start = [path[i + 4], path[i + 5]]
      const line_end = [path[i + 6], path[i + 7]]
      const percentage = (time - line_startTime) / (line_endTime - line_startTime);
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

class CarMotionWorker {
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

  setData(array) {
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
    return new Float64Array([cx, cy])
  }
}

const worker = new CarMotionWorker();

onmessage = function (e) {
  if (e.data instanceof Float64Array) {
    const [key, postTime] = e.data;
    const data = e.data.slice(2);
    switch (key) {
      case 1: {
        //"setData":
        // console.log("car:setData", new Date().getTime() - postTime);
        const workerData = worker.setData(data);
        const array = new Float64Array(workerData.length + 3);
        array.set([key, new Date().getTime(), postTime], 0);
        array.set(workerData, 3);
        this.postMessage(array, [array.buffer]);
        break;
      }
      case 2: {
        //"render":
        // console.log("car:render", new Date().getTime() - postTime);
        const workerData = worker.render(data);
        const array = new Float64Array(workerData.length + 3);
        array.set([key, new Date().getTime(), postTime], 0);
        array.set(workerData, 3);
        this.postMessage(array, [array.buffer]);
        break;
      }
    }
  }
};
