import { Layer, MAP_EVENT, OutlineLayer, SCENE_MAP } from "@/mymap";
import * as THREE from "three";
import axios from "axios";

export class LinkFlowLayer extends Layer {
  constructor(opt) {
    super(opt);

    axios.get("./data/linkflow.v2.json").then((res) => {
      this.data = res.data.data;
      this.update();
    });
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

  render() {
    super.render();
  }

  update() {
    this.clearScene();
    if (!this.map) return;
    if (!this.data) return;
    console.time("update");

    const { link, legs } = this.data;

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

      const points = coords.map((v) => new THREE.Vector3(v[0], v[1], v[2] / 60));
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const mesh = new THREE.Line(geometry, material);

      const legCenterV3 = cV3.clone().add(linkNormal.clone().multiplyScalar(offset));
      const legCenter = [legCenterV3.x, legCenterV3.y];
      const [x1, y1] = this.map.WebMercatorToCanvasXY(...legCenter);
      const [x, y] = this.map.WebMercatorToCanvasXY(...legCenter);
      mesh.position.set(x, y, 0);
      mesh.userData.center = legCenter;

      // const [x, y] = linkNormal.clone().multiplyScalar(offset);
      // mesh.position.set(x, y, 0);
      mesh.layers.enable(SCENE_MAP.BLOOM_SCENE);
      this.scene.add(mesh);
    }
    console.timeEnd("update");
  }
}
