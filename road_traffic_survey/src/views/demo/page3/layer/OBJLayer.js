import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
const loader = new OBJLoader();
const loader2 = new THREE.TextureLoader();
const server = "http://192.168.60.231:23334/OBJ/Data";
export class OBJLayer extends Layer {
  center = proj4("EPSG:4547", "EPSG:3857", [511000.0, 2655000.0]);
  scale = 10 / 9;

  loadIndex = 0;
  loadLength = 50;

  constructor(opt) {
    super(opt);
    this.loadIndex = 0;
    this.loadLength = opt.num || 50;
    this.loadObjs();
  }

  async loadObjs() {
    if (this.loading) return;
    this.loading = true;
    const list = await fetch(server + "/%E6%96%87%E4%BB%B6%E5%88%97%E8%A1%A8.json").then((res) => res.json());
    if (this.loadLength < 0) this.loadLength = list.length;
    for (; this.loadIndex < this.loadLength; this.loadIndex++) {
      const fileName = list[this.loadIndex];
      try {
        const object = await new Promise((resolve, reject) => {
          loader.load(`${server}/${fileName}/${fileName}.obj`, resolve, null, reject);
        });
        object.traverse((child) => {
          if (child.isMesh && child.material) {
            if (child.material.isMaterial) {
              const texture = loader2.load(`${server}/${fileName}/${fileName}_texture_1.jpg`);
              const material = child.material;
              material.setValues({ map: texture, side: THREE.DoubleSide });
              material.needsUpdate = true;
            } else if (child.material.length) {
              for (let i2 = 0, l2 = child.material.length; i2 < l2; i2++) {
                const texture = loader2.load(`${server}/${fileName}/${fileName}_texture_${i2 + 1}.jpg`);
                const material = child.material[i2];
                material.setValues({ map: texture, side: THREE.DoubleSide });
                material.needsUpdate = true;
              }
            }
          }
        });
        if (this.map) {
          const center = this.center;
          const [x, y] = this.map.WebMercatorToCanvasXY(center[0], center[1]);
          object.position.set(x, y, 0);
        }
        object.scale.set(this.scale, this.scale, 1);
        this.scene.add(object);
        if (!this.map) break;
      } catch (e) {
        console.log(fileName, e);
      }
    }
    this.loading = false;
  }

  onAdd(map) {
    super.onAdd(map);
    this.on(MAP_EVENT.UPDATE_CENTER);
    this.loadObjs();
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
