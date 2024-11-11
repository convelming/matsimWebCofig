import { Layer, MAP_EVENT } from "@/mymap";

import { ColorBar2D } from "@/mymap/utils/ColorBar2D.js";
import * as THREE from "three";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";

import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { Text2DGeometry } from '@/mymap/geometry/Text2DGeometry.js';

import { GeoJSONLineListGeometry, GeoJSONLineMaterial } from "../../GeoJSON/layer/GeoJSONLayer.js"


let font = null;
function getFont() {
  if (font) return Promise.resolve(font);
  return new Promise((resolve, reject) => {
    new FontLoader().load(process.env.VUE_APP_PUBLIC_PATH + "MiSans VF_Regular.json", resolve, undefined, reject);
  });
}

export class DesireLineLayer extends Layer {
  name = "DesireLineLayer";
  time = 0;
  data = [];
  showIds = [];
  groupList = [];


  constructor(opt) {
    super(opt);
    this.color = opt.color || 0x000000
  }


  onAdd(map) {
    super.onAdd(map);
    this.updatePosition();
    this.updateValue();
  }

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER) {
      this.updatePosition();
    }
  }

  setColor(color) {
    this.color = color;
    this.updateValue();
  }

  setTime(time) {
    this.time = time;
  }

  setData(data, valueKey) {
    this.data = data;
    this.valueKey = valueKey;
    this.initMesh();
  }

  setShowIds(showIds) {
    this.showIds = showIds.map(v => String(v));
    this.updateValue();
  }

  initMesh() {
    this.clearScene();
    if (!this.data) return;
    const groupList = [];
    for (let i = 0, l = this.data.length; i < l; i++) {
      const group = new THREE.Group();

      const { from, to, fromId, toId, num } = this.data[i];
      const fv2 = new THREE.Vector3(0, 0, 0);
      const tv2 = new THREE.Vector3(to[0] - from[0], to[1] - from[1], 0);
      const cv2 = tv2.clone().multiplyScalar(0.5).add(new THREE.Vector3(tv2.y, -tv2.x, 0).multiplyScalar(0.1))

      const curve = new THREE.QuadraticBezierCurve3(fv2, cv2, tv2);
      const points = curve.getPoints(9);
      const array = points.map((p) => [p.x, p.y, 0]).flat();
      array.unshift(i);
      console.log(fv2, tv2, cv2);

      const lineGeometry = new GeoJSONLineListGeometry([array]);
      const lineMaterial = new GeoJSONLineMaterial({ color: 0xff0000 });

      const line = new THREE.Mesh(lineGeometry, lineMaterial);
      group.add(line);

      const arrowGeometry = new THREE.BufferGeometry();
      arrowGeometry.setAttribute('position', new THREE.Float32BufferAttribute([1, 0, 0, 0, 1, 0, -1, 0, 0], 3))
      arrowGeometry.setIndex([0, 1, 2]);

      const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);

      const arrowP1 = points[points.length - 1];
      const arrowP2 = points[points.length - 2];
      const arrowP3 = arrowP1.clone().sub(arrowP2);
      const arrowP4 = new THREE.Vector3(arrowP3.y, -arrowP3.x, 0);
      const m4 = new THREE.Matrix4().lookAt(arrowP2, arrowP1, new THREE.Vector3(0, 0, 1));
      m4.multiply(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
      const q = new THREE.Quaternion().setFromRotationMatrix(m4);

      arrow.quaternion.set(q.x, q.y, q.z, q.w);
      arrow.position.set(arrowP1.x, arrowP1.y, 0);
      arrow.userData = { p1: arrowP1, p2: arrowP2, p3: arrowP3, p4: arrowP4 }
      group.add(arrow);

      group.userData = { center: from, fromId: String(fromId), toId: String(toId), values: num, line: line, arrow: arrow, show: false };

      groupList.push(group);
    }

    this.groupList = groupList;


    this.updatePosition();
    this.updateValue();
  }

  updatePosition() {
    if (!this.map) return;
    for (const group of this.groupList) {
      const { center } = group.userData;
      const [x, y] = this.map.WebMercatorToCanvasXY(center[0], center[1]);
      group.position.set(x, y, group.position.z);
    }
  }


  updateValue() {
    let min = Infinity, max = -Infinity;
    for (const group of this.groupList) {
      const { values, fromId, toId } = group.userData;
      if (this.showIds.includes(fromId) && this.showIds.includes(toId)) {
        const value = values[this.time] || 0;
        min = Math.min(min, value);
        max = Math.max(max, value);
        group.userData.show = true;
        if (group.parent !== this.scene) this.scene.add(group);
      } else {
        group.userData.show = false;
        this.scene.remove(group);
      }
    }


    for (const group of this.groupList) {
      const { values, show, line, arrow } = group.userData;
      if (show) {
        const value = values[this.time] || 0;
        const lineWidth = value / (max - min) * 100 + 10;
        const lineOffset = lineWidth / 2 + 2;

        arrow.scale.set(lineWidth, lineWidth, 1)
        if (line) {
          line.material.uniforms.diffuse.value = new THREE.Color(this.color);
          line.material.uniforms.lineWidth.value = lineWidth;
          line.material.uniforms.lineOffset.value = lineOffset;
          line.material.needsUpdate = true;
        }
        if (arrow) {
          arrow.material.setValues({ color: new THREE.Color(this.color) });
          const { p1, p2, p3, p4 } = arrow.userData;
          arrow.position.copy(p1).add(p4.setLength(lineOffset));
        }
      }
    }

  }
}