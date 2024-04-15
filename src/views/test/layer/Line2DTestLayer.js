import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap";
import { Line2DGeometry, Line2DMaterial } from "@/mymap/geometry/Line2D";

export class Line2DTestLayer extends Layer {
  constructor(opt) {
    super(opt);
    const points = [];
    points.push(new THREE.Vector3(-10, 0, 0));
    points.push(new THREE.Vector3(0, 10, 0));
    points.push(new THREE.Vector3(10, 0, 0));

    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const material = new Line2DMaterial();

    const mesh = new THREE.Line(geometry, material);
    this.scene.add(mesh);
  }
}
