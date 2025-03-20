import * as THREE from "three";
import { WGS84ToMercator } from "@/mymap/utils/LngLatUtils"

function calculatePosition(path, time) {
  if (path.length == 1) {
    return { start: path[0].point, end: path[0].point, index: 0, isRunning: false }
  }
  const route_startTime = path[0].time;
  const route_endTime = path[path.length - 1].time;
  if (time <= route_startTime) {
    return { start: path[0].point, end: path[1].point, index: 0, isRunning: false }
  } else if (time >= route_endTime) {
    return { start: path[path.length - 1].point, end: path[path.length - 1].point, index: path.length - 1, isRunning: false };
  }

  for (let i = 0, l = path.length - 1; i < l; i++) {
    const line_startTime = path[i].time;
    const line_endTime = path[i + 1].time;
    if (line_startTime <= time && time < line_endTime) {
      let line_start = path[i].point;
      let line_end = path[i + 1].point;
      let percentage = (time - line_startTime) / (line_endTime - line_startTime);

      let _i = i;
      while (line_start[0] == line_end[0] && line_start[1] == line_end[1] && _i < path.length - 1) {
        line_end = path[++_i].point;
        percentage = 0;
      }
      _i = i;
      while (line_start[0] == line_end[0] && line_start[1] == line_end[1] && _i > 0) {
        line_end = path[--_i].point;
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
        index: i
      };
    }
  }
}

function pointMove(start, end, percentage) {
  let x = start[0] + (end[0] - start[0]) * percentage;
  let y = start[1] + (end[1] - start[1]) * percentage;
  return [x, y]
}

function pointDistance(start, end, percentage) {
  return Math.sqrt(Math.pow(end[0] - start[0], 2) + Math.pow(end[1] - start[1], 2)) * percentage;
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
    const maxX = array[3] - this.center[0];
    const minX = array[4] - this.center[0];
    const maxY = array[5] - this.center[1];
    const minY = array[6] - this.center[1];

    const timeKey = Math.ceil(time / this.timeSpeed);
    const _carKeys = this.timeObj.get(timeKey) || [];

    const runCarList = [];
    let detail = null;

    for (const carKey of _carKeys) {
      const v1 = this.carMap.get(carKey);
      if (v1 && time >= v1.startTime && time <= v1.endTime) {
        const { track, index, typeIndex } = v1;
        const { start, end, index: sindex } = calculatePosition(track, time);


        if (v1.index == selectCarIndex) {
          const { track, ...d } = v1;
          detail = d;
          detail.start = track[sindex];
        }

        const [x0, y0] = start;
        const [x1, y1] = end;
        if (x0 > maxX || x0 < minX || y0 > maxY || y0 < minY) continue;

        const position = new THREE.Vector3(x0, y0, 0);
        const target = new THREE.Vector3(x1, y1, 0); // 你的目标点

        const m4 = new THREE.Matrix4();
        m4.multiply(new THREE.Matrix4().lookAt(position, target, new THREE.Vector3(0, 0, 1)));
        m4.multiply(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
        const q = new THREE.Quaternion().setFromRotationMatrix(m4);

        // let angle = Math.atan(y1 - y0, x1 - x0) + Math.PI / 2;
        // const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), angle || Math.PI);
        runCarList.push(index, typeIndex, x0, y0, q.x, q.y, q.z, q.w); // length = 8
      }
    }
    return {
      array: new Float64Array(runCarList),
      detail: detail
    };
  }

  setData(a1) {
    const data = Array.from(Object.entries(JSON.parse(new TextDecoder().decode(a1))));
    const center = [0, 0];
    const idList = [];
    const typeList = [];

    this.carMap.clear();
    this.timeObj.forEach((v) => (v.length = 0));
    this.timeObj.clear();

    const timeSpeed = this.timeSpeed;
    const timeObj = this.timeObj;
    const carMap = this.carMap;

    for (let i1 = 0, l1 = data.length; i1 < l1; i1++) {
      const [k1, v1] = data[i1];

      if (v1.track.length < 1) continue;


      const carId = Symbol(i1);

      v1.id = k1;
      v1.typeIndex = typeList.findIndex(v => v == v1.type);
      if (v1.typeIndex < 0) {
        v1.typeIndex = typeList.length
        typeList.push(v1.type)
      }
      v1.startTime = v1.endTime = 0;
      v1.index = idList.length;
      idList.push(k1);

      let perv = null;
      let totalDispose = 0;
      for (let i2 = 0, l2 = v1.track.length; i2 < l2; i2++) {
        const v2 = v1.track[i2];
        const [x2, y2] = WGS84ToMercator(v2.point[0], v2.point[1]);
        if (!center[0] || !center[1]) {
          center[0] = x2;
          center[1] = y2;
        }
        if (i2 == 0) v1.startTime = v2.time;
        if (i2 == l2 - 1) v1.endTime = v2.time;
        v2.point = [x2 - center[0], y2 - center[1]];

        let dispose = 0;
        let speed = 0;
        if (perv) {
          dispose = pointDistance(perv.point, v2.point, 1) || 0;
          speed = dispose / (v2.time - perv.time)
        }

        totalDispose += dispose;
        v2.dispose = totalDispose;
        v2.speed = speed;


        perv = v2;
      }

      carMap.set(carId, v1);

      for (let j = v1.startTime; j < v1.endTime + timeSpeed; j += timeSpeed) {
        const key = Math.ceil(j / timeSpeed);
        if (!timeObj.has(key)) timeObj.set(key, new Array());
        const arr = timeObj.get(key);
        arr[arr.length] = carId;
      }
    }

    this.center = center;
    this.idList = idList;
    this.typeList = typeList;
    console.log(carMap);

    return { center: center, idList: idList, typeList: typeList }
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
      console.log(workerData);

      this.postMessage({
        type: type,
        postTime: postTime,
        callTime: new Date().getTime(),
        ...workerData
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
        array: workerData.array,
        detail: workerData.detail
      }, [workerData.array.buffer]);
      break;
    }
  }
};
