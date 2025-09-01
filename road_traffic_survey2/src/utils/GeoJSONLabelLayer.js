import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";
import SpriteText from "./SpriteText.js";

export class GeoJSONLabelLayer extends Layer {
  meshList = [];
  color = "#ffffff";
  fontSize = 14;
  data = [];

  constructor(opt) {
    super(opt);
    this.color = opt.color || this.color;
    this.fontSize = opt.fontSize || this.fontSize;
  }

  onAdd(map) {
    super.onAdd(map);
    this.on(MAP_EVENT.UPDATE_CENTER, {});
  }

  dispose() {
    super.dispose();
    this.clearScene();
  }

  clearScene() {
    super.clearScene();
    for (const mesh of this.meshList) {
      mesh.removeFromParent();
      mesh.geometry.dispose();
      mesh.material.dispose();
    }
    this.meshList = [];
  }

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER) {
      for (const mesh of this.scene.children) {
        const [x, y] = this.map.WebMercatorToCanvasXY(...mesh.userData.center);
        mesh.position.set(x, y, 0);
      }
    }
  }

  setColor(color) {
    this.color = color;
    for (const mesh of this.meshList) {
      mesh.color = color;
    }
  }
  setFontSize(fontSize) {
    this.fontSize = fontSize;
    for (const mesh of this.meshList) {
      mesh.fontSize = fontSize;
    }
  }

  setData(data) {
    this.clearScene();
    this.data = data;
    for (const item of data) {
      const mesh = new SpriteText(item.label, this.fontSize, this.color);
      mesh.renderOrder = 999;
      mesh.center.set(0.5, 0);
      mesh.userData.center = item.center;
      if (this.map) {
        const [x, y] = this.map.WebMercatorToCanvasXY(...mesh.userData.center);
        mesh.position.set(x, y, 0);
      }
      this.scene.add(mesh);
      this.meshList.push(mesh);
    }
  }
}
