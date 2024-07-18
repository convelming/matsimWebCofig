import { guid } from "@/utils/utils";
import axios from "axios";
import * as THREE from "three";

const EARTH_RADIUS = 20037508.3427892;

const TIME_SPEED = 60 * 5; // 秒


function calculatePosition(path, time) {
  const route_startTime = path[2];
  const route_endTime = path[path.length - 1];
  if (time <= route_startTime) {
    const startX = path[0];
    const startY = path[1];
    const endX = path[3];
    const endY = path[4];
    return { start: [startX, startY], end: [endX, endY], isRunning: false };
  } else if (time >= route_endTime) {
    const endX = path[path.length - 3];
    const endY = path[path.length - 2];
    return { start: [endX, endY], end: [endX, endY], isRunning: false };
  }
  // 使用二分法找到目标点

  // 最普通的从头到尾寻找目标点
  const length = path.length / 3;
  for (let i = 0; i < length - 1; i++) {
    const line_startTime = path[i * 3 + 2];
    const line_endTime = path[i * 3 + 5];
    if (line_startTime <= time && time < line_endTime) {
      const line_start = [path[i * 3 + 0], path[i * 3 + 1]];
      const line_end = [path[i * 3 + 3], path[i * 3 + 4]];
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

class Worker {
  loading = false;
  timeObj = new Map();
  carMap = new Map();

  tileMap = new Map();


  constructor() { }

  async loadTiles(data) {
    if (this.tileMap.size > 50) {
      // TODO 清除一些显示优先级低的tile
    }

    const { dataSource, row, col, zoom, size } = data;
    for (let i = row[0]; i < row[1]; i++) {
      for (let j = col[0]; j < col[1]; j++) {
        const key = `${i}_${j}`;
        if (!this.tileMap.has(key)) {
          const tile = await this.getTile(dataSource, zoom, i, j);
          this.tileMap.set(key, tile);
        }
      }
    }

    return new Float64Array();
  }

  async getTile(dataSource, zoom, row, col) {
    const response = await axios({
      url: `/pt/tiles/car/${dataSource}/${zoom}/${row}/${col}`,
      headers: { uuid: guid(), dataSource: "" },
      method: "get",
      responseType: "arraybuffer",
    })
    const array = [];
    const dataView = new DataView(response.data);
    for (let i = 0; i < dataView.byteLength; i += 4) {
      const value = dataView.getFloat32(i, false);
      array.push(value);
    }

    const timeSpeed = TIME_SPEED;
    const timeObj = new Map();
    const carMap = new Map();

    for (let i = 0, dataLength = array[0]; i < array.length; i += dataLength + 1, dataLength = array[i]) {
      const id = array[i + 1];
      const type = array[i + 2];
      const path = array.slice(i + 3, i + 1 + dataLength);
      // path = [startTime, endTime, speed, distance, startX, startY, endX, endY .....]
      const startTime = path[2];
      const endTime = path[path.length - 1];
      const carId = Symbol(id);
      const car = {
        id: id,
        type: type,

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
    return {
      row: row,
      col: col,
      x: ((row + 0.5) * (EARTH_RADIUS * 2)) / Math.pow(2, zoom) - EARTH_RADIUS,
      y: EARTH_RADIUS - ((col + 0.5) * (EARTH_RADIUS * 2)) / Math.pow(2, zoom),
      timeObj: timeObj,
      carMap: carMap,
    };
  }

  render(data) {
    console.time("render")
    const { time, maxCarNum, selectCarIndex, maxX, minX, maxY, minY } = data;
    const [cx, cy] = [12628397, 2655338.7]
    const timeSpeed = TIME_SPEED;
    const timeKey = Math.ceil(time / timeSpeed);
    const cars = [];
    for (const tile of this.tileMap.values()) {
      if (tile.timeObj.has(timeKey)) {
        const carKeys = tile.timeObj.get(timeKey);
        for (const key of carKeys) {
          if (tile.carMap.has(key)) {
            cars[cars.length] = tile.carMap.get(key);
          }
        }
      }
    }

    const runCarList = [];
    for (const v1 of cars) {
      if (v1 && (runCarList.length < maxCarNum || v1.id == selectCarIndex) && time >= v1.startTime && time <= v1.endTime) {
        const { path, id } = v1;
        const { start, end } = calculatePosition(path, time);
        const [x0, y0] = start;
        const [x1, y1] = end;
        const position = new THREE.Vector3(x0 - cx, y0 - cy, 0);
        const target = new THREE.Vector3(x1 - cx, y1 - cy, 0); // 你的目标点
        const m4 = new THREE.Matrix4().lookAt(position, target, new THREE.Vector3(0, 0, 1));
        m4.multiply(new THREE.Matrix4().makeRotationY(Math.PI));
        const q = new THREE.Quaternion().setFromRotationMatrix(m4);
        runCarList.push(id, x0 - cx, y0 - cy, q.x, q.y, q.z, q.w); // length = 7
      }
    }
    console.timeEnd("render")
    return new Float64Array(runCarList);
  }
}

const worker = new Worker();

onmessage = function (e) {
  const { key } = e.data;
  switch (key) {
    case 1: {
      //"loadTiles":
      // console.log("car:loadTiles", new Date().getTime() - data.postTime);
      worker.loadTiles(e.data).then(workerData => {
        const array = new Float64Array(workerData.length + 1);
        array.set([key], 0);
        array.set(workerData, 1);
        this.postMessage(array, [array.buffer]);
      })
      break;
    }
    case 2: {
      //"render":
      // console.log("car:render", new Date().getTime() - data.postTime);
      const workerData = worker.render(e.data);
      const array = new Float64Array(workerData.length + 1);
      array.set([key], 0);
      array.set(workerData, 1);
      this.postMessage(array, [array.buffer]);
      break;
    }
  }
};
