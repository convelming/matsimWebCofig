import { Layer } from "../main/Layer";
import * as THREE from "three";
import { MAP_EVENT } from "../main/Map.js";

const Loader = new THREE.TextureLoader();


export class WeatherLayer extends Layer {
  constructor(opt) {
    super(opt);
    this.styleMap = opt.styleMap || MAP_LAYER_STYLE;
    this.setStyleMap(this.styleMap);
  }



}