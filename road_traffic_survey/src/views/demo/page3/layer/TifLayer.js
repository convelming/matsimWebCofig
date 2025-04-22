import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";

export class TifLayer extends Layer {
  constructor(opt) {
    super(opt);
    this.tifImage = opt.tifImage || null;
    this.geometry = new THREE.BufferGeometry();
    this.material = new THREE.MeshLambertMaterial({
      color: "#999",
      transparent: false,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER && this.tifImage) {
      const center = this.tifImage.center;
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

  setTifImage(tifImage) {
    this.tifImage = tifImage;
    this.update();
  }

  setTexture(texture){
    new THREE.TextureLoader().load(process.env.VUE_APP_BASE_API + "/demo/微信图片_20250418163804.png", (texture) => {
      material.setValues({ map: texture });
      material.needsUpdate = true;
    });
  }

  update() {
    if (!this.tifImage) return;

    const tifImage = this.tifImage;
    const geometry = new THREE.PlaneGeometry(tifImage.width, tifImage.height, tifImage.imgWidth - 1, tifImage.imgHeight - 1);
    const posAttr = geometry.attributes.position;
    //遍历顺序：从左至右，从上至下
    for (let i = 0; i < posAttr.count; i++) {
      posAttr.array[3 * i + 2] = tifImage.data[i];
    }
    geometry.computeVertexNormals();
    this.mesh.geometry = geometry;
    this.geometry.dispose();
    this.geometry = geometry;

    if (this.map) {
      this.on(MAP_EVENT.UPDATE_CENTER);
    }
  }

  onAdd(map) {
    super.onAdd(map);
    this.on(MAP_EVENT.UPDATE_CENTER);
  }
}
