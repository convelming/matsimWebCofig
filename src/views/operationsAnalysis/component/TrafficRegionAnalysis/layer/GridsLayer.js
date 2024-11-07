import { Layer, MAP_EVENT } from "@/mymap";

import { ColorBar2D } from "@/mymap/utils/ColorBar2D.js";
import * as THREE from "three";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";

export class GridsLayer extends Layer {
  name = "GridsLayer";

  constructor(opt) {
    super(opt);
    this.colorBar = opt.colorBar || [];
    this.step = opt.step || 100;
    this.size = opt.size || 1;

    this.geometry = new THREE.PlaneGeometry();
    this.material = new THREE.MeshBasicMaterial({});
  }

  onAdd(map) {
    super.onAdd(map);
    this.update();
  }

  setData(data) {
    this.data = data;
    this.update();
  }

  setStep(setp) {
    this.step = setp;
    this.update();
  }

  setSize(size) {
    this.size = parseInt(size);
    this.update();
  }

  setTime(time) {
    this.time = time;
    this.update();
  }

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER) {
      for (const mesh of this.scene.children) {
        const [x, y] = this.map.WebMercatorToCanvasXY(...mesh.userData.center);
        mesh.position.set(x, y, mesh.position.z);
      }
    }
  }

  update() {
    this.clearScene()
    if (!this.data) return;
    if (!this.map) return;
    let center = null;
    const gridObj = {};
    const wh = this.step * this.size;
    for (const v1 of this.data) {
      const row = Math.floor(v1.x / wh);
      const col = Math.floor(v1.y / wh);
      const key = `${row}_${col}`;
      if (!center) center = [row * wh, col * wh];
      if (!gridObj[key]) {
        gridObj[key] = {
          x: row * wh - center[0],
          y: col * wh - center[1],
          value: [...v1.num]
        };
      } else {
        for (let i2 = 0, l2 = Math.max(gridObj[key].value.length, v1.num.length); i2 < l2; i2++) {
          gridObj[key].value[i2] = (gridObj[key].value[i2] || 0) + (v1.num[i2] || 0);
        }
      }
    }

    const gridList = Object.values(gridObj);
    console.log(this.geometry);
    const position = [0, 0, 0, wh, 0, 0, 0, -wh, 0, wh, -wh, 0];
    this.geometry.setAttribute("position", new THREE.Float32BufferAttribute(position, 3))
    const mesh = new THREE.InstancedMesh(this.geometry, this.material, gridList.length);
    for (let i = 0, l = gridList.length; i < l; i++) {
      const { value, x, y } = gridList[i];
      const matrix = new THREE.Matrix4().makeTranslation(x, y, i / l);
      mesh.setMatrixAt(i, matrix);
      mesh.setColorAt(i, new THREE.Color("red"));
    }

    let [x, y] = this.map.WebMercatorToCanvasXY(...center);
    mesh.position.set(x, y, 0);
    mesh.userData.center = center;
    this.scene.add(mesh);

    this.mesh = mesh;

  }

}
