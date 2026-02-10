import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";
import SpriteText from "./SpriteText.js";

export class GeoJSONLabelLayer extends Layer {
  meshList = [];
  color = "#ffffff";
  fontSize = 14;
  data = [];

  minZoom = 0;
  maxZoom = 200;

  constructor(opt) {
    super(opt);
    this.color = opt.color || this.color;
    this.fontSize = opt.fontSize || this.fontSize;
    this.minZoom = opt.minZoom || this.minZoom;
    this.maxZoom = opt.maxZoom || this.maxZoom;
    this.group = new THREE.Group();
  }

  onAdd(map) {
    super.onAdd(map);
    this.on(MAP_EVENT.UPDATE_CENTER, {});
    this.on(MAP_EVENT.UPDATE_ZOOM, {});
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
      if (this.center) {
        const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
        this.group.position.set(x, y, 0);
      }
      // for (const mesh of this.scene.children) {
      //   mesh.position.set(x, y, 0);
      // }
    }

    if (type == MAP_EVENT.UPDATE_ZOOM) {
      if (this.minZoom <= this.map.zoom && this.map.zoom <= this.maxZoom) {
        this.scene.add(this.group);
      } else {
        this.scene.remove(this.group);
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

  setZoomRange(minZoom, maxZoom) {
    this.minZoom = minZoom;
    this.maxZoom = maxZoom;
    if (this.map) {
      this.on(MAP_EVENT.UPDATE_ZOOM, {});
    }
  }

  setData(data) {
    this.clearScene();
    this.data = data;
    let center = null;
    for (const item of data) {
      const mesh = new SpriteText(item.label, this.fontSize, this.color);
      mesh.renderOrder = 999;
      mesh.center.set(0.5, 0);
      if (!center) center = item.center;
      mesh.position.set(item.center[0] - center[0], item.center[1] - center[1], 0);
      this.group.add(mesh);
      this.meshList.push(mesh);
    }
    this.center = center;
    if (this.map) {
      this.on(MAP_EVENT.UPDATE_CENTER, {});
      this.on(MAP_EVENT.UPDATE_ZOOM, {});
    }
  }
}
