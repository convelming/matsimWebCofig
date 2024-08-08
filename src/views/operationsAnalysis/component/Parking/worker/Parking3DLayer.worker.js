import * as THREE from "three";

class Parking3DLayerWorker {
  timeObj = new Map();
  activityMap = new Map();
  timeSpeed = 60 * 1;
  center = [0, 0];

  getParkingByColor({ pickColor }) {
    for (const v of this.activityMap.values()) {
      if (pickColor > 0 && pickColor == v.pickColor) {
        return v;
      }
    }
    return null;
  }

  setData(array) {
    const data = JSON.parse(new TextDecoder().decode(new Uint8Array(array)));
    console.log(data);

    this.activityMap.clear();
    this.timeObj.forEach((v) => (v.length = 0));
    this.timeObj.clear();

    const timeSpeed = this.timeSpeed;
    const timeObj = this.timeObj;
    const activityMap = this.activityMap;
    let center = null;
    let pickColorNum = 1;
    for (const v1 of data) {
      if (!center) {
        center = [v1.coord.x, v1.coord.y];
      }
      const activityId = Symbol(v1.personId);
      const activity = {
        actType: v1.actType,
        coord: { ...v1.coord },
        point: [v1.coord.x - center[0], v1.coord.y - center[1]],
        endTime: v1.endTime,
        startTime: v1.startTime,
        personId: v1.personId,

        // 活动id
        // activityId: Symbol(v1.personId),
        // 拾取颜色
        pickColor: pickColorNum++,
      }

      const { startTime, endTime } = activity;
      for (let index = startTime; index < endTime + timeSpeed; index += timeSpeed) {
        const key = Math.ceil(index / timeSpeed);
        if (!timeObj.has(key)) timeObj.set(key, new Array());
        const arr = timeObj.get(key);
        arr[arr.length] = activityId;
      }
      activityMap.set(activityId, activity);
    }
    this.center = center;
    return new Float64Array(center);
  }

  render(array) {
    console.log(array);

    const [time, maxNum] = array;
    const timeKey = Math.ceil(time / this.timeSpeed);
    const _activityKeys = this.timeObj.get(timeKey) || [];
    const encode = new TextEncoder();

    const list = [time, this.center[0], this.center[1], maxNum];
    let runnum = 0;
    for (const activityKey of _activityKeys) {
      const v1 = this.activityMap.get(activityKey);
      const { point, pickColor, actType, startTime, endTime } = v1;
      if (time >= startTime && time <= endTime) {
        const typeArray = Array.from(encode.encode(actType));
        const l = [typeArray.length + 5, point[0], point[1], pickColor, startTime, endTime]
        l.push(...typeArray);
        console.log(l);
        list.push(...l);
        runnum += 1;
      };
      if (runnum >= maxNum) break;
    }
    return new Float64Array(list);
  }
}


const worker = new Parking3DLayerWorker();

onmessage = function (e) {
  const [key] = e.data;
  const data = e.data.slice(1);
  switch (parseInt(key)) {
    case 1: {
      //"setData":
      const workerData = worker.setData(data);
      const array = new Float64Array(workerData.length + 1);
      array.set([key], 0);
      array.set(workerData, 1);
      this.postMessage(array, [array.buffer]);
      break;
    }
    case 2: {
      //"render":
      const workerData = worker.render(data);
      const array = new Float64Array(workerData.length + 1);
      array.set([key], 0);
      array.set(workerData, 1);
      this.postMessage(array, [array.buffer]);
      break;
    }
  }
};