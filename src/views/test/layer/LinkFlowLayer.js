import { Layer, MAP_EVENT } from "@/mymap";
import * as THREE from "three";
import { data } from "@/assets/data/linkflow.json";

export class LinkFlowLayer extends Layer {
  constructor(opt) {
    super(opt);
    this.data = data;
    this.update();
  }

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER) {
      for (const mesh of this.scene.children) {
        const [x, y] = this.map.WebMercatorToCanvasXY(...mesh.userData.center);
        mesh.position.set(x, y, mesh.position.z);
      }
    }
  }

  onAdd(map) {
    super.onAdd(map);
    this.update();
  }

  update() {
    this.clearScene();
    if (!this.map) return;
    if (!this.data) return;
    console.time("update");

    const { link, legs } = this.data;
    console.log(this.data);

    // const geoList = new Array(legs.length).fill(null);
    const { center, fromCoord, toCoord } = link;
    const fV3 = new THREE.Vector3(fromCoord.x, fromCoord.y, 0);
    const tV3 = new THREE.Vector3(toCoord.x, toCoord.y, 0);
    const cV3 = new THREE.Vector3(center.x, center.y, 0);
    const linkDirection = fV3.clone().sub(tV3).normalize();
    // link的法向量
    const linkNormal = new THREE.Vector3(linkDirection.y, linkDirection.x, 0);
    const material = new THREE.LineBasicMaterial({
      color: 0x0000ff,
    });

    for (let i = 0; i < legs.length; i++) {
      const { offset, coords } = legs[i];
      const points = coords.map((v) => new THREE.Vector3(v[0], v[1] + cV3.x - cV3.y, v[2] / 360));
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const mesh = new THREE.Line(geometry, material);

      // const legCenter = cV3.clone().add(linkNormal.clone().multiplyScalar(offset)).toArray();
      // const [x, y] = this.map.WebMercatorToCanvasXY(...legCenter);
      // console.log(x, y);
      // mesh.position.set(x, y, 0);
      // mesh.userData.center = legCenter;

      const [x, y] = linkNormal.clone().multiplyScalar(offset);
      mesh.position.set(x, y, 0);

      this.scene.add(mesh);
    }
    console.timeEnd("update");
  }
}
