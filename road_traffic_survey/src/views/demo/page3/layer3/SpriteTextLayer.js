import { Layer, MAP_EVENT } from "@/mymap/index.js";
import * as THREE from "three";

import SpriteText from "./SpriteText";
// 地图图层类
export class SpriteTextLayer extends Layer {
  constructor(opt) {
    super(opt);
    this.mesh = new SpriteText("参数产生的撒网\n测试ddsa");
    this.scene.add(this.mesh);
  }
}
