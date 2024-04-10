import { Layer } from "@/mymap";
import * as THREE from "three";

import { getTextImage } from "@/mymap/utils/index";

export class HeatmMapLayer extends Layer {
  name = "HeatmMapLayer";
  loader = new THREE.TextureLoader();
  data = [];

  onAdd(map) {
    super.onAdd(map);
    this.update();
  }

  render() {
    super.render();
  }

  update() {
    const { url, aspect } = getTextImage("name");
  }
}
