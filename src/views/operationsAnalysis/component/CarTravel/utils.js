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
    for (const line of this.lineList) {
      const { startTime, endTime } = line;
      if (startTime <= time && time < endTime) {
        const percentage = (time - startTime) / endTime;
        return {
          start: line.start.move(line.end, percentage),
          end: line.end,
          isRunning: true,
        };
      }
    }
  }

  toJSON() {
    return JSON.parse(JSON.stringify(this._opt));
  }
}

export class CarMotionPoint {

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
