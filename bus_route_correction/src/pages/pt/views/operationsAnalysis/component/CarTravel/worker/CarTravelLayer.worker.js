import { guid } from "@/utils/utils";
import axios from "axios";
import * as THREE from "three";

const EARTH_RADIUS = 20037508.3427892;

const TIME_SPEED = 60 * 5; // 秒

function calculatePosition(path, time) {
  const route_startTime = path[3];
  const route_endTime = path[path.length - 1];
  if (time <= route_startTime) {
    const startX = path[0];
    const startY = path[1];
    const startZ = path[2];
    const endX = path[4];
    const endY = path[5];
    const endZ = path[6];
    return { start: [startX, startY, startZ], end: [endX, endY, endZ], isRunning: false };
  } else if (time >= route_endTime) {
    const endX = path[path.length - 4];
    const endY = path[path.length - 3];
    const endZ = path[path.length - 2];
    return { start: [endX, endY, endZ], end: [endX, endY, endZ], isRunning: false };
  }
  // 使用二分法找到目标点

  // 最普通的从头到尾寻找目标点
  const length = path.length / 4;
  for (let i = 0; i < length - 1; i++) {
    const line_startTime = path[i * 4 + 3];
    const line_endTime = path[i * 4 + 7];
    if (line_startTime <= time && time < line_endTime) {
      const line_start = [path[i * 4 + 0], path[i * 4 + 1], path[i * 4 + 2]];
      const line_end = [path[i * 4 + 4], path[i * 4 + 5], path[i * 4 + 6]];
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
  let z = start[2] + (end[2] - start[2]) * percentage;
  return [x, y, z];
}

class Worker {
  loading = false;
  timeObj = new Map();
  carMap = new Map();

  tileMap = new Map();

  loadMap = new Map();
  run = true;

  constructor() {
    this.handleGetTile();
  }

  loadTiles(data) {
    const LIVE_NUM = 4;
    if (this.tileMap.size > 100) {
      // TODO 清除一些显示优先级低的tile
      for (const key of Array.from(this.tileMap.keys())) {
        if (this.tileMap.get(key).live <= 0) {
          this.tileMap.delete(key);
        }
      }
    }
    for (const tile of this.tileMap.values()) {
      tile.live--;
    }
    const { dataSource, row, col, zoom, size } = data;
    for (let i = row[0]; i <= row[1]; i++) {
      for (let j = col[0]; j <= col[1]; j++) {
        const key = `${i}_${j}`;
        if (!this.tileMap.has(key)) {
          const loadTile = { dataSource: dataSource, zoom: zoom, row: i, col: j, live: LIVE_NUM, loading: true };
          this.tileMap.set(key, loadTile);
          this.loadMap.set(key, loadTile);
        } else {
          this.tileMap.get(key).live = LIVE_NUM;
        }
      }
    }
    return new Float64Array();
  }

  async handleGetTile() {
    while (this.run) {
      if (this.loadMap.size > 1) {
        try {
          const key = this.loadMap.keys().next().value;
          const loadTile = this.loadMap.get(key);
          if (loadTile.live > 0) {
            const tile = await this.getTile(this.loadMap.get(key));
            this.tileMap.set(key, tile);
          }
          this.loadMap.delete(key);
          await new Promise((resolve) => setTimeout(resolve, 0));
        } catch (error) {
          console.error(error);
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
  }

  async getTile(params) {
    const { dataSource, zoom, row, col, live } = params;
    const response = await axios({
      url: process.env.VUE_APP_BASE_API + `/pt/tiles/car/${dataSource}/${zoom}/${row}/${col}`,
      headers: { uuid: guid(), dataSource: "" },
      method: "get",
      responseType: "arraybuffer",
    });
    const array = [];
    const dataView = new DataView(response.data);
    for (let i = 0; i < dataView.byteLength; i += 4) {
      const value = dataView.getFloat32(i, false);
      array.push(value);
    }

    const timeSpeed = TIME_SPEED;
    const timeObj = new Map();
    const carMap = new Map();

    const x1 = ((row + 0) * (EARTH_RADIUS * 2)) / Math.pow(2, zoom) - EARTH_RADIUS;
    const y1 = EARTH_RADIUS - ((col + 0) * (EARTH_RADIUS * 2)) / Math.pow(2, zoom);
    const x2 = ((row + 1) * (EARTH_RADIUS * 2)) / Math.pow(2, zoom) - EARTH_RADIUS;
    const y2 = EARTH_RADIUS - ((col + 1) * (EARTH_RADIUS * 2)) / Math.pow(2, zoom);
    

    for (let i = 0, dataLength = array[0]; i < array.length; i += dataLength + 1, dataLength = array[i]) {
      const id = array[i + 1];
      const type = array[i + 2];
      // path = [x, y, time, x, y, time, ...];
      const path = array.slice(i + 3, i + 1 + dataLength);
      const startTime = path[3];
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
      ...params,
      loading: false,
      minX: Math.min(x1, x2),
      maxX: Math.max(x1, x2),
      minY: Math.min(y1, y2),
      maxY: Math.max(y1, y2),
      timeObj: timeObj,
      carMap: carMap,
    };
  }

  render(data) {
    const { time, maxCarNum, selectCarIndex, maxX, minX, maxY, minY, center } = data;
    const [cx, cy] = center;
    const timeSpeed = TIME_SPEED;
    const timeKey = Math.ceil(time / timeSpeed);
    const runCarList = [];

    for (const { loading, timeObj, carMap } of this.tileMap.values()) {
      if (!loading && timeObj.has(timeKey)) {
        const carKeys = timeObj.get(timeKey);
        for (const key of carKeys) {
          if (carMap.has(key)) {
            const v1 = carMap.get(key);
            if (time >= v1.startTime && time <= v1.endTime) {
              const { path, id } = v1;
              const { start, end } = calculatePosition(path, time);
              const [x0, y0, z0] = start;
              if (minX <= x0 && x0 <= maxX && minY <= y0 && y0 <= maxY) {
                const [x1, y1, z1] = end;
                const position = new THREE.Vector3(x0 - cx, y0 - cy, z0);
                const target = new THREE.Vector3(x1 - cx, y1 - cy, z1); // 你的目标点
                const m4 = new THREE.Matrix4().lookAt(position, target, new THREE.Vector3(0, 0, 1));
                m4.multiply(new THREE.Matrix4().makeRotationY(Math.PI));
                const q = new THREE.Quaternion().setFromRotationMatrix(m4);
                runCarList.push(id, x0 - cx, y0 - cy, z0, q.x, q.y, q.z, q.w); // length = 8
              }
            }
          }
        }
      }
    }
    return new Float64Array(runCarList);
  }
}

const worker = new Worker();

onmessage = function (e) {
  const { key } = e.data;
  switch (key) {
    case 1: {
      const workerData = worker.loadTiles(e.data);
      const array = new Float64Array(workerData.length + 1);
      array.set([key], 0);
      array.set(workerData, 1);
      this.postMessage(array, [array.buffer]);
      break;
    }
    case 2: {
      const workerData = worker.render(e.data);
      const array = new Float64Array(workerData.length + 1);
      array.set([key], 0);
      array.set(workerData, 1);
      this.postMessage(array, [array.buffer]);
      break;
    }
  }
};
