import { Layer, MAP_EVENT } from "@/mymap/index.js";
import * as THREE from "three";

// 地图图层类
export class WindLineLayer extends Layer {
  constructor(opt) {
    super(opt);
    this.data = opt.data;
  }

  setData(data) {
    this.data = data;
    this.update();
  }

  onAdd(map) {
    super.onAdd(map);
    this.update();
  }

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER) {
      const [x, y] = this.map.WebMercatorToCanvasXY(this.data.center[0], this.data.center[1]);
      for (const mesh of this.scene.children) {
        mesh.position.set(x, y, 0);
      }
      for (const mesh of this.pickLayerScene.children) {
        mesh.position.set(x, y, 0);
      }
      for (const mesh of this.pickMeshScene.children) {
        mesh.position.set(x, y, 0);
      }
    }
  }

  update() {
    this.clearScene();
    clearInterval(this._interval);
    if (!this.data) return;
    this.time = 0;
    this.lineList = [];
    const lineNum = 20;
    const lineLength = 100000 / 5;

    for (let i = 0; i < lineNum; i++) {
      const { array, maxValue } = this.data;
      const points = [];
      const colors = [];
      for (const [sx, sy, nx, ny, value] of array) {
        const len = (lineLength * (value + 0.5)) / lineNum;
        const colorArr = new THREE.Color(value, 0.5, 0.5).toArray();
        const no = new THREE.Vector2(nx, ny).normalize();
        const sp = new THREE.Vector2(sx, sy).add(no.setLength(len * i));
        const ep = new THREE.Vector2(sx, sy).add(no.setLength(len * (i + 2)));
        points.push(sp);
        points.push(ep);
        colors.push(colorArr);
        colors.push(colorArr);
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setFromPoints(points);
      geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors.flat(2), 3));
      const material = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: ((i * 2) / lineNum) % 1,
      });
      const line = new THREE.LineSegments(geometry, material);
      this.lineList.push(line);

      const [x, y] = this.map.WebMercatorToCanvasXY(this.data.center[0], this.data.center[1]);
      line.position.set(x, y, 0);
      this.scene.add(line);
    }

    this._interval = setInterval(() => {
      for (const i in this.lineList) {
        const material = this.lineList[i].material;
        let opacity = material.opacity - 1 / 60;
        if (opacity < 0) opacity = 1;
        this.lineList[i].material.setValues({ opacity: opacity });
        this.lineList[i].material.needUpdate = true;
      }
    }, 1000 / 60);
  }

  dispose() {
    super.dispose();
    clearInterval(this._interval);
  }
}
