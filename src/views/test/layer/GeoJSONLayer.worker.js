import * as THREE from "three";

class GeoJSONWorker {
  parse(array) {
    
  }
}

const worker = new GeoJSONWorker();

onmessage = function (e) {
  if (e.data instanceof Float64Array) {
    const [key, postTime] = e.data;
    const data = e.data.slice(2);
    switch (key) {
      case 1: {
        //"parse":
        // console.log("bus:setData", new Date().getTime() - postTime);
        const workerData = worker.parse(data);
        const array = new Float64Array(workerData.length + 3);
        array.set([key, new Date().getTime(), postTime], 0);
        array.set(workerData, 3);
        this.postMessage(array, [array.buffer]);
        break;
      }
    }
  }
};