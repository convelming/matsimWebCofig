

import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";


import axios from "axios";

export class GeoJSONLayer extends Layer {

  color = new THREE.Color(0xffa500);

  constructor(opt) {
    super(opt);
    this.color = new THREE.Color(opt.color || this.color);
    this.setData()
  }

  onAdd(map) {
    super.onAdd()
    this.update()

  }

  setData(data) {
    axios.get("./data/hpPTAL.json").then((res) => {
      console.log(res.data);
    });
  }

  update() {

  }
}











