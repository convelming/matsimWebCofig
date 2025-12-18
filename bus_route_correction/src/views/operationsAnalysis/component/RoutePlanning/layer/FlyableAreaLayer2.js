import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";
import { EPSG4526ToMercator } from "@/mymap/utils/LngLatUtils.js";

import data from "./AirSpaceCube_100.js";

export class FlyableAreaLayer extends Layer {
  constructor(opt) {
    super(opt);
    this.minh = opt.minh;
    this.maxh = opt.maxh;
    this.color = opt.color;
    this.updata();
  }

  onAdd(map) {
    super.onAdd(map);
    this.on(MAP_EVENT.UPDATE_CENTER);
  }

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER && this.center) {
      const center = this.center;
      const [x, y] = this.map.WebMercatorToCanvasXY(center[0], center[1]);
      this.mesh.position.set(x, y, 50);
    }
  }

  updata() {
    // const list = data.filter((item) => {
    //   return item.z >= this.minh && item.z <= this.maxh;
    // });
    const list = data;
    const { x: cx, y: cy, edge_len: size } = list[0] || { x: 0, y: 0, edge_len: 100 };
    const center = EPSG4526ToMercator(cx, cy);
    const geometry = new THREE.BoxGeometry(size * 0.2, size * 0.2, size * 0.2);
    const material = new THREE.MeshPhongMaterial({
      transparent: true,
      opacity: 1,
      shininess: 90,
      side: THREE.DoubleSide,
    });
    console.log(list.length);

    const mesh = new THREE.InstancedMesh(geometry, material, list.length);
    for (let i = 0; i < list.length; i++) {
      const { x, y, z, color } = list[i];

      const pos = EPSG4526ToMercator(x, y);
      const positionV3 = new THREE.Vector3(Math.ceil(pos[0] - center[0]), Math.ceil(pos[1] - center[1]), z);
      const matrix = new THREE.Matrix4().makeTranslation(positionV3);
      mesh.setMatrixAt(i, matrix);
      mesh.setColorAt(i, new THREE.Color(color));
    }

    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    if (mesh.instanceMatrix) mesh.instanceMatrix.needsUpdate = true;

    this.scene.add(mesh);

    this.center = center;
    this.mesh = mesh;

    if (this.map) {
      this.on(MAP_EVENT.UPDATE_CENTER);
    }
  }
}
