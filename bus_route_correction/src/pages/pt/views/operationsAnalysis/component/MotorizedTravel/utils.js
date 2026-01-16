import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

let ModelPoolInstance = null;

// 模型池
export class ModelPool {
  loader = false;

  static get instance() {
    if (!ModelPoolInstance) {
      ModelPoolInstance = new ModelPool();
    }
    return ModelPoolInstance;
  }

  modelPool = null;

  modelObj = null;

  modelsUrl = {
    // Monster_Truck: "/static/models/Monster_Truck.gltf",
    SUV: "/static/models/SUV.gltf",
    // Pickup: "/static/models/Pickup.gltf",
    // Hatchback: "/static/models/Hatchback.gltf",
    // Sedan: "/static/models/Sedan.gltf",
    // Muscle: "/static/models/Muscle.gltf",
    // Muscle_2: "/static/models/Muscle_2.gltf",
    // Van: "/static/models/Van.gltf",
    // Ambulance: "/static/models/Ambulance.gltf",
    Bus: "/static/models/Bus.gltf",
    // Firetruck: "/static/models/Firetruck.gltf",
    // Limousine: "/static/models/Limousine.gltf",
    // Police_Sedan: "/static/models/Police_Sedan.gltf",
    // Police_SUV: "/static/models/Police_SUV.gltf",
    // Police_Muscle: "/static/models/Police_Muscle.gltf",
    // Police_Sports: "/static/models/Police_Sports.gltf",
    // Roadster: "/static/models/Roadster.gltf",
    // Sports: "/static/models/Sports.gltf",
    // Taxi: "/static/models/Taxi.gltf",

    Subway: "/static/models/Subway.gltf",
    Ferry: "/static/models/Bus.gltf",
  };

  constructor() {
    const loader = new GLTFLoader();
    const pList = [];
    for (const [name, url] of Object.entries(this.modelsUrl)) {
      pList.push(
        new Promise((resolve, reject) => {
          loader.load(
            url,
            (gltf) => {
              resolve([name, gltf.scene]);
            },
            null,
            () => {
              resolve([name, null]);
            }
          );
        })
      );
    }
    Promise.all(pList).then((res) => {
      this.modelPool = new Map(res.map((v) => [v[0], new Array()]));
      this.modelObj = new Map(res);
      this.loader = true;
    });
  }

  // 获取模型
  take(name) {
    try {
      return this.modelPool.get(name).shift() || this.modelObj.get(name).clone();
    } catch (error) {
      return null;
    }
  }

  // 回收模型
  still(name, model) {
    try {
      const list = this.modelPool.get(name);
      list[list.length] = model;
      return 1;
    } catch (error) {
      return -1;
    }
  }
}


export class BusMotionPath {
  constructor(opt = []) {
    this._opt = JSON.parse(JSON.stringify(opt));
    const startPoint = new BusMotionPoint(opt[0]);
    const endPoint = new BusMotionPoint(opt[opt.length - 1]);

    let minX = Number.MAX_VALUE;
    let minY = Number.MAX_VALUE;

    let maxX = Number.MIN_VALUE;
    let maxY = Number.MIN_VALUE;

    let totalDistance = 0;
    const lineList = [];

    let start = null;
    let lIndex = 0;
    for (const point of opt) {
      const [x, y] = point;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;

      if (!start) {
        start = new BusMotionPoint(point);
      } else {
        const end = new BusMotionPoint(point);
        const distance = BusMotionPoint.distance(start, end);
        const line = {
          start: start,
          end: end,
          distance: distance,
          startDistance: totalDistance,
          endDistance: totalDistance + distance,
          index: lIndex++,
        };
        totalDistance = line.endDistance;
        lineList[lineList.length] = line;
        start = end;
      }
    }

    this.originPoint = new BusMotionPoint([minX, minY]);
    this.resultPoint = new BusMotionPoint([maxX, maxY]);

    this.startPoint = startPoint;
    this.endPoint = endPoint;
    this.totalDistance = totalDistance;
    this.lineList = lineList;
  }

  // 根据距离获取点坐标
  getPointByDistance(distance) {
    if (distance <= 0) {
      const line = this.lineList[0];
      return { start: line.start, end: line.end, isRunning: false };
    } else if (distance >= this.totalDistance) {
      const line = this.lineList[this.lineList.length - 1];
      return { start: line.end, end: line.end, isRunning: false };
    }
    // 使用二分法找到目标点
    let min = 0,
      max = this.lineList.length - 1;
    while (min <= max) {
      const num = Math.floor((max + min) / 2);
      const line = this.lineList[num];
      if (line.startDistance <= distance && distance < line.endDistance) {
        min = num;
        break;
      } else if (line.startDistance > distance) {
        max = num - 1;
      } else if (line.endDistance < distance) {
        min = num + 1;
      }
    }
    const line = this.lineList[min];
    const percentage = (distance - line.startDistance) / line.distance;
    return {
      start: line.start.move(line.end, percentage),
      end: line.end,
      isRunning: true,
    };
  }

  toJSON() {
    return JSON.parse(JSON.stringify(this._opt));
  }
}

export class BusMotionPoint {
  x = 0;
  y = 0;
  constructor(arr = [0, 0]) {
    this.x = arr[0];
    this.y = arr[1];
  }

  // 向目标点移动
  move(point, percentage, newObject = true) {
    let x = this.x + (point.x - this.x) * percentage;
    let y = this.y + (point.y - this.y) * percentage;
    if (newObject) {
      return new this.constructor([x, y]);
    } else {
      this.x = x;
      this.y = y;
      return this;
    }
  }

  scale(scale, newObject = true) {
    if (newObject) {
      return new this.constructor([this.x * scale, this.y * scale]);
    } else {
      this.x *= scale;
      this.y *= scale;
      return this;
    }
  }

  offset(point, newObject = true) {
    if (newObject) {
      return new this.constructor([this.x - point.x, this.y - point.y]);
    } else {
      this.x -= point.x;
      this.y -= point.y;
      return this;
    }
  }

  unOffset(point, newObject = true) {
    if (newObject) {
      return new this.constructor([this.x + point.x, this.y + point.y]);
    } else {
      this.x += point.x;
      this.y += point.y;
      return this;
    }
  }

  length() {
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
  }

  static distance(start, end) {
    return end.offset(start).length();
  }

  clone() {
    return new this.constructor([this.x, this.y]);
  }

  toJSON() {
    return [this.x, this.y];
  }
}

export class CarMotionPath {
  constructor(opt = []) {
    this._opt = JSON.parse(JSON.stringify(opt));
    const startPoint = new CarMotionPoint(opt[0].startPoint);
    const endPoint = new CarMotionPoint(opt[opt.length - 1].endPoint);
    const startTime = opt[0].startTime;
    const endTime = opt[opt.length - 1].endTime;

    let minX = Number.MAX_VALUE;
    let minY = Number.MAX_VALUE;

    let maxX = Number.MIN_VALUE;
    let maxY = Number.MIN_VALUE;

    let totalDistance = 0;
    let lIndex = 0;
    const lineList = [];

    for (const v of opt) {
      const line = {
        speed: v.speed,
        linkId: v.linkId,

        time: v.endTime - v.startTime,
        startTime: v.startTime,
        endTime: v.endTime,

        distance: v.distance,
        startDistance: totalDistance,
        endDistance: totalDistance + v.distance,
        start: new CarMotionPoint(v.startPoint),
        end: new CarMotionPoint(v.endPoint),

        index: lIndex++,
      };
      totalDistance = line.endDistance;
      lineList[lineList.length] = line;

      minX = Math.min(minX, v.startPoint[0], v.endPoint[0]);
      maxX = Math.max(maxX, v.startPoint[0], v.endPoint[0]);
      minY = Math.min(minY, v.startPoint[1], v.endPoint[1]);
      maxY = Math.max(maxY, v.startPoint[1], v.endPoint[1]);
    }

    this.originPoint = new CarMotionPoint([minX, minY]);
    this.resultPoint = new CarMotionPoint([maxX, maxY]);

    this.startPoint = startPoint;
    this.endPoint = endPoint;
    this.startTime = startTime;
    this.endTime = endTime;
    this.totalDistance = totalDistance;
    this.lineList = lineList;
  }

  // 根据距离获取点坐标
  getPointByTime(time) {
    if (time <= this.startTime) {
      const line = this.lineList[0];
      return { start: line.start, end: line.end, isRunning: false };
    } else if (time >= this.endTime) {
      const line = this.lineList[this.lineList.length - 1];
      return { start: line.end, end: line.end, isRunning: false };
    }
    // 使用二分法找到目标点
    let min = 0,
      max = this.lineList.length - 1;
    while (min <= max) {
      const num = Math.floor((max + min) / 2);
      const line = this.lineList[num];
      if (line.startTime <= time && time < line.endTime) {
        min = num;
        break;
      } else if (line.startTime > time) {
        max = num - 1;
      } else if (line.endTime <= time) {
        min = num + 1;
      }
    }
    const line = this.lineList[min];
    const percentage = (time - line.startTime) / line.time;
    return {
      start: line.start.move(line.end, percentage),
      end: line.end,
      isRunning: true,
    };
  }

  toJSON() {
    return JSON.parse(JSON.stringify(this._opt));
  }
}

export class CarMotionPoint extends BusMotionPoint { }


export class SubwayMotionPath extends BusMotionPath { }

export class SubwayMotionPoint extends BusMotionPoint { }

export function guid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
