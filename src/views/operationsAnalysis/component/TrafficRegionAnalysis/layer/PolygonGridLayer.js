import { Layer, MAP_EVENT } from "@/mymap";

import { ColorBar2D } from "@/mymap/utils/ColorBar2D.js";
import * as THREE from "three";

import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { Text2DGeometry } from '@/mymap/geometry/Text2DGeometry.js';
import { } from "../../GeoJSON/layer/GeoJSONLayer";

let font = null;
function getFont() {
  if (font) return Promise.resolve(font);
  return new Promise((resolve, reject) => {
    new FontLoader().load(process.env.VUE_APP_PUBLIC_PATH + "MiSans VF_Regular.json", resolve, undefined, reject);
  });
}

export class PolygonGridLayer extends Layer {
  name = "PolygonGridLayer";
  time = 0;
  data = [];
  valueKey = "";
  groupList = [];
  showIds = [];

  constructor(opt) {
    super(opt);
    this.colorBar = opt.colorBar || [];
    this.textColor = opt.textColor || 0x000000

    this.textMaterial = new THREE.MeshBasicMaterial({ color: this.textColor });
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

  setData(data, valueKey) {
    this.data = data;
    this.valueKey = valueKey;
    this.initMesh();
  }

  setTime(time) {
    if (this.time !== time) {
      this.time = time;
      this.updateValue();
    }
  }

  setShowIds(showIds) {
    this.showIds = showIds.map(v => String(v));
    this.updateValue();
  }

  setColorBar(colorBar) {
    this.colorBar = colorBar;
    this.updateValue();
  }

  clearScene() {
    super.clearScene();
    if (this.scene) {
      this.scene.traverse(child => {
        if (child.isMesh) {
          try {
            child.geometry.dispose();
          } catch (error) { }
        }
      });
    }
  }

  initMesh() {
    this.clearScene();
    if (!this.data) return;
    const groupList = [];

    for (let i = 0, l = this.data.length; i < l; i++) {
      const { shape, holes, id } = this.data[i];
      const values = this.data[i][this.valueKey] || [];

      const center = shape[0];
      const group = new THREE.Group();
      group.position.set(0, 0, i / l);

      const shapeT = new THREE.Shape(shape.map(v => new THREE.Vector2(v[0] - center[0], v[1] - center[1])));
      shapeT.holes = holes.map(hole => hole.map(v => new THREE.Vector2(v[0] - center[0], v[1] - center[1])));
      const polygonGeometry = new THREE.ShapeGeometry(shapeT);
      const polygonMesh = new THREE.Mesh(polygonGeometry, new THREE.MeshBasicMaterial({}));
      polygonMesh.position.set(0, 0, 0);
      group.add(polygonMesh)

      polygonGeometry.computeBoundingSphere();
      const textCenter = polygonGeometry.boundingSphere.center;

      const textGeometry = new THREE.BufferGeometry();
      const textMesh = new THREE.Mesh(textGeometry, this.textMaterial);
      textMesh.position.set(textCenter.x, textCenter.y, 2);
      group.add(textMesh);

      group.userData = { center, id: String(id), polygonMesh, textMesh, values, show: false };
      this.scene.add(group);
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
      const [x, y] = this.map.WebMercatorToCanvasXY(...center);
      group.position.set(x, y, group.position.z);
    }
  }

  async updateValue() {
    const font = await getFont();

    let min = Infinity, max = -Infinity;
    for (const group of this.groupList) {
      const { values, id } = group.userData;
      if (this.showIds.includes(id)) {
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
      const { values, textMesh, polygonMesh, show } = group.userData;
      if (show) {

        const value = values[this.time] || 0;

        const color = new THREE.Color(ColorBar2D.getColor(value, min, max, this.colorBar));

        polygonMesh.material.setValues({
          color: color
        })
        polygonMesh.material.needsUpdate = true;

        const oldGeo = textMesh.geometry;
        const textGeometry = new Text2DGeometry(String(value), {
          font: font,
          curveSegments: 12
        })
        textMesh.geometry = textGeometry;

        textGeometry.computeBoundingBox();
        if (textGeometry.boundingBox && polygonMesh.geometry.boundingSphere) {
          const center = polygonMesh.geometry.boundingSphere.center.clone();
          const radius = polygonMesh.geometry.boundingSphere.radius;
          const box = textGeometry.boundingBox.max.clone().sub(textGeometry.boundingBox.min);
          const scale = radius / Math.min(box.x * 2, box.y * 2) * 0.3;
          textMesh.scale.set(scale, scale, 1);
          textMesh.position.set(center.x - box.x * scale, center.y - box.y * scale, 2);
        }

        oldGeo.dispose();

      }
    }
  }


}

