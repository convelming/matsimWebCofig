import { Layer, MAP_EVENT } from "@/mymap";
import { ColorBar2D } from "@/mymap/utils/ColorBar2D.v2";

import * as THREE from "three";

import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { Text2DGeometry } from "@/mymap/geometry/Text2DGeometry.js";

let font = null;
function getFont() {
  if (font) return Promise.resolve(font);
  return new Promise((resolve, reject) => {
    new FontLoader().load(process.env.VUE_APP_PUBLIC_PATH + "static/fonts/MiSans VF_Regular.json", resolve, undefined, reject);
  });
}

export class AccessibilityLayer extends Layer {
  name = "AccessibilityLayer";
  time = 0;
  data = [];
  valueKey = "";
  groupList = [];

  constructor(opt) {
    super(opt);
    this.colorBar = opt.colorBar || [];
    this.opacity = opt.opacity || 1;
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

  setData(data) {
    try {
      this.clearScene();
      const list = ["5", "15", "30", "60", "120", ">120"].map((v, i) => [v, i, data[v]]);
      const groupList = [];
      let holes = [];
      for (let i = 0, l = list.length; i < l; i++) {
        const [id, key, points] = list[i];
        if (!points || !points.length) continue;

        const center = points[0];
        const group = new THREE.Group();
        group.position.set(0, 0, (l - i) / l);

        const shapeT = new THREE.Shape(points.map((v) => new THREE.Vector2(v[0] - center[0], v[1] - center[1])));
        shapeT.holes = holes.map((hole) => new THREE.Path(hole.map((v) => new THREE.Vector2(v[0] - center[0], v[1] - center[1]))));

        const polygonGeometry = new THREE.ShapeGeometry(shapeT);
        const polygonMesh = new THREE.Mesh(polygonGeometry, new THREE.MeshBasicMaterial({}));
        polygonMesh.position.set(0, 0, 0);

        group.add(polygonMesh);
        group.userData = {
          id: id,
          key: key,
          center: center,
          polygonMesh: polygonMesh,
        };

        groupList[groupList.length] = group;

        holes = [points];
      }
      this.groupList = groupList;
    } catch (error) {
      this.groupList = [];
      console.log(error);
    }
    this.updatePosition();
    this.updateValue();
  }

  setColorBar(colorBar) {
    this.colorBar = colorBar || [];
    this.updateValue();
  }

  setOpacity(opacity) {
    this.opacity = opacity;
    this.updateValue();
  }

  clearScene() {
    super.clearScene();
    if (this.scene) {
      this.scene.traverse((child) => {
        if (child.isMesh) {
          try {
            child.geometry.dispose();
          } catch (error) {}
        }
      });
    }
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
    let prevBar = null;
    for (let i = this.groupList.length - 1; i >= 0; i--) {
      const group = this.groupList[i];
      const { polygonMesh, key } = group.userData;
      const bar = this.colorBar.find((v) => v.min == key);
      if (bar && bar.use) {
        this.scene.add(group);
        polygonMesh.material.setValues({ color: bar.color, transparent: this.opacity < 1, opacity: this.opacity });
        polygonMesh.material.needsUpdate = true;
        prevBar = bar;
      } else if (prevBar) {
        this.scene.add(group);
        polygonMesh.material.setValues({ color: prevBar.color, transparent: this.opacity < 1, opacity: this.opacity });
        polygonMesh.material.needsUpdate = true;
      } else {
        this.scene.remove(group);
      }
    }
  }
}
