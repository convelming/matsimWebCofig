import * as THREE from "three";

class Activity3DMotionWorker {
  timeObj = new Map();
  array = new Float64Array();
  timeSpeed = 60 * 1;
  center = [0, 0];

  getActivityByColor({ pickColor }) {
    for (const v of this.activityMap.values()) {
      if (pickColor > 0 && pickColor == v.pickColor) {
        return v;
      }
    }
    return null;
  }
  setData(array) {
    this.timeObj.forEach((v) => (v.length = 0));
    this.timeObj.clear();

    const timeSpeed = this.timeSpeed;
    const timeObj = this.timeObj;
    const center = [array[0], array[1]];

    for (let i = 2; i < array.length; i += 6) {
      const startTime = array[i + 4];
      const endTime = array[i + 5];
      for (let j = startTime; j < endTime + timeSpeed; j += timeSpeed) {
        const key = Math.ceil(j / timeSpeed);
        if (!timeObj.has(key)) timeObj.set(key, new Array());
        const arr = timeObj.get(key);
        arr[arr.length] = i;
      }
    }

    this.array = array;

    // let pickColorNum = 1;
    // for (const v1 of data) {
    //   if (!center) {
    //     center = [v1.coord.x, v1.coord.y];
    //   }
    //   const activityId = Symbol(v1.personId);
    //   const activity = {
    //     actType: v1.actType,
    //     coord: { ...v1.coord },
    //     point: [v1.coord.x - center[0], v1.coord.y - center[1]],
    //     endTime: v1.endTime,
    //     startTime: v1.startTime,
    //     personId: v1.personId,

    //     // 活动id
    //     // activityId: Symbol(v1.personId),
    //     // 拾取颜色
    //     pickColor: pickColorNum++,
    //   }

    //   const { startTime, endTime } = activity;
    //   for (let index = startTime; index < endTime + timeSpeed; index += timeSpeed) {
    //     const key = Math.ceil(index / timeSpeed);
    //     if (!timeObj.has(key)) timeObj.set(key, new Array());
    //     const arr = timeObj.get(key);
    //     arr[arr.length] = activityId;
    //   }
    //   activityMap.set(activityId, activity);
    // }
    // this.center = center;
    // return {
    //   center: this.center
    // }
  }

  render({ time, maxNum }) {
    const timeKey = Math.ceil(time / this.timeSpeed);
    const _activityKeys = this.timeObj.get(timeKey) || [];

    const runActivityList = [];
    for (const activityKey of _activityKeys) {
      const v1 = this.activityMap.get(activityKey);
      const { startTime, endTime } = v1;
      if (time >= startTime && time <= endTime) runActivityList.push(JSON.parse(JSON.stringify(v1)));
      if (runActivityList.length >= maxNum) break;
    }
    return {
      time: time,
      list: runActivityList.sort((a, b) => a.startTime - b.startTime),
      center: this.center,
      maxNum: maxNum,
    };
  }
}


const worker = new Activity3DMotionWorker();

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
        console.log("bus:render", new Date().getTime() - postTime, data);
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
