import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";

export class BoxListLayer extends Layer {

  
  constructor(opt) {
    super(opt);
    this.geometry = new THREE.BoxGeometry(80, 80, 80);
    this.material = new THREE.MeshBasicMaterial({ color: opt.color || "#76819a" });
    this.mesh = new THREE.InstancedMesh(this.geometry, this.material, 1);
    this.scene.add(this.mesh);
  }



}