
import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap";
export class TestLayer extends Layer {
  onAdd(map) {
    super.onAdd(map);


    this.scene.add(new THREE.AxesHelper(1000));
    const material = new THREE.LineBasicMaterial({
      color: 0xff0000,
    });

    const points = [
      [10, 14],
      [15, 20],
      [20, 16],
      [7, 6],
      [14, 3],
      [9, 25],
      [15, 26],
      [23, 22],
    ].map(v => new THREE.Vector3(v[0], v[1], 0));

    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const line = new THREE.Line(geometry, material);
    // line.scale.set(10000, 10000, 1)
    this.scene.add(line);
  }
}