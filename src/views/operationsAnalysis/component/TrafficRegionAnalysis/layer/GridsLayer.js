import { Layer, MAP_EVENT } from "@/mymap";

import { ColorBar2D } from "@/mymap/utils/ColorBar2D.js";
import * as THREE from "three";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";

import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { Text2DGeometry } from '@/mymap/geometry/Text2DGeometry.js';

let font = null;
function getFont() {
  if (font) return Promise.resolve(font);
  return new Promise((resolve, reject) => {
    new FontLoader().load(process.env.VUE_APP_PUBLIC_PATH + "MiSans VF_Regular.json", resolve, undefined, reject);
  });
}

export class GridsLayer extends Layer {
  name = "GridsLayer";
  time = 0;

  constructor(opt) {
    super(opt);
    this.colorBar = opt.colorBar || [];
    this.step = opt.step || 100;
    this.size = opt.size || 1;

    this.geometry = new THREE.PlaneGeometry();
    this.material = new THREE.MeshBasicMaterial({});
    this.textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
  }

  onAdd(map) {
    super.onAdd(map);
    this.update();
  }

  async setData(data) {
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

  async update() {
    this.clearScene()
    if (!this.data) return;
    if (!this.map) return;

    const font = await getFont();
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
    const position = [0, 0, 0, wh, 0, 0, 0, -wh, 0, wh, -wh, 0];
    this.geometry.setAttribute("position", new THREE.Float32BufferAttribute(position, 3))

    console.log(THREE);
    
    const mesh = new THREE.InstancedMesh(this.geometry, this.material, gridList.length);
    const textMesh = new THREE.BatchedMesh(gridList.length, 5000, 10000, this.textMaterial);

    const time = Math.floor(this.time / 3600)

    for (let i = 0, l = gridList.length; i < l; i++) {
      const { value, x, y } = gridList[i];
      const matrix = new THREE.Matrix4().makeTranslation(x, y, i / l);
      mesh.setMatrixAt(i, matrix);

      const color = new THREE.Color("red")
      mesh.setColorAt(i, color);

      const textGeometry = new Text2DGeometry(value[time], {
        font: this.font,
        curveSegments: 12,
      });

      const textId = textMesh.addGeometry(textGeometry)
      batchedMesh.setMatrixAt(textId, matrix);
    }


    let [x, y] = this.map.WebMercatorToCanvasXY(...center);
    mesh.position.set(x, y, 0);
    mesh.userData.center = center;
    this.scene.add(mesh);

    textMesh.position.set(x, y, 0);
    textMesh.userData.center = center;
    this.scene.add(textMesh);

  }

}
