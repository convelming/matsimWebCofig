import * as THREE from "three";

class Activity3DLayerWorker {
  timeObj = new Map();
  activityMap = new Map();
  timeSpeed = 60 * 1;
  center = [0, 0];

  getActivityByColor([pickColor]) {
    for (const v of this.activityMap.values()) {
      if (pickColor > 0 && pickColor == v.pickColor) {
        const array = new TextEncoder().encode(JSON.stringify(v));
        return array;
      }
    }
    return [];
  }

  setData(array) {
    const data = JSON.parse(new TextDecoder().decode(new Uint8Array(array)));

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
        ...JSON.parse(JSON.stringify(v1)),

        mtype: v1.actType || v1.type,
        coord: { ...v1.coord },
        point: [v1.coord.x - center[0], v1.coord.y - center[1]],

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
    return center;
  }

  render(array) {
    const [time, maxNum] = array;
    const timeKey = Math.ceil(time / this.timeSpeed);
    const _activityKeys = this.timeObj.get(timeKey) || [];
    const encode = new TextEncoder();
    
    let runNum = 0;
    const runList = [];
    for (const activityKey of _activityKeys) {
      const v1 = this.activityMap.get(activityKey);
      const { point, pickColor, mtype, startTime, endTime } = v1;
      if (time >= startTime && time <= endTime) {
        const typeArray = Array.from(encode.encode(mtype));
        const activityArray = [typeArray.length + 5, point[0], point[1], pickColor, startTime, endTime]
        activityArray.push(...typeArray);
        runList.push(activityArray);
        runNum += 1;
      };
      if (runNum >= maxNum) break;
    }
    runList.sort((a, b) => a[4] - b[4]);
    return [time, this.center[0], this.center[1], Math.min(maxNum, runNum), runList].flat(2);
  }
}


const worker = new Activity3DLayerWorker();

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
    case 3: {
      //"getActivityByColor":
      const workerData = worker.getActivityByColor(data);
      const array = new Float64Array(workerData.length + 1);
      array.set([key], 0);
      array.set(workerData, 1);
      this.postMessage(array, [array.buffer]);
      break;
    }
  }
};