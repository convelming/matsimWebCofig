import * as THREE from "three";

function calculatePosition(path, distance) {
  if (distance <= 0) {
    const startX = path[0];
    const startY = path[1];
    const startZ = path[2];
    const endX = path[4];
    const endY = path[5];
    const endZ = path[6];
    return { start: [startX, startY, startZ], end: [endX, endY, endZ], isRunning: false };
  } else if (distance >= path[path.length - 1]) {
    const endX = path[path.length - 4];
    const endY = path[path.length - 3];
    const endZ = path[path.length - 2];
    return { start: [endX, endY, endZ], end: [endX, endY, endZ], isRunning: false };
  }

  // let startX = path[0];
  // let startY = path[1];
  // let startDistance = path[2];
  // for (let i = 3; i < path.length; i += 3) {
  //   const endX = path[i];
  //   const endY = path[i + 1];
  //   const endDistance = path[i + 2];
  //   if (endDistance > distance) {
  //     return {
  //       start: pointMove([startX, startY], [endX, endY], (distance - startDistance) / (endDistance - startDistance)),
  //       end: [endX, endY],
  //       isRunning: false
  //     }
  //   }
  //   startX = endX;
  //   startY = endY;
  // }

  let min = 0;
  let max = path.length / 4 - 1;
  let num = 0;
  while (min <= max) {
    num = Math.floor((max + min) / 2);
    const start_distance = path[num * 4 + 3];
    const end_distance = path[num * 4 + 7];
    if (start_distance <= distance && distance < end_distance) {
      break;
    } else if (start_distance > distance) {
      max = num;
    } else if (distance >= end_distance) {
      min = num;
    } else {
      console.log("error");
    }
  }

  const startX = path[num * 4];
  const startY = path[num * 4 + 1];
  const startZ = path[num * 4 + 2];
  const startDistance = path[num * 4 + 3];
  const endX = path[num * 4 + 4];
  const endY = path[num * 4 + 5];
  const endZ = path[num * 4 + 6];
  const endDistance = path[num * 4 + 7];

  return {
    start: pointMove([startX, startY, startZ], [endX, endY, endZ], (distance - startDistance) / (endDistance - startDistance)),
    end: [endX, endY, endZ],
    isRunning: false,
  };
}

function pointMove(start, end, percentage) {
  let x = start[0] + (end[0] - start[0]) * percentage;
  let y = start[1] + (end[1] - start[1]) * percentage;
  return [x, y];
}

class BusMotionWorker {
  timeObj = new Map();
  busMap = new Map();
  pathMap = new Map();
  timeSpeed = 60 * 1;

  render(array) {
    const time = array[0];
    const maxBusNum = array[1];
    const selectBusIndex = array[2];
    const maxX = array[3];
    const minX = array[4];
    const maxY = array[5];
    const minY = array[6];

    const timeKey = Math.ceil(time / this.timeSpeed);
    const _busKeys = this.timeObj.get(timeKey) || [];

    const runBusList = [];
    for (const busKey of _busKeys) {
      const v1 = this.busMap.get(busKey);
      if (v1 && (runBusList.length < maxBusNum || v1.id == selectBusIndex) && time >= v1.startTime && time <= v1.endTime) {
        const { pathId, id, speed } = v1;
        const path = this.pathMap.get(pathId);
        const { start, end } = calculatePosition(path, (time - v1.startTime) * speed);
        const [x0, y0, z0] = start;
        const [x1, y1, z1] = end;
        const position = new THREE.Vector3(x0, y0, z0);
        const target = new THREE.Vector3(x1, y1, z1); // 你的目标点
        // const direction = new THREE.Vector3().subVectors(target, position).normalize();
        // const m4 = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
        // m4.multiply(new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), Math.atan2(direction.y, direction.x) + Math.PI / 2));
        // const rotation = new THREE.Euler();
        // rotation.setFromRotationMatrix(m4);
        // const rotationOrderMap = { "XYZ": 1, "YXZ": 2, "ZXY": 3, "ZYX": 4, "YZX": 5, "XZY": 6 };
        // runBusList.push(id, x0, y0, rotation.x, rotation.y, rotation.z, rotationOrderMap[rotation.order]);

        const m4 = new THREE.Matrix4().lookAt(position, target, new THREE.Vector3(0, 0, 1));
        m4.multiply(new THREE.Matrix4().makeRotationY(Math.PI));
        const q = new THREE.Quaternion().setFromRotationMatrix(m4);
        runBusList.push(id, x0, y0, z0, q.x, q.y, q.z, q.w); // length = 7
      }
    }
    return new Float64Array(runBusList);
  }

  setData(array) {
    this.pathMap.clear();
    this.busMap.clear();
    this.timeObj.forEach((v) => (v.length = 0));
    this.timeObj.clear();

    const timeSpeed = this.timeSpeed;
    const timeObj = this.timeObj;
    const busMap = this.busMap;
    const pathMap = this.pathMap;

    const cx = array[0];
    const cy = array[1];
    for (let i = 2, dataLength = array[2]; i < array.length; i += dataLength + 1, dataLength = array[i]) {
      const departuresLength = array[1 + i];
      const departures = array.slice(1 + i + 1, 1 + i + 1 + departuresLength);
      const pathLength = array[1 + i + 1 + departuresLength];
      const path = array.slice(1 + i + 1 + departuresLength + 1, 1 + i + 1 + departuresLength + 1 + pathLength);

      const totalDistance = path[path.length - 1];
      const pathId = Symbol();
      for (let j = 0; j < departuresLength; j += 3) {
        const busId = Symbol(departures[j]);
        const bus = {
          id: departures[j],
          pathId: pathId,
          startTime: departures[j + 1],
          endTime: totalDistance / departures[j + 2] + departures[j + 1],
          speed: departures[j + 2],
        };
        const { startTime, endTime } = bus;
        for (let k = startTime; k < endTime + timeSpeed; k += timeSpeed) {
          const key = Math.ceil(k / timeSpeed);
          if (!timeObj.has(key)) timeObj.set(key, new Array());
          const arr = timeObj.get(key);
          arr[arr.length] = busId;
        }
        busMap.set(busId, bus);
      }
      pathMap.set(pathId, path);
    }
    return new Float64Array([cx, cy]);
  }
}

const worker = new BusMotionWorker();

onmessage = function (e) {
  if (e.data instanceof Float64Array) {
    const [key, postTime] = e.data;
    const data = e.data.slice(2);
    switch (key) {
      case 1: {
        //"setData":
        // console.log("bus:setData", new Date().getTime() - postTime);
        const workerData = worker.setData(data);
        const array = new Float64Array(workerData.length + 3);
        array.set([key, new Date().getTime(), postTime], 0);
        array.set(workerData, 3);
        this.postMessage(array, [array.buffer]);
        break;
      }
      case 2: {
        //"render":
        // console.log("bus:render", new Date().getTime() - postTime, data);
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
