import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
const loader = new OBJLoader();
const loader2 = new THREE.TextureLoader();
const server = "http://192.168.31.171:5500/Data";
export class OBJLayer extends Layer {
  center = [12716943.337189136, 2761023.0570991505];

  constructor(opt) {
    super(opt);
    this.loadObjs();
  }

  async loadObjs() {
    const list = await fetch(server + "/%E6%96%87%E4%BB%B6%E5%88%97%E8%A1%A8.json").then((res) => res.json());
    for (let i = 0, l = 300; i < l; i++) {
      const fileName = list[i];
      try {
        const object = await new Promise((resolve, reject) => {
          loader.load(`${server}/${fileName}/${fileName}.obj`, resolve, null, reject);
        });
        const texture = loader2.load(`${server}/${fileName}/${fileName}_texture_1.jpg`);
        object.traverse((child) => {
          if (child.isMesh) {
            child.material.setValues({ map: texture, side: THREE.DoubleSide });
            child.material.needsUpdate = true;
          }
        });
        this.scene.add(object);
      } catch (e) {}
    }
  }

  onAdd(map) {
    super.onAdd(map);
    this.center = map.center;
  }

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER) {
      const center = this.center;
      const [x, y] = this.map.WebMercatorToCanvasXY(center[0], center[1]);
      for (const mesh of this.scene.children) {
        mesh.position.set(x, y, 0);
      }
      for (const mesh of this.pickLayerScene.children) {
        mesh.position.set(x, y, 0);
      }
      for (const mesh of this.pickMeshScene.children) {
        mesh.position.set(x, y, 0);
      }
    }
  }
}
