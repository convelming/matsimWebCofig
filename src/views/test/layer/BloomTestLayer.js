import { Layer, MAP_EVENT, SCENE_MAP } from "@/mymap";
import * as THREE from "three";

export class BloomTestLayer extends Layer {
  constructor(opt) {
    super(opt);

    const geometry = new THREE.BoxGeometry(200, 200, 200);
    const material = new THREE.MeshBasicMaterial({ color: "#ff0000" });
    this.cube = new THREE.Mesh(geometry, material);
    this.cube.position.set(0, 0, 150);
    this.cube2 = new THREE.Mesh(geometry, material);
    this.cube2.position.set(500, 0, 150);

    this.scene.add(this.cube);
    this.scene.add(this.cube2);

    this.cube.layers.enable(SCENE_MAP.BLOOM_SCENE);
  }
}
