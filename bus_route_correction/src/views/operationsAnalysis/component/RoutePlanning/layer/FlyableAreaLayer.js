import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";
import { EPSG4526ToMercator } from "@/mymap/utils/LngLatUtils.js";

import GeoJSONLayerWorker from "../../GeoJSON/worker/GeoJSONLayer.worker";
import { GeoJSONPolygonListGeometry, GeoJSONPolygonMaterial } from "../../GeoJSON/layer/GeoJSONLayer2.js";

import GeoJSON from "./AirSpacePolygon_100.js";

export class FlyableAreaLayer extends Layer {
  polygonMeshList = [];
  center = [0, 0];

  constructor(opt) {
    super(opt);
    this.minh = opt.minh;
    this.maxh = opt.maxh;
    this.color = opt.color;

    // ******************** 面 ******************** //
    this.polygonMaterial = new THREE.MeshBasicMaterial({
      color: this.color,
      opacity: 0.5,
      transparent: true,
      // shininess: 90,
      side: THREE.DoubleSide, 
      // blending: THREE.MultiplyBlending
      // wireframe: true,
    });
    this.polygonMeshList = [];

    this.init();
  }

  init() {
    const worker = new GeoJSONLayerWorker();
    worker.onmessage = (event) => {
      const { center, pointArray, lineArray, polygonArray, propertiesLabels, propertiesLabelsArray } = event.data;

      // 其他组件需要用到这个数据 不能删除
      // this.$set(this.GeoJSON, "propertiesLabels", propertiesLabels);
      // this.$set(this.GeoJSON, "center", center);

      const textDecoder = new TextDecoder();

      this.center = center;
      this.propertiesLabels = JSON.parse(textDecoder.decode(propertiesLabelsArray));
      this.polygonArray = polygonArray;

      this.clearPolygon();
      this.updatePolygon();

      worker.terminate();
    };
    worker.addEventListener("error", (error) => {
      console.log(error);
      this.data = null;
      worker.terminate();
    });

    const textEncoder = new TextEncoder();
    const array = textEncoder.encode(JSON.stringify(GeoJSON));
    worker.postMessage(array, [array.buffer]);
  }

  setCenter(center) {
    this.center = center;
    if (this.map) this.on(MAP_EVENT.UPDATE_CENTER, {});
  }

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER) {
      const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
      for (const mesh of this.scene.children) {
        mesh.position.set(x, y, mesh.position.z);
      }
    }
  }
  clearPolygon() {
    for (const mesh of this.polygonMeshList) {
      mesh.removeFromParent();
      mesh.geometry.dispose();
    }
    this.polygonMeshList = [];
  }

  async updatePolygon() {
    if (!this.polygonArray) return this.clearPolygon();
    for (let index = 0, l = this.polygonArray.length, num = 0, dataSize = this.polygonArray[0]; index < l; index += 1 + dataSize, dataSize = this.polygonArray[index]) {
      const polygon = this.polygonArray.slice(index + 1, index + 1 + dataSize);
      const { shape, value } = getShape(polygon);
      const z = this.propertiesLabels.z__Number.values[value];
      const h = this.propertiesLabels.h__Number.values[value];
      if (this.minh <= z + 1 && z + 1 <= this.maxh) {
        const geometry = new THREE.ExtrudeGeometry(shape, { depth: h });
        const mesh = new THREE.Mesh(geometry, this.polygonMaterial);
        mesh.position.setZ(z);
        this.polygonMeshList.push(mesh);
        this.scene.add(mesh);
        
      }
    }
    if (this.map) this.on(MAP_EVENT.UPDATE_CENTER);
  }

  onAdd(map) {
    super.onAdd(map);
    this.on(MAP_EVENT.UPDATE_CENTER);
  }
}

function getShape(array) {
  const value = array[0];
  const shapeArray = array.slice(1);
  let shape = null;
  for (let j = 0, l = shapeArray.length, size = shapeArray[0]; j < l; j += 1 + size, size = shapeArray[j]) {
    const v = shapeArray.slice(j + 1, j + 1 + size);
    const points = [];
    for (let k = 0, l3 = v.length / 2; k < l3; k++) {
      points[points.length] = new THREE.Vector2(v[k * 2 + 0], v[k * 2 + 1]);
    }
    if (!shape) {
      shape = new THREE.Shape(points);
    } else {
      const holePath = new THREE.Path(points);
      shape.holes.push(holePath);
    }
  }
  return { shape, value };
}
