import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";
import { EARTH_RADIUS } from "@/mymap/utils/LngLatUtils.js";



export class NetworkSelectLayer extends Layer {
  lineWidth = 6;
  lineOffset = 0;
  time = 0;

  material = null;
  loadingNum = 0;



  constructor(opt) {
    super(opt);
    this.time = opt.time || this.time;
    this.colors = opt.colors || this.colors;
    this.lineWidth = opt.lineWidth || this.lineWidth;
    this.lineOffset = opt.lineOffset || this.lineOffset;

  }


  setSelectLine(lineItem) {
  }


  setSelectNode(nodeItem) {
  }


}