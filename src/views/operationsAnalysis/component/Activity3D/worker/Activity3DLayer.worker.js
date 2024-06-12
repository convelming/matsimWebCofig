import * as THREE from "three";

class Activity3DMotionWorker {
  timeObj = new Map();
  activityMap = new Map();
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

  setData(data) {
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
        coord: {
          x: v1.coord.x - center[0],
          y: v1.coord.y - center[1],
        },
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
    return {
      center: this.center
    }
  }

  render({ time, maxNum }) {
    const timeKey = Math.ceil(time / this.timeSpeed);
    const _activityKeys = this.timeObj.get(timeKey) || [];

    const runActivityList = [];
    for (const activityKey of _activityKeys) {
      const v1 = this.activityMap.get(activityKey);
      const { startTime, endTime } = v1;
      if (time >= startTime && time <= endTime) runActivityList.push(v1);
      if (runActivityList.length >= maxNum) break;
    }
    return {
      time: time,
      list: runActivityList,
      center: this.center,
      maxNum: maxNum,
    };
  }
}


const worker = new Activity3DMotionWorker();

onmessage = function (e) {
  const { key, data } = e.data;
  switch (key) {
    case "setData":
      this.postMessage({ key: key, data: worker.setData(data) });
      break;
    case "render":
      this.postMessage({ key: key, data: worker.render(data) });
      break;
    case "getActivityByColor":
      this.postMessage({ key: key, data: worker.getActivityByColor(data) });
      break;
  }
};
