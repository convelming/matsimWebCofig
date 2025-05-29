import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";
// import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";

import { CSS2DRenderer, CSS2DObject } from "@/mymap/utils/CSS2DRenderer.js";

export class Css2DLabelLayer extends Layer {
  constructor(opt) {
    super(opt);
    this.center = opt.center || [0, 0];
    this.offset = opt.offset || [0.5, 0.5];

    this.el = document.createElement("div");
    this.el.style.userSelect = "all";
    this.mesh = new CSS2DObject(this.el);
    this.mesh.position.set(0, 0, 0);
    this.mesh.offset.set(this.offset[0], this.offset[1]);
    this.scene.add(this.mesh);
  }

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER) {
      const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
      this.mesh.position.set(x, y, 0);
    }
  }

  onAdd(map) {
    super.onAdd(map);
    this.on(MAP_EVENT.UPDATE_CENTER, {});
  }

  setCenter(center) {
    this.center = center;
    this.on(MAP_EVENT.UPDATE_CENTER, {});
  }
  setOffset(offset) {
    this.offset = offset;
    this.mesh.offset.set(this.offset[0], this.offset[1]);
  }
}
