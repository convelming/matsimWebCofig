import GeoJSONDataWorker from "./worker.worker.js?worker";

import { EventListener } from "@/mymap/main/EventListener";
export class GeoJSONData extends EventListener {
  isReady = false;
  center = null;
  static guid() {
    return "xxxxxxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0,
        v = c == "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
  constructor(jsonStr) {
    super({});
    this.promiseMap = {};
    this.worker = new GeoJSONDataWorker();
    this.worker.onmessage = (event) => {
      const { workerId, workerCode, workerData } = event.data;
      const promise = this.promiseMap[workerId];
      if (workerCode == 200) {
        promise.resolve(event.data);
      } else {
        console.error(event);
        promise.reject(event.data);
      }
      delete this.promiseMap[workerId];
    };
    this.worker.onerror = (event) => {
      console.error(event);
    };

    const encode = new TextEncoder();
    const jsonArray = encode.encode(jsonStr);
    this.#postMessageAsync(
      {
        type: "init",
        data: jsonArray,
      },
      [jsonArray.buffer],
    )
      .then((event) => {
        this.isReady = true;
        this.center = event.workerData.center;
        this.handleEventListener("ready");
      })
      .catch((event) => {
        this.isReady = false;
        this.center = null;
      });
  }

  #postMessageAsync(message, transfer) {
    return new Promise((resolve, reject) => {
      const id = GeoJSONData.guid();
      this.promiseMap[id] = {
        resolve,
        reject,
      };
      this.worker.postMessage(
        {
          workerData: message,
          workerId: id,
        },
        transfer,
      );
    });
  }
  ready(func) {
    if (this.isReady) {
      func();
    } else {
      this.addEventListener("ready", func);
    }
  }

  async getAllGeom() {
    const res = await this.#postMessageAsync({
      type: "getAllGeom",
    });
    const { pointArray, lineArray, polygonArray } = res.workerData;
    const decode = new TextDecoder();
    const pointList = JSON.parse(decode.decode(pointArray));
    const lineList = JSON.parse(decode.decode(lineArray));
    const polygonList = JSON.parse(decode.decode(polygonArray));
    return { pointList, lineList, polygonList };
  }
  async getAllPoint() {
    const res = await this.#postMessageAsync({
      type: "getAllPoint",
    });
    const { pointArray } = res.workerData;
    const decode = new TextDecoder();
    const pointList = JSON.parse(decode.decode(pointArray));
    return pointList;
  }
  async getAllLine() {
    const res = await this.#postMessageAsync({
      type: "getAllLine",
    });
    const { lineArray } = res.workerData;
    const decode = new TextDecoder();
    const lineList = JSON.parse(decode.decode(lineArray));
    return lineList;
  }
  async getAllPolygon() {
    const res = await this.#postMessageAsync({
      type: "getAllPolygon",
    });
    const { polygonArray } = res.workerData;
    const decode = new TextDecoder();
    const polygonList = JSON.parse(decode.decode(polygonArray));
    return polygonList;
  }
  async getGeomById() {
    const res = await this.#postMessageAsync({
      type: "getGeomById",
    });
    const { geomArray } = res.workerData;
    const decode = new TextDecoder();
    const geom = JSON.parse(decode.decode(geomArray));
    return geom;
  }
  async getAllProperties() {
    const res = await this.#postMessageAsync({
      type: "getAllProperties",
    });
    const { propertiesListArray } = res.workerData;
    const decode = new TextDecoder();
    const propertiesList = JSON.parse(decode.decode(propertiesListArray));
    return propertiesList;
  }
  async getPropertiesById() {
    const res = await this.#postMessageAsync({
      type: "getPropertiesById",
    });
    const { properties } = res.workerData;
    return properties;
  }
  async propertiesMap(data) {
    const res = await this.#postMessageAsync({
      type: "propertiesMap",
      data: data,
    });
    const decode = new TextDecoder();
    const list = JSON.parse(decode.decode(res.workerData));
    return list;
  }
}
