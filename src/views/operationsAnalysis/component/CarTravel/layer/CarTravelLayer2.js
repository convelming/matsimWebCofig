import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";
import { CarTravelRouteListGeometry, CarTravelRouteGeometry, CarTraveRoutelMaterial } from "../utils"

import { getFloat32Buffer } from "@/api/arraybuffer"

const BUILD_ZOOM = 13;
const EARTH_RADIUS = 20037508.3427892;

export class CarTravelLayer2 extends Layer {

  time = 66919 //3600 * 8;
  timeSpeed = 60 * 1;

  inited = false;

  dataSource = "";
  trailLength = 100;
  lineWidth = 50;
  color = "#ff0000";

  center = [12628397, 2655338.7]

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
      for (let i = 0; i < 30; i++) {
        let mesh = await this.getMesh(i, this.material)
        const [x, y] = this.map.WebMercatorToCanvasXY(...mesh.userData.center);
        mesh.position.set(x, y, 0);
        this.scene.add(mesh);
        await new Promise(resolve => setTimeout(resolve, 10));
      }
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

  async getMesh(index, material) {
    const array = await getFloat32Buffer(`/pt/tiles/car/${this.dataSource}/${BUILD_ZOOM}/${index}`)
    console.time(`new Mesh ${index}`)
    const [cx, cy] = array.slice(3, 5);
    const pathList = [];
    for (let i = 0, dataLength = array[0]; i < array.length; i += dataLength + 1, dataLength = array[i]) {
      const id = array[i + 1];
      const type = array[i + 2];
      const path = array.slice(i + 3, i + 1 + dataLength).map((v, i) => [v - cx, v - cy, v][i % 3]);
      pathList[pathList.length] = path;
    }
    const geometry = new CarTravelRouteListGeometry(pathList);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData.center = [cx, cy];
    console.timeEnd(`new Mesh ${index}`)
    return mesh;
  }
}

