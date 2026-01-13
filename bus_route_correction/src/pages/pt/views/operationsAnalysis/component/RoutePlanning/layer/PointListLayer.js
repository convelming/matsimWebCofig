import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";

import SpriteText from "./SpriteText.js";

const textureLoader = new THREE.TextureLoader();

export class PointListLayer extends Layer {
  name = "PointListLayer";

  texture = textureLoader.load(require("@/assets/image/point.svg"));
  texture2 = textureLoader.load(require("@/assets/image/字母-V.svg"));
  texture3D = textureLoader.load(require("@/assets/image/mti-停机坪.svg"));

  constructor(opt) {
    super(opt);
    this.color = opt.color || new THREE.Color(0xff0000);
    this.size = opt.size || 1;
    this.geometry = new THREE.CylinderGeometry(100, 100, 25, 32); //new THREE.BoxGeometry(80, 80, 80); //new THREE.PlaneGeometry(100, 100);

    this.geometry = new THREE.BufferGeometry();
    this.material = new THREE.PointsMaterial({
      color: this.color,
      size: this.size * 10,
      sizeAttenuation: false,
      opacity: 1,
      transparent: true,

      depthWrite: false,
      depthTest: false,
      depthFunc: THREE.AlwaysDepth,

      map: this.texture,
    });

    this.mesh = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.mesh);

    this.labelGroup = new THREE.Group();
    this.labelGroup.renderOrder = Number.MAX_SAFE_INTEGER;
  }

  setSize(size) {
    this.size = size;
    this.material.setValues({ size: this.size * 10 });
    this.material.needsUpdate = true;

    this.labelList?.forEach((label) => {
      label.center.set(0.5, -0.4);
      label.fontScale = this.size;
    });
  }

  setColor(color) {
    this.color = color;
    this.material.setValues({ color: this.color });
    this.material.needsUpdate = true;
  }

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER && this.center) {
      const center = this.center;
      const [x, y] = this.map.WebMercatorToCanvasXY(center[0], center[1]);
      this.mesh.position.set(x, y, 0);
      this.labelGroup.position.set(x, y, 0);
    }
    if (type == MAP_EVENT.UPDATE_ZOOM) {
      if (this.map.zoom > 13) {
        this.scene.add(this.labelGroup);
      } else {
        this.scene.remove(this.labelGroup);
      }
    }

    if (type == MAP_EVENT.UPDATE_CAMERA_HEIGHT) {
      this.setPitch(this.map.pitch);
    }
  }

  setPitch(pitch) {
    this.pitch = pitch;
    if (this.pitch < 80) {
      this.material.setValues({ map: this.texture3D });
      this.material.needsUpdate = true;

      this.mesh.position.setZ(this.size * 0.5);
    } else {
      this.material.setValues({ map: this.map.zoom > 15 ? this.texture2 : this.texture });
      this.material.needsUpdate = true;

      this.mesh.position.setZ(0);
    }
  }

  setPointList(pointList) {
    this.pointList = pointList;
    this.center = null;
    this.update();
  }

  update() {
    if (this.labelList) {
      while (this.labelList.length) {
        const mesh = this.labelList.pop();
        mesh.removeFromParent();
        mesh.dispose();
      }
    }

    const center = [0, 0];
    const pointList = [];

    const labelList = [];

    this.pointList.forEach((v, i) => {
      if (i == 0) {
        center[0] = v.x;
        center[1] = v.y;
      }
      const pos = new THREE.Vector3(v.x - center[0], v.y - center[1], v.sample_1 || 0);
      pointList.push(pos);
      const label = new SpriteText(v.name, 8, "#000", "#fff");
      label.material.setValues({
        depthWrite: false,
        depthTest: false,
        depthFunc: THREE.AlwaysDepth,
      });
      label.material.needsUpdate = true;
      label.center.set(0.5, -0.4);
      label.fontScale = this.size;
      label.position.copy(pos);
      this.labelGroup.add(label);
      labelList.push(label);
    });

    this.geometry.setFromPoints(pointList);
    this.geometry.computeBoundingSphere();
    this.geometry.computeBoundingSphere();
    this.geometry.needsUpdate = true;

    this.center = center;
    this.labelList = labelList;

    if (this.map) {
      this.on(MAP_EVENT.UPDATE_CENTER);
      this.on(MAP_EVENT.UPDATE_ZOOM);
      this.on(MAP_EVENT.UPDATE_CAMERA_HEIGHT);
    }
  }

  onAdd(map) {
    super.onAdd(map);
    this.on(MAP_EVENT.UPDATE_CENTER);
    this.on(MAP_EVENT.UPDATE_ZOOM);
    this.on(MAP_EVENT.UPDATE_CAMERA_HEIGHT);
  }
}
