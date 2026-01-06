import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";
import { CarTravelRouteListGeometry, CarTravelRouteGeometry, CarTraveRoutelMaterial } from "../utils";

import { getFloat32Buffer } from "@/api/arraybuffer";

const BUILD_ZOOM = 13;
const EARTH_RADIUS = 20037508.3427892;

export class CarTravelLayer4 extends Layer {
  time = 66919; //3600 * 8;
  timeSpeed = 60 * 1;

  inited = false;

  dataSource = "";
  trailLength = 100;
  lineWidth = 50;
  color = "#ff0000";

  center = [12628397, 2655338.7];

  constructor(opt) {
    super(opt);
    this.dataSource = opt.dataSource || this.dataSource;
    this.trailLength = opt.trailLength || this.trailLength;
    this.lineWidth = opt.lineWidth || this.lineWidth;
    this.color = opt.color || this.color;
    this.material = new CarTraveRoutelMaterial({ trailLength: this.trailLength, lineWidth: this.lineWidth, color: this.color });
  }

  setTime(time) {
    this.time = time;
    this.material.uniforms.trailTime.value = this.time;
    this.material.needsUpdate = true;
  }

  setTrailLength(trailLength) {
    this.trailLength = trailLength;
    this.material.uniforms.trailLength.value = this.trailLength;
    this.material.needsUpdate = true;
  }
  setLineWidth(lineWidth) {
    this.lineWidth = lineWidth;
    this.material.uniforms.lineWidth.value = this.lineWidth;
    this.material.needsUpdate = true;
  }
  setColor(color) {
    this.color = color;
    this.material.uniforms.color.value = new THREE.Color(this.color);
    this.material.needsUpdate = true;
  }

  // 地图加载完成回调
  async onAdd(map) {
    super.onAdd(map);
    for (const mesh of this.scene.children) {
      const [x, y] = this.map.WebMercatorToCanvasXY(...mesh.userData.center);
      mesh.position.set(x, y, 0);
    }
    this.autoSize();
  }

  autoSize() {
    const lineWidth = this.map.cameraHeight / 400;
    const trailLength = 100;
    this.setTrailLength(trailLength);
    this.setLineWidth(lineWidth);
  }

  async init() {
    try {
      if (this.inited) return;
      this.inited = true;
      this.clearScene();
      const [array1, array2] = await Promise.all([getFloat32Buffer(`/data/congestion`), getFloat32Buffer(`/data/way`)]);
      const map1 = new Map();
      let maxLength = 0;
      let maxFlow = 0;
      // for (let i = 0, dataLength = array1[0]; i < array1.length; i += dataLength + 1, dataLength = array1[i]) {
      //   const data = array1.slice(i + 1, i + 1 + dataLength).map((v, i) => {
      //     switch (i % 3) {
      //       case 0:
      //         return v - cx;
      //       case 1:
      //         return v - cy;
      //       default:
      //         return v;
      //     }
      //   });
      //   const key = `${data[0]}_${data[1]}`;
      //   const flowList = data.slice(2);
      //   const mf = Math.max(...flowList);
      //   if (mf > maxFlow) maxFlow = mf;
      //   if (data.length > maxLength) maxLength = data.length;
      //   map1.set(key, flowList);
      // }
    } catch (error) {
      console.log(error);
    }
  }

  // 地图事件回调
  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER) {
      for (const mesh of this.scene.children) {
        const [x, y] = this.map.WebMercatorToCanvasXY(...mesh.userData.center);
        mesh.position.set(x, y, 0);
      }
    }
    if (type == MAP_EVENT.UPDATE_CAMERA_HEIGHT) {
      this.autoSize();
    }
  }

  render() {
    super.render();
  }

  dispose() {
    super.dispose();
    this.worker.terminate();
  }
}
