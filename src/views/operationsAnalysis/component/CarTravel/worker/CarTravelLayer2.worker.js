import { guid } from "@/utils/utils";
import axios from "axios";
import * as THREE from "three";

const EARTH_RADIUS = 20037508.3427892;

const TIME_SPEED = 60 * 5; // 秒

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
    for (let i = row[0]; i < row[1]; i++) {
      for (let j = col[0]; j < col[1]; j++) {
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
          await new Promise(resolve => setTimeout(resolve, 0));
        } catch (error) {
          console.error(error)
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }

  async getTile(params) {
    const { dataSource, zoom, row, col, live } = params;
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

    const x1 = ((row + 0) * (EARTH_RADIUS * 2)) / Math.pow(2, zoom) - EARTH_RADIUS;
    const y1 = EARTH_RADIUS - ((col + 0) * (EARTH_RADIUS * 2)) / Math.pow(2, zoom);
    const x2 = ((row + 1) * (EARTH_RADIUS * 2)) / Math.pow(2, zoom) - EARTH_RADIUS;
    const y2 = EARTH_RADIUS - ((col + 1) * (EARTH_RADIUS * 2)) / Math.pow(2, zoom);

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
      ...params,
      loading: false,
      minX: Math.min(x1, x2),
      maxX: Math.max(x1, x2),
      minY: Math.min(y1, y2),
      maxY: Math.max(y1, y2),
      timeObj: timeObj,
      carMap: carMap
    };
  }
}

const worker = new Worker();

onmessage = function (e) {
  const { key } = e.data;
  switch (key) {
    case 1: {
      //"loadTiles":
      // console.log("car:loadTiles", new Date().getTime() - data.postTime);
      const workerData = worker.loadTiles(e.data)
      const array = new Float64Array(workerData.length + 1);
      array.set([key], 0);
      array.set(workerData, 1);
      this.postMessage(array, [array.buffer]);
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
