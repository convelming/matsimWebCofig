import { Layer, MAP_EVENT } from "@/mymap";

import { ColorBar2D } from "@/mymap/utils/ColorBar2D.v2.js";
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
    this.colorBar = new ColorBar2D(opt.colorBar || []);
    this.opacity = opt.opacity || 1;
    this.step = opt.step || 100;
    this.size = opt.size || 1;
    this.timeRange = opt.timeRange;

    this.geometry = new THREE.PlaneGeometry();
    this.material = new THREE.MeshBasicMaterial({ opacity: this.opacity, transparent: this.opacity < 1 });
    this.textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
  }

  onAdd(map) {
    super.onAdd(map);
    this.update();
  }

  setOpacity(opacity) {
    this.opacity = opacity;
    this.material.setValues({ opacity: this.opacity, transparent: this.opacity < 1 });
    this.material.needsUpdate = true;
  }

  setTimeRange(timeRange) {
    this.timeRange = timeRange;
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

  setColorBar(colorBar) {
    this.colorBar = new ColorBar2D(colorBar);
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

  clearScene() {
    super.clearScene();
    if (this.scene) {
      this.scene.traverse(child => {
        if (child.isInstancedMesh) {
          child.dispose();
        } else if (child.isMesh) {
          try {
            child.geometry.dispose();
          } catch (error) { }
        }
      });
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
      let value = v1.num[this.time] || 0;
      if (this.timeRange) {
        const s = Math.floor(this.timeRange[0] / 3600);
        const e = Math.ceil(this.timeRange[1] / 3600);
        value = v1.num.reduce((c, v, i) => s <= i && i <= e ? c + v : c, 0);
      }
      if (!center) center = [row * wh, col * wh];
      if (value <= 0) continue;
      if (!gridObj[key]) {
        gridObj[key] = {
          x: row * wh - center[0],
          y: col * wh - center[1],
          value: 0
        };
      }
      gridObj[key].value += value;
    }


    const group = new THREE.Group();

    const gridList = Object.values(gridObj);

    const min = Math.min(...gridList.map(v1 => v1.value));
    const max = Math.max(...gridList.map(v1 => v1.value));

    const position = [0, 0, 0, wh, 0, 0, 0, -wh, 0, wh, -wh, 0];
    this.geometry.setAttribute("position", new THREE.Float32BufferAttribute(position, 3))
    const mesh = new THREE.InstancedMesh(this.geometry, this.material, gridList.length);

    for (let i = 0, l = gridList.length; i < l; i++) {
      const { value, x, y } = gridList[i];
      const matrix = new THREE.Matrix4().makeTranslation(x, y, i / l);
      mesh.setMatrixAt(i, matrix);

      const color = new THREE.Color(this.colorBar.getColor((value - min) / (max - min) * 100))
      mesh.setColorAt(i, color);

      // const textGeometry = new Text2DGeometry(String(value), {
      //   font: font,
      //   curveSegments: 12,
      // });
      // textGeometry.computeBoundingBox();
      // let textSalce = 1, textX = 0, textY = 0;

      // const box = textGeometry.boundingBox;
      // if (box && box.min && box.min) {
      //   const tw = box.max.x - box.min.x;
      //   const th = box.max.y - box.min.y;
      //   const _w = Math.max(tw, th)
      //   textSalce = wh / _w * 0.7;
      //   textX = (wh - tw * textSalce) / 2;
      //   textY = (wh - th * textSalce) / 2 - wh;
      // }
      // const textMesh = new THREE.Mesh(textGeometry, this.textMaterial);
      // textMesh.position.set(x + textX, y + textY, i / l + 3);
      // textMesh.scale.set(textSalce, textSalce, 1)
      // group.add(textMesh)
    }

    let [x, y] = this.map.WebMercatorToCanvasXY(...center);
    mesh.position.set(x, y, 0);
    mesh.userData.center = center;
    this.scene.add(mesh);

    group.position.set(x, y, 0);
    group.userData.center = center;
    this.scene.add(group);
  }


}
